import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo/client";
import { SiteHeader } from "@/components/site-header";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multiverse Explorer",
  description:
    "Browse Rick and Morty characters and locations across the multiverse.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <ApolloWrapper>
          <SiteHeader />
          {children}
        </ApolloWrapper>
      </body>
    </html>
  );
}
