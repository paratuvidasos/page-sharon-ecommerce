import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { refreshToken as refreshTokenRequest } from "@shared/api-client";

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
  const accessTokenRef = useRef(null);

  const login = useCallback((nextUser, accessToken) => {
    accessTokenRef.current = accessToken || null;
    setUser(nextUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    accessTokenRef.current = null;
    setUser(null);
    setStatus("guest");
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
      })
      .catch(() => {
        if (!cancelled) setStatus("guest");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = {
    user,
    status,
    isAuthenticated: status === "authenticated",
    getAccessToken: () => accessTokenRef.current,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
