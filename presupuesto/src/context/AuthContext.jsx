import { createContext, useContext, useState } from 'react';
import { getStoredUsuario, setStoredAuth, clearStoredUsuario } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(getStoredUsuario);

  const login = (token, userData, rememberMe = false) => {
    setUsuario(userData);
    setStoredAuth(token, userData, rememberMe);
  };

  const logout = () => {
    setUsuario(null);
    clearStoredUsuario();
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
