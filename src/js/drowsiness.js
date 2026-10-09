// drowsiness.js - Tracks eye closure using MediaPipe FaceLandmarker
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { CONFIG } from './config.js';

let faceLandmarker = null;
let eyeClosureStartTime = 0;
let isModelLoaded = false;

export async function initFaceLandmarker() {
    try {
        // FilesetResolver helps find the wasm files for MediaPipe Tasks
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );

        // Initialize FaceLandmarker with the local model
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "./src/assets/models/face_landmarker.task",
                delegate: "GPU"
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1
        });

        isModelLoaded = true;
        return true;
    } catch (error) {
        console.error("Error initializing Face Landmarker:", error);
        isModelLoaded = false;
        throw error;
    }
}

/**
 * Extracts blendshape scores specifically for eye blinking and computes drowsiness.
 * Returns an object with the status and current duration.
 */
export function detectDrowsiness(videoEl, timestamp) {
    if (!isModelLoaded || !faceLandmarker) {
        return { status: "Detection Error", isDrowsy: false, duration: 0 };
    }

    let result = null;
    try {
        // Process frame
        result = faceLandmarker.detectForVideo(videoEl, timestamp);
    } catch (err) {
        console.error("MediaPipe prediction error:", err);
        return { status: "Error", isDrowsy: false, duration: 0 };
    }

    if (result && result.faceBlendshapes && result.faceBlendshapes.length > 0) {
        const blendshapes = result.faceBlendshapes[0].categories;

        // Find blink scores
        const leftBlink = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
        const rightBlink = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;

        // Both eyes must be closed for it to count
        const areEyesClosed = leftBlink > CONFIG.DROWSINESS.BLINK_BLENDSHAPE_THRESHOLD &&
            rightBlink > CONFIG.DROWSINESS.BLINK_BLENDSHAPE_THRESHOLD;

        if (areEyesClosed) {
            if (eyeClosureStartTime === 0) {
                eyeClosureStartTime = performance.now();
            }

            const duration = performance.now() - eyeClosureStartTime;
            const isDrowsy = duration >= CONFIG.DROWSINESS.EYE_CLOSURE_THRESHOLD_MS;

            return {
                status: isDrowsy ? "Drowsy (Alert!)" : "Eyes Closed",
                isDrowsy,
                duration: duration
            };
        } else {
            // Eyes are open, reset timer
            eyeClosureStartTime = 0;
            return { status: "Normal", isDrowsy: false, duration: 0 };
        }
    } else {
        // Face not detected or no blendshapes
        // Be conservative: pausing the timer but not resetting it, or handle it as missing.
        // We will reset for safety so we don't carry over false positives.
        eyeClosureStartTime = 0;
        return { status: "No Face Detected", isDrowsy: false, duration: 0 };
    }
}

export function resetDrowsinessState() {
    eyeClosureStartTime = 0;
}
