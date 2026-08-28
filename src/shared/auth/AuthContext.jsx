import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { refreshToken as refreshTokenRequest, getMyProfile, logoutAccount, logoutAllAccounts, deleteAccount as deleteAccountRequest } from "@shared/api-client";
import { matchCountryByE164, stripDialCode } from "@shared/data/countries";
import { parseJwt } from "./jwt";

const AuthContext = createContext(null);

function toProfileUser(apiUser, prev) {
  return {
    name: `${apiUser.firstName} ${apiUser.lastName}`,
    email: apiUser.email,
    phone: prev?.email === apiUser.email ? prev.phone : "",
    countryCode: prev?.email === apiUser.email ? prev.countryCode : "CO",
    avatarUrl: prev?.email === apiUser.email ? prev.avatarUrl : null,
  };
}

// El accessToken vive únicamente en memoria (nunca localStorage ni una cookie legible
// por JS: cualquier XSS podría leerlas) — se guarda en un ref, no en estado, para que ni
// siquiera un render lo exponga más de lo necesario. Se pierde al recargar la página a
// propósito; para que "recordarme" persista entre reloads, al montar la app se intenta
// una vez POST /accounts/refresh-token: el backend lee la cookie httpOnly refresh_token
// y devuelve un accessToken nuevo si sigue siendo válida. Un 401 ahí es el caso normal de
// "no había sesión" (o expiró) y no debe mostrarse como error al usuario.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | guest
  // Ningún componente debe leer user.phone/avatarUrl como "definitivo" hasta que esto
  // sea true: ProfileForm (y cualquier otro formulario derivado de `user`) inicializa
  // su estado local con useState(initialValues) en el montaje, sin re-sincronizarse
  // después — si el modal llega a montarse antes de que hydrateProfile() resuelva,
  // captura el phone vacío para siempre aunque el context se actualice más tarde.
  // ProfileModal usa este flag para retrasar el montaje del form hasta que sea seguro.
  const [profileReady, setProfileReady] = useState(false);
  // El claim `role` ("ADMIN"/"CUSTOMER") sí se puede guardar en estado (a diferencia
  // del accessToken): no es un secreto, solo gatea qué se muestra en el cliente — el
  // backend es quien de verdad exige role:"ADMIN" en cada ruta /admin/*.
  const [role, setRole] = useState(null);
  // null mientras no se sabe todavía (antes de que resuelva hydrateProfile). false =
  // cuenta creada solo por Google/Clerk, sin contraseña propia — la usan ProfileModal
  // (para ofrecer "crear contraseña") y DeleteAccountModal (para bloquear el borrado
  // hasta que exista una contraseña con la que confirmarlo).
  const [hasPassword, setHasPassword] = useState(null);
  const accessTokenRef = useRef(null);

  // Ni /login ni /refresh-token devuelven el perfil completo (phone/avatarUrl/hasPassword)
  // — solo GET /accounts/me lo trae, así que hay que pedirlo aparte apenas hay accessToken
  // y parchear el `user` ya seteado. El teléfono viene en E.164 sin el país por separado
  // (a diferencia de las direcciones), así que el país se infiere del propio dial code.
  const hydrateProfile = useCallback(async (accessToken) => {
    try {
      const apiUser = await getMyProfile(accessToken);
      setHasPassword(apiUser.hasPassword ?? null);
      setUser((prev) => {
        if (!prev) return prev;
        const patch = { avatarUrl: apiUser.avatarUrl ?? prev.avatarUrl };
        if (apiUser.phone) {
          const country = matchCountryByE164(apiUser.phone);
          patch.countryCode = country.code;
          patch.phone = stripDialCode(apiUser.phone, country.code);
        }
        return { ...prev, ...patch };
      });
    } catch {
      // Silencioso: el perfil ya se ve con lo que trajo login/refresh, solo faltaría
      // el teléfono/avatar/hasPassword hasta que el usuario reabra el modal o recargue.
    } finally {
      setProfileReady(true);
    }
  }, []);

  const login = useCallback((nextUser, accessToken) => {
    accessTokenRef.current = accessToken || null;
    setUser(nextUser);
    setStatus("authenticated");
    setRole(accessToken ? parseJwt(accessToken)?.role ?? null : null);
    if (accessToken) {
      setProfileReady(false);
      hydrateProfile(accessToken);
    } else {
      setHasPassword(null);
      setProfileReady(true); // Sin accessToken no hay perfil (GET /accounts/me) que pedir.
    }
  }, [hydrateProfile]);

  // DeleteAccountModal llama esto justo después de que POST /accounts/set-password
  // responde 200, para no tener que esperar un refetch de GET /accounts/me solo para
  // desbloquear el flujo de borrado en la misma sesión.
  const markPasswordCreated = useCallback(() => setHasPassword(true), []);

  // El backend usa JWT sin estado para el accessToken: /logout y /logout-all solo
  // revocan el refresh token (cookie httpOnly) en la base de datos, no pueden invalidar
  // un accessToken ya emitido. Por eso acá se borra siempre del cliente justo después
  // de la llamada (en el finally), sin esperar ni depender de que el request tenga éxito
  // — si no, la sesión seguiría viéndose activa en esta pestaña hasta que expire solo.
  const logout = useCallback(async () => {
    try {
      await logoutAccount();
    } finally {
      accessTokenRef.current = null;
      setUser(null);
      setStatus("guest");
      setProfileReady(false);
      setRole(null);
      setHasPassword(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await logoutAllAccounts(accessTokenRef.current);
    } finally {
      accessTokenRef.current = null;
      setUser(null);
      setStatus("guest");
      setProfileReady(false);
      setRole(null);
      setHasPassword(null);
    }
  }, []);

  // A diferencia de logout/logoutAll, acá NO se limpia la sesión en un finally: si el
  // backend rechaza la contraseña (401 INVALID_CREDENTIALS) el usuario sigue autenticado
  // y debe poder reintentar sin perder su sesión actual. Solo se limpia tras un 200 real.
  const deleteAccount = useCallback(async ({ password, reason }) => {
    const result = await deleteAccountRequest({ password, reason, accessToken: accessTokenRef.current });
    accessTokenRef.current = null;
    setUser(null);
    setStatus("guest");
    setProfileReady(false);
    setRole(null);
    setHasPassword(null);
    return result;
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) } : prev));
  }, []);

  useEffect(() => {
    let cancelled = false;
    refreshTokenRequest()
      .then(({ accessToken, user: apiUser }) => {
        if (cancelled) return;
        accessTokenRef.current = accessToken;
        setUser((prev) => toProfileUser(apiUser, prev));
        setStatus("authenticated");
        setRole(parseJwt(accessToken)?.role ?? null);
        hydrateProfile(accessToken);
      })
      .catch(() => {
        if (!cancelled) setStatus("guest");
      });
    return () => {
      cancelled = true;
    };
  }, [hydrateProfile]);

  const value = {
    user,
    status,
    isAuthenticated: status === "authenticated",
    profileReady,
    role,
    isAdmin: role === "ADMIN",
    hasPassword,
    markPasswordCreated,
    getAccessToken: () => accessTokenRef.current,
    login,
    logout,
    logoutAll,
    deleteAccount,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
