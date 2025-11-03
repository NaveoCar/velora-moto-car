import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
            Compra y vende vehículos{" "}
            <span className="text-primary">con confianza</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            La plataforma más confiable de Colombia para tu próximo carro o moto. 
            Conectamos compradores y vendedores de forma segura.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="hero" size="lg" className="text-base px-8">
              Publicar vehículo gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8">
              Ver vehículos
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap gap-8 justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Verificación de vendedores</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Publicación gratuita</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Miles de vehículos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
