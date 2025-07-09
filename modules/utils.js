export function formatTime(seconds, fullFormat = false) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let sec = Math.floor(seconds % 60);

    if (fullFormat || hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${sec.toString().padStart(2, '0')}`;
    }
}

/**
 *
 * @param selector
 * @param timeout
 * @returns {Promise<Element>}
 */
export function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver(() => {
            console.log('ytsp: waiting for element:', selector);
            const node = document.querySelector(selector);
            if (node) {
                observer.disconnect();
                resolve(node);
            }
        });

        ytspMutationObservers['waitForElement'] = observer;

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} was not found before timeout (${(timeout / 1000)}s.`));
        }, timeout);
    });
}
