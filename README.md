# Smart Vehicle Safety & Driver Monitoring System

This project is a beginner-friendly college prototype designed to monitor a driver's safety using a computer webcam. It runs entirely in the browser using JavaScript and requires no backend server or cloud processing.

## 🚀 Features

1. **Driver Drowsiness Detection:**
   Uses MediaPipe's Face Landmarker AI model to detect facial blendshapes. It continuously monitors the `eyeBlinkLeft` and `eyeBlinkRight` scores. If both eyes remain continuously closed for more than 15 seconds, a drowsiness alert and an alarm are triggered.

2. **Camera Shaking Detection:**
   Uses the HTML5 Canvas API to compare the pixels of consecutive webcam frames. If sustained, substantial pixel differences are detected (simulating heavy vibration or a shaking camera), it triggers a camera movement alert.

## 📁 Folder Structure Explained

- `index.html`: The main dashboard page containing the layout, video element, and status grid.
- `package.json` & `vite.config` (internal): Defines project dependencies (Vite for local development, MediaPipe for AI).
- `src/css/style.css`: All the styling rules for the dashboard (dark navy theme, responsive grid).
- `src/js/`:
  - `main.js`: The central "brain" that initializes everything, hooks up buttons, and runs the main loop `requestAnimationFrame`.
  - `config.js`: Contains adjustable numbers like the 15-second timer limit, and shaking sensitivity. 
  - `camera.js`: Asks for webcam permission and manages the video feed.
  - `drowsiness.js`: Uses MediaPipe to find the face and calculate eye closure.
  - `shakeDetection.js`: Uses a hidden Canvas to calculate the difference between the current frame and previous frame.
  - `alerts.js`: Generates the alarm sound using the Web Audio API and handles UI messages.
- `src/assets/models/`: Contains the locally downloaded MediaPipe model (`face_landmarker.task`).
- `tests/`: Documentation on how to test the system.

## 🛠 Installation & Usage

Make sure you have Node.js installed.

1. **Install Dependencies:**
   Open a terminal in the folder `mini project safety` and run:
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *Vite will print a local URL (e.g., `http://localhost:5173/`). Open this URL in your web browser (Chrome/Edge/Firefox).*

3. **Usage:**
   - Click **Start Monitoring** and grant camera permissions.
   - Wait a moment for the AI model to initialize.
   - The status indicators should turn green ("Monitoring" and "Normal").
   - Click **Stop Monitoring** to turn off the camera.

## ⚠️ Limitations & Setup Notes

- **Prototype Only:** This relies on simple computer vision and standard webcams. True vehicle safety systems use infrared cameras and IMU (vibration) sensors.
- **Lighting:** Drowsiness detection requires good lighting for the AI to see your face clearly.
- **Shaking Detection:** Since it is based on image differences, heavy movement in the background (like someone walking past) might also trigger the shake alert.
- **Privacy:** All processing happens dynamically inside your browser (`localhost`). No video is recorded, saved, or uploaded!

## Troubleshooting

- **Camera Permission Denied:** You must click "Allow" when the browser asks for camera access. If blocked, click the lock icon in your URL bar and reset permissions.
- **Model Error:** If the status says "Model Error", ensure that `face_landmarker.task` is successfully downloaded into `src/assets/models/`.
