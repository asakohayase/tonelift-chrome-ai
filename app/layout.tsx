import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import React from "react"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ToneLift AI",
  description: "ToneLift AI is an innovative web application that leverages Chrome's built-in AI capabilities to transform your communications into more empathetic, effective messages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
