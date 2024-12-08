// https://vike.dev/usePageContext
export { PageContextProvider };

import React, { useContext } from 'react';
import type { PageContext } from 'vike/types';

const Context = React.createContext<PageContext>(undefined as unknown as PageContext);

function PageContextProvider({ pageContext, children }: { pageContext: PageContext; children: React.ReactNode }) {
  return <Context.Provider value={pageContext}>{children}</Context.Provider>;
}

/** https://vike.dev/usePageContext */
// eslint-disable-next-line react-refresh/only-export-components
export default function usePageContext() {
  return useContext(Context);
}
