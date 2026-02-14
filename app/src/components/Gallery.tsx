import { useState } from 'react';
import { X, Play, Heart, Trash2 } from 'lucide-react';
import type { MediaItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface GalleryProps {
  media: MediaItem[];
  isAuthenticated: boolean;
  onRemoveMedia: (year: number, mediaId: string) => void;
  maxItems?: { top: number; bottom: number };
}

export function Gallery({
  media,
  isAuthenticated,
  onRemoveMedia,
  maxItems = { top: 5, bottom: 6 },
}: GalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const topRow = media.slice(0, maxItems.top);
  const bottomRow = media.slice(maxItems.top, maxItems.top + maxItems.bottom);

  const handleRemove = (item: MediaItem) => {
    if (isAuthenticated) {
      onRemoveMedia(item.year, item.id);
      if (selectedMedia?.id === item.id) {
        setSelectedMedia(null);
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Row */}
      <div className="flex flex-wrap justify-center gap-3">
        {topRow.map((item, index) => (
          <div
            key={item.id}
            className="relative group cursor-pointer"
            onClick={() => setSelectedMedia(item)}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl border-2 border-white/50">
              {item.type === 'photo' ? (
                <img
                  src={item.url}
                  alt="Memory"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>

            {/* Remove Button */}
            {isAuthenticated && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600 shadow-lg"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="flex flex-wrap justify-center gap-3">
        {bottomRow.map((item, index) => (
          <div
            key={item.id}
            className="relative group cursor-pointer"
            onClick={() => setSelectedMedia(item)}
            style={{
              animationDelay: `${(index + maxItems.top) * 100}ms`,
            }}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl border-2 border-white/50">
              {item.type === 'photo' ? (
                <img
                  src={item.url}
                  alt="Memory"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>

            {/* Remove Button */}
            {isAuthenticated && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600 shadow-lg"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Media Viewer Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/90 border-none">
          {/* ✅ ACCESSIBILITY: DialogTitle for screen readers (hidden visually) */}
          <DialogTitle className="sr-only">
            {selectedMedia?.type === 'photo' ? 'Photo Viewer' : 'Video Viewer'}
          </DialogTitle>
          
          {selectedMedia && (
            <div className="relative">
              {selectedMedia.type === 'photo' ? (
                <img
                  src={selectedMedia.url}
                  alt="Memory"
                  className="w-full max-h-[80vh] object-contain"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  className="w-full max-h-[80vh]"
                />
              )}

              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => handleRemove(selectedMedia)}
                  className="absolute top-4 left-4 w-10 h-10 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
