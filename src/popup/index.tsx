/** @jsxImportSource @emotion/react */

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { Styles } from "./Styles";
import "./index.css";
import TabCopier from "./TabCopier";
import TabLoader from "./TabLoader";
import TabViewer from "./TabViewer";

export default function Popup() {

  const [nav, setNav] = useState<"copy" | "load" | "view">("copy");

  return (
    <div css={styles.container}>
      <div css={styles.nav}>
        <div css={[styles.navItem, { fontWeight: nav === 'copy' ? '600' : '200' }]} onClick={() => setNav("copy")}>copy</div>
        <div css={[styles.navItem, { fontWeight: nav === 'load' ? '600' : '200' }]} onClick={() => setNav("load")}>load</div>
        <div css={[styles.navItem, { fontWeight: nav === 'view' ? '600' : '200' }]} onClick={() => setNav("view")}>view</div>
      </div>
      {nav === "copy" && <TabCopier />}
      {nav === "load" && <TabLoader />}
      {nav === "view" && <TabViewer />}
    </div>
  );
}

const styles : Styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    width: 800,
    height: 600,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  nav: {
    display: "flex",
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#be1436",
  },
  navItem: {
    fontSize: 14,
    fontWeight: 700,
    marginRight: 8,
    cursor: "pointer",
    color: "#fff",
    '&:hover': {
      color: "#eee",
    },
  },
};
