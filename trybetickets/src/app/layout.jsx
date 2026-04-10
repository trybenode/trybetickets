import { Roboto, Nunito_Sans} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  title: "TrybeTickets - Premier Event Ticketing Platform",
  description: "Create, manage, and attend amazing events with TrybeTickets.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
