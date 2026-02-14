/**
 * Camera Optimization Utilities
 * Helps ensure camera access is fast and reliable across different devices
 */

export interface CameraConstraintSet {
  video: MediaStreamConstraints['video'];
  audio: false;
  label: string;
}

/**
 * Get optimized camera constraints based on device capabilities
 * Tries multiple constraint sets to find the best fit for the device
 * More aggressive approach: prefer speed over quality
 */
export function getOptimizedCameraConstraints(): CameraConstraintSet[] {
  // Detect if device has limited bandwidth or processing power
  const isLowEndDevice = detectLowEndDevice();

  if (isLowEndDevice) {
    return getLowEndDeviceConstraints();
  }

  return getStandardDeviceConstraints();
}

/**
 * Constraints optimized for low-end devices (slower processors, limited bandwidth)
 * AGGRESSIVE: prefer speed and compatibility
 */
function getLowEndDeviceConstraints(): CameraConstraintSet[] {
  return [
    {
      label: 'Low-end (minimal)',
      video: {
        facingMode: { ideal: 'environment' },
        width: { max: 480 },
        height: { max: 360 },
      },
      audio: false,
    },
    {
      label: 'Any camera',
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    },
  ];
}

/**
 * Constraints optimized for standard devices
 * AGGRESSIVE: try low res first for faster connection
 */
function getStandardDeviceConstraints(): CameraConstraintSet[] {
  return [
    {
      label: 'Fast (480p)',
      video: {
        facingMode: { ideal: 'environment' },
        width: { max: 640 },
        height: { max: 480 },
      },
      audio: false,
    },
    {
      label: 'Any camera',
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    },
  ];
}

/**
 * Detect if device appears to be low-end based on navigator info
 */
function detectLowEndDevice(): boolean {
  // Check device memory if available (Chrome/Edge)
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 4) {
      console.log(`📱 Low device memory detected: ${memory}GB`);
      return true;
    }
  }

  // Check if on slow connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && connection.effectiveType && connection.effectiveType === '2g') {
      console.log('📡 Slow connection detected (2G)');
      return true;
    }
  }

  // Check CPU cores if available
  if ('hardwareConcurrency' in navigator) {
    const cores = (navigator as any).hardwareConcurrency;
    if (cores && cores < 2) {
      console.log(`⚙️ Low CPU core count detected: ${cores}`);
      return true;
    }
  }

  return false;
}

/**
 * Optimized image capture settings based on canvas size
 */
export function getOptimizedImageSettings(videoWidth: number, videoHeight: number) {
  // For lower resolution, use higher quality JPEG
  // For higher resolution, use lower quality to reduce file size
  const quality = Math.min(0.95, 0.85 + (Math.min(videoWidth, 640) / 1280) * 0.1);

  return {
    quality,
    maxWidth: Math.min(videoWidth, 1920),
    maxHeight: Math.min(videoHeight, 1080),
  };
}

/**
 * Check if camera can be accessed (permission check)
 */
export async function checkCameraPermission(): Promise<boolean> {
  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    console.log(`📷 Camera permission status: ${result.state}`);
    return result.state === 'granted';
  } catch (error) {
    console.log('⚠️  Cannot query camera permission:', error);
    return false;
  }
}

/**
 * Warm up camera hardware (fast initial request) to speed up future calls
 */
export async function warmUpCamera(): Promise<void> {
  try {
    // Request minimal stream just to "wake up" camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { max: 160 },
        height: { max: 120 },
      },
      audio: false,
    });
    
    // Immediately stop the stream
    stream.getTracks().forEach(track => track.stop());
    console.log('🔥 Camera warmed up');
  } catch (error) {
    // Silently fail - this is optional optimization
    console.log('⚠️  Could not warm up camera:', error);
  }
}
