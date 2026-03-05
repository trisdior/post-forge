import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Valencia Construction — Mission Control",
  description: "Lead tracking and operations dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', (e) => {
                if (e.message && e.message.includes('MetaMask')) {
                  e.preventDefault();
                }
              });
              window.addEventListener('unhandledrejection', (e) => {
                if (e.reason && e.reason.toString && e.reason.toString().includes('MetaMask')) {
                  e.preventDefault();
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
