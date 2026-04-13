import type { Metadata } from "next";
import MuiProvider from "@/components/MuiProvider";

export const metadata: Metadata = {
  title: "SecureShare — Secure File Sharing",
  description:
    "Upload and share files securely with expiring, nonce-protected links. Built for developers who care about security.",
  keywords: ["secure file sharing", "encrypted links", "one-time download"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <MuiProvider>{children}</MuiProvider>
      </body>
    </html>
  );
}
