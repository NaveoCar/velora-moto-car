import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";

interface VehicleCardProps {
  image: string;
  title: string;
  city: string;
  year: number;
  price: number;
  type?: string;
}

const VehicleCard = ({ image, title, city, year, price, type }: VehicleCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl border-border overflow-hidden rounded-2xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {type && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
            {type}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5 space-y-3">
        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{year}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-2xl font-bold text-primary">
            {formatPrice(price)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;
