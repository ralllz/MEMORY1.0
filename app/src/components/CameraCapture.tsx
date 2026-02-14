import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOptimizedImageSettings } from '@/lib/cameraOptimization';

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
    let videoReadyTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const setupCamera = async () => {
      try {
        const startTime = performance.now();
        console.log('📷 [Camera] Requesting camera permission...');
        
        // Try different constraint combinations - from most specific to most general
        const constraintsList = [
          // Try 1: Basic camera request without specific resolution
          {
            video: true,
            audio: false,
          },
          // Try 2: With backward camera preference
          {
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
          },
          // Try 3: With low resolution for compatibility
          {
            video: {
              facingMode: { ideal: 'environment' },
              width: { max: 640 },
              height: { max: 480 },
            },
            audio: false,
          },
        ] as MediaStreamConstraints[];

        let stream: MediaStream | null = null;
        let successConstraint = '';

        for (let i = 0; i < constraintsList.length; i++) {
          try {
            console.log(`📷 [Camera] Attempt ${i + 1} of ${constraintsList.length}...`);
            stream = await Promise.race([
              navigator.mediaDevices.getUserMedia(constraintsList[i]),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('getUserMedia timeout')), 5000)
              ),
            ]);
            successConstraint = `Attempt ${i + 1}`;
            console.log(`✅ [Camera] SUCCESS with ${successConstraint}`);
            break;
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error';
            console.log(`⚠️  [Camera] Attempt ${i + 1} failed: ${errMsg}`);
            continue;
          }
        }

        if (!stream) {
          throw new Error('Unable to access camera with any configuration. Please check permissions.');
        }

        // Check if stream is actually active
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0) {
          throw new Error('Camera stream obtained but no video track available');
        }

        console.log(`📹 [Camera] Got video track:`, {
          enabled: videoTracks[0].enabled,
          readyState: videoTracks[0].readyState,
          width: videoTracks[0].getSettings?.().width,
          height: videoTracks[0].getSettings?.().height,
        });

        if (isMounted && videoRef.current) {
          console.log('📹 [Camera] Attaching stream to video element...');
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Set permission immediately
          setHasPermission(true);
          
          const loadTimeMs = performance.now() - startTime;
          setCameraLoadTime(loadTimeMs);
          console.log(`✅ [Camera] Stream attached (${loadTimeMs.toFixed(0)}ms)`);

          // Mark ready immediately if we can, with timeout fallback
          // Some devices need a bit of time for first frame
          const checkReady = () => {
            const video = videoRef.current;
            if (!video) {
              console.log('⚠️ [Camera] Video element missing');
              return false;
            }

            // Check multiple indicators
            const hasVideoWidth = video.videoWidth > 0;
            const hasVideoHeight = video.videoHeight > 0;
            const hasReadyState = video.readyState >= 2;
            const trackEnabled = videoTracks[0]?.enabled ?? false;

            console.log(`🔍 [Camera] Readiness check:`, {
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState,
              trackEnabled,
              paused: video.paused,
            });

            // If we have a stream with enabled track, consider it ready
            // even if first frame hasn't arrived yet
            if (trackEnabled && ((hasVideoWidth && hasVideoHeight) || hasReadyState)) {
              console.log('✅ [Camera] Video ready - frames detected');
              return true;
            }

            return false;
          };

          // Check immediately
          if (checkReady()) {
            if (isMounted) setVideoReady(true);
          } else {
            // If not ready immediately, wait up to 2 seconds with checks every 200ms
            let attempts = 0;
            const readyCheckInterval = setInterval(() => {
              attempts++;
              if (!isMounted) {
                clearInterval(readyCheckInterval);
                return;
              }

              if (checkReady()) {
                clearInterval(readyCheckInterval);
                setVideoReady(true);
                console.log(`✅ [Camera] Ready after ${attempts * 200}ms`);
              }

              // Force ready after 10 attempts (2 seconds) max
              if (attempts >= 10) {
                clearInterval(readyCheckInterval);
                console.log('⏱️ [Camera] Forcing ready after max attempts');
                setVideoReady(true);
              }
            }, 200);

            // Safety timeout
            videoReadyTimeoutId = setTimeout(() => {
              clearInterval(readyCheckInterval);
              if (isMounted) {
                console.log('⏱️ [Camera] Safety timeout - forcing ready');
                setVideoReady(true);
              }
            }, 2500);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ [Camera] Error:', err);
          const message = err instanceof Error ? err.message : 'Failed to access camera';
          setError(message);
          setHasPermission(false);
        }
      }
    };

    setupCamera();

    return () => {
      isMounted = false;
      
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 [Camera] Stopped track:', track.kind);
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (timeoutId) clearTimeout(timeoutId);
      if (videoReadyTimeoutId) clearTimeout(videoReadyTimeoutId);
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
