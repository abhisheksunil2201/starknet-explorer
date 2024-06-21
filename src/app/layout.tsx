import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata = {
  title: "Starknet Explorer",
  description: "Blockchain Explorer to explore Starknet",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="min-h-screen bg-[#121212] text-white">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
