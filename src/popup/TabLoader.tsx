/** @jsxImportSource @emotion/react */

import { useEffect, useRef, useState } from "react";
import type { Styles } from "./Styles";
import "./index.css";

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

  const updateWindowAndTabCount = () => {
    const windows = getWindowsFromDivContent();
    setWindowCount(windows.length);
    setTabCount(windows.reduce((a, b) => a + b.length, 0));
  };

  useEffect(() => {
    updateWindowAndTabCount();
  }, []);

  // detect changes to the div content
  useEffect(() => {
    const div = document.querySelector('#textarea') as HTMLElement;
    const observer = new MutationObserver(() => {
      // console.log("mutation");
      updateWindowAndTabCount();
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
    backgroundColor: "#be1436",
  },
  textareaContainer: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    // border: "1px solid #c3c3c3",
    // border: "none",
    border: "1px solid #000",
    outline: 'none',
    borderRadius: 8,
    marginTop: 12,
    marginLeft: 12,
    marginRight: 12,
    marginBottom: 16,
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.3)',
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
    marginTop: 0,
    marginLeft: 12,
    marginRight: 12,
    marginBottom: 12,
    borderRadius: 8,
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.3)',
    // border: 'none',
    border: "1px solid #000",
    color: "#222",
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
    background: "#f7f7f7",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    outline: 0,
    '&:hover': {
      background: "#e0e0e0",
    },
    '&:active': {
      background: "#d0d0d0",
    },
  },
};
