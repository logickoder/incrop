// https://vike.dev/onRenderHtml

import ReactDOMServer from 'react-dom/server';
import { dangerouslySkipEscape, escapeInject } from 'vike/server';
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
  const desc = pageContext.data?.description ?? pageContext.config.description ?? 'Redefine your images, your way! InCrop is the ultimate tool for inverse cropping, letting you seamlessly remove the center of your photos and bring edges together for a unique, standout effect. Crop smarter, not harder!';

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        ${import.meta.env.PROD ? escapeInject`<link rel="manifest" href="/manifest.webmanifest">` : ''}
        <link rel="icon" href="/favicon.ico" sizes="48x48">
        <link rel="icon" href="/logo.svg" sizes="any" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">
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