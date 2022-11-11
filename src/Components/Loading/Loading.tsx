import React from "react";
import styles from "./Loading.module.css";
import clsx from "clsx";
import D20 from "./D20";

function Loading() {
  const className = clsx(styles.loader);

  return (
    <>
      <div className={styles.loadingOverlay}>
        <D20 classes={className} />
      </div>
    </>
  );
}

export default Loading;

