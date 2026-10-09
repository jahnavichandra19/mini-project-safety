// camera.js - Handing WebRTC getUserMedia API
export const cameraState = {
    isActive: false,
    stream: null,
    videoElement: null
};

export async function initCamera(videoEl) {
    cameraState.videoElement = videoEl;
}

export async function startCamera() {
    if (cameraState.isActive) return true;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: false
        });

        cameraState.stream = stream;
        cameraState.videoElement.srcObject = stream;

        // Wait for video to actually be ready to play
        await new Promise((resolve) => {
            cameraState.videoElement.onloadedmetadata = () => {
                resolve();
            };
        });

        cameraState.isActive = true;
        return true;
    } catch (error) {
        console.error("Error accessing webcam:", error);
        throw error;
    }
}

export function stopCamera() {
    if (cameraState.stream) {
        const tracks = cameraState.stream.getTracks();
        tracks.forEach(track => track.stop());
    }
    if (cameraState.videoElement) {
        cameraState.videoElement.srcObject = null;
    }
    cameraState.isActive = false;
    cameraState.stream = null;
}
