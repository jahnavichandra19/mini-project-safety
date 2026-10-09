// main.js - Core controller

import { CONFIG } from './config.js';
import { initAlerts, setDrowsinessAlert, setShakingAlert, resetAllAlerts } from './alerts.js';
import { initCamera, startCamera, stopCamera, cameraState } from './camera.js';
import { initShakeDetection, detectShake, resetShakeState } from './shakeDetection.js';
import { initFaceLandmarker, detectDrowsiness, resetDrowsinessState } from './drowsiness.js';

const dom = {
    video: document.getElementById('webcamView'),
    hiddenCanvas: document.getElementById('processingCanvas'),
    videoError: document.getElementById('videoErrorMessage'),

    btnStart: document.getElementById('btnStart'),
    btnStop: document.getElementById('btnStop'),
    btnReset: document.getElementById('btnReset'),

    overallStatus: document.getElementById('statusOverall'),
    drowsinessStatus: document.getElementById('statusDrowsiness'),
    shakingStatus: document.getElementById('statusShaking'),

    timerDisplay: document.getElementById('closureTimer')
};

let animationFrameId = null;
let lastShakeProcessTime = 0;
let isModelReady = false;

// Initialization
async function initializeApp() {
    initAlerts('alertContainer', 'btnMuteToggle');
    initCamera(dom.video);
    initShakeDetection(dom.hiddenCanvas);

    updateOverallStatus('Initializing Model...', CONFIG.UI.COLOR_GRAY);
    dom.btnStart.disabled = true;

    try {
        await initFaceLandmarker();
        isModelReady = true;
        updateOverallStatus('Not Started', CONFIG.UI.COLOR_GRAY);
        dom.btnStart.disabled = false;
    } catch (err) {
        updateOverallStatus('Model Error', CONFIG.UI.COLOR_RED);
        showVideoError("Failed to load AI model. Please check console.");
    }
}

// UI Helpers
function updateOverallStatus(text, bgClass) {
    dom.overallStatus.textContent = text;
    dom.overallStatus.className = `badge ${bgClass}`;
}

function updateSubStatus(element, text, bgClass) {
    element.textContent = text;
    element.className = `badge ${bgClass}`;
}

function showVideoError(msg) {
    dom.videoError.textContent = msg;
    dom.videoError.classList.remove('hidden');
}

function hideVideoError() {
    dom.videoError.classList.add('hidden');
}

function updateTimerDisplay(durationMs) {
    const seconds = (durationMs / 1000).toFixed(1);
    dom.timerDisplay.textContent = seconds;
    if (durationMs > 0) {
        dom.timerDisplay.parentElement.classList.add('danger');
    } else {
        dom.timerDisplay.parentElement.classList.remove('danger');
    }
}

// Main Loop
function startProcessingLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    requestAnimationFrame(processFrame);
}

function processFrame(time) {
    if (!cameraState.isActive) return;

    // 1. Drowsiness Detection (Runs every frame)
    const drowsyResult = detectDrowsiness(dom.video, time);
    updateTimerDisplay(drowsyResult.duration);

    if (drowsyResult.isDrowsy) {
        updateSubStatus(dom.drowsinessStatus, drowsyResult.status, CONFIG.UI.COLOR_RED);
        setDrowsinessAlert(true);
    } else if (drowsyResult.status === "Eyes Closed") {
        updateSubStatus(dom.drowsinessStatus, drowsyResult.status, CONFIG.UI.COLOR_ORANGE);
        setDrowsinessAlert(false);
    } else if (drowsyResult.status === "No Face Detected") {
        updateSubStatus(dom.drowsinessStatus, drowsyResult.status, CONFIG.UI.COLOR_GRAY);
        setDrowsinessAlert(false);
    } else {
        updateSubStatus(dom.drowsinessStatus, drowsyResult.status, CONFIG.UI.COLOR_GREEN);
        setDrowsinessAlert(false);
    }

    // 2. Shake Detection (Throttled based on interval)
    if (time - lastShakeProcessTime >= CONFIG.SHAKE.PROCESS_INTERVAL_MS) {
        const isShaking = detectShake(dom.video, dom.hiddenCanvas);

        if (isShaking) {
            updateSubStatus(dom.shakingStatus, 'Unusual Movement', CONFIG.UI.COLOR_RED);
            setShakingAlert(true);
        } else {
            updateSubStatus(dom.shakingStatus, 'Normal Stability', CONFIG.UI.COLOR_GREEN);
            setShakingAlert(false);
        }
        lastShakeProcessTime = time;
    }

    // Continue loop
    animationFrameId = requestAnimationFrame(processFrame);
}

// Event Handlers
async function handleStart() {
    if (!isModelReady) return;
    hideVideoError();

    try {
        updateOverallStatus('Starting Camera...', CONFIG.UI.COLOR_ORANGE);
        await startCamera();

        dom.btnStart.disabled = true;
        dom.btnStop.disabled = false;

        updateOverallStatus('Monitoring', CONFIG.UI.COLOR_GREEN);
        updateSubStatus(dom.drowsinessStatus, 'Normal', CONFIG.UI.COLOR_GREEN);
        updateSubStatus(dom.shakingStatus, 'Normal Stability', CONFIG.UI.COLOR_GREEN);

        // Reset states before starting
        resetShakeState();
        resetDrowsinessState();
        resetAllAlerts();
        updateTimerDisplay(0);

        // Begin processing
        startProcessingLoop();

    } catch (err) {
        console.error(err);
        updateOverallStatus('Camera Error', CONFIG.UI.COLOR_RED);
        showVideoError("Camera access denied or unavailable.");
    }
}

function handleStop() {
    stopCamera();
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    dom.btnStart.disabled = false;
    dom.btnStop.disabled = true;

    updateOverallStatus('Not Started', CONFIG.UI.COLOR_GRAY);
    updateSubStatus(dom.drowsinessStatus, '--', CONFIG.UI.COLOR_GRAY);
    updateSubStatus(dom.shakingStatus, '--', CONFIG.UI.COLOR_GRAY);

    resetShakeState();
    resetDrowsinessState();
    resetAllAlerts();
    updateTimerDisplay(0);
}

function handleReset() {
    resetShakeState();
    resetDrowsinessState();
    resetAllAlerts();
    updateTimerDisplay(0);
}

// Bind Events
dom.btnStart.addEventListener('click', handleStart);
dom.btnStop.addEventListener('click', handleStop);
dom.btnReset.addEventListener('click', handleReset);

// Start initialization once DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
