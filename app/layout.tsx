import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import AuthProvider from "@/components/auth/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Toast from "@/components/ui/Toast";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col font-sans">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toast />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
