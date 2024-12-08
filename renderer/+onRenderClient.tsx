// https://vike.dev/onRenderClient
import Layout from './Layout';

import ReactDOM from 'react-dom/client';
import type { OnRenderClientAsync } from 'vike/types';
import getPageTitle from './getPageTitle';

let root: ReactDOM.Root;
const onRenderClient: OnRenderClientAsync = async (pageContext): ReturnType<OnRenderClientAsync> => {
  const { Page } = pageContext;

  const container = document.getElementById('react-root');
  if (!container) throw new Error('DOM element #react-root not found');

  const page = (
    <Layout pageContext={pageContext}>
      {Page ? <Page /> : null}
    </Layout>
  );

  if (!root) {
    root = ReactDOM.createRoot(container);
  }
  root.render(page);
  document.title = getPageTitle(pageContext);
};

export default onRenderClient;