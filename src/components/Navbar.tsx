import { Button } from "@/components/ui/button";
import { Car, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Naveo</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/vehiculos" className="text-foreground hover:text-primary transition-colors font-medium">
              Vehículos
            </Link>
            <Link to="/publicar" className="text-foreground hover:text-primary transition-colors font-medium">
              Publicar
            </Link>
            <a href="/#naveo-care" className="text-foreground hover:text-primary transition-colors font-medium">
              Naveo Care
            </a>
          </div>

          <Button
            variant="hero"
            size="default"
            className="hidden md:inline-flex"
            onClick={() => navigate("/publicar")}
          >
            Publicar vehículo
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-6 mt-8">
                <Link to="/" className="flex items-center gap-2 mb-4">
                  <Car className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold text-foreground">Naveo</span>
                </Link>
                
                <Link to="/vehiculos" className="text-foreground hover:text-primary transition-colors font-medium text-lg">
                  Vehículos
                </Link>
                <Link to="/publicar" className="text-foreground hover:text-primary transition-colors font-medium text-lg">
                  Publicar
                </Link>
                <a href="/#naveo-care" className="text-foreground hover:text-primary transition-colors font-medium text-lg">
                  Naveo Care
                </a>
                
                <Button
                  variant="hero"
                  size="lg"
                  className="mt-4"
                  onClick={() => navigate("/publicar")}
                >
                  Publicar vehículo
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
