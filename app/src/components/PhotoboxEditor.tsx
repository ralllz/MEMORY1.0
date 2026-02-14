import { useEffect, useRef, useState } from 'react';
import { Canvas, Image } from 'fabric';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PHOTOBOX_TEMPLATES } from '@/hooks/usePhotoboxEditor';

interface PhotoboxEditorProps {
  sourceImage: string; // Camera photo as data URL
  onSave: (blob: Blob, templateName: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function PhotoboxEditor({ sourceImage, onSave, onClose, isLoading }: PhotoboxEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(PHOTOBOX_TEMPLATES[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadError, setLoadError] = useState<string>('');

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const initializeCanvas = async () => {
      try {
        setIsInitializing(true);
        console.log('🎨 [PhotoboxEditor] Initializing canvas...');
        
        const element = canvasRef.current;
        if (!element) return;

        const canvas = new Canvas(element, {
          width: 800,
          height: 600,
          backgroundColor: '#f0f0f0',
        });

        fabricCanvasRef.current = canvas;
        console.log('✅ [PhotoboxEditor] Canvas created');

        // Load source image from camera
        Image.fromURL(sourceImage, {
          crossOrigin: 'anonymous',
          onLoaded: (img: any) => {
            try {
              console.log('✅ [PhotoboxEditor] Source image loaded');
              img.scaleToWidth(800);
              img.set({
                left: 0,
                top: Math.max(0, (600 - img.getScaledHeight()) / 2),
                selectable: false,
              });
              canvas.add(img);
              canvas.renderAll();
            } catch (err) {
              console.error('❌ [PhotoboxEditor] Error adding source image:', err);
              setLoadError('Failed to load camera image');
            }
          },
          onError: () => {
            console.error('❌ [PhotoboxEditor] Failed to load source image');
            setLoadError('Failed to load camera image');
          }
        } as any);

        // Load template
        const templatePath = PHOTOBOX_TEMPLATES.find(t => t.id === selectedTemplate)?.path;
        if (templatePath) {
          console.log('🎨 [PhotoboxEditor] Loading template from:', templatePath);
          Image.fromURL(templatePath, {
            crossOrigin: 'anonymous',
            onLoaded: (template: any) => {
              try {
                console.log('✅ [PhotoboxEditor] Template loaded');
                template.scaleToWidth(800);
                template.set({
                  left: 0,
                  top: 0,
                  selectable: true,
                });
                canvas.add(template);
                canvas.renderAll();
                setIsInitializing(false);
              } catch (err) {
                console.error('❌ [PhotoboxEditor] Error adding template:', err);
                setIsInitializing(false);
              }
            },
            onError: () => {
              console.error('❌ [PhotoboxEditor] Failed to load template');
              setIsInitializing(false);
              setLoadError('Failed to load template');
            }
          } as any);
        }

        return () => {
          try {
            canvas.dispose();
          } catch (err) {
            console.log('⚠️  Error disposing canvas:', err);
          }
        };
      } catch (error) {
        console.error('❌ [PhotoboxEditor] Canvas initialization error:', error);
        setLoadError('Canvas initialization failed');
        setIsInitializing(false);
      }
    };

    initializeCanvas();
  }, [sourceImage, selectedTemplate]);

  // Handle template selector change
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsInitializing(true);
    
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    
    // Remove only template objects (keep source image)
    for (let i = objects.length - 1; i > 0; i--) {
      canvas.remove(objects[i]);
    }

    // Add new template
    const templatePath = PHOTOBOX_TEMPLATES.find(t => t.id === templateId)?.path;
    if (templatePath) {
      console.log('🎨 [PhotoboxEditor] Switching to template:', templateId);
      Image.fromURL(templatePath, {
        crossOrigin: 'anonymous',
        onLoaded: (template: any) => {
          try {
            template.scaleToWidth(800);
            template.set({
              left: 0,
              top: 0,
              selectable: true,
            });
            canvas.add(template);
            canvas.renderAll();
            setIsInitializing(false);
            console.log('✅ [PhotoboxEditor] Template switched successfully');
          } catch (err) {
            console.error('❌ [PhotoboxEditor] Error switching template:', err);
            setIsInitializing(false);
          }
        },
        onError: () => {
          console.error('❌ [PhotoboxEditor] Failed to load new template');
          setIsInitializing(false);
        }
      } as any);
    }
  };

  // Save canvas
  const handleSave = async () => {
    if (!fabricCanvasRef.current) return;

    setIsSaving(true);
    try {
      console.log('💾 [PhotoboxEditor] Exporting canvas...');
      
      const canvas = fabricCanvasRef.current;
      
      // Convert canvas to blob
      canvas.getElement().toBlob(
        async (blob: Blob | null): Promise<void> => {
          try {
            if (!blob) throw new Error('Failed to create blob');
            
            const templateName = PHOTOBOX_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Unknown';
            
            console.log('📦 [PhotoboxEditor] Canvas exported, saving...');
            await onSave(blob, templateName);
            
            setIsSaving(false);
            onClose();
          } catch (error) {
            console.error('❌ [PhotoboxEditor] Blob save error:', error);
            setIsSaving(false);
          }
        },
        'image/png',
        0.95
      );
    } catch (error) {
      console.error('❌ [PhotoboxEditor] Save error:', error);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold">📸 Photobox Editor</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1 hover:bg-white/20 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-semibold mb-2">❌ Error</p>
              <p className="text-red-700 text-sm">{loadError}</p>
              <Button onClick={onClose} variant="outline" className="mt-4">
                Close
              </Button>
            </div>
          )}

          {!loadError && (
            <>
              {/* Canvas with loading overlay */}
              <div className="flex justify-center bg-gray-100 p-4 rounded-lg relative">
                <canvas
                  ref={canvasRef}
                  className="border-4 border-gray-300 rounded shadow-lg"
                />
                {isInitializing && (
                  <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-center">
                      <div className="animate-spin mb-2">⏳</div>
                      <p className="text-sm font-medium text-gray-700">Loading editor...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Template Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  🎨 Select Template
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {PHOTOBOX_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template.id)}
                      disabled={isInitializing || isSaving || isLoading}
                      className={`relative p-3 rounded-lg border-2 transition ${
                        selectedTemplate === template.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-300 hover:border-pink-300'
                      } ${(isInitializing || isSaving || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <img
                        src={template.path}
                        alt={template.name}
                        className="w-full h-24 object-cover rounded"
                        onError={(e) => {
                          console.error('Failed to load template thumbnail:', template.id);
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ccc" width="100" height="100"/%3E%3C/svg%3E';
                        }}
                      />
                      <p className="mt-2 text-sm font-medium text-gray-700">{template.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                <p className="font-semibold mb-1">💡 Editor Controls:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Click and drag elements to move them</li>
                  <li>Use corner handles to resize</li>
                  <li>Right-click to rotate</li>
                  <li>Select template to switch frames</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={onClose}
                  disabled={isSaving || isInitializing}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || isLoading || isInitializing}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                >
                  {isSaving ? '💾 Saving...' : '✅ Save Photobox'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
