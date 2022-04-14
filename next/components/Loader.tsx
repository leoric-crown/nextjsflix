import React from "react";
import styles from "../styles/loading.module.css";

const Loader = () => {
  return (
    <div className={styles.loaderWrapper}>
      <p className={styles.loader}>Loading...</p>
    </div>
  );
};

export default Loader;
