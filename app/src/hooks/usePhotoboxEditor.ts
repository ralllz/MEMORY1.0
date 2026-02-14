import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const CLOUDINARY_CLOUD_NAME = 'dfmieytqu';
const CLOUDINARY_UPLOAD_PRESET = 'MEMORY_CLD';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Template names matching the template files
export const PHOTOBOX_TEMPLATES = [
  {
    id: 'template1',
    name: 'Template 1',
    path: new URL('../assets/templates/template1.jpeg', import.meta.url).href,
  },
  {
    id: 'template2',
    name: 'Template 2',
    path: new URL('../assets/templates/template2.jpeg', import.meta.url).href,
  },
  {
    id: 'template3',
    name: 'Template 3',
    path: new URL('../assets/templates/template3.jpeg', import.meta.url).href,
  },
];

export function usePhotoboxEditor() {
  const [isLoading, setIsLoading] = useState(false);
  const [photoboxStatus, setPhotoboxStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Upload edited photo to Cloudinary
  const uploadPhotoToCloudinary = useCallback(async (blob: Blob): Promise<string> => {
    try {
      console.log('📤 [Photobox] Uploading edited photo to Cloudinary...');
      
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'auto');
      
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (!data.secure_url) {
        throw new Error('No secure_url returned from Cloudinary');
      }

      console.log('✅ [Photobox] Cloudinary upload success:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('❌ [Photobox] Cloudinary upload error:', error);
      throw error;
    }
  }, []);

  // Save edited photo to Supabase Photobox table
  const savePhotoboxToSupabase = useCallback(async (
    imageUrl: string,
    templateName: string
  ): Promise<void> => {
    try {
      console.log('💾 [Photobox] Saving to Supabase...', { templateName });
      setPhotoboxStatus('saving');

      const title = `Photobox - ${templateName} - ${new Date().toLocaleDateString()}`;

      const { data, error } = await supabase
        .from('Photobox')
        .insert([
          {
            title: title,
            image_url: imageUrl,
            file_type: 'image/png',
            template_name: templateName,
          },
        ])
        .select();

      if (error) {
        console.error('❌ [Photobox] Supabase error:', error.message);
        setPhotoboxStatus('error');
        throw error;
      }

      console.log('✅ [Photobox] Saved to Supabase:', data?.[0]?.id);
      setPhotoboxStatus('success');
      setTimeout(() => setPhotoboxStatus('idle'), 2000);
    } catch (error) {
      console.error('❌ [Photobox] Save failed:', error);
      setPhotoboxStatus('error');
      setTimeout(() => setPhotoboxStatus('idle'), 3000);
      throw error;
    }
  }, []);

  // Main save function - upload + save to DB
  const savePhotobox = useCallback(async (
    canvasBlob: Blob,
    templateName: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadPhotoToCloudinary(canvasBlob);
      
      // Save to Supabase
      await savePhotoboxToSupabase(cloudinaryUrl, templateName);
      
      console.log('✅ [Photobox] Complete save workflow finished');
    } catch (error) {
      console.error('❌ [Photobox] Save workflow failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [uploadPhotoToCloudinary, savePhotoboxToSupabase]);

  return {
    isLoading,
    photoboxStatus,
    savePhotobox,
    uploadPhotoToCloudinary,
    savePhotoboxToSupabase,
  };
}
