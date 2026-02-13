import { useState, useEffect, useCallback } from 'react';
import type { MediaItem, YearData } from '@/types';

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];

const generateSampleMedia = (): YearData[] => {
  return YEARS.map(year => ({
    year,
    media: [],
  }));
};

export function useMediaStorage() {
  const [yearData, setYearData] = useState<YearData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      year,
      createdAt: new Date(),
    };

    setYearData(prev => prev.map(yd => {
      if (yd.year === year) {
        return { ...yd, media: [...yd.media, newMedia] };
      }
      return yd;
    }));

    return newMedia;
  }, []);

  const removeMedia = useCallback((year: number, mediaId: string) => {
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
  };
}
