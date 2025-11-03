import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Palette,
  DoorOpen,
  Phone,
  Mail,
  ArrowLeft,
  Share2,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Datos de ejemplo - en producción vendrían de Supabase
const vehicleData = {
  1: {
    id: 1,
    title: "BMW Serie 5 2023",
    description: "Vehículo en excelente estado, único dueño. Mantenimientos al día en concesionario oficial. Incluye garantía extendida hasta 2025. Sistema de navegación, cámara 360°, asientos de cuero con calefacción y ventilación.",
    city: "Bogotá",
    year: 2023,
    price: 185000000,
    type: "Sedán",
    brand: "BMW",
    model: "Serie 5",
    mileage: 15000,
    transmission: "Automática",
    fuelType: "Gasolina",
    color: "Negro",
    doors: 4,
    condition: "Usado - Excelente",
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
    ],
    contactName: "Juan Pérez",
    contactPhone: "3001234567",
    contactEmail: "juan@ejemplo.com",
  },
};

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // En producción, aquí se haría una consulta a Supabase
  const vehicle = id ? vehicleData[parseInt(id) as keyof typeof vehicleData] : undefined;

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Vehículo no encontrado</h1>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vehicle.title,
        text: `Mira este ${vehicle.type} en Naveo`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles",
      });
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Eliminado de favoritos" : "Añadido a favoritos",
      description: isFavorite 
        ? "El vehículo ha sido eliminado de tus favoritos" 
        : "El vehículo ha sido añadido a tus favoritos",
    });
  };

  const handleContact = () => {
    toast({
      title: "Información de contacto",
      description: "El vendedor será notificado de tu interés",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Imágenes y detalles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={vehicle.images[selectedImage]}
                    alt={vehicle.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    {vehicle.type}
                  </Badge>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={handleFavorite}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                </div>
                
                {/* Miniaturas */}
                <div className="grid grid-cols-4 gap-2 p-4">
                  {vehicle.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-transparent hover:border-border'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${vehicle.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Título y precio */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {vehicle.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{vehicle.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{vehicle.year}</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-primary">
                {formatPrice(vehicle.price)}
              </p>
            </div>

            <Separator />

            {/* Características principales */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Características</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Gauge className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kilometraje</p>
                      <p className="font-semibold">{vehicle.mileage?.toLocaleString()} km</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transmisión</p>
                      <p className="font-semibold">{vehicle.transmission}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Fuel className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Combustible</p>
                      <p className="font-semibold">{vehicle.fuelType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Palette className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Color</p>
                      <p className="font-semibold">{vehicle.color}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DoorOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Puertas</p>
                      <p className="font-semibold">{vehicle.doors}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <p className="font-semibold">{vehicle.condition}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descripción */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {vehicle.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Información de contacto */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Información del vendedor</h3>
                  <p className="text-muted-foreground">{vehicle.contactName}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={handleContact}>
                    <Phone className="mr-2 h-5 w-5" />
                    Llamar ahora
                  </Button>
                  
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <a href={`https://wa.me/57${vehicle.contactPhone}`} target="_blank" rel="noopener noreferrer">
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </a>
                  </Button>

                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <a href={`mailto:${vehicle.contactEmail}`}>
                      <Mail className="mr-2 h-5 w-5" />
                      Enviar email
                    </a>
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {vehicle.contactPhone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {vehicle.contactEmail}
                  </p>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Consejo:</strong> Verifica siempre el estado del vehículo en persona antes de realizar cualquier transacción.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VehicleDetails;