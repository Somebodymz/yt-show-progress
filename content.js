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

    if (location.href.includes('youtube.com/watch')) {
        ui.init()
    }else{
        ui.disable()
    }
})();

browser.runtime.onMessage.addListener(async message => {
    if (message.type !== 'ytsp-url-changed') {
        return;
    }

    const ui = await import(browser.runtime.getURL('modules/ui.js'))

    if (message.url.includes('youtube.com/watch')) {
        ui.init()
    }else{
        ui.disable()
    }
});
