import React, { useState } from "react";
import Image from "next/image";
import styles from "../styles/navbar.module.css";
import type { User } from "../lib/types";
import { googleSignIn } from "../lib/firebase";

export type NavUserProps = {
  user: User | null;
};

const NavUser = ({ user }: NavUserProps) => {
  const handleSignIn = () => {
    console.log("handling sign in");
    googleSignIn();
    console.log('in NavUser', { user });
    return [];
  };

  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <div>
      {!user?.id ? (
        <button className={styles.usernameBtn} onClick={handleSignIn}>
          <div className={styles.username} onClick={handleSignIn}>
            Sign In
          </div>
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
            <div className={styles.linkName}>Sign Out</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavUser;
