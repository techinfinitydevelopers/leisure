import type { Metadata } from "next";
import { Cormorant, Pinyon_Script } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";

// SF Pro Display — headings / UI (Apple-modern)
const sfpro = localFont({
  variable: "--font-sf",
  display: "swap",
  src: [
    { path: "./fonts/SF-Pro-Display-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/SF-Pro-Display-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/SF-Pro-Display-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/SF-Pro-Display-Semibold.otf", weight: "600", style: "normal" },
    { path: "./fonts/SF-Pro-Display-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/SF-Pro-Display-Black.otf", weight: "900", style: "normal" },
  ],
});

// Roboto — body (variable weight 100–900)
const roboto = localFont({
  variable: "--font-roboto",
  display: "swap",
  src: "./fonts/Roboto-Variable.ttf",
  weight: "100 900",
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Leisure — Sound Your Wild",
  description:
    "A premium wireless speaker engineered for powerful sound, modern design, and immersive everyday listening. Feel every beat. See every detail.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${sfpro.variable} ${cormorant.variable} ${pinyon.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Preloader />
          <Nav />
          <CartDrawer />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
