declare global {
  namespace chrome {
    namespace windows {
      interface Window {
        orderIdx: number;
      }
    }
  }
}

export type Windows = chrome.windows.Window[];
export type TabGroupIdToTabGroup = { [id: number]: chrome.tabGroups.TabGroup };
export type WindowAndTabInformation = [Windows, TabGroupIdToTabGroup, number];

export async function getWindowAndTabInformation(): Promise<WindowAndTabInformation> {
  const windows = await chrome.windows.getAll({ populate: true });
  const currId = (await chrome.windows.getCurrent()).id;

  // give each window an "orderIdx" which tells us the order in which the windows were created
  windows.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (b.id > a.id) return 1;
  });
  windows.map((w, idx) => w.orderIdx = idx + 1);
  windows.map((w, idx) => w.id === currId && console.log('wow', w));

  // put current window on top
  // put incognito windows on bottom (only relevant if "Allow In Incognito" toggled on in settings)
  windows.sort((a, b) => {
    if (a.id == currId) return -1;
    if (b.id == currId) return 1;
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

  return [windows, tabGroupIdToTabGroup, currId];
}
