"use client"

import { useState } from "react"
import { useContract, useContractRead, Web3Button } from "@thirdweb-dev/react"
import { formatEther } from "viem"
import { CalendarDays, MapPin, Tag } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface TicketCardProps {
  tokenId: number
  contractAddress: string
}

export function TicketCard({ tokenId, contractAddress }: TicketCardProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { contract } = useContract(contractAddress)
  const { data: ticket, isLoading: isLoadingTicket } = useContractRead(contract, "tickets", [tokenId])

  if (isLoadingTicket) {
    return <TicketCardSkeleton />
  }

  if (!ticket) {
    return null
  }

  const originalPrice = formatEther(ticket.originalPrice.toString())
  const currentPrice = formatEther(ticket.currentPrice.toString())
  const eventDate = new Date(Number(ticket.eventDate) * 1000)
  const isExpired = Date.now() > Number(ticket.eventDate) * 1000

  const priceChange = ((Number(currentPrice) - Number(originalPrice)) / Number(originalPrice)) * 100
  const priceChangeColor = priceChange > 0 ? "text-red-500" : "text-green-500"

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <img
            src={ticket.metadata.imageURI || "/placeholder.svg?height=192&width=384"}
            alt={ticket.metadata.eventName}
            className="h-full w-full object-cover"
          />
          {isExpired && (
            <Badge variant="destructive" className="absolute right-2 top-2">
              Expired
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="line-clamp-1 text-xl">{ticket.metadata.eventName}</CardTitle>
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{ticket.metadata.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{eventDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="font-medium">{currentPrice} ETH</span>
            {priceChange !== 0 && (
              <span className={`text-sm ${priceChangeColor}`}>
                ({priceChange > 0 ? "+" : ""}
                {priceChange.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Web3Button
          contractAddress={contractAddress}
          action={async (contract) => {
            try {
              setIsLoading(true)
              await contract.call("buyTicket", [tokenId], {
                value: ticket.currentPrice,
              })
              toast({
                title: "Success",
                description: "Ticket purchased successfully!",
              })
            } catch (error: any) {
              toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
              })
            } finally {
              setIsLoading(false)
            }
          }}
          className="w-full"
          isDisabled={isExpired || isLoading}
        >
          {isLoading ? "Processing..." : "Buy Ticket"}
        </Web3Button>
      </CardFooter>
    </Card>
  )
}

function TicketCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="h-48 w-full" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="mt-2 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}

