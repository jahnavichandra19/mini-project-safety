// alerts.js - Manages Audio Alarms and UI alert banners
import { CONFIG } from './config.js';

let audioCtx = null;
let activeOscillator = null;
let isMuted = false;

// Track what conditions are active
export const activeAlerts = {
    drowsiness: false,
    shaking: false
};

const dom = {
    alertContainer: null,
    muteBtn: null
};

export function initAlerts(alertContainerId, muteBtnId) {
    dom.alertContainer = document.getElementById(alertContainerId);
    dom.muteBtn = document.getElementById(muteBtnId);

    dom.muteBtn.addEventListener('click', toggleMute);
}

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function toggleMute() {
    isMuted = !isMuted;
    dom.muteBtn.innerText = isMuted ? "Unmute Alarm" : "Mute Alarm";
    dom.muteBtn.className = isMuted ? "btn btn-danger" : "btn btn-secondary";

    if (isMuted) {
        stopAlarm();
    } else {
        evaluateAlarm();
    }
}

export function setDrowsinessAlert(isActive) {
    if (activeAlerts.drowsiness === isActive) return; // Unchanged
    activeAlerts.drowsiness = isActive;
    updateUI();
    evaluateAlarm();
}

export function setShakingAlert(isActive) {
    if (activeAlerts.shaking === isActive) return; // Unchanged
    activeAlerts.shaking = isActive;
    updateUI();
    evaluateAlarm();
}

export function resetAllAlerts() {
    activeAlerts.drowsiness = false;
    activeAlerts.shaking = false;
    updateUI();
    stopAlarm();
}

function updateUI() {
    dom.alertContainer.innerHTML = '<h3 class="hidden">Active Alerts</h3>';

    if (!activeAlerts.drowsiness && !activeAlerts.shaking) {
        // No alerts active
        return;
    }

    // Generate banners
    if (activeAlerts.drowsiness) {
        const banner = document.createElement('div');
        banner.className = 'alert-box alert-danger';
        banner.style.borderLeftColor = 'var(--status-red)';
        banner.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
        banner.innerHTML = `<span class="alert-message">🚨 Drowsiness Alert: Eyes appear closed for too long!</span>`;
        dom.alertContainer.appendChild(banner);
    }

    if (activeAlerts.shaking) {
        const banner = document.createElement('div');
        banner.className = 'alert-box alert-warning';
        banner.innerHTML = `<span class="alert-message">⚠️ Unusual Camera Movement Detected!</span>`;
        dom.alertContainer.appendChild(banner);
    }
}

function evaluateAlarm() {
    if (isMuted) return;

    const shouldSound = activeAlerts.drowsiness || activeAlerts.shaking;

    if (shouldSound && !activeOscillator) {
        playAlarm();
    } else if (!shouldSound && activeOscillator) {
        stopAlarm();
    }
}

function playAlarm() {
    initAudioContext();
    if (activeOscillator || !audioCtx) return;

    // Create an alternating siren effect using oscillator
    activeOscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    activeOscillator.type = 'square';
    activeOscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // Hz

    // Siren modulation
    const sirenInterval = setInterval(() => {
        if (!activeOscillator) {
            clearInterval(sirenInterval);
            return;
        }
        const freq = activeOscillator.frequency.value === 600 ? 800 : 600;
        activeOscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    }, 300);

    activeOscillator.sirenIntervalId = sirenInterval;

    gainNode.gain.value = 0.1; // Not too loud

    activeOscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    activeOscillator.start();
}

function stopAlarm() {
    if (activeOscillator) {
        clearInterval(activeOscillator.sirenIntervalId);
        activeOscillator.stop();
        activeOscillator.disconnect();
        activeOscillator = null;
    }
}
