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

    let progressBar = document.createElement('div');
    progressBar.className = `${elementNames.progressBar} ${elementNames.progressBar}-tiny`;
    progressBar.style.height = globalSettings.timerFullBackground ? '100%' : globalSettings.progressbarHeight;

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

    updateTimeDisplay(true);
}

/**
 * @returns {Element}
 */
function selectCurrentChapter() {
    return !isMobile ?
        document.querySelector('.ytp-chapter-title-content') :
        document.querySelector('.ytwPlayerTimeDisplayChapterButton');
}

/**
 *
 * @returns {Node[]}
 */
function createChapters() {
    let chaptersText = document.createElement('div');
    let currentChapter = selectCurrentChapter();

    chaptersText.className = `${elementNames.chaptersText}`;
    chaptersText.style.padding = isMobile ? '.33em .40em' : '.75em 1em .85em';
    chaptersText.style.fontSize = isMobile ? '1.5em' : '14px';

    if (isMobile) {
        chaptersText.style.paddingLeft = 'max(1.1em, env(safe-area-inset-left))';
    }

    chaptersText.textContent = currentChapter && currentChapter.textContent ? currentChapter.textContent : '';

    //let chaptersText2 = chaptersText.cloneNode(true);
    //chaptersText2.classList.add(`${elementNames.chaptersText}-shadow`);

    return [chaptersText];
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
    container.style.marginTop = `-${globalSettings.progressbarHeight}`
    container.style.height = globalSettings.progressbarHeight;

    if (globalSettings.progressbarEnabled) {
        let progressbar = document.createElement('div');
        progressbar.className = `${elementNames.progressBar} ${elementNames.progressBar}-wide`;
        progressbar.style.background = globalSettings.progressbarColor;

        container.appendChild(progressbar);
    }

    if (globalSettings.chaptersEnabled) {
        container.append(...createChapters());
    }

    videoContainer.appendChild(container);
}

export function removeElements() {
    let oldElements = document.querySelectorAll('.' + elementNames.container);

    if (oldElements.length > 0) {
        oldElements.forEach(el => el.remove());
    }
}

export function updateTimeDisplay(forced = false) {
    let progressBar = document.querySelectorAll('.' + elementNames.progressBar);
    let timeText = document.querySelectorAll('.' + elementNames.timeText);
    const videoStatus = getVideoInfo()

    if (videoStatus.paused && !forced) {
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

    if (globalSettings.chaptersEnabled) {
        let chaptersText = document.querySelectorAll('.' + elementNames.chaptersText);
        let currentChapter = selectCurrentChapter();

        if (currentChapter && currentChapter.textContent) {
            chaptersText.forEach(el => el.textContent = currentChapter.textContent);
        } else {
            chaptersText.forEach(el => el.textContent = '');
        }
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