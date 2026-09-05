import type { Metadata } from "next";
import { Ultra, Poppins } from "next/font/google";
import "./globals.css";

const ultra = Ultra({ subsets: ["latin"], weight: "400", variable: "--font-ultra" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Murder Party — 100% personnalisable",
  description: "Choisissez votre Murder. Choisissez comment vous voulez la vivre. On s'occupe du reste.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${ultra.variable} ${poppins.variable}`}>
      <body className="grain min-h-screen bg-noir text-white antialiased">
        {children}
      </body>
    </html>
  );
}
