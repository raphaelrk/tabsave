/** @jsxImportSource @emotion/react */

import { useEffect, useLayoutEffect, useMemo, useState, useTransition } from "react";
import type { Style, Styles } from "./Styles";
import "./index.css";
import type { TabGroupIdToTabGroup, WindowAndTabInformation, Windows } from "~popup/getWindowAndTabInformation";
import { getWindowAndTabInformation } from "~popup/getWindowAndTabInformation";

export default function TabCopier() {
  const [isPending, startTransition] = useTransition();

  const [windowAndTabInformation, setWindowAndTabInformation] = useState<WindowAndTabInformation>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getWindowAndTabInformation().then(info => {
      startTransition(() => {
        setWindowAndTabInformation(info);
      });
    });
  }, []);

  const [filteredWindowAndTabInformation, setFilteredWindowAndTabInformation] = useState<WindowAndTabInformation>(null);
  useEffect(() => {
    if (!windowAndTabInformation) {
      return;
    }
    startTransition(() => {
      setFilteredWindowAndTabInformation({
        ...windowAndTabInformation,
        windows: windowAndTabInformation.windows.map(w => ({
          ...w,
          tabs: w.tabs.filter(t => t.title.toLowerCase().includes(search.toLowerCase())),
        })).filter(w => w.tabs.length > 0),
      });
    });
  }, [windowAndTabInformation, search]);

  const windowListJsx = useMemo(() => {
    if (!filteredWindowAndTabInformation) {
      return <div style={{ flex: 1, padding: 12, fontSize: 14, color: '#666' }}>Loading...</div>
    };
    return (
      <WindowList
        windowAndTabInformation={filteredWindowAndTabInformation}
      />
    );
  }, [filteredWindowAndTabInformation]);

  return (
    <div css={styles.container}>
      <div css={styles.searchContainer}>
        <input
          css={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      <div css={styles.windowListOuterContainer}>
        <ListHeader />
        {windowListJsx}
        <div css={styles.footer}>
          <div css={{ flex: 1 }} />
          <div css={styles.footerText}>
            {filteredWindowAndTabInformation?.windows.reduce((acc, w) => acc + w.tabs.length, 0)} tabs
            {/* from {filteredWindowAndTabInformation?.windows.length} windows */}
          </div>
          <div css={styles.footerText}>
            {/* {filteredWindowAndTabInformation?.windows.reduce((acc, w) => acc + w.tabs.length, 0)} tabs */}
            {filteredWindowAndTabInformation?.windows.length} windows
          </div>
        </div>
      </div>
    </div>
  );
}

function WindowList({ windowAndTabInformation }: { windowAndTabInformation: WindowAndTabInformation }) {
  const { windows } = windowAndTabInformation;
  return (
    <div css={styles.windowListInnerContainer}>
      {windows.map((w, idx) =>
        <WindowInfo key={w.id} windowListIdx={idx} window={w} windowAndTabInformation={windowAndTabInformation} />
      )}
    </div>
  );
}

