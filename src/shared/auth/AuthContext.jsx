import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { refreshToken as refreshTokenRequest, getMyProfile, logoutAccount, logoutAllAccounts, deleteAccount as deleteAccountRequest } from "@shared/api-client";
import { matchCountryByE164, stripDialCode } from "@shared/data/countries";

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
  const accessTokenRef = useRef(null);

  // Ni /login ni /refresh-token devuelven el perfil completo (phone/avatarUrl) — solo
  // GET /accounts/me lo trae, así que hay que pedirlo aparte apenas hay accessToken y
  // parchear el `user` ya seteado. El teléfono viene en E.164 sin el país por separado
  // (a diferencia de las direcciones), así que el país se infiere del propio dial code.
  const hydrateProfile = useCallback(async (accessToken) => {
    try {
      const apiUser = await getMyProfile(accessToken);
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
      // el teléfono/avatar hasta que el usuario reabra el modal o recargue.
    } finally {
      setProfileReady(true);
    }
  }, []);

  const login = useCallback((nextUser, accessToken) => {
    accessTokenRef.current = accessToken || null;
    setUser(nextUser);
    setStatus("authenticated");
    if (accessToken) {
      setProfileReady(false);
      hydrateProfile(accessToken);
    } else {
      setProfileReady(true); // Google simulado: no hay accessToken, nada que hidratar.
    }
  }, [hydrateProfile]);

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
