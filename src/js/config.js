// config.js - Centralized configuration settings

export const CONFIG = {
  DROWSINESS: {
    // 6 seconds required continuous closure
    EYE_CLOSURE_THRESHOLD_MS: 6000,
    // Eye blendshape threshold above which an eye is considered closed
    // Depending on model, blendshapes like eyeBlinkLeft range from 0 (open) to 1 (closed)
    BLINK_BLENDSHAPE_THRESHOLD: 0.3
  },
  SHAKE: {
    // Interval for shake detection frame pulling
    PROCESS_INTERVAL_MS: 100,
    // Per-pixel average absolute difference threshold to trigger motion
    DIFF_THRESHOLD: 12.0,
    // Required consecutive frames exceeding threshold to trigger alert
    CONSECUTIVE_FRAMES_WARNING: 5,
    // How long movement must stop before alert clears automatically
    CLEAR_DURATION_MS: 3000,
    // Dimensions to scale down hidden canvas (for performance)
    RESOLUTION_W: 160,
    RESOLUTION_H: 120
  },
  UI: {
    COLOR_GREEN: 'bg-green',
    COLOR_RED: 'bg-red',
    COLOR_GRAY: 'bg-gray',
    COLOR_ORANGE: 'bg-orange'
  }
};
