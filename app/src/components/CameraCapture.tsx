import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOptimizedCameraConstraints, getOptimizedImageSettings } from '@/lib/cameraOptimization';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [videoReady, setVideoReady] = useState(false);
  const [cameraLoadTime, setCameraLoadTime] = useState<number>(0);

  useEffect(() => {
    // Request camera permission with optimized constraints
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;
    let pollIntervalId: ReturnType<typeof setInterval> | null = null;

    const setupCamera = async () => {
      try {
        const startTime = performance.now();
        console.log('📷 [Camera] Requesting camera permission...');
        
        // Get optimized constraint sets for this device
        const constraintsList = getOptimizedCameraConstraints();
        let stream: MediaStream | null = null;

        for (const constraintSet of constraintsList) {
          try {
            console.log(`📷 [Camera] Trying constraint set: ${constraintSet.label}`);
            stream = await navigator.mediaDevices.getUserMedia(constraintSet as MediaStreamConstraints);
            console.log(`✅ [Camera] SUCCESS with: ${constraintSet.label}`);
            break;
          } catch (err) {
            console.log(`⚠️  [Camera] Failed (${constraintSet.label}):`, (err as Error).message);
            continue;
          }
        }

        if (!stream) {
          throw new Error('No camera constraint worked - no camera available');
        }

        if (isMounted && videoRef.current) {
          console.log('📹 [Camera] Setting video stream...');
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Set permission immediately - video will show as soon as it's ready
          setHasPermission(true);
          
          const loadTimeMs = performance.now() - startTime;
          setCameraLoadTime(loadTimeMs);
          console.log(`✅ [Camera] Permission granted, stream active (${loadTimeMs.toFixed(0)}ms)`);
          
          // Poll for video readiness (checking if video has started rendering)
          let checkCount = 0;
          pollIntervalId = setInterval(() => {
            checkCount++;
            const video = videoRef.current;
            
            if (!video) {
              console.log('⚠️ [Camera] Video element no longer available');
              if (pollIntervalId) clearInterval(pollIntervalId);
              return;
            }

            // Multiple ways to check if video is ready
            const hasData = video.videoWidth > 0 && video.videoHeight > 0;
            const isPlaying = !video.paused && !video.ended;
            const readyState = video.readyState >= 2; // HAVE_CURRENT_DATA or better

            console.log(`🔍 [Camera] Poll ${checkCount}: hasData=${hasData}, isPlaying=${isPlaying}, readyState=${video.readyState}`);

            if (hasData || (isPlaying && readyState)) {
              console.log('✅ [Camera] Video detected frames! Marking as ready');
              if (isMounted) {
                setVideoReady(true);
              }
              if (pollIntervalId) clearInterval(pollIntervalId);
            }

            // Max 20 checks (2 seconds with 100ms interval)
            if (checkCount > 20) {
              console.log('⏱️ [Camera] Timeout: marking video as ready after polling');
              if (isMounted) {
                setVideoReady(true);
              }
              if (pollIntervalId) clearInterval(pollIntervalId);
            }
          }, 100);

          // Also set a hard timeout as last resort (3 seconds)
          timeoutId = setTimeout(() => {
            if (isMounted && pollIntervalId) {
              console.log('⏱️ [Camera] Hard timeout: forcing video ready');
              clearInterval(pollIntervalId);
              setVideoReady(true);
            }
          }, 3000);
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ [Camera] Permission denied or error:', err);
          const message = err instanceof Error ? err.message : 'Failed to access camera';
          setError(message);
          setHasPermission(false);
        }
      }
    };

    setupCamera();

    return () => {
      isMounted = false;
      
      // Cleanup: stop video stream properly
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 [Camera] Track stopped:', track.kind);
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
    };
  }, []);

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

  // Handle video loaded event
  const handleVideoLoaded = () => {
    console.log('✅ [Camera] Video stream ready to capture (onLoadedMetadata)');
    setVideoReady(true);
  };

  // Handle when video can play
  const handleVideoCanPlay = () => {
    console.log('✅ [Camera] Video can play (onCanPlay)');
    setVideoReady(true);
  };

  // Handle when video starts playing
  const handleVideoPlay = () => {
    console.log('✅ [Camera] Video playing (onPlay)');
    setVideoReady(true);
  };

  // Handle loaded data
  const handleLoadedData = () => {
    console.log('✅ [Camera] Loaded data (onLoadedData)');
    setVideoReady(true);
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
              <p className="text-gray-500 text-sm mt-2">Please ensure camera permission is granted</p>
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
                  onLoadedMetadata={handleVideoLoaded}
                  onCanPlay={handleVideoCanPlay}
                  onPlay={handleVideoPlay}
                  onLoadedData={handleLoadedData}
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
