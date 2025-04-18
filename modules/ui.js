const utils = await import(browser.runtime.getURL('modules/utils.js'));

export function init() {
    removeTimeDisplay()
    createTimeDisplay()
    setInterval(updateTimeDisplay, 1000)
}

export function disable() {
    removeTimeDisplay()
}

export function createTimeDisplay() {
    let timeDisplay = document.createElement('div');
    timeDisplay.id = 'ytsp-time-display';
    timeDisplay.style.position = 'fixed';
    timeDisplay.style.background = 'rgba(0, 0, 0, 0.7)';
    timeDisplay.style.color = '#fff';
    timeDisplay.style.padding = '4px 8px';
    timeDisplay.style.borderRadius = '4px';
    timeDisplay.style.fontSize = '14px';
    timeDisplay.style.fontFamily = 'Arial, sans-serif';
    timeDisplay.style.zIndex = '1000';
    timeDisplay.style.minWidth = '60px';
    timeDisplay.style.textAlign = 'center';
    timeDisplay.style.overflow = 'hidden';
    if (ytspSettings.position === 'top') {
        timeDisplay.style.top = '60px';
        timeDisplay.style.right = '10px';
    } else {
        timeDisplay.style.bottom = '10px';
        timeDisplay.style.right = '10px';
    }

    let timeText = document.createElement('div');
    timeText.style.position = 'relative';
    timeText.style.marginBottom = '2px';
    timeText.id = 'ytsp-time-text';
    timeText.textContent = '...';

    let progressBar = document.createElement('div');
    progressBar.id = 'ytsp-progress-bar';
    progressBar.style.position = 'absolute';
    progressBar.style.bottom = '0';
    progressBar.style.left = '0';
    progressBar.style.height = ytspSettings.isFull ? '100%' : '2px';
    progressBar.style.background = 'red';
    progressBar.style.color = 'black';
    progressBar.style.width = '0%';
    if (ytspSettings.isFull) {
        progressBar.style.whiteSpace = 'nowrap';
        progressBar.style.lineHeight = '27px';
        progressBar.style.textIndent = '9px';
        progressBar.style.textAlign = 'left';
    } else {
        progressBar.style.color = 'red';
    }

    timeDisplay.appendChild(progressBar);
    timeDisplay.appendChild(timeText);
    document.body.appendChild(timeDisplay);
}

export function removeTimeDisplay() {
    let oldDisplay = document.getElementById('ytsp-time-display');
    if (oldDisplay) {
        oldDisplay.remove();
    }
}

export function updateTimeDisplay() {

    let timeText = document.getElementById('ytsp-time-text');
    let progressBar = document.getElementById('ytsp-progress-bar');

    if (timeText && progressBar) {
        let times = getVideoTime()

        timeText.textContent = `${times.timeCurrent} / ${times.timeTotal}`;
        progressBar.style.width = `${times.timePercent}%`;
        progressBar.textContent = `${times.timeCurrent} / ${times.timeTotal}`;
    }
}

function getVideoTime() {
    let video = document.querySelector('video');

    let result = {
        timeCurrent: '',
        timeTotal: '',
        timePercent: 0,
    }

    if (video) {
        result = {
            timeCurrent: utils.formatTime(video.currentTime),
            timeTotal: utils.formatTime(video.duration),
            timePercent: Math.floor((video.currentTime / video.duration) * 100),
        }
    }

    return result
}