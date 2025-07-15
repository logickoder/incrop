import { ReactNode, StrictMode } from 'react';
import { PageContextProvider } from './usePageContext';
import type { PageContext } from 'vike/types';
import './css/main.scss';
import { ToastContainer, ToastProvider } from './toast';
import Skeleton from '../pages/_shared/skeleton';

export default function Layout({ children, pageContext }: { children: ReactNode; pageContext: PageContext }) {
  return (
    <StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <ToastProvider>
          <Skeleton>{children}</Skeleton>
          <ToastContainer />
        </ToastProvider>
      </PageContextProvider>
    </StrictMode>
  );
}