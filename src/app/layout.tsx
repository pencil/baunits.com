import type { Metadata, Viewport } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import ExternalLink from "@/components/ExternalLink";
import { Tab, TabBar } from "@/components/TabBar";

const font = Roboto_Flex({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Battle Aces Units",
  description: "A list of units in the game Battle Aces",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <div className="flex flex-col text-sm md:text-base mx-auto items-center max-w-screen-2xl">
          <nav className="flex items-center h-10 fixed p-2 text-center w-full max-w-full bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
            <TabBar>
              <Tab href="/">Units</Tab>
              <Tab href="/changelog">Changelog</Tab>
            </TabBar>
          </nav>
          <main className="min-h-visible-screen w-full mt-10">{children}</main>
          <footer className="p-2 text-sm text-slate-600 dark:text-slate-400 flex flex-col gap-y-4 w-full">
            <p>
              BAUnits.com is a fan-made website for the game Battle Aces by
              Uncapped Games. You can help improve this site by contributing on{" "}
              <ExternalLink href="https://github.com/pencil/baunits.com">
                GitHub
              </ExternalLink>
              .
            </p>
            <p>
              Server hosting provided by{" "}
              <ExternalLink href="https://www.smartinary.com">
                Smartinary
              </ExternalLink>
              .
            </p>
            <p>
              Battle Aces and Uncapped Games are trademarks in the EU and other
              Countries. This site is not affiliated with or endorsed by Battle
              Aces or Uncapped Games. Data and images sourced from the{" "}
              <ExternalLink href="https://www.playbattleaces.com/units">
                official Battle Aces website
              </ExternalLink>
              .
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
