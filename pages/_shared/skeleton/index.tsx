import { ReactNode, useEffect } from 'react';
import { Info, Moon, Sun } from 'lucide-react';
import useSkeletonStore from './store';
import { AppTheme } from './types';
import Link from '../Link';

export default function Skeleton({ children }: { children: ReactNode }) {
  const iconClass = 'w-5 h-5 text-base-content';

  const theme = useSkeletonStore((state) => state.theme);

  const toggleTheme = () => {
    useSkeletonStore.getState().toggleTheme();
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={`flex flex-col min-h-screen ${theme}`}>
      <header className="sticky top-0 z-50 bg-base-100 shadow-sm">
        <div className="navbar container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary">InCrop</h1>
            </Link>
            <span
              className="tooltip tooltip-bottom"
              data-tip="Remove center, join edges - Inverse image cropping"
            >
              <Info className={iconClass} />
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle"
              aria-label="Toggle Theme"
            >
              {theme == AppTheme.dark ? <Sun className={iconClass} /> : <Moon className={iconClass} />}
            </button>

            {/*<a*/}
            {/*  href="https://github.com/yourusername/incrop"*/}
            {/*  target="_blank"*/}
            {/*  rel="noopener noreferrer"*/}
            {/*  className="btn btn-ghost btn-circle"*/}
            {/*  aria-label="GitHub Repository"*/}
            {/*>*/}
            {/*  <GitHub className="w-5 h-5" />*/}
            {/*</a>*/}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-200 text-base-content">
        <div className="flex flex-col sm:flex-row items-center space-x-4">
          <span>© 2024 <Link href="https://github.com/logickoder" target="_blank">Jeffery Orazulike</Link>. All Rights Reserved.</span>
          <div className="flex space-x-2">
            <span className="text-xs bg-primary/10 px-2 py-1 rounded">Inverse Crop Innovator</span>
            <span className="text-xs bg-accent/10 px-2 py-1 rounded">Image Processing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}