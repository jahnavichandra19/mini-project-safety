// shakeDetection.js - Detects unusual camera movement by comparing video frames
import { CONFIG } from './config.js';

let previousFrame = null;
let consecutiveShakeFrames = 0;
let lastShakeTime = 0;

export function initShakeDetection(canvasEl) {
    canvasEl.width = CONFIG.SHAKE.RESOLUTION_W;
    canvasEl.height = CONFIG.SHAKE.RESOLUTION_H;
    previousFrame = null;
    consecutiveShakeFrames = 0;
}

export function detectShake(videoEl, canvasEl) {
    const ctx = canvasEl.getContext('2d', { willReadFrequently: true });

    // Draw the current video frame onto the low-res canvas
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    const currentFrame = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
    let isShaking = false;

    if (previousFrame) {
        const diff = calculateFrameDifference(previousFrame.data, currentFrame.data);

        if (diff > CONFIG.SHAKE.DIFF_THRESHOLD) {
            consecutiveShakeFrames++;
            if (consecutiveShakeFrames >= CONFIG.SHAKE.CONSECUTIVE_FRAMES_WARNING) {
                isShaking = true;
                lastShakeTime = performance.now();
            }
        } else {
            // Movement stopped or is low
            consecutiveShakeFrames = Math.max(0, consecutiveShakeFrames - 1);
        }
    }

    // Check if we haven't shaken for the clear duration
    if (isShaking === false && performance.now() - lastShakeTime < CONFIG.SHAKE.CLEAR_DURATION_MS) {
        isShaking = true; // Maintain shaking state for a bit so it doesn't flicker
    }

    previousFrame = currentFrame;
    return isShaking;
}

export function resetShakeState() {
    consecutiveShakeFrames = 0;
    lastShakeTime = 0;
}

/**
 * Calculates average absolute difference per pixel between two ImageData arrays
 */
function calculateFrameDifference(data1, data2) {
    let diffSum = 0;
    const pixels = data1.length / 4; // Each pixel is RGBA

    for (let i = 0; i < data1.length; i += 4) {
        // Only compare RGB, ignore Alpha
        const rDiff = Math.abs(data1[i] - data2[i]);
        const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
        const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);

        // Convert to perceptual luminance difference roughly
        const lumDiff = (rDiff * 0.299 + gDiff * 0.587 + bDiff * 0.114);
        diffSum += lumDiff;
    }

    return diffSum / pixels;
}
