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

export function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver(() => {
            const node = document.querySelector(selector);
            if (node) {
                observer.disconnect();
                resolve(node);
            }
        });

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

export function watchClassToggle(targetElement, className, callback) {
    const observer = new MutationObserver(() => {
        callback(targetElement.classList.contains(className));
    });

    observer.observe(targetElement, {
        attributes: true,
        attributeFilter: ['class'],
    });

    callback(targetElement.classList.contains(className));
}