import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppTheme } from './types';

type SkeletonStoreState = {
  theme: AppTheme;
};

type SkeletonStoreActions = {
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

type SkeletonStore = SkeletonStoreState & SkeletonStoreActions;

const useSkeletonStore = create(
  devtools(
    persist<SkeletonStore>(
      (set, get) => ({
        theme: AppTheme.light,
        setTheme: (theme) => set({ theme }),
        toggleTheme: () => set({ theme: get().theme === AppTheme.light ? AppTheme.dark : AppTheme.light })
      }),
      {
        name: 'skeleton'
      }
    )
  )
);

export default useSkeletonStore;