export type ThemeType = 'love' | 'love-sea' | 'sakura' | 'space' | 'cat' | 'original';

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  year: number;
  createdAt: Date;
}

export interface PhotoboxItem {
  id: string;
  title: string;
  url: string;
  templateName: string;
  createdAt: Date;
}

export interface YearData {
  year: number;
  media: MediaItem[];
}

export interface User {
  phone: string;
  isLoggedIn: boolean;
}

export interface StorySection {
  title: string;
  content: string;
  year: number;
}
