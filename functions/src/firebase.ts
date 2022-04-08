import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import {
  FieldValue,
  getFirestore,
  QuerySnapshot,
} from "firebase-admin/firestore";
import { numberQueryOperators, StatsQueryInput } from "./types";

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

export const queryStats = async (userId: string, input: StatsQueryInput) => {
  try {
    const { likeDislike, watched, progress } = input || {};
    let query = statsRef.where("userId", "==", userId);
    if (likeDislike) {
      query = query.where("likeDislike", "in", likeDislike);
    }
    if (watched !== null && watched !== undefined) {
      query = query.where("watched", "==", watched);
    }
    if (progress) {
      const progressOp = numberQueryOperators.get(progress.operator);
      if (progressOp) {
        if ([">", ">="].includes(progressOp)) {
          query = query.orderBy("progress", "desc");
        }
        if (["<", "<="].includes(progressOp)) {
          query = query.orderBy("progress", "asc");
        }

        query = query.where("progress", progressOp, progress.value);
      }
    }
    query = query.orderBy("timestamp", "desc");

    const querySnapshot = await query.get();
    return querySnapshot;
  } catch (error) {
    console.error((error as Error).message);
    throw error;
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
  const docs: { id: string; data: object }[] = [];
  querySnapshot.forEach((doc) => docs.push({ id: doc.id, data: doc.data() }));
  return docs;
};

export const setStats = async (docId: string, update: object) => {
  try {
    const timestamp = FieldValue.serverTimestamp();
    await statsRef.doc(docId).set({ ...update, timestamp }, { merge: true });
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
    const timestamp = FieldValue.serverTimestamp();
    const newDoc = await statsRef.add({ ...newStats, timestamp });
    return newDoc;
  } catch (error) {
    console.error(
      "There was an error in firebase/setStats",
      (error as Error).message
    );
    throw error;
  }
};
