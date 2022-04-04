import React, { useState } from "react";
import Image from "next/image";
import styles from "../styles/navbar.module.css";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/router";

const NavUser = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter()

  const { user, loading, signIn, signOut } = useAuth();

  const handleSignIn = () => {
    signIn();
  };

  const handleSignOut = () => {
    setShowDropdown(false);
    signOut();
    router.push("/")
  };

  return (
    <div>
      {!user?.uid ? (
        <button className={styles.usernameBtn} onClick={handleSignIn}>
          <div className={styles.username}>
            {loading ? "Loading..." : "Sign In"}
          </div>
        </button>
      ) : (
        <button
          className={styles.usernameBtn}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Image
            className={styles.userPhoto}
            src={user?.photoURL as string}
            alt="User Photo"
            width="32px"
            height="32px"
          />
          <div className={styles.username}>{user?.email}</div>
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
