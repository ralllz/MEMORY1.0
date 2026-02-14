import { useState, useEffect, useCallback } from 'react';
import type { MediaItem, YearData } from '@/types';

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];
<<<<<<< HEAD
const METADATA_KEY = 'memory_metadata';

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'MEMORY_CLD';
const CLOUDINARY_UPLOAD_PRESET = 'MEMORYCLD';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

interface StoredMediaMetadata {
  id: string;
  filename: string;
  type: 'photo' | 'video';
  year: number;
  createdAt: string;
  mimeType: string;
  cloudinaryUrl: string; // URL dari Cloudinary
  cloudinaryPublicId?: string; // Public ID untuk delete
}

// Upload file ke Cloudinary
const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
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
=======
>>>>>>> 4b067a9dd4bcdd4241f391ba645aa2cdd60bb42a

const generateSampleMedia = (): YearData[] => {
  return YEARS.map(year => ({
    year,
    media: [],
  }));
};

export function useMediaStorage() {
  const [yearData, setYearData] = useState<YearData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
<<<<<<< HEAD
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Load metadata from localStorage on mount
  useEffect(() => {
    const loadMedia = async () => {
      try {
        const stored = localStorage.getItem(METADATA_KEY);
        if (stored) {
          try {
            const metadata: StoredMediaMetadata[] = JSON.parse(stored);
            const loadedYearData = generateSampleMedia();

            // Reconstruct media items dengan URL dari Cloudinary
            for (const meta of metadata) {
              const yearIdx = loadedYearData.findIndex(yd => yd.year === meta.year);
              
              if (yearIdx !== -1) {
                loadedYearData[yearIdx].media.push({
                  id: meta.id,
                  type: meta.type,
                  url: meta.cloudinaryUrl, // URL dari Cloudinary
                  year: meta.year,
                  createdAt: new Date(meta.createdAt),
                });
              }
            }

            setYearData(loadedYearData);
          } catch (parseError) {
            console.error('Error parsing metadata:', parseError);
            localStorage.removeItem(METADATA_KEY);
            setYearData(generateSampleMedia());
          }
        } else {
          setYearData(generateSampleMedia());
        }
      } catch (error) {
        console.error('Error loading media:', error);
        setYearData(generateSampleMedia());
      } finally {
        setIsLoading(false);
      }
    };

    loadMedia();
  }, []);

  const addMedia = useCallback((year: number, file: File): MediaItem | null => {
    const mediaId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setCloudStatus('saving');
    
    // Upload to Cloudinary
    uploadToCloudinary(file)
      .then(({ url, publicId }) => {
        // Save metadata to localStorage dengan URL Cloudinary
        const stored = localStorage.getItem(METADATA_KEY);
        const metadata: StoredMediaMetadata[] = stored ? JSON.parse(stored) : [];
        metadata.push({
          id: mediaId,
          filename: file.name,
          type: file.type.startsWith('video/') ? 'video' : 'photo',
          year,
          createdAt: new Date().toISOString(),
          mimeType: file.type,
          cloudinaryUrl: url,
          cloudinaryPublicId: publicId,
        });

        try {
          localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
        } catch (error) {
          console.error('Error saving metadata:', error);
        }

        // Update state dengan URL Cloudinary
        setYearData(prev => prev.map(yd => {
          if (yd.year === year) {
            return {
              ...yd,
              media: [
                ...yd.media,
                {
                  id: mediaId,
                  type: file.type.startsWith('video/') ? 'video' : 'photo',
                  url: url, // URL dari Cloudinary
                  year,
                  createdAt: new Date(),
                },
              ],
            };
          }
          return yd;
        }));

        setCloudStatus('success');
        setTimeout(() => setCloudStatus('idle'), 2000);
      })
      .catch(error => {
        console.error('Error uploading to Cloudinary:', error);
        setCloudStatus('error');
        setTimeout(() => setCloudStatus('idle'), 3000);
      });

    // Return null temporarily (state akan update setelah upload selesai)
    const newMedia: MediaItem = {
      id: mediaId,
      type: file.type.startsWith('video/') ? 'video' : 'photo',
      url: '', // Temporary, akan diupdate setelah Cloudinary upload
=======

  useEffect(() => {
    const stored = localStorage.getItem('memory_media');
    if (stored) {
      const parsed = JSON.parse(stored);
      setYearData(parsed.map((yd: YearData) => ({
        ...yd,
        media: yd.media.map((m: MediaItem) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        })),
      })));
    } else {
      setYearData(generateSampleMedia());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && yearData.length > 0) {
      localStorage.setItem('memory_media', JSON.stringify(yearData));
    }
  }, [yearData, isLoading]);

  const addMedia = useCallback((year: number, file: File): MediaItem | null => {
    const url = URL.createObjectURL(file);
    const newMedia: MediaItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: file.type.startsWith('video/') ? 'video' : 'photo',
      url,
>>>>>>> 4b067a9dd4bcdd4241f391ba645aa2cdd60bb42a
      year,
      createdAt: new Date(),
    };

<<<<<<< HEAD
=======
    setYearData(prev => prev.map(yd => {
      if (yd.year === year) {
        return { ...yd, media: [...yd.media, newMedia] };
      }
      return yd;
    }));

>>>>>>> 4b067a9dd4bcdd4241f391ba645aa2cdd60bb42a
    return newMedia;
  }, []);

  const removeMedia = useCallback((year: number, mediaId: string) => {
<<<<<<< HEAD
    // Get metadata untuk delete dari Cloudinary (optional)
    const stored = localStorage.getItem(METADATA_KEY);
    if (stored) {
      try {
        const metadata: StoredMediaMetadata[] = JSON.parse(stored);
        
        // TODO: Optionally delete dari Cloudinary jika ingin
        // Require auth token untuk Cloudinary destroy API
        
        const filtered = metadata.filter(m => m.id !== mediaId);
        localStorage.setItem(METADATA_KEY, JSON.stringify(filtered));
      } catch (error) {
        console.error('Error updating metadata:', error);
      }
    }

=======
>>>>>>> 4b067a9dd4bcdd4241f391ba645aa2cdd60bb42a
    setYearData(prev => prev.map(yd => {
      if (yd.year === year) {
        return { ...yd, media: yd.media.filter(m => m.id !== mediaId) };
      }
      return yd;
    }));
  }, []);

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
<<<<<<< HEAD
    cloudStatus,
=======
>>>>>>> 4b067a9dd4bcdd4241f391ba645aa2cdd60bb42a
  };
}
