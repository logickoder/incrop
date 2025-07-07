import { ReactNode, StrictMode } from 'react';
import { PageContextProvider } from './usePageContext';
import type { PageContext } from 'vike/types';
import './css/main.scss';
import { ToastContainer } from 'react-toastify';
import Skeleton from '../pages/_shared/skeleton';

export default function Layout({ children, pageContext }: { children: ReactNode; pageContext: PageContext }) {
  return (
    <StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <Skeleton>{children}</Skeleton>
        <ToastContainer
          autoClose={1000}
        />
      </PageContextProvider>
    </StrictMode>
  );
}