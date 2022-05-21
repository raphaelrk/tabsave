window.addEventListener("load", () => {

    const textarea = document.querySelector("#textarea");
    const button = document.querySelector("button");
    const navCurrBtn = document.querySelector("#nav-curr");
    const navAllBtn = document.querySelector("#nav-all");

    // https://stackoverflow.com/a/43439734/3273806
    function unescapeHtml(unsafe) {
        return unsafe
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
    }
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const asyncGetCurrentWindowId = () => {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ "currentWindow": true }, tabs => {
                resolve(tabs[0].windowId);
            });
        });
    };

    const setText = async (onlyCurrentWindow) => {
        const currentWindowId = await asyncGetCurrentWindowId();

        chrome.tabs.query(onlyCurrentWindow ? { "currentWindow": onlyCurrentWindow } : {}, async tabs => {

            const tabsByWindow = {};
            tabs.forEach(tab => {
                tabsByWindow[tab.windowId] = tabsByWindow[tab.windowId] || [];
                tabsByWindow[tab.windowId].push(tab);
            });

            // put current window on top
            const windows = Object.entries(tabsByWindow);
            windows.sort(([a_id, a_tabs], [b_id, b_tabs]) => {
                if (a_id == currentWindowId) return -1;
                if (b_id == currentWindowId) return 1;
                return 0;
            });

            const html = windows.map(([windowId, tabs]) => {
                return tabs.map(tab => (`
                    ${tab.title}
                    <br>
                    <a href="${escapeHtml(tab.url)}">${escapeHtml(tab.url)}</a>
                `)).join("<br>");
            }).join("<br><br>")

            textarea.innerHTML = html;
        });
    };

    const selectText = (shouldCopy) => {
        window.setTimeout(function() {
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
            if (shouldCopy) {
                document.execCommand("copy");
                button.innerText = "Copied!";
                setTimeout(() => {
                    if (button.innerText.toLowerCase() === "copied!") button.innerText = "Copy";
                }, 1000);
            }
        }, 1);
    }

    const setMode = async (onlyCurrentWindow) => {
        navCurrBtn.style.fontWeight = onlyCurrentWindow ? "700" : "400";
        navAllBtn.style.fontWeight = onlyCurrentWindow ? "400" : "700";
        await setText(onlyCurrentWindow);
        setTimeout(() => selectText(false), 100);
    };

    setMode(false);

    button.addEventListener("click", () => {
        selectText(true);
    });
    navCurrBtn.addEventListener("click", () => {
        setMode(true);
    });
    navAllBtn.addEventListener("click", () => {
        setMode(false);
    });
    
});
