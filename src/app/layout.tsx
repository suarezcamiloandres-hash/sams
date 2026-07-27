import { Montserrat, Alex_Brush } from "next/font/google";

import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";

import "./app.css";
import Header from "@/components/Header";
import ViewCanvas from "@/components/ViewCanvas";
import Footer from "@/components/Footer";
import VideoButton from "@/components/VideoButton";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-alex-brush",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${alexBrush.variable}`}>
      <body className="overflow-x-hidden bg-crema">
        <Header />
        <main>
          {children}
          <ViewCanvas />
        </main>
        <Footer />
        <VideoButton />
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}
