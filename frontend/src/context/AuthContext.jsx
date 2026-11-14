import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('petuk-user') || 'null'));
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('petuk-token')));

  useEffect(() => {
    if (!localStorage.getItem('petuk-token')) return;
    api.me().then((profile) => {
      setUser(profile); localStorage.setItem('petuk-user', JSON.stringify(profile));
    }).catch(() => logout()).finally(() => setChecking(false));
  }, []);

  const accept = (payload) => {
    localStorage.setItem('petuk-token', payload.token);
    localStorage.setItem('petuk-user', JSON.stringify(payload.user));
    setUser(payload.user);
  };
  const logout = () => {
    localStorage.removeItem('petuk-token'); localStorage.removeItem('petuk-user'); setUser(null); setChecking(false);
  };

  const value = useMemo(() => ({ user, checking, login: async (data) => accept(await api.login(data)), register: async (data) => api.register(data), logout }), [user, checking]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
