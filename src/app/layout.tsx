import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import '@/styles/global.scss'

const rubik = Rubik({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rubik',
});

export const metadata: Metadata = {
  title: "M-AGENT",
  description: "m-agent prototpye build",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={rubik.className}>
      <body>
        {children}
      </body>
    </html>
  );
}