import { useEffect, useState } from 'react';

interface SakuraPetal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  swayAmount: number;
}

interface SakuraTree {
  id: number;
  x: number;
  scale: number;
}

export function SakuraTheme() {
  const [petals, setPetals] = useState<SakuraPetal[]>([]);
  const [trees, setTrees] = useState<SakuraTree[]>([]);

  useEffect(() => {
    // Generate falling petals
    const newPetals: SakuraPetal[] = [];
    for (let i = 0; i < 50; i++) {
      newPetals.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 8,
        size: 10 + Math.random() * 15,
        swayAmount: 30 + Math.random() * 50,
      });
    }
    setPetals(newPetals);

    // Generate sakura trees
    const newTrees: SakuraTree[] = [
      { id: 1, x: 5, scale: 0.8 },
      { id: 2, x: 85, scale: 1 },
      { id: 3, x: 50, scale: 0.6 },
    ];
    setTrees(newTrees);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft Pink Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-100 via-pink-50 to-white" />

      {/* Wind Effect */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(5)].map((_, i) => (
          <div
            key={`wind-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent animate-wind"
            style={{
              top: `${20 + i * 15}%`,
              left: '-100%',
              width: '100%',
              animationDelay: `${i * 2}s`,
              animationDuration: '4s',
            }}
          />
        ))}
      </div>

      {/* Sakura Trees */}
      {trees.map((tree) => (
        <div
          key={tree.id}
          className="absolute bottom-0 animate-tree-sway"
          style={{
            left: `${tree.x}%`,
            transform: `scale(${tree.scale})`,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Tree Trunk */}
          <div className="relative">
            <div className="w-8 h-32 bg-gradient-to-t from-amber-800 to-amber-600 rounded-full mx-auto" />
            {/* Tree Branches with Flowers */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <div className="relative w-48 h-48">
                {/* Main crown */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-pink-400 to-purple-400 rounded-full opacity-80 blur-sm" />
                {/* Flower clusters */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-8 h-8 bg-pink-300 rounded-full animate-flower-glow"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Falling Petals */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-fall-sway"
          style={{
            left: `${petal.x}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            '--sway-amount': `${petal.swayAmount}px`,
          } as React.CSSProperties}
        >
          <svg
            width={petal.size}
            height={petal.size}
            viewBox="0 0 20 20"
            className="text-pink-300"
          >
            <path
              d="M10 0C10 0 12 5 12 10C12 15 10 20 10 20C10 20 8 15 8 10C8 5 10 0 10 0Z"
              fill="currentColor"
              opacity="0.8"
            />
            <path
              d="M0 10C0 10 5 8 10 8C15 8 20 10 20 10C20 10 15 12 10 12C5 12 0 10 0 10Z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>
      ))}

      {/* Stuck Petals on Elements */}
      <div className="absolute top-1/4 left-1/4 animate-petal-stuck">
        <svg width="15" height="15" viewBox="0 0 20 20" className="text-pink-400">
          <path d="M10 0C10 0 12 5 12 10C12 15 10 20 10 20C10 20 8 15 8 10C8 5 10 0 10 0Z" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute top-1/3 right-1/3 animate-petal-stuck" style={{ animationDelay: '1s' }}>
        <svg width="12" height="12" viewBox="0 0 20 20" className="text-pink-300">
          <path d="M10 0C10 0 12 5 12 10C12 15 10 20 10 20C10 20 8 15 8 10C8 5 10 0 10 0Z" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute bottom-1/4 left-1/3 animate-petal-stuck" style={{ animationDelay: '2s' }}>
        <svg width="18" height="18" viewBox="0 0 20 20" className="text-pink-400">
          <path d="M10 0C10 0 12 5 12 10C12 15 10 20 10 20C10 20 8 15 8 10C8 5 10 0 10 0Z" fill="currentColor" />
        </svg>
      </div>

      {/* Soft Glow Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-pink-200/20 via-transparent to-transparent" />
    </div>
  );
}
