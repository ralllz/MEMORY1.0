import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOptimizedImageSettings, getSimpleCameraConstraints, getFallbackCameraConstraints } from '@/lib/cameraOptimization';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [videoReady, setVideoReady] = useState(false);
  const [cameraLoadTime, setCameraLoadTime] = useState<number>(0);

  /**
   * Start camera dengan logic yang simpel dan stabil
   * Menggunakan useCallback agar referensi function tetap stabil
   */
  const startCamera = useCallback(async () => {
    try {
      const startTime = performance.now();
      console.log('📷 [Camera] Starting camera initialization...');
      
      let mediaStream: MediaStream | null = null;
      
      // ATTEMPT 1: Simple video constraint
      try {
        console.log('📷 [Camera] Attempt 1: Simple video constraint');
        mediaStream = await Promise.race([
          navigator.mediaDevices.getUserMedia(getSimpleCameraConstraints()),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          ),
        ]);
        console.log('✅ [Camera] Attempt 1 SUCCESS');
      } catch (err1) {
        console.log('⚠️ [Camera] Attempt 1 failed, trying fallback...');
        
        // ATTEMPT 2: Fallback dengan facingMode
        try {
          console.log('📷 [Camera] Attempt 2: With facingMode fallback');
          mediaStream = await Promise.race([
            navigator.mediaDevices.getUserMedia(getFallbackCameraConstraints()),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 5000)
            ),
          ]);
          console.log('✅ [Camera] Attempt 2 SUCCESS');
        } catch (err2) {
          console.error('❌ [Camera] Attempt 2 failed:', err2);
          throw err2;
        }
      }

      // Validate stream
      if (!mediaStream) {
        throw new Error('Failed to acquire media stream');
      }

      const videoTracks = mediaStream.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error('No video track available in stream');
      }

      console.log(`📹 [Camera] Got stream with ${videoTracks.length} video track(s)`);

      // SET STATE FIRST - menyimpan stream ke state
      setStream(mediaStream);
      streamRef.current = mediaStream;

      // THEN attach ke video element - penting untuk order ini!
      if (videoRef.current) {
        console.log('📹 [Camera] Attaching stream to video element...');
        videoRef.current.srcObject = mediaStream;
        
        // NOW mark as permission granted - SETELAH srcObject sudah set
        setHasPermission(true);
        
        const loadTimeMs = performance.now() - startTime;
        setCameraLoadTime(loadTimeMs);
        console.log(`✅ [Camera] Permission set and stream attached (${loadTimeMs.toFixed(0)}ms)`);
      } else {
        throw new Error('Video element reference not available');
      }

    } catch (err) {
      console.error('❌ [Camera] Initialization error:', err);
      const message = err instanceof Error ? err.message : 'Camera initialization failed';
      setError(message);
      setHasPermission(false);
      setStream(null);
    }
  }, []);

  /**
   * Handle ketika video element sudah punya metadata
   * PENTING: Kita manual call play() karena autoplay kadang tidak berfungsi
   */
  const handleOnLoadedMetadata = useCallback(() => {
    console.log('📹 [Camera] onLoadedMetadata fired');
    
    if (videoRef.current) {
      console.log('🎬 [Camera] Manually calling play() to force video playback');
      
      // Manual play - ini penting untuk browser yang tidak respect autoplay
      videoRef.current.play()
        .then(() => {
          console.log('✅ [Camera] Video play() successful');
          setVideoReady(true);
        })
        .catch((err) => {
          console.log('⚠️ [Camera] Video play() failed:', err);
          // Fallback: mark ready anyway
          setVideoReady(true);
        });
    }
  }, []);

  /**
   * Handle ketika video dapat di-play
   */
  const handleOnCanPlay = useCallback(() => {
    console.log('✅ [Camera] Video can play');
    if (videoRef.current && videoRef.current.paused) {
      console.log('🎬 [Camera] Video paused, calling play()...');
      videoRef.current.play().catch(err => {
        console.log('⚠️ [Camera] Play failed on canplay:', err);
      });
    }
    setVideoReady(true);
  }, []);

  /**
   * Handle ketika video benar-benar mulai playing
   */
  const handleOnPlaying = useCallback(() => {
    console.log('✅ [Camera] Video now playing');
    setVideoReady(true);
  }, []);

  /**
   * Setup camera saat component mount
   */
  useEffect(() => {
    let readyTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;

    console.log('⚙️ [Camera] Component mounted, initializing...');
    
    // Call the memoized startCamera function
    startCamera();

    // Fallback timeout - jika dalam 3 detik tidak ready juga, paksa ready
    readyTimeoutId = setTimeout(() => {
      if (isMounted && videoRef.current?.srcObject) {
        console.log('⏱️ [Camera] Forcing video ready after timeout');
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
        setVideoReady(true);
      }
    }, 3000);

    return () => {
      console.log('🛑 [Camera] Component unmounting, cleaning up...');
      isMounted = false;
      
      // Stop all tracks dari stream
      if (stream) {
        stream.getTracks().forEach(track => {
          console.log(`🛑 [Camera] Stopping ${track.kind} track`);
          track.stop();
        });
      }
      
      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      // Clear timeout
      if (readyTimeoutId) clearTimeout(readyTimeoutId);
    };
  }, [startCamera, stream]);

  // Capture photo from video stream with optimization
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) return;

      // Set canvas size to match actual video dimensions
      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Get optimized settings for image
      const imageSettings = getOptimizedImageSettings(videoWidth, videoHeight);

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL with optimized quality
      const dataUrl = canvas.toDataURL('image/jpeg', imageSettings.quality);
      console.log('📸 [Camera] Photo captured successfully', {
        width: canvas.width,
        height: canvas.height,
        size: dataUrl.length,
        quality: imageSettings.quality.toFixed(2),
        loadTime: cameraLoadTime.toFixed(0) + 'ms'
      });

      onCapture(dataUrl);
    } catch (error) {
      console.error('❌ [Camera] Capture failed:', error);
      setError('Failed to capture photo. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold">📷 Camera</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition"
            disabled={hasPermission === null}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {hasPermission === null && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin mb-4">
                <Camera className="w-8 h-8 text-pink-500" />
              </div>
              <p className="text-gray-600 font-medium">Initializing camera...</p>
              <p className="text-gray-500 text-sm mt-2">Requesting device access...</p>
              <p className="text-gray-400 text-xs mt-4">This may take a few seconds</p>
            </div>
          )}

          {hasPermission === false && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-semibold mb-2">❌ Camera Access Denied</p>
              <p className="text-red-700 text-sm mb-4">{error}</p>
              <p className="text-red-700 text-xs mb-4">
                Please allow camera access in your browser settings to use Photobox.
              </p>
              <div className="text-left text-xs text-red-600 bg-red-100 p-3 rounded mb-4 space-y-1">
                <p className="font-semibold">How to fix:</p>
                <p>1. Look for the lock or camera icon in your address bar</p>
                <p>2. Click and allow camera permissions</p>
                <p>3. Refresh and try again</p>
              </div>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          )}

          {hasPermission === true && (
            <>
              {/* Video stream container */}
              <div className="bg-black rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={handleOnLoadedMetadata}
                  onCanPlay={handleOnCanPlay}
                  onPlay={handleOnPlaying}
                  className="w-full aspect-video object-cover"
                  style={{
                    transform: 'scaleX(-1)',  // Mirror for selfie-like experience
                  }}
                />
                {!videoReady && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block animate-spin mb-2">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white text-sm">Preparing camera...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                <p className="font-semibold mb-1">💡 Tips:</p>
                <ul className="text-xs space-y-1">
                  <li>• Good lighting = better photos</li>
                  <li>• Keep the camera steady</li>
                  <li>• Make sure you're centered in frame</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button 
                  onClick={onClose} 
                  variant="outline"
                  disabled={!videoReady}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCapture}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
                  disabled={!videoReady}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
