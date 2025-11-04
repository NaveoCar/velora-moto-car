import { Button } from "@/components/ui/button";
import { Car, Menu, User, LogOut, Settings, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

          <div className="hidden md:flex items-center gap-4">
            {user && profile ? (
              <>
                {(profile.role === 'seller' || profile.role === 'admin') && (
                  <Button
                    variant="hero"
                    size="default"
                    onClick={() => navigate("/publicar")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Publicar
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                        <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {profile.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/perfil')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </DropdownMenuItem>
                    {(profile.role === 'seller' || profile.role === 'admin') && (
                      <DropdownMenuItem onClick={() => navigate('/mis-vehiculos')}>
                        <Car className="mr-2 h-4 w-4" />
                        <span>Mis Vehículos</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/configuracion')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth/login")}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="hero"
                  onClick={() => navigate("/auth/register")}
                >
                  Registrarse
                </Button>
              </>
            )}
          </div>

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
                
                {user && profile ? (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                          <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{profile.full_name}</p>
                          <p className="text-xs text-muted-foreground">{profile.email}</p>
                        </div>
                      </div>
                      
                      {(profile.role === 'seller' || profile.role === 'admin') && (
                        <Button
                          variant="hero"
                          size="lg"
                          className="w-full mb-2"
                          onClick={() => navigate("/publicar")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Publicar vehículo
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => navigate("/auth/login")}
                    >
                      Iniciar Sesión
                    </Button>
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={() => navigate("/auth/register")}
                    >
                      Registrarse
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
