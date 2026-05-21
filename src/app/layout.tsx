import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MultiPOS — Multi-Store Point of Sale System",
  description: "Multi-Store Point of Sale System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <div id="receipt-print-root" style={{ display: 'none' }}></div>
      </body>
    </html>
  );
}
