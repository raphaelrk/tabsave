declare global {
  namespace chrome {
    namespace windows {
      interface Window {
        orderIdx: number;
      }
    }
    namespace tabs {
      interface Tab {
        orderIdx: number;
      }
    }
  }
}

export type Windows = chrome.windows.Window[];
export type TabGroupIdToTabGroup = { [id: number]: chrome.tabGroups.TabGroup };
export type TabIdToOrderIdx = { [id: number]: number };
export type WindowAndTabInformation = {
  windows: Windows;
  tabGroupIdToTabGroup: TabGroupIdToTabGroup;
  currWindowId: number;
  tabIdToOrderIdx: TabIdToOrderIdx;
};

export async function getWindowAndTabInformation(): Promise<WindowAndTabInformation> {
  const windows = await chrome.windows.getAll({ populate: true });
  const currWindowId = (await chrome.windows.getCurrent()).id;

  // give each window an "orderIdx" which tells us the order in which the windows were created
  windows.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (b.id > a.id) return 1;
  });
  windows.map((w, idx) => w.orderIdx = idx + 1);
  windows.map((w, idx) => w.id === currWindowId && console.log('current window:', w));

  // give each tab an "orderIdx" which tells us the order in which the tabs were created
  const tabs : chrome.tabs.Tab[] = windows.reduce((acc, w) => acc.concat(w.tabs), []);
  tabs.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (b.id > a.id) return 1;
  });
  tabs.map((t, idx) => t.orderIdx = idx + 1);
  const tabIdToOrderIdx = {};
  tabs.forEach(t => tabIdToOrderIdx[t.id] = t.orderIdx);

  // put current window on top
  // put incognito windows on bottom (only relevant if "Allow In Incognito" toggled on in settings)
  windows.sort((a, b) => {
    if (a.id == currWindowId) return -1;
    if (b.id == currWindowId) return 1;
    if (a.incognito && !b.incognito) return 1;
    if (b.incognito && !a.incognito) return -1;
    if (a.state === 'minimized' && b.state !== 'minimized') return 1;
    if (b.state === 'minimized' && a.state !== 'minimized') return -1;
    if (a.id < b.id) return -1;
    if (b.id > a.id) return 1;
    return 0;
  });

  // fetch the tab groups
  let tabGroups = await chrome.tabGroups.query({});
  let tabGroupIdToTabGroup = {};
  tabGroups.forEach(tabGroup => {
    tabGroupIdToTabGroup[tabGroup.id] = tabGroup;
  });

  return { windows, tabGroupIdToTabGroup, currWindowId, tabIdToOrderIdx };
}
