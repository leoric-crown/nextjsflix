import React, { BaseSyntheticEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/navbar.module.css";

interface NavBarProps {
  username: string;
}

const NavBar: React.FC<NavBarProps> = (props) => {
  const { username } = props;

  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleOnClickNav = (event: BaseSyntheticEvent, path: string) => {
    event.preventDefault;
    router.push(path);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Link href="/">
          <a
            className={styles.logoLink}
            onClick={(event) => handleOnClickNav(event, "/")}
          >
            <div className={styles.logoWrapper}>
              <Image
                src="/static/netflix.svg"
                alt="Netflix logo"
                width="128px"
                height="32px"
              />
            </div>
          </a>
        </Link>
        <ul className={styles.navItems}>
          <li
            className={styles.navItem}
            onClick={(event) => handleOnClickNav(event, "/")}
          >
            Home
          </li>
          <li
            className={styles.navItem2}
            onClick={(event) => handleOnClickNav(event, "/my-list")}
          >
            My List
          </li>
        </ul>
        <nav className={styles.navContainer}>
          <div>
            <button
              className={styles.usernameBtn}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <p className={styles.username}>{username}</p>
              <Image
                src="/static/expand_more.svg"
                alt="Expand dropdown"
                width="24px"
                height="24px"
              />
            </button>
          </div>
          {showDropdown && (
            <div className={styles.navDropdown}>
              <div>
                <Link href="/login">
                  <a className={styles.linkName}>Sign Out</a>
                </Link>
                {/* <div className={styles.lineWrapper}></div> */}
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default NavBar;
