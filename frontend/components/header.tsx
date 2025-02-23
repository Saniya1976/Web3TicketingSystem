import { Ticket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WalletConnect } from "./wallet-connect";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="Resalex Logo"
              width={32}
              height={32}
              className="text-primary"
            />
            <span className="text-xl font-bold">Resalex Tickets</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link 
              href="/tickets" 
              className="hover:text-primary transition-colors"
            >
              Browse Tickets
            </Link>
            <Link 
              href="/tickets/create" 
              className="hover:text-primary transition-colors"
            >
              Create Ticket
            </Link>
            <WalletConnect />
          </div>
        </nav>
      </div>
    </header>
  );
}