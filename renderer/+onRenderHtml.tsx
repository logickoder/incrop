// https://vike.dev/onRenderHtml

import ReactDOMServer from 'react-dom/server';
import { dangerouslySkipEscape, escapeInject } from 'vike/server';
import logoUrl from './logo.svg';
import type { OnRenderHtmlAsync } from 'vike/types';
import Layout from './Layout';
import getPageTitle from './getPageTitle';

const onRenderHtml: OnRenderHtmlAsync = async (pageContext): ReturnType<OnRenderHtmlAsync> => {
  const { Page } = pageContext;

  // This onRenderHtml() hook only supports SSR, see https://vike.dev/render-modes for how to modify
  // onRenderHtml() to support SPA

  const pageHtml = Page ?
    // Alternatively, we can use an HTML stream, see https://vike.dev/streaming
    ReactDOMServer.renderToString(
      <Layout pageContext={pageContext}>
        <Page />
      </Layout>
    ) : '';

  const title = getPageTitle(pageContext);
  const desc = pageContext.data?.description || pageContext.config.description || 'Demo of using Vike';

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${logoUrl}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
      </head>
      <body>
        <div id="react-root">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      // We can add custom pageContext properties here, see https://vike.dev/pageContext#custom
    }
  };
};

export default onRenderHtml;