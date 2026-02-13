import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import type { MediaItem } from '@/types';

interface Planet {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  name: string;
  orbitRadius: number;
  orbitDuration: number;
  mediaIndex: number;
}

interface SpaceThemeProps {
  media: MediaItem[];
}

export function SpaceTheme({ media }: SpaceThemeProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);

  const planets: Planet[] = [
    { id: 1, x: 50, y: 50, size: 80, color: 'from-orange-400 to-red-500', name: 'Mars', orbitRadius: 0, orbitDuration: 0, mediaIndex: 0 },
    { id: 2, x: 20, y: 30, size: 60, color: 'from-blue-400 to-cyan-500', name: 'Neptune', orbitRadius: 150, orbitDuration: 20, mediaIndex: 1 },
    { id: 3, x: 80, y: 70, size: 70, color: 'from-yellow-400 to-orange-500', name: 'Jupiter', orbitRadius: 200, orbitDuration: 25, mediaIndex: 2 },
    { id: 4, x: 30, y: 80, size: 50, color: 'from-purple-400 to-pink-500', name: 'Venus', orbitRadius: 120, orbitDuration: 15, mediaIndex: 3 },
    { id: 5, x: 70, y: 20, size: 55, color: 'from-green-400 to-teal-500', name: 'Uranus', orbitRadius: 180, orbitDuration: 22, mediaIndex: 4 },
  ];

  const handlePlanetClick = useCallback((planet: Planet) => {
    setSelectedPlanet(planet);
  }, []);

  const selectedMedia = selectedPlanet ? media[selectedPlanet.mediaIndex] : null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Space Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black" />

      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Galaxy/Nebula Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Shooting Stars */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`shooting-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star"
          style={{
            top: `${10 + i * 20}%`,
            left: '-10%',
            animationDelay: `${i * 4}s`,
          }}
        >
          <div className="absolute inset-0 w-20 h-px bg-gradient-to-r from-white to-transparent -rotate-45 origin-left" />
        </div>
      ))}

      {/* Planets */}
      {planets.map((planet) => (
        <div
          key={planet.id}
          className="absolute pointer-events-auto cursor-pointer"
          style={{
            left: `${planet.x}%`,
            top: `${planet.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => handlePlanetClick(planet)}
        >
          {/* Orbit Ring */}
          {planet.orbitRadius > 0 && (
            <div
              className="absolute border border-white/10 rounded-full animate-orbit"
              style={{
                width: planet.orbitRadius * 2,
                height: planet.orbitRadius * 2,
                left: -planet.orbitRadius + planet.size / 2,
                top: -planet.orbitRadius + planet.size / 2,
                animationDuration: `${planet.orbitDuration}s`,
              }}
            />
          )}

          {/* Planet */}
          <div
            className={`relative rounded-full bg-gradient-to-br ${planet.color} shadow-2xl transition-transform duration-300 hover:scale-110`}
            style={{
              width: planet.size,
              height: planet.size,
              boxShadow: `0 0 30px rgba(255,255,255,0.3), inset -10px -10px 20px rgba(0,0,0,0.3)`,
            }}
          >
            {/* Planet Surface Detail */}
            <div className="absolute inset-2 rounded-full bg-white/10" />
            <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 rounded-full bg-white/20" />
            
            {/* Planet Name */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white text-xs font-medium whitespace-nowrap opacity-70">
              {planet.name}
            </div>
          </div>
        </div>
      ))}

      {/* Planet Media Modal */}
      {selectedPlanet && selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
          <div className="relative max-w-2xl w-full mx-4">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPlanet(null)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Media Content */}
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              {selectedMedia.type === 'photo' ? (
                <img
                  src={selectedMedia.url}
                  alt="Memory"
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  className="w-full max-h-[70vh]"
                />
              )}
            </div>

            {/* Planet Info */}
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold text-white">Memory from {selectedPlanet.name}</h3>
              <p className="text-white/70">Year {selectedMedia.year}</p>
            </div>
          </div>
        </div>
      )}

      {/* Moon */}
      <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 shadow-lg">
        <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-gray-300/50" />
        <div className="absolute bottom-6 right-6 w-6 h-6 rounded-full bg-gray-300/50" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-gray-300/50" />
      </div>
    </div>
  );
}
