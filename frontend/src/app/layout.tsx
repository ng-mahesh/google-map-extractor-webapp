import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ExtractionProvider } from "@/contexts/ExtractionContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Google Maps Data Extractor",
  description: "Extract business data from Google Maps with ease",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ExtractionProvider>
            {children}
            <Toaster position="top-right" />
          </ExtractionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
