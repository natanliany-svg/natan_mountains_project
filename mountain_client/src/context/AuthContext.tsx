import React, { createContext, useContext, useEffect, useState } from 'react';
import type { JwtPayload } from '../types';
import {
  decodeToken,
  getToken,
  removeToken,
  saveToken,
} from '../utils/tokenUtils';

// (#26)
interface AuthContextType {
  user: JwtPayload | null;
  login: (token: string) => void;
  logout: () => void;
}

// (#26)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// (#26)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(null);

  // (#26)
  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser(decoded);
      } else {
        removeToken();
      }
    }
  }, []);

  // (#26)
  const login = (token: string) => {
    saveToken(token);
    const decoded = decodeToken(token);
    setUser(decoded);
  };

  // (#26)
  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// (#27)
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
