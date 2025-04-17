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
