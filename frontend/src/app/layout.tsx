import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Data Insights",
  description: "Upload data, auto-detect metrics, and get insights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
      </body>
    </html>
  );
}
