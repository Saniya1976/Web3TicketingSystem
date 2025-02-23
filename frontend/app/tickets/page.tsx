"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import { toast } from "sonner";

interface TicketData {
  id: number;
  eventName: string;
  price: string;
  owner: string;
  isValid: boolean;
  isForSale: boolean;
}

export default function BrowseTickets() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    if (typeof window.ethereum === "undefined") {
      toast.error("Please install MetaMask to view tickets");
      setLoading(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        "YOUR_CONTRACT_ADDRESS",
        ["function getTicket(uint256) view returns (tuple(uint256 id, string eventName, uint256 price, address owner, bool isValid, bool isForSale))"],
        provider
      );

      const ticketsList: TicketData[] = [];
      // For demo purposes, we'll check the first 10 tickets
      for (let i = 1; i <= 10; i++) {
        try {
          const ticket = await contract.getTicket(i);
          ticketsList.push({
            id: Number(ticket.id),
            eventName: ticket.eventName,
            price: ethers.formatEther(ticket.price),
            owner: ticket.owner,
            isValid: ticket.isValid,
            isForSale: ticket.isForSale,
          });
        } catch (error) {
          break;
        }
      }

      setTickets(ticketsList);
    } catch (error) {
      console.error("Error loading tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  async function buyTicket(ticketId: number, price: string) {
    if (typeof window.ethereum === "undefined") {
      toast.error("Please install MetaMask to buy tickets");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        "YOUR_CONTRACT_ADDRESS",
        ["function buyTicket(uint256) payable"],
        signer
      );

      const tx = await contract.buyTicket(ticketId, {
        value: ethers.parseEther(price),
      });
      await tx.wait();
      
      toast.success("Ticket purchased successfully!");
      loadTickets();
    } catch (error) {
      console.error("Error buying ticket:", error);
      toast.error("Failed to buy ticket");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Tickets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{ticket.eventName}</h3>
                <p className="text-muted-foreground">ID: {ticket.id}</p>
              </div>
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p>Price: {ticket.price} ETH</p>
              <p>Owner: {ticket.owner.slice(0, 6)}...{ticket.owner.slice(-4)}</p>
              <p>Status: {ticket.isForSale ? "For Sale" : "Not for Sale"}</p>
            </div>
            {ticket.isForSale && (
              <Button
                className="w-full mt-4"
                onClick={() => buyTicket(ticket.id, ticket.price)}
              >
                Buy Ticket
              </Button>
            )}
          </Card>
        ))}
        {tickets.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No tickets available</p>
          </div>
        )}
      </div>
    </div>
  );
}