
import type { Metadata } from 'next';
import { ThemeProvider } from '@/_src/context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Modern Brand Theme App',
  description: 'Next.js App with Tailwind CSS Theme',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <ToastContainer position="top-right" autoClose={2500} theme="colored" />
        </ThemeProvider>
      </body>
    </html>
  );
}

