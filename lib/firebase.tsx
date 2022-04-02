// import firebaseConfig from "./firebaseConfig";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  UserCredential,
} from "firebase/auth";
import { getFirestore, addDoc, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVrDb7yUDBsf6GSewV-XlJzdHe4Yv5KVw",
  authDomain: "nextjsflixfb.firebaseapp.com",
  projectId: "nextjsflixfb",
  storageBucket: "nextjsflixfb.appspot.com",
  messagingSenderId: "272497895756",
  appId: "1:272497895756:web:3ea290624c6970f2ed87e9",
};

const firebaseApp = initializeApp(firebaseConfig);
console.log({ firebaseApp });

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

const collectionRef = collection(firestore, "usernames");
addDoc(collectionRef, { contents: "someData" + Date.now().toString() });

const googleProvider = new GoogleAuthProvider();

export const googleSignIn = async () => {
  return await signInWithPopup(auth, googleProvider)
  .then((credential: UserCredential) => {
    const user: User = credential.user
    return user
  })
  .catch(error => {
    console.error(error)
    throw error
  })
  // return userCredential as UserCredential;
};

export default firebaseApp;
