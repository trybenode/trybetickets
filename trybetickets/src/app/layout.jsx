import { Roboto, Nunito_Sans} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const roboto = Roboto({
  weight: ['400', '500', '600', '700'],
  variable: "--font-roboto",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  weight: ['400', '500', '600', '700'],
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "TrybeTickets - Your Ultimate Event Platform",
  description: "Discover and book tickets for amazing events",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
