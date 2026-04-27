import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "@/app/assets/styles/globals.css";
import { Providers } from "./providers";

const JetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PM2 Monitor",
  description: "Multi-machine PM2 process monitoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={JetBrainsMono.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
