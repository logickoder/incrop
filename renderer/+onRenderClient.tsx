// https://vike.dev/onRenderClient
import Layout from './Layout';

import ReactDOM from 'react-dom/client';
import type { OnRenderClientAsync } from 'vike/types';
import getPageTitle from './getPageTitle';
import registerPwa from '../utils/registerPwa';
import registerFirebase from '../utils/registerFirebase';

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
    await registerPwa();
    registerFirebase();
    root = ReactDOM.createRoot(container);
  }
  root.render(page);
  document.title = getPageTitle(pageContext);
};

export default onRenderClient;