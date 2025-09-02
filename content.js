console.log('ytsp: content.js loaded.');

const isMobile = location.hostname.startsWith('m.') || !!document.querySelector('ytm-app');

let globalSettings = {};

(async () => {
    'use strict';

    const ui = await import(browser.runtime.getURL('modules/ui.js'));

    globalSettings = (await import(browser.runtime.getURL('modules/settings.js'))).default;
    const savedSettings = (await browser.storage.local.get('settings'))["settings"] || {};
    if (savedSettings) {
        globalSettings = {
            ...globalSettings,
            ...savedSettings
        }
    }

    if (showProgressFor(location.href)) {
        ui.init()
        await handleFullscreen();
    } else {
        ui.disable()
    }
})();

browser.runtime.onMessage.addListener(async message => {
    if (message.type !== 'ytspUrlChanged') {
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
