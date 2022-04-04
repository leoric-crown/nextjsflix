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

  const signIn = async () => {
    setLoading(true);
    try {
      const newUser: User = await googleSignIn();
      setUser(newUser);
    } catch (error) {
      console.error(
        "There was an error in useAuth/signIn: ",
        (error as Error).message
      );
    }
  };

  const signOut = () => {
    auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    return () => unsubscribe();
  });

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
