import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'AniFlux — Free Anime Streaming Platform',
  description:
    'AniFlux is a free, open-source anime streaming platform featuring thousands of anime titles in HD. No subscription. No paywalls. Pure anime bliss.',
  keywords: 'anime, streaming, free anime, AniFlux, watch anime online, otaku',
  openGraph: {
    title: 'AniFlux — Free Anime Streaming',
    description: 'The ultimate free, open-source anime streaming experience.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="scan-line-overlay">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
