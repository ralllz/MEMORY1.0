import { useState, useCallback } from 'react';
import { Heart, LogOut, Lock, Unlock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/LoginModal';
import { YearSlider } from '@/components/YearSlider';
import { Gallery } from '@/components/Gallery';
import { StorySection } from '@/components/StorySection';
import { ThemeSelector } from '@/components/ThemeSelector';
import { LoveTheme, LoveSeaTheme, SakuraTheme, SpaceTheme, CatTheme, OriginalTheme } from '@/components/themes';
import { useAuth } from '@/hooks/useAuth';
import { useMediaStorage } from '@/hooks/useMediaStorage';
import type { ThemeType } from '@/types';
import './App.css';

function App() {
  const { user, login, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addMedia, removeMedia, getMediaByYear, getAllMedia, years, isLoading: mediaLoading } = useMediaStorage();
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2021);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('love');

  const handleLogin = useCallback((phone: string, password: string): boolean => {
    return login(phone, password);
  }, [login]);

  const handleAddMedia = useCallback((year: number, file: File) => {
    addMedia(year, file);
  }, [addMedia]);

  const handleRemoveMedia = useCallback((year: number, mediaId: string) => {
    removeMedia(year, mediaId);
  }, [removeMedia]);

  const renderTheme = () => {
    switch (currentTheme) {
      case 'love':
        return <LoveTheme />;
      case 'love-sea':
        return <LoveSeaTheme />;
      case 'sakura':
        return <SakuraTheme />;
      case 'space':
        return <SpaceTheme media={getAllMedia()} />;
      case 'cat':
        return <CatTheme />;
      case 'original':
        return <OriginalTheme />;
      default:
        return <LoveTheme />;
    }
  };

  if (authLoading || mediaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-500 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Memuat memory...</p>
        </div>
      </div>
    );
  }

  const allMedia = getAllMedia();
  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Theme Background */}
      {renderTheme()}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/30 border-b border-white/20">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
              <span className="font-bold text-gray-800">Memory</span>
            </div>

            {/* Auth Status */}
            <div className="flex items-center gap-3">
              {authenticated ? (
                <>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Unlock className="w-4 h-4 text-green-500" />
                    {user?.phone.slice(-4)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-gray-600 hover:text-pink-500 hover:bg-pink-50"
                >
                  <Lock className="w-4 h-4 mr-1" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Theme Selector */}
        <div className="sticky top-16 z-40 backdrop-blur-sm">
          <ThemeSelector
            currentTheme={currentTheme}
            onSelectTheme={setCurrentTheme}
          />
        </div>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4 animate-pulse-slow">
              MEMORY
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-medium flex items-center justify-center gap-3">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              NAK PUNGUT & NAK SOA
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-500">
                {authenticated 
                  ? 'Kamu bisa menambah dan menghapus foto/video' 
                  : 'Login untuk menambah foto/video'}
              </span>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
          </div>

          {/* Year Slider */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Pilih Tahun
              <Sparkles className="w-5 h-5 text-purple-500" />
            </h2>
            <YearSlider
              years={years}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              onAddMedia={handleAddMedia}
              onRemoveMedia={handleRemoveMedia}
              getMediaByYear={getMediaByYear}
              isAuthenticated={authenticated}
              onLoginClick={() => setIsLoginModalOpen(true)}
            />
          </div>

          {/* Selected Year Gallery */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Kenangan Tahun {selectedYear}
            </h2>
            {getMediaByYear(selectedYear).length > 0 ? (
              <Gallery
                media={getMediaByYear(selectedYear)}
                isAuthenticated={authenticated}
                onRemoveMedia={handleRemoveMedia}
                maxItems={{ top: 5, bottom: 6 }}
              />
            ) : (
              <div className="text-center py-12 bg-white/50 rounded-2xl backdrop-blur-sm">
                <Heart className="w-12 h-12 text-pink-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada kenangan di tahun ini</p>
                {authenticated && (
                  <p className="text-sm text-gray-400 mt-2">
                    Tekan tombol + di slider tahun untuk menambah foto/video
                  </p>
                )}
              </div>
            )}
          </div>

          {/* All Memories Gallery */}
          {allMedia.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                Semua Kenangan
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              </h2>
              <Gallery
                media={allMedia}
                isAuthenticated={authenticated}
                onRemoveMedia={handleRemoveMedia}
                maxItems={{ top: 5, bottom: 6 }}
              />
            </div>
          )}

          {/* Story Section */}
          <StorySection theme={currentTheme} />
        </main>

        {/* Footer */}
        <footer className="py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span>Made with love for Nak Pungut & Nak Soa</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          </div>
          <p className="text-sm text-gray-400 mt-2">2021 - 2026</p>
        </footer>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

export default App;
