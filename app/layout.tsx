import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./providers/SessionProvider";

export const metadata: Metadata = {
  title: "Postifly",
  description: "Postifly international shipping and parcel forwarding platform.",
};
console.log('s')
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
