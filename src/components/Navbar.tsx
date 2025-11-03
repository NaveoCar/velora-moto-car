import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Velora</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#vehiculos" className="text-foreground hover:text-primary transition-colors font-medium">
              Vehículos
            </a>
            <a href="#publicar" className="text-foreground hover:text-primary transition-colors font-medium">
              Publicar
            </a>
            <a href="#velora-care" className="text-foreground hover:text-primary transition-colors font-medium">
              Velora Care
            </a>
          </div>

          <Button variant="hero" size="default" className="hidden md:inline-flex">
            Publicar vehículo
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
