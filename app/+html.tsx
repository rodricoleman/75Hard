import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

// Wrapper of the root HTML in web. Adds PWA manifest + theme color.
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
        <meta name="theme-color" content="#0B0D10" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rotina" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: bg }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const bg = `
  body { background-color: #0B0D10; }
  @media (prefers-color-scheme: dark) {
    body { background-color: #0B0D10; }
  }
`;
