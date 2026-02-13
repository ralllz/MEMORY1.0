import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'heart' | 'plane';
}

export function LoveTheme() {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    const newElements: FloatingElement[] = [];
    
    // Generate floating hearts
    for (let i = 0; i < 15; i++) {
      newElements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 15 + Math.random() * 25,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 5,
        type: 'heart',
      });
    }

    // Generate paper planes
    for (let i = 15; i < 20; i++) {
      newElements.push({
        id: i,
        x: -10,
        y: Math.random() * 80,
        size: 30,
        duration: 15 + Math.random() * 10,
        delay: Math.random() * 8,
        type: 'plane',
      });
    }

    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300" />

      {/* Floating Hearts */}
      {elements.filter(e => e.type === 'heart').map((element) => (
        <div
          key={element.id}
          className="absolute animate-float-heart"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDuration: `${element.duration}s`,
            animationDelay: `${element.delay}s`,
          }}
        >
          <Heart
            className="text-pink-400/40"
            style={{
              width: element.size,
              height: element.size,
            }}
            fill="currentColor"
          />
        </div>
      ))}

      {/* Paper Planes */}
      {elements.filter(e => e.type === 'plane').map((element) => (
        <div
          key={element.id}
          className="absolute animate-paper-plane"
          style={{
            top: `${element.y}%`,
            animationDuration: `${element.duration}s`,
            animationDelay: `${element.delay}s`,
          }}
        >
          <svg
            width={element.size}
            height={element.size}
            viewBox="0 0 24 24"
            fill="none"
            className="text-rose-400/50"
          >
            <path
              d="M2 12L22 2L15 22L11 13L2 12Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}

      {/* Sparkle Effects */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
