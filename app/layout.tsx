import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import CookieBanner from "./components/CookieBanner";

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["300", "400"],
    variable: "--font-cormorant",
});

const jost = Jost({
    subsets: ["latin"],
    weight: ["200", "300", "400", "500"],
    variable: "--font-jost",
});

export const metadata: Metadata = {
    title: "Tendenze — Gioielli & Borse",
    description: "Gioielli e borse di tendenza",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="it" className={`${cormorant.variable} ${jost.variable}`}>
        <body>
        <CartProvider>
            {children}
            <CookieBanner />
        </CartProvider>
        </body>
        </html>
    );
}