"use client"

import { useState } from "react"
import { useContract, useContractRead } from "@thirdweb-dev/react"
import { Search, SlidersHorizontal } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/connect-wallet"
import { TicketCard } from "@/components/ticket-card"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")

  const { contract } = useContract(CONTRACT_ADDRESS)
  const { data: totalSupply, isLoading } = useContractRead(contract, "totalSupply")

  const tickets = Array.from({ length: Number(totalSupply) || 0 }, (_, i) => i)
  const filteredTickets = tickets // TODO: Implement search filtering

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">NFT Tickets</h1>
          <ConnectWalletButton />
        </div>
      </nav>

      <div className="container py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <TicketCard tokenId={0} contractAddress={CONTRACT_ADDRESS} />
              </div>
            ))}
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((tokenId) => (
              <TicketCard key={tokenId} tokenId={tokenId} contractAddress={CONTRACT_ADDRESS} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">No tickets found</h2>
            <p className="mt-2 text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </main>
  )
}

