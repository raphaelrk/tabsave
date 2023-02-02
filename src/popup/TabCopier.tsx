/** @jsxImportSource @emotion/react */

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { Styles } from "./Styles";
import "./index.css";
import type { TabGroupIdToTabGroup, WindowAndTabInformation, Windows } from "~popup/getWindowAndTabInformation";
import { getWindowAndTabInformation } from "~popup/getWindowAndTabInformation";

export default function TabCopier() {

  const [nav, setNav] = useState<"all" | "curr">("all");
  const [windowAndTabInformation, setWindowAndTabInformation] = useState<WindowAndTabInformation>(null);
  const [justCopied, setJustCopied] = useState(false);

  useEffect(() => {
    getWindowAndTabInformation().then(setWindowAndTabInformation);
  }, []);

  // const loadWindowsAndTabs = async () => {
  //   const windows = await chrome.windows.getAll({ populate: true });
  //   const text = windows.map((window, idx) => {
  //     const tabs = window.tabs?.map(tab => `<a href="${tab.url}">${tab.title}</a>`).join('<br>');
  //     return `${idx}<br>${tabs}`;
  //   }).join('<br><br>');
  //   divTextAreaRef.current.innerHTML = text;
  // }

  // const copyToClipboard = (text: string) => {
  //   const textArea = document.createElement("textarea");
  //   textArea.value = text;
  //   document.body.appendChild(textArea);
  //   textArea.select();
  //   document.execCommand("copy");
  //   textArea.remove();
  // };
  const selectText = () => {
    const textarea = document.querySelector<HTMLDivElement>("#textarea");
    const range = document.createRange();
    range.selectNodeContents(textarea);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
  const deselectText = () => {
    const sel = window.getSelection();
    sel.removeAllRanges();
  }
  const copyToClipboard = () => {
    selectText();
    document.execCommand("copy");
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1000);
    deselectText();
  }

  // after window info is rendered, select text
  // useEffect(() => {
  //   if (windowAndTabInformation) {
  //     // selectText();
  //     copyToClipboard();
  //   }
  // }, [nav, windowAndTabInformation]);

  return (
    <div css={styles.container}>
      <div css={styles.nav}>
        <div css={[styles.navItem, { fontWeight: nav === 'all' ? '700' : '400' }]} onClick={() => setNav("all")}>all windows</div>
        <div css={[styles.navItem, { fontWeight: nav === 'curr' ? '700' : '400' }]} onClick={() => setNav("curr")}>current window</div>
      </div>
      <div css={styles.textareaContainer}>
        {/*<div id={"textarea"} css={styles.textarea} contentEditable={true}>*/}
        <div id={"textarea"} css={styles.textarea}>
          {windowAndTabInformation &&
            <WindowList nav={nav} windowAndTabInformation={windowAndTabInformation} />
          }
        </div>
      </div>
      <button onClick={copyToClipboard} css={styles.copyButton}>
        {justCopied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function WindowList({ nav, windowAndTabInformation }: { nav: "all" | "curr", windowAndTabInformation: WindowAndTabInformation }) {
  const [windows, tabGroupIdToTabGroup, currentWindowId] = windowAndTabInformation;

  const filteredWindows = useMemo(() => {
    if (nav === "all") {
      return windows;
    } else {
      return [windows[0]];
      // return windows.filter(w => w.focused);
    }
  }, [nav, windows]);

  const tabCount = useMemo(() => filteredWindows.reduce((acc, w) => acc + w.tabs.length, 0), [filteredWindows]);
  const minimizedWindowsCount = useMemo(() => filteredWindows.filter(w => w.state === 'minimized').length, [filteredWindows]);
  const incognitoWindowsCount = useMemo(() => filteredWindows.filter(w => w.incognito).length, [filteredWindows]);
  const fileUrlsCount = useMemo(() => filteredWindows.reduce((acc, w) => acc + w.tabs.filter(t => t.url.startsWith('file://')).length, 0), [filteredWindows]);

  const timeString = useMemo(() => {
    let now = new Date();
    // let currentDateMMMDDYYYY = now.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', weekday: "short" });
    let day = now.toLocaleString('en-US', { weekday: "short" });
    let month = now.toLocaleString('en-US', { month: 'short' });
    let date = now.toLocaleString('en-US', { day: 'numeric' });
    let year = now.toLocaleString('en-US', { year: 'numeric' });
    let time = now.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    let timeString = `${month} ${date} ${year} ${time} ${day}`;
    return timeString;
  }, []);

  return (
    <div>
      <div>Tab Save {timeString}</div>
      <div>
        {filteredWindows.length} {filteredWindows.length === 1 ? `window ` : `windows `} ({minimizedWindowsCount} minimized, {incognitoWindowsCount} incognito, {fileUrlsCount} local files)
      </div>
      <div>{tabCount} {tabCount === 1 ? `tab` : `tabs`}</div>
      <br/>
      <br/>

      {filteredWindows.map((w, idx) => (
        <div key={w.id}>
          <WindowInfo key={w.id} window={w} windowAndTabInformation={windowAndTabInformation} />
          {idx < filteredWindows.length - 1 && (
            <>
              <br/>
              <br/>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function WindowInfo({ window, windowAndTabInformation }: { window: chrome.windows.Window, windowAndTabInformation: WindowAndTabInformation }) {
  const [windows, tabGroupIdToTabGroup, currentWindowId] = windowAndTabInformation;

  const focused = window.focused || window.id === currentWindowId;

  const windowInfo = [
    `${window.tabs.length} ${window.tabs.length === 1 ? `tab` : `tabs`}`,
    focused && `Focused`,
    window.incognito && `Incognito`,
    window.state === 'minimized' && `Minimized`,
  ].filter(Boolean).join(', ');

  // let windowInfoJSX = <>Window {window.orderIdx} ({windowInfo})</>;
  // if (focused) windowInfoJSX = <b>{windowInfoJSX}</b>;
  const windowInfoJSX = (
    <div style={{ fontWeight: focused ? 800 : 300, color: window.incognito ? 'red' : (focused ? '#5f2aff' : '#000') }}>
      Window {window.orderIdx} ({windowInfo})
    </div>
  );

  return (
    <div style={{ opacity: window.state === 'minimized' || window.incognito ? 0.3 : 1 }}>
      {windowInfoJSX}
      {window.tabs.map((t, idx) => (
        <div key={t.id}>
          <TabInfo key={t.id} tab={t} window={window} tabGroupIdToTabGroup={tabGroupIdToTabGroup} />
        </div>
      ))}
    </div>
  );
}

function TabInfo({ tab, window, tabGroupIdToTabGroup }: { tab: chrome.tabs.Tab, window: chrome.windows.Window, tabGroupIdToTabGroup: TabGroupIdToTabGroup }) {
  // const minimized = window.state === 'minimized';

  const tabNameJsx = (
    <div style={{ fontWeight: tab.active ? 800 : 300 }}>
      {tabGroupIdToTabGroup[tab.groupId] && <span style={{ color: tabGroupIdToTabGroup[tab.groupId].color, fontWeight: 'bold' }}>[{tabGroupIdToTabGroup[tab.groupId].title}]</span>}
      {tab.title}
      {tab.active && <span style={{ color: '#169a0a' }}> (Active)</span>}
    </div>
  );

  // if (tab.favIconUrl) favicon = `<div class="favicon" style="background-image: url('${tab.favIconUrl}')"></div>`;

  let urlJsx = (
    <div style={{ fontWeight: tab.active ? 800 : 300 }}>
      <a href={tab.url} target="_blank" rel="noopener noreferrer">{tab.url}</a>
    </div>
  );

  return (
    <div style={{ marginLeft: 12 }}>
      {tabNameJsx}
      {urlJsx}
    </div>
  );
}

const styles : Styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#fff",
    // width: 800,
    // height: 600,
  },
  textareaContainer: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #c3c3c3",
    borderRadius: 4,
    // margin: 12,
    margin: '0 12px 12px 12px'
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
  copyButton: {
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
  nav: {
    display: "flex",
    flexDirection: "row",
    padding: 12,
  },
  navItem: {
    fontSize: 14,
    fontWeight: 700,
    marginRight: 8,
    cursor: "pointer",
    color: "#000",
    '&:hover': {
      color: "#222",
    },
  },
};
