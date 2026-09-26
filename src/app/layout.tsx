import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Notification Console",
  description: "Preview and send secure crypto transaction email notifications.",
  applicationName: "Crypto Notification Console",
  keywords: ["crypto", "email", "transaction notification", "Binance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
