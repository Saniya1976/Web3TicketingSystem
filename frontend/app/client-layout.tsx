// app/client-layout.tsx
"use client"

import { ReactNode } from "react"
import { Sepolia } from "@thirdweb-dev/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThirdwebProvider } from "@thirdweb-dev/react"
import { Toaster } from "@/components/ui/toaster"

// Create a single instance of QueryClient outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})


export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider
      activeChain={Sepolia}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_API_KEY}
      supportedChains={[Sepolia]}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThirdwebProvider>
  )
}