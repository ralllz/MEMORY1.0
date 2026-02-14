import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
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
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(PHOTOBOX_TEMPLATES[0].id);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f0f0f0',
    });

    fabricCanvasRef.current = canvas;

    // Load source image
    fabric.Image.fromURL(sourceImage, {
      onLoaded: (img: any) => {
        img.scaleToWidth(800);
        img.set({
          left: 0,
          top: Math.max(0, (600 - img.getScaledHeight()) / 2),
        });
        canvas.add(img);
        canvas.renderAll();
      }
    } as any);

    // Load template
    const templatePath = PHOTOBOX_TEMPLATES.find(t => t.id === selectedTemplate)?.path;
    if (templatePath) {
      fabric.Image.fromURL(templatePath, {
        onLoaded: (template: any) => {
          template.scaleToWidth(800);
          template.set({
            left: 0,
            top: 0,
            selectable: true, // Allow user to interact
          });
          canvas.add(template);
          canvas.renderAll();
        }
      } as any);
    }

    return () => {
      canvas.dispose();
    };
  }, [sourceImage]);

  // Handle template selector change
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    // Remove template layer (last object)
    const lastObject = canvas.getObjects()[canvas.getObjects().length - 1];
    if (lastObject) {
      canvas.remove(lastObject);
    }

    // Add new template
    const templatePath = PHOTOBOX_TEMPLATES.find(t => t.id === templateId)?.path;
    if (templatePath) {
      fabric.Image.fromURL(templatePath, {
        onLoaded: (template: any) => {
          template.scaleToWidth(800);
          template.set({
            left: 0,
            top: 0,
            selectable: true,
          });
          canvas.add(template);
          canvas.renderAll();
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
        async (blob: Blob | null) => {
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
          {/* Canvas */}
          <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
            <canvas
              ref={canvasRef}
              className="border-4 border-gray-300 rounded shadow-lg"
            />
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
                  className={`relative p-3 rounded-lg border-2 transition ${
                    selectedTemplate === template.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-300 hover:border-pink-300'
                  }`}
                >
                  <img
                    src={template.path}
                    alt={template.name}
                    className="w-full h-24 object-cover rounded"
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
              disabled={isSaving}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
            >
              {isSaving ? '💾 Saving...' : '✅ Save Photobox'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
