/** @type {{formatTime:function}} */
const utils = await import(browser.runtime.getURL('modules/utils.js'));

const mode = {
    CURRENT: 'current',
    REMAIN: 'remain',
    CURRENT_ONLY: 'current_only',
    REMAIN_ONLY: 'remain_only',
}

/** @type string */
let currentMode = localStorage.getItem('ytspCurrentMode') ?? mode.CURRENT;

const elementNames = {
    container: 'ytsp-container',
    timeText: 'ytsp-time-text',
    progressBar: 'ytsp-progress-bar',
}

export function init() {
    removeTimeDisplay()
    createTimeDisplay()
    setInterval(updateTimeDisplay, 500)
}

export function disable() {
    removeTimeDisplay()
}

export function showTimer() {
    let timer = document.querySelector('.ytsp-container-tiny')

    if (timer) {
        timer.style.display = 'block'
    }
}

export function hideTimer() {
    let timer = document.querySelector('.ytsp-container-tiny')

    if (timer) {
        timer.style.display = 'none'
    }
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
    container.style.background = 'rgba(0, 0, 0, 0.7)';
    container.style.color = '#fff';
    container.style.padding = '4px 8px';
    container.style.borderRadius = '4px';
    container.style.fontSize = '14px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.zIndex = '99';
    container.style.minWidth = '12px';
    container.style.textAlign = 'center';
    container.style.overflow = 'hidden';
    if (isMobile) {
        container.style.position = 'absolute';
        if (ytspSettings.tinyPosition === 'top') {
            container.style.top = '60px';
        } else {
            container.style.top = '100%';
            container.style.marginTop = '5px';
            container.style.marginRight = '-5px';
            container.style.opacity = '.75';
        }
    } else {
        container.style.position = 'fixed';
        if (ytspSettings.tinyPosition === 'top') {
            container.style.top = '60px';
        } else {
            container.style.bottom = '10px';
        }
    }
    container.style.right = '10px';

    let timeText = document.createElement('div');
    timeText.className = elementNames.timeText;
    timeText.style.position = 'relative';
    timeText.style.marginBottom = '1px';
    timeText.style.cursor = 'pointer';
    timeText.textContent = '...';
    timeText.addEventListener('click', e => {
        currentMode = nextMode();
        console.log('current mode:', currentMode);
        localStorage.setItem('ytspCurrentMode', currentMode);
        updateTimeDisplay()
    });

    let progressBar = document.createElement('div');
    progressBar.className = `${elementNames.progressBar} ${elementNames.progressBar}-tiny`;
    progressBar.style.position = 'absolute';
    progressBar.style.bottom = '0';
    progressBar.style.left = '0';
    progressBar.style.height = ytspSettings.tinyFullBackground ? '100%' : ytspSettings.wideHeight;
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

    const mobileVideoContainer = document.querySelector('#player-container-id');

    if (isMobile && mobileVideoContainer) {
        mobileVideoContainer.appendChild(container)
    } else {
        document.body.appendChild(container);
    }
}

function createTimeDisplayWide() {
    const videoContainerSelector = isMobile ? '#player-container-id' : '#movie_player';
    const videoContainer = document.querySelector(videoContainerSelector);

    if (!videoContainer) {
        console.log('ytsp: NOT FOUND video container: ', videoContainer);
        return;
    }

    const container = document.createElement('div');
    container.className = `${elementNames.container} ${elementNames.container}-wide`;
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.right = '0';
    container.style.top = '100%';
    container.style.width = '100%';
    container.style.zIndex = '10';
    container.style.marginTop = `-${ytspSettings.wideHeight}`
    container.style.height = ytspSettings.wideHeight;
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

    videoContainer.appendChild(container);
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
        let text = '';

        const modeToText = {
            [mode.CURRENT]: `${times.current} / ${times.total}`,
            [mode.REMAIN]: `${times.remain} / ${times.total}`,
            [mode.CURRENT_ONLY]: `${times.current}`,
            [mode.REMAIN_ONLY]: `${times.remain}`,
        };

        const timeLabel = modeToText[currentMode];

        if (ytspSettings.tinyShowTime && ytspSettings.tinyShowPercent) {
            text = `${timeLabel} (${times.percent}%)`
        } else if (ytspSettings.tinyShowTime) {
            text = `${timeLabel}`
        } else if (ytspSettings.tinyShowPercent) {
            text = `${times.percent}%`
        }

        if (isNaN(times.percent)) {
            text = 'Loading...'
            console.log('ytsp: found video elements: ', document.querySelectorAll('video').length);
        }

        timeText.forEach(el => el.textContent = text);
        progressBar.forEach(el => el.textContent = el.className.includes('tiny') ? text : '')
    }
}

function getVideoTime() {
    let video = document.querySelector('#movie_player video');

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

function nextMode() {
    const modeValues = Object.values(mode)
    const currentIndex = modeValues.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % modeValues.length;
    currentMode = modeValues[nextIndex];
    return currentMode;
}