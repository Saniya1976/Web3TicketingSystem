import { MintTicketForm } from "@/components/mint-ticket-form"

export default function MintPage() {
  return (
    <main className="container mx-auto py-8">
      <div className="flex min-h-screen flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Mint New Ticket</h1>
          <p className="mt-2 text-muted-foreground">Create a new NFT ticket for your event</p>
        </div>
        <MintTicketForm />
      </div>
    </main>
  )
}

