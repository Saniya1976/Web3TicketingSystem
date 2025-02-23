// app/layout.tsx
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import ClientLayout from "./client-layout" 

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "NFT Ticketing Marketplace",
  description: "Buy and sell event tickets as NFTs",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Client Components Wrapper */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}



import './globals.css'