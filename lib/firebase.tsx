// import firebaseConfig from "./firebaseConfig";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  UserCredential,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from '../firebaseConfig'

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

const googleProvider = new GoogleAuthProvider();

export const googleSignIn = async () => {
  return await signInWithPopup(auth, googleProvider)
    .then((credential: UserCredential) => {
      return credential.user as User;
    })
    .catch((error) => {
      console.error("There was an error in firebase/googleSignin: ", error);
      throw error;
    });
};

export default firebaseApp;
