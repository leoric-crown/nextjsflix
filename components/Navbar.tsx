import React, { BaseSyntheticEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/navbar.module.css";
import NavUser from "../components/NavUser";

interface NavBarProps {
  gradientBackground: boolean;
}

const Navbar: React.FC<NavBarProps> = (props) => {
  const { gradientBackground } = props;

  const router = useRouter();

  const handleOnClickNav = (event: BaseSyntheticEvent, path: string) => {
    event.preventDefault;
    router.push(path);
  };

  return (
    <div
      className={gradientBackground ? styles.container : styles.containerOpaque}
    >
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
          <NavUser/>
          
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
