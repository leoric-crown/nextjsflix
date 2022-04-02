import React, { useState, useContext } from "react";
import Image from "next/image";
import styles from "../styles/navbar.module.css";
import type { UserData } from "../context/UserContext";
import { googleSignIn } from "../lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { UserContext, UserContextActionTypes } from "../context/UserContext";

export type NavUserProps = {
  user: UserData;
};

const NavUser = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { state: userState, dispatch: userDispatch } =
    useContext(UserContext);

  const { user } = userState;

  const handleSignIn = async () => {
    try {
      const firebaseUser: FirebaseUser = await googleSignIn();
      const user: UserData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName as string,
        email: firebaseUser.email as string,
      };

      userDispatch({
        type: UserContextActionTypes.SetUser,
        payload: user,
      });
    } catch (error) {
      console.error(
        "There was an error in handleSignIn: ",
        (error as Error).message
      );
    }
  };

  const handleSignOut = () => {
    setShowDropdown(false);
    userDispatch({
      type: UserContextActionTypes.SetUser,
      payload: null,
    });
  };

  return (
    <div>
      {!user?.uid ? (
        <button className={styles.usernameBtn} onClick={handleSignIn}>
          <div className={styles.username}>Sign In</div>
        </button>
      ) : (
        <button
          className={styles.usernameBtn}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className={styles.username}>{user?.name}</div>
          <Image
            src="/static/expand_more.svg"
            alt="Expand dropdown"
            width="24px"
            height="24px"
          />
        </button>
      )}
      {showDropdown && (
        <div className={styles.navDropdown}>
          <div>
            <div className={styles.linkName} onClick={handleSignOut}>
              Sign Out
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavUser;
