const VIDEOPLAYER = document.querySelector("#videoplayer");
const VIDEO = document.querySelector("#videoplayer-video");
const SOURCES = document.querySelectorAll("video__source");
const CONTROLLERS = document.querySelector("#videoplayer-controllers");
const PLAY_PAUSE = document.querySelector("#button-pause-play");
const MUTE_UNMUTE = document.querySelector("#button-mute-unmute");
const VOLUME = document.querySelector("#range-volume");
const FULLSCREEN_SMALLSCREEN = document.querySelector("#button-fullscreen-smallscreen");
const TIMESTAMP = document.querySelector("#range-timestamp");
const VOLUME_DISPLAY = document.querySelector("#state-volume");
const TIMESTAMP_DISPLAY = document.querySelector("#state-current-time");
const DURATION_DISPLAY = document.querySelector("#state-duration");
const PLAY_SVG = document.querySelector("#button-play-svg");
const PAUSE_SVG = document.querySelector("#button-pause-svg");
const MUTE_SVG = document.querySelector("#button-mute-svg");
const UNMUTE_SVG = document.querySelector("#button-unmute-svg");
const FULLSCREEN_SVG = document.querySelector("#button-fullscreen-svg");
const SMALLSCREEN_SVG = document.querySelector("#button-smallscreen-svg");
let controlsTimeout;

function formateTimeFromSeconds(time) {
    time = Math.floor(time);
    let seconds = time % 60;
    time = Math.floor(time / 60);
    let minutes = time % 60;
    let hours = Math.floor(time / 60);
    return [
        hours > 0 ? String(hours).padStart(2, '0') : null,
        minutes > 0 ? String(minutes).padStart(2, '0') : String(minutes),
        seconds > 0 ? String(seconds).padStart(2, '0') : String(seconds)
      ].filter(Boolean).join(':');
}
function hideElement(visible) {
    if (!visible.classList.contains("visually-hidden")) visible.classList.add("visually-hidden");
}
function visibleElement(hidden) {
    if (hidden.classList.contains("visually-hidden")) hidden.classList.remove("visually-hidden");
}
function changeHiddenElement(visible, hidden) {
    hideElement(visible);
    visibleElement(hidden);
}

function play() {
    VIDEO.play();
    changeHiddenElement(PLAY_SVG, PAUSE_SVG);
}
function pause() {
    VIDEO.pause();
    changeHiddenElement(PAUSE_SVG, PLAY_SVG);
}

function mute() {
    VIDEO.muted = true;
    changeHiddenElement(MUTE_SVG, UNMUTE_SVG);
}
function unmute() {
    VIDEO.muted = false;
    changeHiddenElement(UNMUTE_SVG, MUTE_SVG);
}

function fullscreen(e) {
    VIDEOPLAYER.requestFullscreen();
}
function smallscreen(e) {
    document.exitFullscreen();
}
function fullscreenChangeIcon() {
    changeHiddenElement(FULLSCREEN_SVG, SMALLSCREEN_SVG);
}
function smallscreenChangeIcon() {
    changeHiddenElement(SMALLSCREEN_SVG, FULLSCREEN_SVG);
}

function syncVolume() {
    VIDEO.volume = VOLUME.value / 100;
    VOLUME.style.setProperty('--filled', `${VOLUME.value}%`);
}
function syncVolumeRange() {
    VOLUME.value = VIDEO.volume * 100;
}
function syncVolumeDisplay() {
    VOLUME_DISPLAY.innerHTML = `${Math.round(VIDEO.volume * 100)}%`;
}

function syncTimestamp() {
    VIDEO.currentTime = TIMESTAMP.value / 1000;
}
function syncTimestampRange() {
    TIMESTAMP.value = VIDEO.currentTime * 1000;
    TIMESTAMP.style.setProperty('--filled', `${100 * TIMESTAMP.value / TIMESTAMP.max}%`);
}
function syncTimestampDisplay() {
    TIMESTAMP_DISPLAY.innerHTML = formateTimeFromSeconds(VIDEO.currentTime);
}

