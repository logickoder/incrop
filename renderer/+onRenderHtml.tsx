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

  const url = pageContext.urlOriginal || `https://incrop.logickoder.dev${pageContext.urlPathname}`;
  const imageUrl = 'https://incrop.logickoder.dev/logo.svg';
  const siteName = 'InCrop';
  const keywords = 'image editing, inverse cropping, photo editor, crop tool, image manipulation, online editor, photo processing';
  const author = 'logickoder';
  const type = 'website';

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <!-- Basic SEO -->
        <title>${title}</title>
        <meta name="description" content="${desc}" />
        <meta name="keywords" content="${keywords}" />
        <meta name="author" content="${author}" />
        <link rel="canonical" href="${url}" />
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="${type}" />
        <meta property="og:url" content="${url}" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${desc}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:site_name" content="${siteName}" />
        <meta property="og:locale" content="en_US" />
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="${url}" />
        <meta property="twitter:title" content="${title}" />
        <meta property="twitter:description" content="${desc}" />
        <meta property="twitter:image" content="${imageUrl}" />
        
        <!-- PWA and Mobile -->
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="${siteName}" />
        
        <!-- Search Engine Verification -->
        <meta name="google-site-verification" content="fbTISIQMxVJpMKZ77NscIpp1iJ8R-4WI_2XaCZdrkXw" />
        
        <!-- Preconnect for performance -->
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        
        <!-- Favicons and Icons -->
        <link rel="icon" href="/favicon.ico" sizes="48x48">
        <link rel="icon" href="/logo.svg" sizes="any" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">
        
        <!-- PWA Manifest -->
        ${import.meta.env.PROD ? escapeInject`<link rel="manifest" href="/manifest.webmanifest">` : ''}
        
        <!-- Structured Data -->
        <script type="application/ld+json">
          ${dangerouslySkipEscape(JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': siteName,
      'description': desc,
      'url': url,
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'author': {
        '@type': 'Organization',
        'name': author
      }
    }
  ))}
        </script>
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