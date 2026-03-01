'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { useMemo } from 'react';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

interface FirebaseClientProviderProps {
  children: React.ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseApp = useMemo(() => {
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
  }, []);

  const auth = useMemo(() => getAuth(firebaseApp), [firebaseApp]);
  const firestore = useMemo(() => getFirestore(firebaseApp), [firebaseApp]);

  const contextValue = {
    app: firebaseApp,
    auth,
    firestore,
  };

  return <FirebaseProvider value={contextValue}>{children}</FirebaseProvider>;
}