function syncFullscreenSmallscreenIcon() {
    if (document.fullscreenElement) fullscreenChangeIcon();
    else smallscreenChangeIcon();
}

function playPauseEvent(e) {
    console.log(`Play/pause`, e);
    if (VIDEO.paused) play();
    else pause();
}
function muteUnmuteEvent(e) {
    console.log(`Mute/unmute`, e);
    if (VIDEO.muted) unmute();
    else mute();
}
function volumeEvent(e) {
    console.log(`Volume`, VOLUME.value, e);
    if (e === "ArrowUp") VOLUME.value = Number(VOLUME.value) + 5;
    else if (e === "ArrowDown") VOLUME.value -= 5;
    syncVolume();
}
function fullscreenSmallscreenEvent(e) {
    console.log(`Fullscreen/smallscreen`, e);
    if (document.fullscreenElement) smallscreen(e);
    else fullscreen(e);
}
function timestampEvent(e) {
    console.log(`Timestamp`, e);
    if (e === "ArrowRight") TIMESTAMP.value = Number(TIMESTAMP.value) + 5000;
    else if (e === "ArrowLeft") TIMESTAMP.value -= 5000;
    syncTimestamp();
    syncTimestampRange();
    syncTimestampDisplay();
}
function handleControllersVisibility() {
    CONTROLLERS.style.opacity = '1';
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
        CONTROLLERS.style.opacity = '0';
    }, 1500);
}

function initVideo() {
    TIMESTAMP.max = VIDEO.duration * 1000; // 1ms
    DURATION_DISPLAY.innerHTML = formateTimeFromSeconds(VIDEO.duration);
    syncVolumeRange();
    syncVolume();
    syncTimestampRange();
    syncVolumeDisplay();
    syncTimestampDisplay();
}

VIDEO.addEventListener('ended', (e) => pause());
VIDEO.addEventListener('click', (e) => {
    playPauseEvent(e);
    if (e.detail == 2) fullscreenSmallscreenEvent(e);
});
VIDEO.addEventListener('volumechange', (e) => {
    if (document.fullscreenElement) syncVolumeRange()
    syncVolumeDisplay();
});
VIDEO.addEventListener('timeupdate', (e) => {
    syncTimestampRange();
    syncTimestampDisplay();
});
document.addEventListener('fullscreenchange', (e) => syncFullscreenSmallscreenIcon());
PLAY_PAUSE.addEventListener('click', (e) => playPauseEvent(e));
MUTE_UNMUTE.addEventListener('click', (e) => muteUnmuteEvent(e));
FULLSCREEN_SMALLSCREEN.addEventListener('click', (e) => fullscreenSmallscreenEvent(e));
VOLUME.addEventListener('input', (e) => volumeEvent(e));
TIMESTAMP.addEventListener('input', (e) => timestampEvent(e));
VIDEOPLAYER.addEventListener('mousemove', () => handleControllersVisibility());

document.addEventListener('keydown', (e) => {
    let isKnown = true;
    switch (e.code) {
        case 'Space':
        case 'KeyK':
            playPauseEvent(e.code);
            break;
        case 'KeyM':
            muteUnmuteEvent(e.code);
            break;
        case 'KeyF':
            fullscreenSmallscreenEvent(e.code);
            break;
        case 'ArrowUp':
        case 'ArrowDown':
            volumeEvent(e.code);
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            timestampEvent(e.code);
            break;
        default:
            isKnown = false;
            console.log(`Unrecognized hotkey: ${e.code}`, e);
    }
    if (isKnown) e.preventDefault();
});

if (VIDEO.readyState >= HTMLMediaElement.HAVE_METADATA) initVideo();
VIDEO.addEventListener('loadedmetadata', (e) => initVideo());


