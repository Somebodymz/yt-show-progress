/** @type {{formatTime:function}} */
const utils = await import(browser.runtime.getURL('modules/utils.js'));

let mode = 'current'; // current|remain

const elementNames = {
    container: 'ytsp-container',
    timeText: 'ytsp-time-text',
    progressBar: 'ytsp-progress-bar',
}

export function init() {
    removeTimeDisplay()
    createTimeDisplay()
    setInterval(updateTimeDisplay, 1000)
}

export function disable() {
    removeTimeDisplay()
}

export function createTimeDisplay() {
    if (ytspSettings.tinyEnabled) {
        createTimeDisplayTiny()
    }
    if (ytspSettings.wideEnabled) {
        createTimeDisplayWide()
    }
}

function createTimeDisplayTiny() {
    let container = document.createElement('div');
    container.className = `${elementNames.container} ${elementNames.container}-tiny`;
    container.style.position = 'fixed';
    container.style.background = 'rgba(0, 0, 0, 0.7)';
    container.style.color = '#fff';
    container.style.padding = '4px 8px';
    container.style.borderRadius = '4px';
    container.style.fontSize = '14px';
    container.style.fontFamily = 'Arial, sans-serif';
    //container.style.zIndex = '9999';
    container.style.minWidth = '60px';
    container.style.textAlign = 'center';
    container.style.overflow = 'hidden';
    if (ytspSettings.tinyPosition === 'top') {
        container.style.top = '60px';
        container.style.right = '10px';
    } else {
        container.style.bottom = '10px';
        container.style.right = '10px';
    }

    let timeText = document.createElement('div');
    timeText.className = elementNames.timeText;
    timeText.style.position = 'relative';
    timeText.style.marginBottom = '2px';
    timeText.textContent = '...';

    let progressBar = document.createElement('div');
    progressBar.className = `${elementNames.progressBar} ${elementNames.progressBar}-tiny`;
    progressBar.style.position = 'absolute';
    progressBar.style.bottom = '0';
    progressBar.style.left = '0';
    progressBar.style.height = ytspSettings.tinyFullBackground ? '100%' : '2px';
    progressBar.style.background = 'red';
    progressBar.style.color = 'black';
    progressBar.style.width = '0%';
    if (ytspSettings.tinyFullBackground) {
        progressBar.style.whiteSpace = 'nowrap';
        progressBar.style.lineHeight = '27px';
        progressBar.style.textIndent = '9px';
        progressBar.style.textAlign = 'left';
    } else {
        progressBar.style.color = 'red';
    }

    container.appendChild(progressBar);
    container.appendChild(timeText);
    document.body.appendChild(container);
}

function createTimeDisplayWide() {
    const container = document.createElement('div');
    container.className = `${elementNames.container} ${elementNames.container}-wide`;
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.right = '0';
    container.style.top = '100%';
    container.style.width = '100%';
    container.style.height = '2px';
    //container.style.zIndex = '9999';
    container.style.pointerEvents = 'none';

    let progressBar = document.createElement('div');
    progressBar.className = `${elementNames.progressBar} ${elementNames.progressBar}-wide`;
    progressBar.style.position = 'absolute';
    progressBar.style.bottom = '0';
    progressBar.style.left = '0';
    progressBar.style.height = '100%';
    progressBar.style.background = 'red';
    progressBar.style.color = 'black';
    progressBar.style.width = '0%';

    container.appendChild(progressBar);

    document.querySelector('#movie_player').closest('#container').appendChild(container);
}

export function removeTimeDisplay() {
    let oldElements = document.querySelectorAll('.' + elementNames.container);
    if (oldElements.length > 0) {
        oldElements.forEach(el => el.remove());
    }
}

export function updateTimeDisplay() {
    let timeText = document.querySelectorAll('.' + elementNames.timeText);
    let progressBar = document.querySelectorAll('.' + elementNames.progressBar);

    let times = getVideoTime()

    if (progressBar.length > 0) {
        progressBar.forEach(el => el.style.width = `${times.percent}%`);
    }

    if (timeText.length > 0 && progressBar.length > 0) {
        let text = ''
        let textTime = mode === 'remain' ? times.remain : times.current

        if (ytspSettings.tinyShowTime && ytspSettings.tinyShowPercent) {
            text = `${textTime} / ${times.total} (${times.percent}%)`
        } else if (ytspSettings.tinyShowTime) {
            text = `${textTime} / ${times.total}`
        } else if (ytspSettings.tinyShowPercent) {
            text = `${times.percent}%`
        }

        if (isNaN(times.percent)) {
            text = 'Undefined. Try to reload.'
        }

        timeText.forEach(el => el.textContent = text);
        progressBar.forEach(el => el.textContent = el.className.includes('tiny') ? text : '')
    }
}

function getVideoTime() {
    let video = document.querySelector('video');

    let result = {
        current: '',
        remain: '',
        total: '',
        percent: 0,
    }

    if (video) {
        result = {
            current: utils.formatTime(video.currentTime),
            remain: '-' + utils.formatTime(video.duration - video.currentTime),
            total: utils.formatTime(video.duration),
            percent: round((video.currentTime / video.duration) * 100),
        }
    }

    return result
}

function round(value, decimals = 1) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
