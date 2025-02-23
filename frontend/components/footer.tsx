export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2024 Resalex Tickets. All rights reserved.
          </p>
          <a
            href="https://github.com/yourusername/resalex-ticketing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            GitHub Repository
          </a>
        </div>
      </div>
    </footer>
  );
}