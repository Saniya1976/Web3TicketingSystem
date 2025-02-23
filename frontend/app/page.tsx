import { Ticket, Calendar, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center space-y-12">
      <section className="text-center max-w-3xl">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          Welcome to Resalex Tickets
        </h1>
        <p className="text-xl text-muted-foreground">
          The next generation of secure and transparent ticket management
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="flex flex-col items-center p-6 bg-secondary rounded-lg">
          <Ticket className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Secure Tickets</h3>
          <p className="text-center text-muted-foreground">
            Every ticket is secured by blockchain technology
          </p>
        </div>

        <div className="flex flex-col items-center p-6 bg-secondary rounded-lg">
          <Calendar className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Easy Management</h3>
          <p className="text-center text-muted-foreground">
            Create and manage events with just a few clicks
          </p>
        </div>

        <div className="flex flex-col items-center p-6 bg-secondary rounded-lg">
          <Users className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Transfer & Sell</h3>
          <p className="text-center text-muted-foreground">
            Securely transfer or sell your tickets to others
          </p>
        </div>
      </section>

      <section className="w-full max-w-5xl bg-secondary p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Featured Events</h2>
        <div className="text-center text-muted-foreground">
          <p>No events available yet.</p>
          <p>Check back soon for exciting upcoming events!</p>
        </div>
      </section>
    </div>
  );
}