import { useState, useCallback, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CameraCapture } from './CameraCapture';
import { PhotoboxEditor } from './PhotoboxEditor';
import { usePhotoboxEditor } from '@/hooks/usePhotoboxEditor';

interface PhotoboxButtonProps {
  onSaveComplete?: () => void;
}

export function PhotoboxButton({ onSaveComplete }: PhotoboxButtonProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [sourceImage, setSourceImage] = useState<string>('');
  const [cameraInitializing, setCameraInitializing] = useState(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { isLoading, photoboxStatus, savePhotobox } = usePhotoboxEditor();

  // Handle opening camera with debounce to prevent multiple triggers
  const handleOpenCamera = useCallback(() => {
    // Prevent multiple rapid clicks
    if (cameraInitializing || showCamera || showEditor) {
      return;
    }

    setCameraInitializing(true);
    
    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Set camera to show after short delay (gives visual feedback)
    clickTimeoutRef.current = setTimeout(() => {
      console.log('📷 [PhotoboxButton] Opening camera...');
      setShowCamera(true);
      setCameraInitializing(false);
    }, 100);
  }, [cameraInitializing, showCamera, showEditor]);

  // Handle camera capture
  const handleCapture = useCallback((dataUrl: string) => {
    console.log('✅ [PhotoboxButton] Photo captured, size:', dataUrl.length);
    setSourceImage(dataUrl);
    setShowCamera(false);
    
    // Wait a bit for camera to properly close before opening editor
    const timer = setTimeout(() => {
      console.log('📸 [PhotoboxButton] Opening editor...');
      setShowEditor(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // Handle save from editor
  const handleSave = useCallback(async (blob: Blob, templateName: string) => {
    try {
      console.log('💾 [PhotoboxButton] Processing save...');
      await savePhotobox(blob, templateName);
      
      console.log('✅ [PhotoboxButton] Save complete');
      setSourceImage('');
      setShowEditor(false);
      
      // Callback to parent (for refresh etc)
      onSaveComplete?.();
    } catch (error) {
      console.error('❌ [PhotoboxButton] Save failed:', error);
    }
  }, [savePhotobox, onSaveComplete]);

  // Handle close camera
  const handleCloseCamera = useCallback(() => {
    setShowCamera(false);
    setCameraInitializing(false);
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
  }, []);

  return (
    <>
      {/* Photobox Button */}
      <Button
        onClick={handleOpenCamera}
        disabled={showCamera || showEditor || isLoading || cameraInitializing}
        className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white hover:from-yellow-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        title="Create a photo with templates and effects"
      >
        {cameraInitializing ? (
          <>
            <span className="animate-spin">⏳</span>
            Initializing...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Photobox
          </>
        )}
      </Button>

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={handleCloseCamera}
        />
      )}

      {/* Photo Editor Modal */}
      {showEditor && sourceImage && (
        <PhotoboxEditor
          sourceImage={sourceImage}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setSourceImage('');
          }}
          isLoading={isLoading}
        />
      )}

      {/* Status indicator */}
      {photoboxStatus === 'saving' && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-40 animate-pulse">
          <span className="animate-spin">⏳</span>
          Saving photobox...
        </div>
      )}
      
      {photoboxStatus === 'success' && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-40 animate-in fade-in">
          <span>✅</span>
          Photobox saved successfully!
        </div>
      )}
      
      {photoboxStatus === 'error' && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-40 animate-in fade-in">
          <span>❌</span>
          Error saving photobox
        </div>
      )}
    </>
  );
}
