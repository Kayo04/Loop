import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider" // <--- Importa isto

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loop - Finance & Habits",
  description: "Controla a tua vida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning> 
      <body className={inter.className}>
        {/* Envolvemos tudo no Provider */}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}