import { Shield, Zap, Users, CheckCircle, TrendingUp, HeadphonesIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Compra segura",
      description: "Verificamos la identidad de todos los vendedores para garantizar transacciones seguras y confiables.",
    },
    {
      icon: Zap,
      title: "Publicación rápida",
      description: "Publica tu vehículo en menos de 5 minutos. Proceso simple y sin complicaciones.",
    },
    {
      icon: Users,
      title: "Miles de usuarios",
      description: "Únete a la comunidad más grande de compradores y vendedores de vehículos en Colombia.",
    },
    {
      icon: CheckCircle,
      title: "Sin comisiones ocultas",
      description: "Publicación 100% gratuita. Sin costos adicionales ni sorpresas al final.",
    },
    {
      icon: TrendingUp,
      title: "Mejor visibilidad",
      description: "Tu vehículo será visto por miles de compradores potenciales cada día.",
    },
    {
      icon: HeadphonesIcon,
      title: "Soporte 24/7",
      description: "Nuestro equipo está disponible para ayudarte en cualquier momento que lo necesites.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Por qué elegir Naveo?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            La plataforma más completa y confiable para comprar y vender vehículos en Colombia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 flex-wrap justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">10,000+</p>
              <p className="text-muted-foreground mt-1">Vehículos publicados</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">50,000+</p>
              <p className="text-muted-foreground mt-1">Usuarios activos</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">98%</p>
              <p className="text-muted-foreground mt-1">Satisfacción</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;