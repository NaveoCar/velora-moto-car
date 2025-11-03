import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Carlos Rodríguez",
      city: "Bogotá",
      rating: 5,
      comment: "Vendí mi carro en menos de una semana. La plataforma es muy fácil de usar y el soporte fue excelente.",
      initials: "CR",
    },
    {
      name: "María González",
      city: "Medellín",
      rating: 5,
      comment: "Encontré el SUV perfecto para mi familia. Los filtros de búsqueda son muy útiles y la información es clara.",
      initials: "MG",
    },
    {
      name: "Andrés Martínez",
      city: "Cali",
      rating: 5,
      comment: "Excelente experiencia comprando mi primera moto. El vendedor fue muy profesional y todo fue transparente.",
      initials: "AM",
    },
    {
      name: "Laura Sánchez",
      city: "Barranquilla",
      rating: 5,
      comment: "La mejor plataforma para vender vehículos. Recibí muchas ofertas y pude elegir la mejor opción.",
      initials: "LS",
    },
    {
      name: "Diego Ramírez",
      city: "Cartagena",
      rating: 5,
      comment: "Proceso muy seguro y confiable. Me sentí respaldado en todo momento durante la compra de mi camioneta.",
      initials: "DR",
    },
    {
      name: "Ana Torres",
      city: "Bucaramanga",
      rating: 5,
      comment: "Publiqué mi vehículo gratis y en pocos días ya tenía compradores interesados. ¡Muy recomendado!",
      initials: "AT",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Miles de personas confían en Naveo para comprar y vender sus vehículos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.city}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  "{testimonial.comment}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-foreground">4.9/5</span>
            <span className="text-muted-foreground">basado en 2,500+ reseñas</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;