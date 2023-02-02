/** @jsxImportSource @emotion/react */

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { Style, Styles } from "./Styles";
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
      {windowAndTabInformation && <WindowList windowAndTabInformation={windowAndTabInformation} />}
      {!windowAndTabInformation && <div style={{ padding: 20, fontSize: 14, color: '#666' }}>Loading...</div>}
    </div>
  );
}

function WindowList({ windowAndTabInformation }: { windowAndTabInformation: WindowAndTabInformation }) {
  const windows = windowAndTabInformation[0];
  return (
    <div css={styles.windowListOuterContainer}>
      <ListHeader />
      <div css={styles.windowListInnerContainer}>
        {windows.map((w, idx) =>
          <WindowInfo key={w.id} window={w} windowAndTabInformation={windowAndTabInformation} />
        )}
      </div>
    </div>
  );
}

function WindowInfo({ window, windowAndTabInformation }: { window: chrome.windows.Window, windowAndTabInformation: WindowAndTabInformation }) {
//   const [windows, tabGroupIdToTabGroup, currentWindowId] = windowAndTabInformation;
// 
//   const focused = window.focused || window.id === currentWindowId;
// 
//   const windowInfo = [
//     `${window.tabs.length} ${window.tabs.length === 1 ? `tab` : `tabs`}`,
//     focused && `Focused`,
//     window.incognito && `Incognito`,
//     window.state === 'minimized' && `Minimized`,
//   ].filter(Boolean).join(', ');
// 
//   const windowInfoJSX = (
//     <div style={{ fontWeight: focused ? 800 : 300, color: window.incognito ? 'red' : (focused ? '#5f2aff' : '#000') }}>
//       Window {window.orderIdx} ({windowInfo})
//     </div>
//   );

  return (
    <div
      css={styles.windowInfo}>
      {/* {windowInfoJSX} */}
      {window.tabs.map((t, idx) => (
        <TabInfo key={t.id} tab={t} window={window} windowAndTabInformation={windowAndTabInformation} />
      ))}
    </div>
  );
}

function TabInfo({ tab, window, windowAndTabInformation }: { tab: chrome.tabs.Tab, window: chrome.windows.Window, windowAndTabInformation: WindowAndTabInformation }) {
  const [windows, tabGroupIdToTabGroup, currentWindowId] = windowAndTabInformation;

  return (
    <div css={styles.tabInfoContainer}>
      {/* window order idx */}
      <div css={[styles.windowOrderIdxColumn, { fontWeight: tab.active ? 800 : 300, color: tab.active ? '#5f2aff' : '#000' }]}>
        {window.orderIdx}
      </div>

      {/* favicon */}
      <div css={styles.faviconColumn}>
        <div css={[styles.favicon, { backgroundImage: `url('${tab.favIconUrl}')` }]}/>
      </div>

      {/* title */}
      <div css={[styles.titleContainer, { fontWeight: tab.active ? 700 : 300 }]}>
        {/* <div style={{ width: 10 }}/> */}
        {tabGroupIdToTabGroup[tab.groupId] &&
          <span style={{ color: tabGroupIdToTabGroup[tab.groupId].color, fontWeight: 'bold' }}>
            [{tabGroupIdToTabGroup[tab.groupId].title}]
          </span>
        }
        {tab.title}
        {tab.active && <span style={{ color: '#169a0a' }}> (Active)</span>}
      </div>

      {/* url */}
      <div css={[styles.urlContainer, { fontWeight: tab.active ? 800 : 300 }]}>
        <a css={styles.url} href={tab.url} target="_blank" rel="noopener noreferrer">{tab.url}</a>
      </div>
    </div>
  );
}

function ListHeader() {
  return (
    <div css={[styles.tabInfoContainer, styles.listHeader]}>
      {/* window order idx */}
      <div css={styles.windowOrderIdxColumn}>
        #
      </div>

      {/* favicon */}
      <div css={styles.faviconColumn}>
        <div css={styles.favicon}/>
      </div>

      {/* title */}
      <div css={styles.titleContainer}>
        {/* <div style={{ width: 10 }}/> */}
        title
      </div>

      {/* url */}
      <div css={styles.urlContainer}>
        <span css={styles.url}>url</span>
      </div>
    </div>
  );
}

const oneLine : Style = {
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  wordWrap: 'normal',
};

const styles : Styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  windowListOuterContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    margin: '12px 12px 0 12px',
    overflowY: 'hidden',
    // backgroundColor: "#fff",
    borderLeft: `1px solid #00000093`,
    borderTop: `1px solid #00000093`,
    borderRight: `1px solid #00000093`,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  windowListInnerContainer: {
    // backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'scroll',
    // boxShadow: '0 1px 3px 0 rgba(0,0,0,0.15)',
  },
  windowInfo: {
    display: 'flex',
    flexDirection: 'column',
    // opacity: window.state === 'minimized' || window.incognito ? 0.3 : 1, 
    // boxShadow: `inset 0 -1px 0 0 rgba(0 0 0 / 30%)`,
    // borderRadius: 4,
    // borderRadius: 12,
    // border: `1px solid ${window.incognito ? 'red' : (window.focused ? '#5f2aff' : '#000')}`,
    // border: `1px solid #000`,
    // marginBottom: 10,
    backgroundColor: '#fff',
    // backgroundColor: '#ff0',
  },
  tabInfoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 31,
    boxShadow: `inset 0 -1px 0 0 #00000013`,
    // opacity: (window.state === 'minimized' || window.incognito) ? 0.3 : 1,
    // backgroundColor: tab.active ? '#cfc' : (tab.incognito ? '#780c20ad' : undefined),
    '&:hover': {
      backgroundColor: 'rgb(240, 240, 240)',
      boxShadow: `inset 0 -1px 0 0 #00000013, inset 2px 0 0 0 rgb(202, 111, 111)`,
    },
  },
  listHeader: {
    backgroundColor: '#fafaff',
  },
  windowOrderIdxColumn: {
    width: 31,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 300,
    // fontWeight: tab.active ? 800 : 300,
    // color: tab.active ? '#5f2aff' : '#000',
    borderRight: '1px solid #00000013',
    fontSize: 10,
  },
  faviconColumn: {
    width: 31,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: '1px solid #00000013',
  },
  favicon: {
    width: 16,
    height: 16,
    // backgroundImage: `url('${tab.favIconUrl}')`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
  },
  titleContainer: {
    ...oneLine,
    flex: 0.5,
    // height: '100%',
    // display: 'flex',
    // alignItems: 'center',
    fontWeight: 300,
    // fontWeight: tab.active ? 700 : 300,
    overflow: 'hidden',
    // marginRight: 20,
    borderRight: '1px solid #00000013',
    paddingLeft: 8,
    paddingRight: 8,
  },
  urlContainer: {
    ...oneLine,
    flex: 0.5,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 300,
    // fontWeight: tab.active ? 800 : 300,
    overflow: 'hidden',
    paddingLeft: 8,
    paddingRight: 8,
  },
  url: {
    ...oneLine,
    flex: 1,
  },
  oneline: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
  },
};
