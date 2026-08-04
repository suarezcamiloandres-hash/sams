import { Montserrat, Alex_Brush } from "next/font/google";

import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";

import "./app.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoButton from "@/components/VideoButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import AnnouncementBar from "@/components/AnnouncementBar";
import CartButton from "@/components/CartButton";
import WelcomePopup from "@/components/WelcomePopup";
import { CartProvider } from "@/lib/cart-context";

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
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main>{children}</main>
          <Footer />
          <VideoButton />
          <WhatsAppButton />
          <CartButton />
          <WelcomePopup />
        </CartProvider>
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}
