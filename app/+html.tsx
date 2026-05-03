import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

// Wrapper of root HTML in web. Loads kawaii rounded display + body fonts,
// sets warm-cream system bg, and wires the PWA manifest.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#FFF9F2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rotina" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Fredoka:wght@500;600;700&display=swap"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: rootCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const rootCss = `
  html, body { background-color: #FFF9F2; }
  body {
    font-family: Quicksand, -apple-system, BlinkMacSystemFont, "Segoe UI Variable", system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #3D3633;
  }
  /* Decorative dotted pattern in the corner of the page */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image:
      radial-gradient(circle at 0% 0%, rgba(255, 203, 82, 0.08), transparent 280px),
      radial-gradient(circle at 100% 0%, rgba(168, 230, 207, 0.10), transparent 320px),
      radial-gradient(circle at 50% 100%, rgba(255, 177, 153, 0.08), transparent 380px);
    z-index: 0;
  }
  #root, #__next, [data-reactroot] { position: relative; z-index: 1; }
  ::selection { background: #FFE3D6; color: #3D3633; }
  @media (prefers-color-scheme: dark) { html, body { background-color: #FFF9F2; } }
`;
