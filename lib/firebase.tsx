// import firebaseConfig from "./firebaseConfig";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVrDb7yUDBsf6GSewV-XlJzdHe4Yv5KVw",
  authDomain: "nextjsflixfb.firebaseapp.com",
  projectId: "nextjsflixfb",
  storageBucket: "nextjsflixfb.appspot.com",
  messagingSenderId: "272497895756",
  appId: "1:272497895756:web:3ea290624c6970f2ed87e9",
};

const firebaseApp = initializeApp(firebaseConfig);
console.log({firebaseApp})

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

const googleProvider = new GoogleAuthProvider();

export const googleSignIn = async () => {
  const user = await signInWithPopup(auth, googleProvider)
    .then((user) => {
      console.log(user);
      return user;
    })
    .catch((error) => {
      console.error('Error in googleSignIn', error);
      return null;
    });

  return user;
};

export default firebaseApp;
