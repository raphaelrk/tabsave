/** @jsxImportSource @emotion/react */

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { Styles } from "./Styles";
import "./index.css";
import type { TabGroupIdToTabGroup, WindowAndTabInformation, Windows } from "~popup/getWindowAndTabInformation";
import { getWindowAndTabInformation } from "~popup/getWindowAndTabInformation";

export default function TabCopier() {
  const [windowAndTabInformation, setWindowAndTabInformation] = useState<WindowAndTabInformation>(null);

  useEffect(() => {
    getWindowAndTabInformation().then(setWindowAndTabInformation);
  }, []);

  return (
    <div css={styles.container}>
      <div css={styles.textareaContainer}>
        <div css={styles.textarea}>
          {windowAndTabInformation && <WindowList windowAndTabInformation={windowAndTabInformation} />}
        </div>
      </div>
    </div>
  );
}

function WindowList({ windowAndTabInformation }: { windowAndTabInformation: WindowAndTabInformation }) {
  const windows = windowAndTabInformation[0];
  return (
    <div css={{ display: 'flex', flexDirection: 'column' }}>
      {windows.map((w, idx) => (
        <div key={w.id} css={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: idx < windows.length - 1 ? 24 : 0,
          backgroundColor: '#f99',
          padding: 12,
          borderRadius: 8,
        }}>
          <WindowInfo key={w.id} window={w} windowAndTabInformation={windowAndTabInformation} />
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

  const windowInfoJSX = (
    <div style={{ fontWeight: focused ? 800 : 300, color: window.incognito ? 'red' : (focused ? '#5f2aff' : '#000') }}>
      Window {window.orderIdx} ({windowInfo})
    </div>
  );

  return (
    <div style={{ opacity: window.state === 'minimized' || window.incognito ? 0.3 : 1, display: 'flex', flexDirection: 'column' }}>
      {windowInfoJSX}
      {window.tabs.map((t, idx) => (
        <div key={t.id} css={{ display: 'flex', flexDirection: 'column', marginBottom: idx < window.tabs.length - 1 ? 12 : 0 }}>
          <TabInfo key={t.id} tab={t} window={window} tabGroupIdToTabGroup={tabGroupIdToTabGroup} />
        </div>
      ))}
    </div>
  );
}

function TabInfo({ tab, window, tabGroupIdToTabGroup }: { tab: chrome.tabs.Tab, window: chrome.windows.Window, tabGroupIdToTabGroup: TabGroupIdToTabGroup }) {
  // const minimized = window.state === 'minimized';

  const tabNameJsx = (
    <div style={{ flex: 1, fontWeight: tab.active ? 800 : 300, overflow: 'hidden', marginRight: 20 }}>
      {tabGroupIdToTabGroup[tab.groupId] && <span style={{ color: tabGroupIdToTabGroup[tab.groupId].color, fontWeight: 'bold' }}>[{tabGroupIdToTabGroup[tab.groupId].title}]</span>}
      {tab.title}
      {tab.active && <span style={{ color: '#169a0a' }}> (Active)</span>}
    </div>
  );

  // if (tab.favIconUrl) favicon = `<div class="favicon" style="background-image: url('${tab.favIconUrl}')"></div>`;

  let urlJsx = (
    <div style={{ flex: 1, fontWeight: tab.active ? 800 : 300, overflow: 'hidden' }}>
      <a href={tab.url} target="_blank" rel="noopener noreferrer">{tab.url}</a>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 12 }}>
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
    display: "flex",
    flexDirection: "column",
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
};
