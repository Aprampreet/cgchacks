import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavSid from "../comps/NavSid";
import { AuthProvider } from "@/context/AuthContext";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
import ProtectedRoutes from "@/comps/ProtectedRoutes";
export const metadata: Metadata = {
  title: "CGC hack",
  description: "Modern dashboard with Next.js + ShadCN UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-white`}>
        
          <AuthProvider>
            <ProtectedRoutes>
              <NavSid>{children}</NavSid>
            </ProtectedRoutes>
          </AuthProvider>
        
      </body>
    </html>
  );
}
