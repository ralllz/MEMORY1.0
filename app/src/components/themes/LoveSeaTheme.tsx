import { useEffect, useState, useCallback } from 'react';
import { Heart } from 'lucide-react';

interface SeaCreature {
  id: number;
  x: number;
  y: number;
  type: 'jellyfish' | 'nemo' | 'dolphin' | 'starfish' | 'seahorse';
  direction: 'left' | 'right';
  speed: number;
  size: number;
  showBubble: boolean;
}

const creatureEmojis: Record<string, string> = {
  jellyfish: '🪼',
  nemo: '🐠',
  dolphin: '🐬',
  starfish: '🌟',
  seahorse: '🦄',
};

export function LoveSeaTheme() {
  const [creatures, setCreatures] = useState<SeaCreature[]>([]);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const newCreatures: SeaCreature[] = [];
    const types: SeaCreature['type'][] = ['jellyfish', 'nemo', 'dolphin', 'starfish', 'seahorse'];

    for (let i = 0; i < 12; i++) {
      newCreatures.push({
        id: i,
        x: Math.random() * 90 + 5,
        y: Math.random() * 80 + 10,
        type: types[Math.floor(Math.random() * types.length)],
        direction: Math.random() > 0.5 ? 'left' : 'right',
        speed: 10 + Math.random() * 20,
        size: 30 + Math.random() * 20,
        showBubble: false,
      });
    }

    setCreatures(newCreatures);
  }, []);

  const handleCreatureClick = useCallback((creatureId: number, x: number, y: number) => {
    setCreatures(prev =>
      prev.map(c => (c.id === creatureId ? { ...c, showBubble: true } : c))
    );

    const bubbleId = Date.now();
    setBubbles(prev => [...prev, { id: bubbleId, x, y }]);

    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== bubbleId));
      setCreatures(prev =>
        prev.map(c => (c.id === creatureId ? { ...c, showBubble: false } : c))
      );
    }, 2000);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Ocean Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-200 via-blue-300 to-blue-500" />

      {/* Wave Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <svg
          className="absolute bottom-0 w-full h-full animate-wave"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(255,255,255,0.3)"
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
          />
        </svg>
        <svg
          className="absolute bottom-0 w-full h-full animate-wave-slow"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(255,255,255,0.2)"
            d="M0,40 C360,100 720,20 1080,80 C1260,100 1380,60 1440,40 L1440,120 L0,120 Z"
          />
        </svg>
      </div>

      {/* Sea Creatures */}
      {creatures.map((creature) => (
        <div
          key={creature.id}
          className={`absolute cursor-pointer pointer-events-auto transition-transform hover:scale-125 ${
            creature.direction === 'left' ? 'animate-swim-left' : 'animate-swim-right'
          }`}
          style={{
            left: `${creature.x}%`,
            top: `${creature.y}%`,
            animationDuration: `${creature.speed}s`,
            fontSize: creature.size,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleCreatureClick(creature.id, creature.x, creature.y);
          }}
        >
          <span className="select-none filter drop-shadow-lg">
            {creatureEmojis[creature.type]}
          </span>

          {/* Love Bubble */}
          {creature.showBubble && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bubble-pop">
              <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            </div>
          )}
        </div>
      ))}

      {/* Floating Bubbles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`bubble-${i}`}
          className="absolute rounded-full bg-white/30 animate-bubble-float"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: '-20px',
            width: `${10 + Math.random() * 20}px`,
            height: `${10 + Math.random() * 20}px`,
            animationDuration: `${8 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      {/* Click Bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute pointer-events-none"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <Heart
              key={i}
              className="absolute w-4 h-4 text-pink-500 fill-pink-500 animate-love-bubble"
              style={{
                animationDelay: `${i * 0.1}s`,
                transform: `rotate(${i * 72}deg) translateY(-20px)`,
              }}
            />
          ))}
        </div>
      ))}

      {/* Seaweed */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`seaweed-${i}`}
            className="w-4 h-24 bg-gradient-to-t from-green-600 to-green-400 rounded-full origin-bottom animate-sway"
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    </div>
  );
}
