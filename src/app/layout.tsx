import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ListProvider } from "@/context/ListContext";
import { AiAssistantProvider } from "@/context/AiAssistantContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListDrawer from "@/components/ListDrawer";
import AiAssistant from "@/components/AiAssistant";
import FloatingCartButton from "@/components/FloatingCartButton";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Схожу на рынок — доставка продуктов в Ялте",
  description:
    "Соберите список продуктов на сайте — мы сходим на рынок и доставим заказ в течение часа.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ListProvider>
          <AiAssistantProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ListDrawer />
            <AiAssistant />
            <FloatingCartButton />
          </AiAssistantProvider>
        </ListProvider>
      </body>
    </html>
  );
}
