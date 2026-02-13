import { useEffect, useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'glow' | 'heart' | 'sparkle';
}

export function OriginalTheme() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    
    // Generate floating particles
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 6,
        duration: 10 + Math.random() * 15,
        delay: Math.random() * 5,
        type: ['glow', 'heart', 'sparkle'][Math.floor(Math.random() * 3)] as Particle['type'],
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Elegant Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Geometric Shapes */}
      <div className="absolute inset-0">
        {/* Floating Hexagons */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`hex-${i}`}
            className="absolute animate-float-hex"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <svg
              width="40"
              height="46"
              viewBox="0 0 40 46"
              className="text-white/5"
            >
              <path
                d="M20 0L40 11.5V34.5L20 46L0 34.5V11.5L20 0Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          </div>
        ))}

        {/* Floating Circles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute rounded-full border border-white/10 animate-float-circle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${30 + Math.random() * 50}px`,
              height: `${30 + Math.random() * 50}px`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-float-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          {particle.type === 'glow' && (
            <div
              className="rounded-full bg-white/30 blur-sm"
              style={{
                width: particle.size,
                height: particle.size,
              }}
            />
          )}
          {particle.type === 'heart' && (
            <Heart
              className="text-pink-400/30"
              style={{
                width: particle.size * 3,
                height: particle.size * 3,
              }}
              fill="currentColor"
            />
          )}
          {particle.type === 'sparkle' && (
            <Sparkles
              className="text-yellow-300/40"
              style={{
                width: particle.size * 2,
                height: particle.size * 2,
              }}
            />
          )}
        </div>
      ))}

      {/* Light Rays */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={`ray-${i}`}
            className="absolute top-0 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent animate-ray"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Futuristic Lines */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
              <stop offset="50%" stopColor="rgba(168, 85, 247, 0.3)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
            </linearGradient>
          </defs>
          {[...Array(5)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={20 + i * 20}
              x2="100%"
              y2={20 + i * 20}
              stroke="url(#lineGrad)"
              strokeWidth="1"
              className="animate-pulse-line"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Central Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-radial from-purple-500/10 via-transparent to-transparent animate-pulse-slow" />
      </div>
    </div>
  );
}
