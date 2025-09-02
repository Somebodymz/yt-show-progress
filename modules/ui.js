/** @type {{formatTime:function}} */
const utils = await import(browser.runtime.getURL('modules/utils.js'));

const mode = {
    CURRENT: 'current',
    REMAIN: 'remain',
    CURRENT_ONLY: 'current_only',
    REMAIN_ONLY: 'remain_only',
    //REMAIN_CURRENT: 'remain_current',
}

/** @type string */
let currentMode = localStorage.getItem('ytspCurrentMode') ?? mode.CURRENT;

const elementNames = {
    container: 'ytsp-container',
    timeText: 'ytsp-time-text',
    progressBar: 'ytsp-progress-bar',
    chaptersText: 'ytsp-chapter-title',
}

export function init() {
    removeElements()
    createElements()
    setInterval(updateTimeDisplay, 500)
}

export function disable() {
    removeElements()
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

export function createElements() {
    createTimer()
    createProgressbar()
}

function createTimer() {
    if (!globalSettings.timerEnabled) {
        return;
    }

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
        if (globalSettings.timerPosition === 'top') {
            container.style.top = '60px';
        } else {
            container.style.top = '100%';
            container.style.marginTop = '5px';
            container.style.marginRight = '-5px';
            container.style.opacity = '.75';
        }
    } else {
        container.style.position = 'fixed';
        if (globalSettings.timerPosition === 'top') {
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
    timeText.addEventListener('click', e => {
        currentMode = nextMode();
        localStorage.setItem('ytspCurrentMode', currentMode);
        updateTimeDisplay()
    });

    const videoInfo = getVideoInfo();
    timeText.textContent = videoInfo.total;

    let progressBar = document.createElement('div');
    progressBar.className = `${elementNames.progressBar} ${elementNames.progressBar}-tiny`;
    progressBar.style.position = 'absolute';
    progressBar.style.bottom = '0';
    progressBar.style.left = '0';
    progressBar.style.height = globalSettings.timerFullBackground ? '100%' : globalSettings.progressbarHeight;
    progressBar.style.background = 'red';
    progressBar.style.color = 'black';
    progressBar.style.width = '0%';
    if (globalSettings.timerFullBackground) {
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

/**
 *
 * @returns {HTMLElement}
 */
function createChapters() {
    let currentChapterTitle = document.querySelector('.ytp-chapter-title-content');
    let chaptersText = document.createElement('div');

    chaptersText.className = `${elementNames.chaptersText} ${elementNames.chaptersText}-wide`;
    chaptersText.style.position = 'absolute';
    chaptersText.style.bottom = '0';
    chaptersText.style.left = '0';
    chaptersText.style.margin = '.75em 1em .85em';
    //chaptersText.style.padding = '0 .2em';
    chaptersText.style.color = '#eeeeee';
    //chaptersText.style.textShadow = '1px 1px 3px #000000';
    chaptersText.style.backgroundColor = 'rgba(256,256,256,0.15)';

    if (isMobile) {
        chaptersText.style.fontSize = '12px';
    } else {
        chaptersText.style.fontSize = '14px';
    }

    chaptersText.textContent = currentChapterTitle && currentChapterTitle.textContent ? currentChapterTitle.textContent : '';

    return chaptersText;
}

function createProgressbar() {
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
    container.style.marginTop = `-${globalSettings.progressbarHeight}`
    container.style.height = globalSettings.progressbarHeight;
    container.style.pointerEvents = 'none';

    if (globalSettings.progressbarEnabled) {
        let progressbar = document.createElement('div');
        progressbar.className = `${elementNames.progressBar} ${elementNames.progressBar}-wide`;
        progressbar.style.position = 'absolute';
        progressbar.style.bottom = '0';
        progressbar.style.left = '0';
        progressbar.style.height = '100%';
        progressbar.style.background = globalSettings.progressbarColor;
        progressbar.style.color = 'black';
        progressbar.style.width = '0%';
        container.appendChild(progressbar);
    }

    if (globalSettings.chaptersEnabled) {
        container.appendChild(createChapters());
    }

    videoContainer.appendChild(container);
}

export function removeElements() {
    let oldElements = document.querySelectorAll('.' + elementNames.container);

    if (oldElements.length > 0) {
        oldElements.forEach(el => el.remove());
    }
}

export function updateTimeDisplay() {
    let progressBar = document.querySelectorAll('.' + elementNames.progressBar);
    let timeText = document.querySelectorAll('.' + elementNames.timeText);
    let currentChapter = document.querySelector('.ytp-chapter-title-content');

    let videoStatus = getVideoInfo()

    if (videoStatus.paused) {
        return;
    }

    if (progressBar.length > 0) {
        progressBar.forEach(el => el.style.width = `${videoStatus.percent}%`);
    }

    if (timeText.length > 0 && progressBar.length > 0) {
        let text = '';

        const modeToText = {
            [mode.CURRENT]: `${videoStatus.current} / ${videoStatus.total}`,
            [mode.REMAIN]: `${videoStatus.remain} / ${videoStatus.total}`,
            [mode.CURRENT_ONLY]: `${videoStatus.current}`,
            [mode.REMAIN_ONLY]: `${videoStatus.remain}`,
        };

        const timeLabel = modeToText[currentMode];

        if (globalSettings.timerShowTime && globalSettings.timerShowPercent) {
            text = `${timeLabel} (${videoStatus.percent}%)`
        } else if (globalSettings.timerShowTime) {
            text = `${timeLabel}`
        } else if (globalSettings.timerShowPercent) {
            text = `${videoStatus.percent}%`
        }

        if (isNaN(videoStatus.percent)) {
            text = 'Loading...'
        }

        timeText.forEach(el => el.textContent = text);
        progressBar.forEach(el => el.textContent = el.className.includes('tiny') ? text : '')
    }

    let chaptersText = document.querySelector('.' + elementNames.chaptersText);
    if (currentChapter && currentChapter.textContent) {
        chaptersText.textContent = chaptersText ? currentChapter.textContent : '';
    } else {
        chaptersText.textContent = '';
    }
}

function getVideoInfo() {
    let video = document.querySelector('video[src]');

    let result = {
        current: '',
        remain: '',
        total: '',
        percent: 0,
        paused: undefined,
    }

    if (video) {
        result = {
            current: utils.formatTime(video.currentTime),
            remain: '-' + utils.formatTime(video.duration - video.currentTime),
            total: utils.formatTime(video.duration),
            percent: round((video.currentTime / video.duration) * 100),
            paused: video.paused,
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