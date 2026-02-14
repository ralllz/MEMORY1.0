/**
 * Camera Optimization Utilities - SIMPLIFIED
 * Keep constraints minimal for faster camera initialization
 */

/**
 * Get minimal camera constraints - let browser handle resolution
 * This is the FASTEST and most compatible approach
 */
export function getSimpleCameraConstraints(): MediaStreamConstraints {
  return {
    video: true,  // Let browser auto-select resolution
    audio: false,
  };
}

/**
 * Get fallback camera constraints if simple approach fails
 */
export function getFallbackCameraConstraints(): MediaStreamConstraints {
  return {
    video: { facingMode: { ideal: 'environment' } },
    audio: false,
  };
}

/**
 * Optimized image capture settings based on canvas size
 * KEEP THIS - used by CameraCapture for photo quality
 */
export function getOptimizedImageSettings(videoWidth: number, videoHeight: number) {
  // Adaptive quality: lower res = higher quality, higher res = lower quality
  const quality = Math.min(0.95, 0.85 + (Math.min(videoWidth, 640) / 1280) * 0.1);

  return {
    quality,
    maxWidth: Math.min(videoWidth, 1920),
    maxHeight: Math.min(videoHeight, 1080),
  };
}
