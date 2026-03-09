import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  geminiKey: string | null;
  setGeminiKey: (key: string | null) => void;
  coachingMode: boolean;
  setCoachingMode: (enabled: boolean) => void;
  brandName: string;
  setBrandName: (name: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  geminiKey: localStorage.getItem('geminiKey') || null,
  setGeminiKey: (key) => {
    if (key) {
      localStorage.setItem('geminiKey', key);
    } else {
      localStorage.removeItem('geminiKey');
    }
    set({ geminiKey: key });
  },
  coachingMode: localStorage.getItem('coachingMode') === 'true',
  setCoachingMode: (enabled) => {
    localStorage.setItem('coachingMode', String(enabled));
    set({ coachingMode: enabled });
  },
  brandName: localStorage.getItem('brandName') || 'ParikshAI',
  setBrandName: (name) => {
    localStorage.setItem('brandName', name);
    set({ brandName: name });
  },
}));
