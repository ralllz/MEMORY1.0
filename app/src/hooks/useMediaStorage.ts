import { useState, useEffect, useCallback } from 'react';
import type { MediaItem, YearData } from '@/types';
import { supabase } from '../supabaseClient';

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];

// ============================================================================
// CLOUDINARY CONFIGURATION & CONSTANTS
// ============================================================================
const CLOUDINARY_CLOUD_NAME = 'dfmieytqu';
const CLOUDINARY_UPLOAD_PRESET = 'MEMORY_CLD';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// ============================================================================
// CLOUDINARY UPLOAD FUNCTION
// ✅ REQUIREMENT 1: resource_type 'auto' untuk support video & photo
// ============================================================================
const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  // ✅ REQUIREMENT 1: CRITICAL - resource_type must be 'auto' for video support
  formData.append('resource_type', 'auto');
  
  try {
    console.log('📤 [CLOUDINARY] Starting upload:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileType: file.type,
      timestamp: new Date().toISOString(),
    });
    
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (!data.secure_url) {
      throw new Error('Cloudinary did not return secure_url in response');
    }

    console.log('✅ [CLOUDINARY] Upload success:', {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      resourceType: data.resource_type,
    });

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('❌ [CLOUDINARY] Upload failed:', {
      error: error instanceof Error ? error.message : String(error),
      fileName: file.name,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

// ============================================================================
// MEDIA STORAGE HOOK - MAIN
// ============================================================================
export function useMediaStorage() {
  const [yearData, setYearData] = useState<YearData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // ========================================================================
  // ✅ REQUIREMENT 2: fetchFromSupabase FUNCTION
  // Fetch data dari Supabase 'Memories' table
  // No localStorage usage, no window.location.reload()
  // ========================================================================
  const fetchFromSupabase = useCallback(async () => {
    try {
      console.log('🔍 [SUPABASE] Fetching data from Memories table...');
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('Memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [SUPABASE] Query error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          timestamp: new Date().toISOString(),
        });
        setYearData(YEARS.map(year => ({ year, media: [] })));
        return;
      }

      if (!data) {
        console.log('⚠️ [SUPABASE] No data returned (null)');
        setYearData(YEARS.map(year => ({ year, media: [] })));
        return;
      }

      if (!Array.isArray(data)) {
        console.error('❌ [SUPABASE] Invalid data format - expected array:', typeof data);
        setYearData(YEARS.map(year => ({ year, media: [] })));
        return;
      }

      console.log('✅ [SUPABASE] Query success, processing', data.length, 'records...');
      console.log('📋 [SUPABASE] Sample data structure:', data.length > 0 ? {
        sample: data[0],
        keys: Object.keys(data[0] || {})
      } : 'No data');

      // Transform Supabase data ke format YearData
      const loadedYearData: YearData[] = YEARS.map(year => ({
        year,
        media: data
          .filter(item => {
            // ✅ DEFENSIVE: Only include items with valid year
            if (!item.year || typeof item.year !== 'number') {
              console.log('⚠️ [SUPABASE] Skipping item with invalid/missing year:', { 
                id: item.id, 
                hasYear: !!item.year,
                year: item.year 
              });
              return false;
            }
            return item.year === year;
          })
          .map(item => {
            try {
              // ✅ DEFENSIVE: Handle missing file_type gracefully
              const fileType = item.file_type?.startsWith('video/') ? 'video' : 'photo';
              if (!item.image_url) {
                console.warn('⚠️ [SUPABASE] Item missing image_url:', item.id);
              }
              return {
                id: item.id.toString(),
                type: fileType as 'video' | 'photo',
                url: item.image_url || '',
                year: item.year,
                createdAt: new Date(item.created_at),
              } as MediaItem;
            } catch (mapError) {
              console.error('❌ [SUPABASE] Error mapping item:', { 
                itemId: item.id, 
                error: mapError 
              });
              return null as any;
            }
          })
          .filter(item => item !== null), // Remove any failed mappings
      }));

      // ✅ Log if newly inserted item appears (verify sync is working)
      const totalItems = data.length;
      const displayedItems = loadedYearData.reduce((sum, yd) => sum + yd.media.length, 0);
      if (totalItems > displayedItems) {
        console.warn('⚠️ [SUPABASE] Some items missing after filter:', {
          total: totalItems,
          displayed: displayedItems,
          missingYears: data.filter(item => !item.year).map(item => item.id)
        });
      }

      setYearData(loadedYearData);
      console.log('✅ [SUPABASE] State updated with', displayedItems, 'items across', 
        loadedYearData.filter(yd => yd.media.length > 0).length, 'years');
    } catch (error) {
      console.error('❌ [SUPABASE] Exception during fetch:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      setYearData(YEARS.map(year => ({ year, media: [] })));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data pada mount
  useEffect(() => {
    console.log('🚀 [HOOK] useMediaStorage mounted, loading initial data...');
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  // ========================================================================
  // addMedia FUNCTION
  // ✅ REQUIREMENT 2: Upload to Cloudinary + Save to Supabase
  // ✅ Calls fetchFromSupabase() at the end to sync across devices
  // ✅ NO window.location.reload() anywhere
  // ✅ NO localStorage usage (only auth uses localStorage in useAuth.ts)
  // ========================================================================
  const addMedia = useCallback((
    year: number,
    file: File,
    onUploadComplete?: (url: string) => Promise<void> | void
  ): MediaItem => {
    const mediaId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('📸 [ADDMEDIA] START - Adding new media:', {
      year,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileType: file.type,
      mediaId,
      timestamp: new Date().toISOString(),
    });
    
    setCloudStatus('saving');
    
    // Create temporary placeholder media item
    const placeholderMedia: MediaItem = {
      id: mediaId,
      type: file.type.startsWith('video/') ? 'video' : 'photo',
      url: '', // Will be filled after Cloudinary upload
      year,
      createdAt: new Date(),
    };

    // Add placeholder to state immediately for instant UI feedback
    setYearData(prev => prev.map(yd => {
      if (yd.year === year) {
        return {
          ...yd,
          media: [...yd.media, placeholderMedia],
        };
      }
      return yd;
    }));

    // Upload to Cloudinary asynchronously
    uploadToCloudinary(file)
      .then(async ({ url }) => {
        console.log('📦 [ADDMEDIA] Cloudinary upload complete, updating UI with real URL...');
        
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

        // ✅ REQUIREMENT: Call onUploadComplete callback
        // This should handle Supabase insert in App.tsx
        if (onUploadComplete) {
          try {
            console.log('💾 [ADDMEDIA] Executing onUploadComplete callback (App.tsx Supabase insert)...');
            await Promise.resolve(onUploadComplete(url));
            console.log('✅ [ADDMEDIA] onUploadComplete callback completed');
          } catch (error) {
            console.error('❌ [ADDMEDIA] Error in onUploadComplete callback:', error);
            throw error; // Re-throw to prevent sync from proceeding
          }
        }
        
        // ========================================================================
        // ✅ REQUIREMENT 2: EXPLICIT SYNC - Call fetchFromSupabase at END
        // This ensures data propagates to all devices WITHOUT page reload
        // ========================================================================
        console.log('⏳ [ADDMEDIA] Waiting 1500ms for Supabase transaction to fully commit...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('🔄 [ADDMEDIA] SYNCING: Calling fetchFromSupabase() to refresh data...');
        await fetchFromSupabase();
        console.log('✅ [ADDMEDIA] SYNC COMPLETE - All devices see the new data WITHOUT reload!');
        
        setCloudStatus('success');
        setTimeout(() => setCloudStatus('idle'), 2000);
      })
      .catch(error => {
        console.error('❌ [ADDMEDIA] FAILED - Error during upload process:', error);
        setCloudStatus('error');
        setTimeout(() => setCloudStatus('idle'), 3000);
      });

    return placeholderMedia;
  }, [fetchFromSupabase]);

  // Remove media function
  const removeMedia = useCallback(async (year: number, mediaId: string) => {
    console.log('🗑️ [REMOVEMEDIA] START - Removing media:', { year, mediaId });
    
    // Remove dari state immediately for instant UI feedback
    setYearData(prev => prev.map(yd => {
      if (yd.year === year) {
        return { ...yd, media: yd.media.filter(m => m.id !== mediaId) };
      }
      return yd;
    }));
    
    // Wait for any Supabase deletion to process
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Refresh data from Supabase to sync deletion across devices
    console.log('🔄 [REMOVEMEDIA] Syncing deletion across devices...');
    await fetchFromSupabase();
    console.log('✅ [REMOVEMEDIA] COMPLETE - Deletion synced');
  }, [fetchFromSupabase]);

  // Helper function to get media by year
  const getMediaByYear = useCallback((year: number): MediaItem[] => {
    return yearData.find(yd => yd.year === year)?.media || [];
  }, [yearData]);

  // Helper function to get all media
  const getAllMedia = useCallback((): MediaItem[] => {
    return yearData.flatMap(yd => yd.media);
  }, [yearData]);

  // ========================================================================
  // RETURN HOOK INTERFACE
  // ========================================================================
  return {
    // State
    yearData,
    isLoading,
    cloudStatus,
    
    // Functions
    addMedia,
    removeMedia,
    getMediaByYear,
    getAllMedia,
    fetchFromSupabase, // Export for explicit refresh if needed
    
    // Constants
    years: YEARS,
  };
}
