import { useState, useEffect, useCallback } from 'react';
import type { MediaItem, YearData } from '@/types';
import { supabase } from '../supabaseClient';

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'dfmieytqu';
const CLOUDINARY_UPLOAD_PRESET = 'MEMORY_CLD';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Upload file ke Cloudinary
const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('resource_type', 'auto'); // Support video uploads
  
  try {
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

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export function useMediaStorage() {
  const [yearData, setYearData] = useState<YearData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Fetch memories dari Supabase
  const fetchFromSupabase = useCallback(async () => {
    try {
      console.log('🔍 Fetching from Supabase...');
      setIsLoading(true);
      const { data, error } = await supabase
        .from('Memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching from Supabase:', error.message);
        setYearData(YEARS.map(year => ({ year, media: [] })));
        return;
      }

      if (!data) {
        console.log('✅ No data returned from Supabase');
        setYearData(YEARS.map(year => ({ year, media: [] })));
        return;
      }

      // Transform Supabase data ke YearData format
      const loadedYearData: YearData[] = YEARS.map(year => ({
        year,
        media: data
          .filter(item => item.year === year)
          .map(item => {
            const fileType = item.file_type?.startsWith('video/') ? 'video' : 'photo';
            return {
              id: item.id.toString(),
              type: fileType as 'video' | 'photo',
              url: item.image_url,
              year: item.year,
              createdAt: new Date(item.created_at),
            } as MediaItem;
          }),
      }));

      setYearData(loadedYearData);
      console.log('✅ Data loaded from Supabase:', data.length, 'items');
    } catch (error) {
      console.error('Error in fetchFromSupabase:', error);
      setYearData(YEARS.map(year => ({ year, media: [] })));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data dari Supabase saat component mount
  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  const addMedia = useCallback((year: number, file: File, onUploadComplete?: (url: string) => Promise<void> | void): MediaItem => {
    const mediaId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setCloudStatus('saving');
    
    // Create temporary media item dengan placeholder URL
    const placeholderMedia: MediaItem = {
      id: mediaId,
      type: file.type.startsWith('video/') ? 'video' : 'photo',
      url: '', // Will be updated after Cloudinary upload
      year,
      createdAt: new Date(),
    };

    // Add placeholder to state immediately
    setYearData(prev => prev.map(yd => {
      if (yd.year === year) {
        return {
          ...yd,
          media: [...yd.media, placeholderMedia],
        };
      }
      return yd;
    }));

    // Upload to Cloudinary in background
    console.log('📤 Uploading to Cloudinary...', file.name, 'Size:', file.size, 'Type:', file.type);
    uploadToCloudinary(file)
      .then(async ({ url }) => {
        console.log('✅ Cloudinary upload success:', url);
        
        // Update state dengan URL yang sebenarnya dari Cloudinary
        setYearData(prev => prev.map(yd => {
          if (yd.year === year) {
            return {
              ...yd,
              media: yd.media.map(m =>
                m.id === mediaId
                  ? { ...m, url: url }
                  : m
              ),
            };
          }
          return yd;
        }));

        // Callback ke App.tsx untuk save ke Supabase
        // App.tsx akan menangani fetchFromSupabase() setelah insert berhasil
        if (onUploadComplete) {
          try {
            console.log('💾 Calling onUploadComplete callback to save to Supabase...');
            await Promise.resolve(onUploadComplete(url));
          } catch (error) {
            console.error('Error in onUploadComplete:', error);
          }
        }
        
        setCloudStatus('success');
        console.log('⏱️ Setting cloud status to success');
        setTimeout(() => setCloudStatus('idle'), 2000);
      })
      .catch(error => {
        console.error('❌ Error uploading to Cloudinary:', error);
        setCloudStatus('error');
        setTimeout(() => setCloudStatus('idle'), 3000);
      });

    return placeholderMedia;
  }, [fetchFromSupabase]);

  const removeMedia = useCallback(async (year: number, mediaId: string) => {
    // Remove dari state immediately
    setYearData(prev => prev.map(yd => {
      if (yd.year === year) {
        return { ...yd, media: yd.media.filter(m => m.id !== mediaId) };
      }
      return yd;
    }));
    // Tunggu Supabase delete selesai, kemudian fetch ulang
    await new Promise(resolve => setTimeout(resolve, 300));
    await fetchFromSupabase();
    console.log('✅ Delete dan sinkronisasi selesai');
  }, [fetchFromSupabase]);

  const getMediaByYear = useCallback((year: number): MediaItem[] => {
    return yearData.find(yd => yd.year === year)?.media || [];
  }, [yearData]);

  const getAllMedia = useCallback((): MediaItem[] => {
    return yearData.flatMap(yd => yd.media);
  }, [yearData]);

  return {
    yearData,
    addMedia,
    removeMedia,
    getMediaByYear,
    getAllMedia,
    isLoading,
    years: YEARS,
    cloudStatus,
    fetchFromSupabase, // Export untuk explicit refresh dari parent component
  };
}
