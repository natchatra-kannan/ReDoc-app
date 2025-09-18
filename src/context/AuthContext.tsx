"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

// This is a simplified user object, not the Firebase one.
export type FakeUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string;
};

interface AuthContextType {
  user: FakeUser | null;
  loading: boolean;
  login: (user: FakeUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FakeUser | null>(null);
  // No real loading, so we can set it to false.
  const loading = false;

  const login = useCallback((user: FakeUser) => {
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
