import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { MediaItem } from '@/types';

interface YearSliderProps {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  onAddMedia: (year: number, file: File) => void;
  onRemoveMedia: (year: number, mediaId: string) => void;
  getMediaByYear: (year: number) => MediaItem[];
  isAuthenticated: boolean;
  onLoginClick: () => void;
}

export function YearSlider({
  years,
  selectedYear,
  onSelectYear,
  onAddMedia,
  onRemoveMedia,
  getMediaByYear,
  isAuthenticated,
  onLoginClick,
}: YearSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeYearForAdd, setActiveYearForAdd] = useState<number | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 200;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleAddClick = (year: number) => {
    if (!isAuthenticated) {
      onLoginClick();
      return;
    }
    setActiveYearForAdd(year);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent bubbling to avoid any form submission
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.target.files?.[0];
    if (file && activeYearForAdd) {
      console.log('📸 File selected:', file.name, file.size, file.type);
      onAddMedia(activeYearForAdd, file);
      setActiveYearForAdd(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveClick = (year: number, mediaId: string) => {
    if (isAuthenticated) {
      onRemoveMedia(year, mediaId);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
        capture="environment"
      />

      {/* Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6 text-pink-500" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="w-6 h-6 text-pink-500" />
      </button>

      {/* Slider */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-12 py-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {years.map((year) => {
          const media = getMediaByYear(year);
          const isSelected = selectedYear === year;

          return (
            <div
              key={year}
              className={`flex-shrink-0 w-48 transition-all duration-500 ${
                isSelected ? 'scale-105' : 'scale-100 opacity-80'
              }`}
            >
              <div
                onClick={() => onSelectYear(year)}
                className={`relative cursor-pointer rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
                  isSelected
                    ? 'ring-4 ring-pink-400 ring-offset-2'
                    : 'hover:shadow-2xl'
                }`}
              >
                {/* Year Card Background */}
                <div className="h-32 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-2 left-2 w-8 h-8 bg-white/20 rounded-full" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/10 rounded-full" />
                    <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white/15 rounded-full" />
                  </div>

                  <span className="text-4xl font-bold text-white drop-shadow-lg">
                    {year}
                  </span>

                  {/* Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddClick(year);
                    }}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    <Plus className="w-5 h-5 text-pink-500" />
                  </button>
                </div>

                {/* Media Preview */}
                {media.length > 0 && (
                  <div className="p-2 bg-white">
                    <div className="flex gap-1 overflow-x-auto">
                      {media.slice(0, 3).map((item) => (
                        <div key={item.id} className="relative flex-shrink-0">
                          {item.type === 'photo' ? (
                            <img
                              src={item.url}
                              alt="Memory"
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-500">🎥</span>
                            </div>
                          )}
                          {isAuthenticated && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveClick(year, item.id);
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <Trash2 className="w-2 h-2 text-white" />
                            </button>
                          )}
                        </div>
                      ))}
                      {media.length > 3 && (
                        <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-pink-600 font-bold">
                            +{media.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {media.length === 0 && (
                  <div className="p-3 bg-white text-center">
                    <p className="text-xs text-gray-400">Belum ada foto</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
