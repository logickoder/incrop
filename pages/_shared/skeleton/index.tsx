import { ReactNode, useEffect } from 'react';
import { Info, Moon, Sun } from 'lucide-react';
import useSkeletonStore from './store';
import { AppTheme } from './types';
import Link from '../Link';
import Github from '../../../assets/github.svg';
import Twitter from '../../../assets/x.svg';
import { ReactSVG } from 'react-svg';

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
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary">InCrop</h1>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle"
              aria-label="Toggle Theme"
            >
              {theme == AppTheme.dark ? <Sun className={iconClass} /> : <Moon className={iconClass} />}
            </button>

            <Link href="/about" className="btn btn-ghost btn-circle">
              <Info className={iconClass} />
            </Link>

            <Link
              href="https://twitter.com/logickoder"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-circle"
              aria-label="logickoder's Twitter"
            >
              <ReactSVG src={Twitter} className={iconClass} wrapper="span" />
            </Link>

            <Link
              href="https://github.com/logickoder/incrop"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-circle"
              aria-label="GitHub Repository"
            >
              <ReactSVG src={Github} className={iconClass} wrapper="span" />
            </Link>
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
          <span>© 2024 <Link href="https://github.com/logickoder" target="_blank">Jeffery Orazulike (logickoder)</Link>. All Rights Reserved.</span>
          <div className="flex space-x-2">
            <span className="text-xs bg-primary/10 px-2 py-1 rounded">Inverse Crop Innovator</span>
            <span className="text-xs bg-accent/10 px-2 py-1 rounded">Image Processing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}