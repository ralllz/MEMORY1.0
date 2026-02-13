import { Heart, Waves, Flower2, Rocket, Cat, Sparkles } from 'lucide-react';
import type { ThemeType } from '@/types';

interface ThemeSelectorProps {
  currentTheme: ThemeType;
  onSelectTheme: (theme: ThemeType) => void;
}

interface ThemeOption {
  id: ThemeType;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const themes: ThemeOption[] = [
  {
    id: 'love',
    name: 'Love',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'love-sea',
    name: 'Love Sea',
    icon: <Waves className="w-5 h-5" />,
    color: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    icon: <Flower2 className="w-5 h-5" />,
    color: 'from-pink-300 to-purple-400',
  },
  {
    id: 'space',
    name: 'Space',
    icon: <Rocket className="w-5 h-5" />,
    color: 'from-indigo-400 to-purple-500',
  },
  {
    id: 'cat',
    name: 'Cat',
    icon: <Cat className="w-5 h-5" />,
    color: 'from-orange-400 to-yellow-500',
  },
  {
    id: 'original',
    name: 'Elegant',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-slate-400 to-purple-500',
  },
];

export function ThemeSelector({ currentTheme, onSelectTheme }: ThemeSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 p-4">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onSelectTheme(theme.id)}
          className={`relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
            currentTheme === theme.id
              ? `bg-gradient-to-r ${theme.color} text-white shadow-lg scale-105`
              : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
          }`}
        >
          {theme.icon}
          <span>{theme.name}</span>
          
          {currentTheme === theme.id && (
            <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
}
