new window.MutationObserver(function (x) {
    renderMathInElement(document.body, {delimiters: delimiters});
}).observe(document.getElementsByTagName("main")[0], {childList: true, subtree: true});