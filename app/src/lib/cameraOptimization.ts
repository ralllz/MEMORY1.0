/**
 * Fungsi SUPER SIMPEL untuk akses kamera
 * Tidak ada logika kompleks, checking berlebihan, atau optimization yang tidak perlu
 * Langsung request camera dan return streamnya!
 */

/**
 * Constraint standard - browser akan menggunakan resolusi optimal otomatis
 */
export function getSimpleCameraConstraints(): MediaStreamConstraints {
  return {
    video: true,
    audio: false,
  };
}

/**
 * Fallback constraint jika yang pertama gagal
 * Prefer back camera (environment)
 */
export function getFallbackCameraConstraints(): MediaStreamConstraints {
  return {
    video: {
      facingMode: 'environment',
    },
    audio: false,
  };
}

/**
 * Settings untuk quality saat capture foto
 * Adjust berdasarkan ukuran video untuk hasil optimal
 */
export interface ImageSettings {
  quality: number;
  maxWidth: number;
}

export function getOptimizedImageSettings(videoWidth: number, _videoHeight: number): ImageSettings {
  // Resolusi rendah = quality lebih tinggi (overhead kecil)
  // Resolusi tinggi = quality sedang (buffer lebih besar)
  
  let quality = 0.85; // Default good quality
  let maxWidth = 1280;

  // Jika video sangat rendah (mobile 480p atau lebih kecil)
  if (videoWidth <= 480) {
    quality = 0.9; // Tinggi quality untuk hasil lebih sharp
    maxWidth = 640;
  }
  // Jika video medium (720p)
  else if (videoWidth <= 720) {
    quality = 0.85;
    maxWidth = 960;
  }
  // Jika video tinggi (1080p+)
  else {
    quality = 0.8; // Sedikit turun untuk ukuran file
    maxWidth = 1280;
  }

  return { quality, maxWidth };
}
