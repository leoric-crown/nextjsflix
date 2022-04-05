import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, QuerySnapshot } from "firebase-admin/firestore";

const firebaseApp = initializeApp();
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const statsRef = firestore.collection("stats");

export const verifyToken = async (token: string) => {
  try {
    if (token) {
      const verifiedUser = await auth.verifyIdToken(token);
      return verifiedUser;
    }
    return false;
  } catch (error) {
    console.error(
      "There was an error in firebase/verifyToken: ",
      (error as Error).message
    );
    return false;
  }
};

export const queryStatsByUserAndVideoId = async (
  userId: string,
  videoId: string
) => {
  const querySnapshot = await statsRef
    .where("userId", "==", userId)
    .where("videoId", "==", videoId)
    .get();
  return querySnapshot;
};

export const getDocsFromQuerySnapshot = (querySnapshot: QuerySnapshot) => {
  const docs: { docId: string; data: object }[] = [];
  querySnapshot.forEach((doc) =>
    docs.push({ docId: doc.id, data: doc.data() })
  );
  return docs;
};

export const setStats = async (docId: string, update: object) => {
  try {
    await statsRef.doc(docId).set(update, { merge: true });
  } catch (error) {
    console.error(
      "There was an error in firebase/setStats",
      (error as Error).message
    );
    throw error;
  }
};

export const addStats = async (newStats: object) => {
  try {
    await statsRef.add(newStats);
  } catch (error) {
    console.error(
      "There was an error in firebase/setStats",
      (error as Error).message
    );
    throw error;
  }
};
