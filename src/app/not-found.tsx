import Link from "next/link";
import Mascot from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="flex flex-col items-center text-center max-w-md animate-in fade-in zoom-in duration-500">
        <div className="relative mb-8">
          <Mascot size={130} className="relative z-10" />
        </div>
        
        <h1 className="font-heading text-6xl font-bold tracking-tighter sm:text-7xl">
          404
        </h1>
        
        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          Page not found
        </h2>
        
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Looks like this prerequisite doesn't exist. Let's get you back on track to your degree path.
        </p>
        
        <div className="mt-8">
          <Link href="/">
            <Button size="lg" className="rounded-full shadow-lg">
              <Home className="mr-2 size-5" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
