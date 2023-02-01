const textarea = document.querySelector("#textarea");
const copyButton = document.querySelector("#copy-window-btn");
const navCurrBtn = document.querySelector("#nav-curr");
const navAllBtn = document.querySelector("#nav-all");

const getWindows = async () => {
    const windows = await chrome.windows.getAll({ populate: true });
    const currId = (await chrome.windows.getCurrent()).id;

    // put current window on top
    // put incognito windows on bottom (only relevant if "Allow In Incognito" toggled on in settings)
    windows.sort((a, b) => {
        if (a.id == currId) return -1;
        if (b.id == currId) return 1;
        if (a.incognito && !b.incognito) return 1;
        if (b.incognito && !a.incognito) return -1;
        return 0;
    });

    return windows
};

const createHTML = async (allWindows) => {
    let windows = await getWindows();
    if (!allWindows) windows = [windows[0]];
    return windows.map(w => `
        ${w.incognito ? `(Incognito)<br>` : ``}
        ${w.tabs.map(tab => `
            ${tab.title}
            <br>
            <a href="${encodeURI(tab.url)}">${encodeURI(tab.url)}</a>
        `).join("<br>")}
    `).join("<br><br>");
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
};

// load initial popup content. show all by default.
showContent('ALL');

// copy button pressed
copyButton.addEventListener("click", () => copyText());

// "all windows" or "current window" pressed
navAllBtn.addEventListener("click", () => showContent('ALL'));
navCurrBtn.addEventListener("click", () => showContent('CURR'));