function WindowInfo({ windowListIdx, window, windowAndTabInformation }: { windowListIdx: number, window: chrome.windows.Window, windowAndTabInformation: WindowAndTabInformation }) {
  // const [windows, tabGroupIdToTabGroup, currentWindowId] = windowAndTabInformation;
  // const focused = window.focused || window.id === currentWindowId;
  // const incognito = window.incognito;
  // const orderIdx = window.orderIdx;
  // const tabCount = window.tabs.length;
  // const minimized = window.state === 'minimized';

  return (
    <div css={styles.windowInfo}>
      {window.tabs.map((t, idx) => (
        <TabInfo key={t.id} windowListIdx={windowListIdx} tab={t} window={window} windowAndTabInformation={windowAndTabInformation} />
      ))}
      <div
        css={{
          position: 'absolute',
          height: 0.5,
          left: 0,
          right: 0,
          bottom: 0,
          // backgroundColor: 'rgba(0, 0, 0, 0.3)',
          // backgroundColor: `hsla(${windowListIdx * 71 % 360}, 99%, 30%, 0.3)`,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}
      />
    </div>
  );
}

function TabInfo({ windowListIdx, tab, window, windowAndTabInformation }: { windowListIdx: number, tab: chrome.tabs.Tab, window: chrome.windows.Window, windowAndTabInformation: WindowAndTabInformation }) {
  const { tabGroupIdToTabGroup, tabIdToOrderIdx, currWindowId } = windowAndTabInformation;

  const incognito = window.incognito;
  const minimized = window.state === 'minimized';
  const windowFocused = window.focused || window.id === currWindowId;

  return (
    <div css={[
      styles.tabInfoContainer,
      {
        // backgroundColor: `hsl(${window.orderIdx * 30 % 360}, 90%, 96%)`,
        // backgroundColor: tab.active ? `hsl(${window.orderIdx * 30 % 360}, 90%, 90%)` : `hsl(${window.orderIdx * 30 % 360}, 90%, 96%)`,
        // backgroundColor: tab.active ? `hsl(${window.orderIdx * 30 % 360}, 90%, 90%)` : undefined,
        // opacity: incognito || minimized ? 0.5 : 1,
        // backgroundColor: incognito ? '#f99999' : undefined,
        backgroundColor: incognito ? '#f99999' : minimized ? '#e0e0e0' : undefined,
        '&:hover': {
          // backgroundColor: `hsl(${window.orderIdx * 30 % 360}, 96%, 92%)`,
          // boxShadow: `inset 0 -1px 0 0 #00000013, inset 2px 0 0 0 hsl(${window.orderIdx * 30 % 360}, 99%, 40%)`,
          // boxShadow: `inset 0 -1px 0 0 #00000013, inset 2px 0 0 0 rgb(202, 111, 111)`,
          // backgroundColor: `hsl(${window.orderIdx * 30 % 360}, 90%, 90%)`,
          // backgroundColor: `#f2f2f2`,
          backgroundColor: incognito ? '#f08888' : minimized ? '#d9d9d9' : '#f2f2f2',
          // filter: 'brightness(0.95)',
        },
      },
    ]}>
      {/* window order idx */}
      <div css={[
        styles.windowOrderIdxColumn,
        windowFocused && { fontWeight: 800, color: '#5f2aff' },
        tab.active && { fontWeight: 800 },
        {
          // backgroundColor: `hsl(${window.orderIdx * 30 % 360}, 90%, 96%)`,
          // backgroundColor: `hsl(${window.orderIdx * 30 % 360}, 90%, 90%)`,
          // backgroundColor: `hsl(${windowListIdx * 59 % 360}, 90%, 90%)`,
          backgroundColor: `hsl(${windowListIdx * 71 % 360}, 92%, 88%)`,
        }
      ]}>
        {window.orderIdx}
      </div>

      {/* tab order idx */}
      <div css={[styles.windowOrderIdxColumn, { fontWeight: tab.active ? 800 : 300 }]}>
        {tabIdToOrderIdx[tab.id]}
      </div>

      {/* favicon */}
      <div css={styles.faviconColumn}>
        <div css={[styles.favicon, { backgroundImage: `url('${tab.favIconUrl}')` }]}/>
      </div>

      {/* title */}
      <div css={[styles.titleContainer, { fontWeight: tab.active ? 700 : 300 }]} title={tab.title}>
        <div css={styles.title}>
          {tabGroupIdToTabGroup[tab.groupId] &&
            <span style={{ color: tabGroupIdToTabGroup[tab.groupId].color, fontWeight: 'bold' }}>
              [{tabGroupIdToTabGroup[tab.groupId].title}]
            </span>
          }
          {tab.title}
        </div>
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
      <div css={styles.windowOrderIdxColumn} title={"Window index"}>
        W
      </div>

      {/* tab order idx */}
      <div css={styles.windowOrderIdxColumn} title={"Tab index"}>
        T
      </div>

      {/* favicon */}
      <div css={styles.faviconColumn} title={"Favicon"}>
        <div css={styles.favicon}/>
      </div>

      {/* title */}
      <div css={styles.titleContainer}>
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
    // backgroundColor: "#f0f0f0",
    backgroundColor: "#be1436",
  },
  searchContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
    marginLeft: 12,
    marginRight: 12,
    height: 31,
    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.3)',
  },
  searchInput: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: 500,
    border: 'none',
    borderRadius: 8,
    outline: 'none',
    // backgroundColor: '#fff',
    '&::placeholder': {
      color: '#999',
    },
    '&:focus': {
      outline: '2px solid #000',
    },
  },
  windowListOuterContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginTop: 12,
    marginBottom: 8,
    marginLeft: 12,
    marginRight: 12,
    backgroundColor: '#fcfcfc',
    borderRadius: 8,
    overflow: 'hidden',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.4,
    // shadowRadius: 6,
    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.4)',
    // outline: '2px solid #000000',
  },
  windowListInnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'scroll',
    '::-webkit-scrollbar': {
      // '-webkit-appearance': 'none',
      // width: 7,
      width: 8,
    },
    '::-webkit-scrollbar-thumb': {
      borderRadius: 4,
      backgroundColor: 'rgba(0, 0, 0, .5)',
      // '-webkit-box-shadow': '0 0 1px rgba(255,255,255,.5)',
      height: 24,
    },
  },
  windowInfo: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    // opacity: window.state === 'minimized' || window.incognito ? 0.3 : 1, 
    // boxShadow: `inset 0 -1px 0 0 rgba(0 0 0 / 30%)`,
    // borderRadius: 4,
    // borderRadius: 12,
    // border: `1px solid ${window.incognito ? 'red' : (window.focused ? '#5f2aff' : '#000')}`,
    // border: `1px solid #000`,
    // borderBottom: `1px solid #000`,
    // boxShadow: `inset 0 -2px 0 0 #00000093`,
    // marginBottom: 10,
    // backgroundColor: '#fff',
    // backgroundColor: '#ff0',
    // css pseudo selector to style the last child
    // '&:last-child': {
    //   borderBottom: 0,
    //   marginBottom: 0,
    // },
  },
  tabInfoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 31,
    boxShadow: `inset 0 -1px 0 0 #00000013`,
    // borderBottom: '1px solid #e9e9e9',
    // opacity: (window.state === 'minimized' || window.incognito) ? 0.3 : 1,
    // backgroundColor: tab.active ? '#cfc' : (tab.incognito ? '#780c20ad' : undefined),
  },
  listHeader: {
    backgroundColor: '#f8f8f8',
    // backgroundColor: '#fafaff',
    // borderBottom: '1px solid #000000',
    // boxShadow: `inset 0 -1px 0 0 #00000020`,
  },
  windowOrderIdxColumn: {
    width: 31,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 300,
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
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
  },
  titleContainer: {
    ...oneLine,
    flex: 0.5,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 300,
    overflow: 'hidden',
    borderRight: '1px solid #00000013',
    paddingLeft: 8,
    paddingRight: 8,
  },
  title: {
    ...oneLine,
    flex: 1,
  },
  urlContainer: {
    ...oneLine,
    flex: 0.5,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 300,
    overflow: 'hidden',
    paddingLeft: 8,
    paddingRight: 8,
  },
  url: {
    ...oneLine,
    flex: 1,
    // color: '#5f098bff',
    color: '#000',
    fontSize: 12,
    // textDecorationLine: 'none',
  },
  footer: {
    backgroundColor: '#f8f8f8',
    height: 24,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    // borderTopWidth: 1,
    // borderTopColor: '#e9e9e9',
    boxShadow: `inset 0 1px 0 0 #00000013`,
  },
  footerText: {
    fontWeight: 500,
    fontSize: 12,
    color: '#777',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 92,
    height: '100%',
    // backgroundColor: '#f00',
    // color: '#00000093',
    borderLeft: `1px solid #00000013`,
    // fontVariant: 'all-petite-caps',
  },
};
