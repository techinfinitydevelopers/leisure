import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { AudioProvider } from "@/context/AudioContext";
import FloatingSoundToggle from "@/components/FloatingSoundToggle";

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

// Albra Trial Grotesk — replaces Pinyon Script (removed) as the accent/tagline
// font. Kept on the `--font-pinyon` variable name so all existing
// `font-pinyon` usages (taglines, "Leisure" wordmark, etc.) pick it up with no
// per-file changes.
const pinyon = localFont({
  variable: "--font-pinyon",
  display: "swap",
  src: [
    { path: "./fonts/albra/Albra-Trial-Grotesk-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/albra/Albra-Trial-Grotesk-Light-Italic.otf", weight: "300", style: "italic" },
    { path: "./fonts/albra/Albra-Trial-Grotesk-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/albra/Albra-Trial-Grotesk-Regular-Italic.otf", weight: "400", style: "italic" },
    { path: "./fonts/albra/Albra-Trial-Grotesk-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/albra/Albra-Trial-Grotesk-Medium-Italic.otf", weight: "500", style: "italic" },
    { path: "./fonts/albra/Albra-Trial-Grotesk-Semi.otf", weight: "600", style: "normal" },
    { path: "./fonts/albra/Albra-Trial-Grotesk-Semi-Italic.otf", weight: "600", style: "italic" },
    { path: "./fonts/albra/Albra-Trial-Grotesk-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/albra/Albra-Trial-Grotesk-Bold-Italic.otf", weight: "700", style: "italic" },
    { path: "./fonts/albra/Albra-Trial-Grotesk-Black.otf", weight: "900", style: "normal" },
    { path: "./fonts/albra/Albra-Trial-Grotesk-Black-Italic.otf", weight: "900", style: "italic" },
  ],
});

// THE GLOBE — distressed/stencil display accent (personal-use license; check
// before using in shipped commercial marketing assets)
const globe = localFont({
  variable: "--font-globe",
  display: "swap",
  src: "./fonts/TheGlobePersonalUse-Bold.ttf",
  weight: "700",
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
      className={`${roboto.variable} ${sfpro.variable} ${pinyon.variable} ${globe.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <CartProvider>
          <AudioProvider>
            <Preloader />
            <Nav />
            <CartDrawer />
            {children}
            <Footer />
            {/* sticky sound control — persists on every page; lifts above the
                product StickyBuyBar when it appears */}
            <FloatingSoundToggle />
          </AudioProvider>
        </CartProvider>
      </body>
    </html>
  );
}
