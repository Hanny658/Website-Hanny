import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from '../components/navbar'
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Footer from "src/components/footer";
import { ErrorBoundary } from "./error-bundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hanny",
  description: "Hanny's personal website using next.ts",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ErrorBoundary>
              <Navbar />
              {children}
              <Footer />
          </ErrorBoundary>
        </body>
      </html>
  );
}
