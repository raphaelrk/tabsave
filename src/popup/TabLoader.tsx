/** @jsxImportSource @emotion/react */

import { useEffect, useRef, useState } from "react";
import type { Styles } from "./Styles";
import "./index.css";
import { css } from "@emotion/react";

export default function TabCopier() {

  const [windowCount, setWindowCount] = useState<number>(0);
  const [tabCount, setTabCount] = useState<number>(0);
  const divTextAreaRef = useRef<HTMLDivElement>(null);
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  const getWindowsFromDivContent = (): string[][] => {
    const textForEachWindow = (document.querySelector('#textarea') as HTMLElement).innerText.split(/\n{3,}/).filter(x => x.trim());
    const linesForEachWindow = textForEachWindow.map(w => w.split('\n').filter(x => x.trim()));
    const urlsForEachWindow = linesForEachWindow.map(w => w.filter(x => x.includes('://'))).filter(x => x.length);
    const windows = urlsForEachWindow.map(window => [...new Set(window)]);
    console.log({ textForEachWindow, linesForEachWindow, urlsForEachWindow, windows });
    return windows;
  }

  const loadWindowsAndTabs = async () => {
    const windows = getWindowsFromDivContent();
    for (const tabs of windows) {
      console.log("tabs", tabs);
      chrome.windows.create({ url: tabs });
    }
  }

  // detect changes to the div content
  useEffect(() => {
    const div = document.querySelector('#textarea') as HTMLElement;
    const observer = new MutationObserver(() => {
      // console.log("mutation");
      const windows = getWindowsFromDivContent();
      setWindowCount(windows.length);
      setTabCount(windows.reduce((a, b) => a + b.length, 0));
    });
    observer.observe(div, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const onInitialClick = () => {
    if (hasClicked) return;
    setHasClicked(true);
    divTextAreaRef.current.innerHTML = '';
  }

  return (
    <div css={styles.container}>
      <div css={styles.textareaContainer}>
        {/* <div id={"textarea"} css={styles.textarea}> */}
        <div ref={divTextAreaRef} id={"textarea"} css={styles.textarea} contentEditable={true} onClick={onInitialClick}>
          <p style={{ margin: 0, fontSize: 13 }}>
            Example Domain
          </p>
          <p style={{ margin: 0, fontSize: 13 }}>
            <a href="http://example.com">http://example.com</a>
          </p>
        </div>
      </div>
      <button onClick={loadWindowsAndTabs} css={styles.loadButton}>
        Load {windowCount} window{windowCount !== 1 && 's'} with {tabCount} tab{tabCount !== 1 && 's'}
      </button>
    </div>
  );
}

const styles: Styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  textareaContainer: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #c3c3c3",
    borderRadius: 4,
    margin: 12,
  },
  textarea: {
    overflowX: "scroll",
    overflowY: "scroll",
    flex: 1,
    fontSize: 12,
    padding: 12,
    color: "#222",
    whiteSpace: "nowrap",
    outline: 0,
    border: 0,
  },
  loadButton: {
    border: 0,
    width: "100%",
    color: "#222",
    fontSize: 13,
    fontWeight: "bold",
    borderTop: "1px solid #dfdfdf",
    textTransform: "uppercase",
    background: "#f7f7f7",
    cursor: "pointer",
    padding: 12,
    outline: 0,
    '&:hover': {
      background: "#f0f0f0",
    },
    '&:active': {
      background: "#e0e0e0",
    },
  },
};
