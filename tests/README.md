# Manual Testing Guide

Because this is a hardware-integrated prototype relying on live webcam feeds, automated unit-testing is disabled in favor of manual verification.

## 1. Test Application Initialization
- Run `npm run dev`.
- Ensure the application loads correctly without errors in the DevTools console.
- Ensure the UI starts in a "Not Started" resting state.

## 2. Test Camera Access
- Click **Start Monitoring**.
- Verify the browser asks for permission.
- Deny permission once -> verify UI shows "Camera Error".
- Allow permission -> verify Live video feed appears in the main box.

## 3. Test Eye-Closure (Drowsiness Algorithm)
- Start the application.
- Block the camera entirely with your hand, or look away completely. Ensure it says "No Face Detected".
- Look at the camera.
- Intentionally close your eyes and **hold them closed**.
- Observe the timer: It should count up in seconds.
- Wait until it passes **15.0s**. 
- Validate:
  - An Alarm Siren plays.
  - A red banner appears: "Drowsiness Alert: Eyes appear closed for too long!"
  - Drowsiness indicator says "Drowsy (Alert!)".
- Reopen your eyes.
- Validate:
  - Timer immediately drops to `0.0s`.
  - Alert goes away and alarm stops playing.

## 4. Test Camera Shaking Detection
- With monitoring running, pick up your laptop (or grab your external webcam) and **shake it vigorously** side to side for 2 or 3 seconds.
- Validate:
  - The Stability indicator changes to "Unusual Movement".
  - An orange banner appears: "Unusual Camera Movement Detected!".
  - If the alarm is unmuted, it should sound.
- Set the camera down flat.
- Validate:
  - After ~3 seconds of stillness, the alert automatically clears.

## 5. Test UI Boundaries
- Click **Mute Alarm** and verify sounds do not play when an alert triggers.
- Click **Reset** and verify the UI timers are zeroed.
- Click **Stop Monitoring** and completely verify the green camera LED goes off (video track stopped).
