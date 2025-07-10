console.log('ytsp: content.js loaded.');

const ytspMutationObservers = {}

const isMobile = location.hostname.startsWith('m.') ||
    !!document.querySelector('ytm-app');

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
        await handleFullscreen();
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
        await handleFullscreen();
    } else {
        ui.disable()
    }
});

function showProgressFor(url) {
    return !!(url.includes('youtube.com/watch') || url.includes('youtube.com/shorts'))
}

async function handleFullscreen() {
    if (document.fullscreenElement) {
        await handleFullscreenOn()
    } else {
        await handleFullscreenOff()
    }
}

/**
 * Watch fullscreen changes.
 */
document.addEventListener('fullscreenchange', handleFullscreen);

async function handleFullscreenOn() {
    const ui = await import(browser.runtime.getURL('modules/ui.js'))

    if (!isMobile) {
        ui.hideTimer();
    } else {
        document.querySelector('.ytsp-container-tiny').style.marginTop = '-35px';
    }
}

async function handleFullscreenOff() {
    const ui = await import(browser.runtime.getURL('modules/ui.js'))

    if (!isMobile) {
        ui.showTimer();
    } else {
        document.querySelector('.ytsp-container-tiny').style.marginTop = '5px';
    }
}

//console.log( ytspMutationObservers );
