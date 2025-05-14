import { Urbanist } from "next/font/google";
import { Toaster } from 'sonner';
import "@/app/styles/global.css";

const urbanist = Urbanist({
  subsets: ["latin"],

  variable: "--font-urbanist",
  display: "swap",
});


const SITE_URL = "https://joeliescreation.swiftsyn.com";
const BANNER_URL = "https://raw.githubusercontent.com/DarknessMonarch/joeliecreation/refs/heads/master/public/assets/banner.png";

export const viewport = { 
  themeColor: "#651b6d",
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "joeliecreation",
    template: "%s , joeliecreation"
  },
  applicationName: "joeliecreation",
  description: "get the service you need",
  authors: [{ name: "joeliecreation", url: SITE_URL }],
  generator: "Next.js",
  keywords: [
    'saloon', 'services', 'cooking', 'nails', 'haircut', 'barber', 'joeliecreation',
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "joeliecreation",
    description: "get the service you need",
    url: SITE_URL,
    siteName: "joeliecreation",
    images: [{
      url: BANNER_URL,
      width: 1200,
      height: 630,
      alt: "joeliecreation Banner"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "joeliecreation",
    description: "get the service you need",
    images: [BANNER_URL],
    creator: "@joeliecreation"
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  },
  verification: {
    google: "",
    yandex: "",
  },
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/favicon.ico"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={urbanist.className}>
      <body>
        <Toaster
          position="top-center"
          richColors={true}
          toastOptions={{
            style: {
              background: "#651b6d",
              color: "#ffffff",
              borderRadius: "15px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
