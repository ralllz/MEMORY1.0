import { useState } from 'react';
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
  
  const { isLoading, photoboxStatus, savePhotobox } = usePhotoboxEditor();

  // Handle camera capture
  const handleCapture = (dataUrl: string) => {
    console.log('✅ [PhotoboxButton] Photo captured');
    setSourceImage(dataUrl);
    setShowCamera(false);
    setShowEditor(true);
  };

  // Handle save from editor
  const handleSave = async (blob: Blob, templateName: string) => {
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
  };

  return (
    <>
      {/* Photobox Button */}
      <Button
        onClick={() => setShowCamera(true)}
        disabled={showCamera || showEditor || isLoading}
        className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white hover:from-yellow-500 hover:to-pink-600 disabled:opacity-50"
        title="Create a photo with templates and effects"
      >
        <Sparkles className="w-5 h-5" />
        Photobox
      </Button>

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
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
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          Saving photobox...
        </div>
      )}
      
      {photoboxStatus === 'success' && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <span>✅</span>
          Photobox saved successfully!
        </div>
      )}
      
      {photoboxStatus === 'error' && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <span>❌</span>
          Error saving photobox
        </div>
      )}
    </>
  );
}
