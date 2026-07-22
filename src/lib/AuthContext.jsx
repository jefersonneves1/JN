import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Auth is disabled — all data persists in localStorage.
  // base44 import retained for platform compatibility.
  useEffect(() => {
    setIsLoadingAuth(false);
    setIsLoadingPublicSettings(false);
    setAuthError(null);
  }, []);

  const navigateToLogin = () => {};

  return (
    <AuthContext.Provider value={{
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};