const textarea = document.querySelector("#textarea");
const copyButton = document.querySelector("#copy-window-btn");
const navCurrBtn = document.querySelector("#nav-curr");
const navAllBtn = document.querySelector("#nav-all");

const getWindows = async () => {
    const windows = await chrome.windows.getAll({ populate: true });
    const currId = (await chrome.windows.getCurrent()).id;

    // give each window an "orderIdx" which tells us the order in which the windows were created
    windows.sort((a, b) => {
        if (a.id < b.id) return -1;
        if (b.id > a.id) return 1;
    });
    windows.map((w, idx) => w.orderIdx = idx + 1);

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

    return windows
};

const createHTML = async (allWindows) => {
    let windows = await getWindows();
    if (!allWindows) windows = [windows[0]];
    let tabGroups = await chrome.tabGroups.query({});
    let tabGroupIdToTabGroup = {};
    tabGroups.forEach(tabGroup => {
        tabGroupIdToTabGroup[tabGroup.id] = tabGroup;
    });

    const tabCount = allWindows ? windows.reduce((acc, w) => acc + w.tabs.length, 0) : windows[0].tabs.length;

    let now = new Date();
    // let currentDateMMMDDYYYY = now.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', weekday: "short" });
    let day = now.toLocaleString('en-US', { weekday: "short" });
    let month = now.toLocaleString('en-US', { month: 'short' });
    let date = now.toLocaleString('en-US', { day: 'numeric' });
    let year = now.toLocaleString('en-US', { year: 'numeric' });
    let time = now.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    let timeString = `${day} ${month} ${date} ${year} ${time}`;

    let minimizedWindowsCount = windows.filter(w => w.state === 'minimized').length;
    let incognitoWindowsCount = windows.filter(w => w.incognito).length;

    let preamble = [
        `Tab Bankruptcy ${timeString}`,
        `${windows.length} ${windows.length === 1 ? 'Window' : 'Windows'}${minimizedWindowsCount ? ` (${minimizedWindowsCount} Minimized)` : ''}${incognitoWindowsCount ? ` (${incognitoWindowsCount} Incognito)` : ''}`,
        `${tabCount} ${tabCount === 1 ? 'Tab' : 'Tabs'}`,
        `<br>`,
    ].filter(x => x).join("<br>");

    return preamble + windows.map((w, idx) => {
        let windowName = [
            `Window ${w.orderIdx}`,
            w.incognito ? "(Incognito)" : "",
            w.focused ? "(Focused)" : "",
            w.state === 'minimized' ? "(Minimized)" : ""
        ].filter(x => x).join(" ");
        if (w.focused) windowName = `<b>${windowName}</b>`;

        // let closeButton = `<button class="close-window" id="${w.id}"></button>`;

        let tabListItems = w.tabs.map((tab, tidx) => {
            let tabName = tab.title;
            if (tab.groupId !== -1) {
                const tabGroup = tabGroupIdToTabGroup[tab.groupId];
                tabName = `<b style="color: ${tabGroup.color};">[${tabGroup.title}]</b> ${tabName}`;
            }
            if (tab.active) tabName += " (Active)";
            if (tab.active) tabName = `<b>${tabName}</b>`;

            // let favicon = '';
            // // if (tab.favIconUrl) favicon = `<img class="favicon" src="${tab.favIconUrl}">`;
            // if (tab.favIconUrl) favicon = `<div class="favicon" style="background-image: url('${tab.favIconUrl}')"></div>`;

            let url = `<a href="${encodeURI(tab.url)}">${encodeURI(tab.url)}</a>`;
            if (tab.active) url = `<b>${url}</b>`;

            // return `<li>${favicon}${tabName}<br>${url}</li>`;
            return `${tabName}<br>${url}`;
        });

        // let tabList = `<ul>${tabListItems.join("\n")}</ul>`;
        let tabList = `${tabListItems.join("<br>")}`;

        // return `${closeButton}${windowName}<br>${tabList}`;
        return `${windowName}<br>${tabList}`;
    }).join("<br><br>"); // .join("<br>"); // .join("");
}

const selectText = () => {
    var sel, range;
    if (window.getSelection && document.createRange) {
        range = document.createRange();
        range.selectNodeContents(textarea);
        sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(textarea);
        range.select();
    }
}

const copyText = () => {
    selectText();
    document.execCommand("copy");
    copyButton.innerText = "Copied!";
    setTimeout(() => {
        if (copyButton.innerText.toLowerCase() === "copied!") copyButton.innerText = "Copy";
    }, 1000);
};

const showContent = async (contentType) => {
    navAllBtn.style.fontWeight = (contentType === 'ALL' ? "700" : "400");
    navCurrBtn.style.fontWeight = (contentType === 'CURR' ? "700" : "400");
    textarea.innerHTML = await createHTML(contentType === 'ALL');
    selectText();

    // document.querySelectorAll(".close-window").forEach(button => {
    //     button.addEventListener("click", async () => {
    //         await chrome.windows.remove(parseInt(button.id));
    //         showContent(contentType);
    //     });
    // });
};

// load initial popup content. show all by default.
showContent('ALL');

// copy button pressed
copyButton.addEventListener("click", () => copyText());

// "all windows" or "current window" pressed
navAllBtn.addEventListener("click", () => showContent('ALL'));
navCurrBtn.addEventListener("click", () => showContent('CURR'));
