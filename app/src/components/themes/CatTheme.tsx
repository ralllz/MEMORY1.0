import { useEffect, useState, useCallback, useRef } from 'react';

interface Cat {
  id: number;
  x: number;
  y: number;
  direction: 'left' | 'right';
  type: 'walking' | 'scratching' | 'sleeping';
  emoji: string;
}

const catEmojis = ['🐱', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

export function CatTheme() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [scratchingCats, setScratchingCats] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create synthetic meow sound using Web Audio API
    const createMeowSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      return () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      };
    };

    audioRef.current = { play: createMeowSound() } as any;

    const newCats: Cat[] = [];
    for (let i = 0; i < 8; i++) {
      newCats.push({
        id: i,
        x: Math.random() * 90 + 5,
        y: Math.random() * 70 + 15,
        direction: Math.random() > 0.5 ? 'left' : 'right',
        type: Math.random() > 0.7 ? 'scratching' : 'walking',
        emoji: catEmojis[Math.floor(Math.random() * catEmojis.length)],
      });
    }
    setCats(newCats);
  }, []);

  const handleCatClick = useCallback((catId: number) => {
    // Play meow sound
    if (audioRef.current) {
      audioRef.current.play();
    }

    // Add to scratching cats temporarily
    setScratchingCats(prev => [...prev, catId]);
    setTimeout(() => {
      setScratchingCats(prev => prev.filter(id => id !== catId));
    }, 1000);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Warm Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-200" />

      {/* Paw Prints */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(15)].map((_, i) => (
          <div
            key={`paw-${i}`}
            className="absolute animate-fade-paw"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" className="text-orange-400">
              <circle cx="12" cy="14" r="5" />
              <circle cx="6" cy="8" r="2.5" />
              <circle cx="12" cy="5" r="2.5" />
              <circle cx="18" cy="8" r="2.5" />
            </svg>
          </div>
        ))}
      </div>

      {/* Yarn Balls */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`yarn-${i}`}
          className="absolute animate-bounce-slow"
          style={{
            left: `${10 + i * 20}%`,
            bottom: '10%',
            animationDelay: `${i * 0.3}s`,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-500 shadow-lg">
            <div className="absolute inset-1 rounded-full border-2 border-white/30" />
          </div>
        </div>
      ))}

      {/* Walking Cats */}
      {cats.filter(c => c.type === 'walking').map((cat) => (
        <div
          key={cat.id}
          className={`absolute pointer-events-auto cursor-pointer transition-transform hover:scale-125 ${
            cat.direction === 'left' ? 'animate-cat-walk-left' : 'animate-cat-walk-right'
          }`}
          style={{
            left: `${cat.x}%`,
            top: `${cat.y}%`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
          onClick={() => handleCatClick(cat.id)}
        >
          <span className="text-4xl select-none filter drop-shadow-lg">
            {cat.emoji}
          </span>
          
          {/* Scratch Effect */}
          {scratchingCats.includes(cat.id) && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1 animate-scratch">
              <span className="text-red-400 text-xl">✕</span>
              <span className="text-red-400 text-xl">✕</span>
              <span className="text-red-400 text-xl">✕</span>
            </div>
          )}
        </div>
      ))}

      {/* Scratching Cats on Text Areas */}
      {cats.filter(c => c.type === 'scratching').map((cat) => (
        <div
          key={cat.id}
          className="absolute pointer-events-auto cursor-pointer"
          style={{
            left: `${cat.x}%`,
            top: `${cat.y}%`,
          }}
          onClick={() => handleCatClick(cat.id)}
        >
          <div className="relative">
            <span className="text-4xl select-none filter drop-shadow-lg animate-scratch-text">
              🐱
            </span>
            
            {/* Scratch Marks */}
            <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-1">
              <div className="w-0.5 h-6 bg-red-400/60 rounded-full transform -rotate-12" />
              <div className="w-0.5 h-8 bg-red-400/60 rounded-full" />
              <div className="w-0.5 h-6 bg-red-400/60 rounded-full transform rotate-12" />
            </div>

            {/* Scratch Effect on Click */}
            {scratchingCats.includes(cat.id) && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <span className="text-2xl animate-bounce">💥</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Floating Fish */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`fish-${i}`}
          className="absolute animate-float-fish"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.8}s`,
          }}
        >
          <span className="text-2xl">🐟</span>
        </div>
      ))}

      {/* Cat Food Bowl */}
      <div className="absolute bottom-8 left-8">
        <div className="w-16 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-b-full shadow-lg">
          <div className="absolute top-1 left-2 right-2 h-3 bg-amber-700 rounded-full" />
        </div>
      </div>

      {/* Sleeping Cat Zzz */}
      <div className="absolute bottom-12 right-12">
        <span className="text-5xl">😴</span>
        <div className="absolute -top-4 right-0 flex flex-col items-center animate-zzz">
          <span className="text-sm text-blue-400 font-bold">Z</span>
          <span className="text-xs text-blue-400 font-bold">z</span>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-orange-300 rounded-full animate-ping" />
      <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
    </div>
  );
}
