console.log("ytsp: background.js loaded.")

let ytspGlobalRecentUrl = ''

browser.webNavigation.onHistoryStateUpdated.addListener(details => {
    if (details.frameId !== 0) {
        return;
    }

    browser.tabs.sendMessage(details.tabId, {
        type: 'ytsp-url-changed',
        url: details.url,
        prevUrl: ytspGlobalRecentUrl
    });

    ytspGlobalRecentUrl = details.url
});