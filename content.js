const ytspSettings = {
    isFull: true,
    position: 'bottom',
};

(function () {
    'use strict';

    function createTimeDisplay() {
        let timeDisplay = document.createElement('div');
        timeDisplay.id = 'ytsp-time-display';
        timeDisplay.style.position = 'absolute';
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
        }else {
            timeDisplay.style.bottom = '10px';
            timeDisplay.style.right = '10px';
        }

        let timeText = document.createElement('div');
        timeText.style.position = 'relative';
        timeText.style.marginBottom = '2px';
        timeText.id = 'ytsp-time-text';

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

    function formatTime(seconds, fullFormat = false) {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let sec = Math.floor(seconds % 60);

        if (fullFormat || hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${sec.toString().padStart(2, '0')}`;
        }
    }

    function updateTimeDisplay() {
        let video = document.querySelector('video');
        let timeText = document.getElementById('ytsp-time-text');
        let progressBar = document.getElementById('ytsp-progress-bar');

        if (video && timeText && progressBar) {
            let currentTime = formatTime(video.currentTime);
            let duration = formatTime(video.duration);
            let timeString = `${currentTime} / ${duration}`
            timeText.textContent = timeString;

            let progressPercent = Math.floor((video.currentTime / video.duration) * 100);
            progressBar.style.width = `${progressPercent}%`;
            progressBar.textContent = timeString;
        }
    }

    createTimeDisplay();
    setInterval(updateTimeDisplay, 1000);
})();
