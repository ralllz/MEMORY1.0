import { useState } from 'react';
import { Phone, Lock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (phone: string, password: string) => boolean;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = onLogin(phone, password);
      if (success) {
        setPhone('');
        setPassword('');
        onClose();
      } else {
        setError('Nomor HP atau password salah!');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
            Login Memory
            <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-pink-500" />
              Nomor HP
            </label>
            <Input
              type="tel"
              placeholder="Masukkan nomor HP"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-pink-500" />
              Password
            </label>
            <Input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? 'Memuat...' : 'Login'}
          </Button>

          <p className="text-xs text-center text-gray-500 mt-2">
            Hint: Nomor HP: 082339503532 atau 085339951848
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
