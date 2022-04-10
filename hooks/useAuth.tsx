import {
  initializeAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  UserCredential,
  browserPopupRedirectResolver,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import firebaseApp from "../lib/firebase";
import nookies from "nookies";

const auth = initializeAuth(firebaseApp, {
  persistence: browserLocalPersistence,
});

const googleProvider = new GoogleAuthProvider();

export const googleSignIn = async () => {
  return await signInWithPopup(
    auth,
    googleProvider,
    browserPopupRedirectResolver
  )
    .then((credential: UserCredential) => {
      return credential.user as User;
    })
    .catch((error) => {
      console.error("There was an error in useAuth/googleSignin: ", error);
      throw error;
    });
};

type ContextState = {
  user: User | null;
  error: Error;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
};

export const AuthContext = createContext({
  user: null,
  loading: true,
} as ContextState);

export const AuthContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [user, setUser] = useState(null as User | null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null as unknown as Error);

  const signIn = async () => {
    setLoading(true);
    try {
      const newUser: User = await googleSignIn();
      setUser(newUser);
    } catch (err) {
      console.error(
        "There was an error in useAuth/signIn: ",
        (err as Error).message
      );
      setError(err as Error);
    }
  };

  const signOut = () => {
    auth.signOut();
    nookies.destroy(undefined, "token");
    setUser(null);
  };

  useEffect(() => {
    setLoading(false);
  }, [user, error]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      const token = await newUser?.getIdToken();
      nookies.set(undefined, "token", token as string, { path: "/" });
      setUser(newUser);
    });

    return () => unsubscribe();
  });

  return (
    <AuthContext.Provider value={{ user, error, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
