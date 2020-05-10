window.addEventListener("load", () => {
    chrome.tabs.query({ "currentWindow": true }, tabs => {
        const urls = tabs.map(tab => (`
            ${tab.title}
            <br>
            <a href="${escape(tab.url)}">${escape(tab.url)}</a>
        `));
        const textarea = document.querySelector("div");
        textarea.innerHTML = urls.join("<br>");
        // textarea.select();
        // document.execCommand("copy");
    });
    document.querySelector("button").addEventListener("click", () => {
        copy();
        // const urls = document.querySelector("div").value.split("\n");
        // urls.map(url => chrome.tabs.create({ "url": url.trim(), "active": false }));
    });

    const div = document.querySelector("div");
    const copy = () => {
        window.setTimeout(function() {
            var sel, range;
            if (window.getSelection && document.createRange) {
                range = document.createRange();
                range.selectNodeContents(div);
                sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (document.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(div);
                range.select();
            }
            document.execCommand("copy");
            document.querySelector("button").innerText = "Copied!";
        }, 1);
    }
    // div.onfocus = copy;
    copy();
});
