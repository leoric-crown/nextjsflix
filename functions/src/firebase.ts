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
    console.log("in queryStats");
    const { likeDislike, watched, progress } = input;
    console.log({ input });
    let query = statsRef.where("userId", "==", userId);
    // .where("videoId", "in", videoIds);
    if (likeDislike) {
      console.log("adding likeDislike where clause");
      query = query.where("likeDislike", "in", likeDislike);
    }
    if (watched) {
      console.log("adding watched where clause");
      query = query.where("watched", "==", watched);
    }
    if (progress) {
      const progressOp = numberQueryOperators.get(progress.operator);
      if (progressOp) {
        console.log("adding progress where clause", progressOp, progress.value);
        query = query.where("progress", progressOp, progress.value);
      }
    }

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
  const docs: { docId: string; data: object }[] = [];
  querySnapshot.forEach((doc) =>
    docs.push({ docId: doc.id, data: doc.data() })
  );
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
    await statsRef.add({ ...newStats, timestamp });
  } catch (error) {
    console.error(
      "There was an error in firebase/setStats",
      (error as Error).message
    );
    throw error;
  }
};
