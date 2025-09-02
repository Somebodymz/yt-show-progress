console.log("ytsp: background.js loaded.")

let globalRecentUrl = ''

browser.webNavigation.onHistoryStateUpdated.addListener(details => {
    console.log('ytsp: background.js: ', details)
    if (details.frameId !== 0) {
        return;
    }

    browser.tabs.sendMessage(details.tabId, {
        type: 'ytspUrlChanged',
        url: details.url,
        prevUrl: globalRecentUrl
    });

    globalRecentUrl = details.url
});
