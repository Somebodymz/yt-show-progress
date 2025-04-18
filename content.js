console.log('content.js loaded.');

const ytspSettings = {
    isFull: true,
    position: 'bottom',
    showTime: true,
    showPercent: true,
};

(async () => {
    'use strict';

    const ui = await import(browser.runtime.getURL('modules/ui.js'))

    if (showProgressFor(location.href)) {
        ui.init()
    } else {
        ui.disable()
    }
})();

browser.runtime.onMessage.addListener(async message => {
    if (message.type !== 'ytsp-url-changed') {
        return;
    }

    const ui = await import(browser.runtime.getURL('modules/ui.js'))

    if (showProgressFor(message.url)) {
        ui.init()
    } else {
        ui.disable()
    }
});

function showProgressFor(url) {
    if (url.includes('youtube.com/watch')) {
        return true
    }

    if (url.includes('youtube.com/shorts')) {
        return true
    }

    return false
}