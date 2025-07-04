console.log('ytsp: content.js loaded.');

const ytspSettings = {
    wideEnabled: true,
    wideHeight: '2px',

    tinyEnabled: true,
    tinyPosition: 'bottom',
    tinyFullBackground: true,
    tinyShowTime: true,
    tinyShowPercent: false,
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
    return !!(url.includes('youtube.com/watch') || url.includes('youtube.com/shorts'))
}

/**
 * Watch fullscreen changes.
 */
document.addEventListener('fullscreenchange', async () => {
    if (document.fullscreenElement) {
        await handleFullscreenOn()
    } else {
        await handleFullscreenOff()
    }
});

async function handleFullscreenOn() {
    const ui = await import(browser.runtime.getURL('modules/ui.js'))

    ui.hideTimer();
}

async function handleFullscreenOff() {
    const ui = await import(browser.runtime.getURL('modules/ui.js'))

    ui.showTimer();
}