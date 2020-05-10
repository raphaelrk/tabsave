window.addEventListener("load", () => {
    chrome.tabs.query({ "currentWindow": true }, tabs => {
        const urls = tabs.map(tab => (`
            ${tab.title}
            <br>
            <a href="${escape(tab.url)}">${escape(tab.url)}</a>
        `));
        const textarea = document.querySelector("#textarea");
        textarea.innerHTML = urls.join("<br>");
        // textarea.select();
        // document.execCommand("copy");
    });
    document.querySelector("button").addEventListener("click", () => {
        copy();
        // const urls = document.querySelector("#textarea").value.split("\n");
        // urls.map(url => chrome.tabs.create({ "url": url.trim(), "active": false }));
    });

    const textarea = document.querySelector("#textarea");
    const copy = () => {
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
            document.execCommand("copy");
            document.querySelector("button").innerText = "Copied window!";
        }, 1);
    }
    // textarea.onfocus = copy;
    copy();
});
