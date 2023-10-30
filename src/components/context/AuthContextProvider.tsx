'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';

import { auth } from '@/lib/client/firebase/core';

import type { User } from 'firebase/auth';

type AuthContext = {
  authUserLoading: boolean;
  authUser: User | null;
};

type AuthContextProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const AuthContext = createContext<AuthContext | null>(null);

export default function AuthContextProvider({
  children,
}: AuthContextProviderProps): JSX.Element {
  const [authUserLoading, setauthUserLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }

      setauthUserLoading(false);
    });

    return () => authUnsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContext = {
    authUserLoading,
    authUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContext {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useInitializeState must be used within an AuthContextProvider',
    );
  }

  return context;
}
