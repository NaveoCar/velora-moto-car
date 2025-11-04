import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import VehicleCard from "@/components/VehicleCard";
import SearchFilters, { FilterState } from "@/components/SearchFilters";
import Footer from "@/components/Footer";
import { vehicleService } from "@/services/vehicle.service";
import type { Vehicle } from "@/types/vehicle.types";
import { Loader2 } from "lucide-react";

const Vehicles = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    transmission: "",
    fuelType: "",
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, [filters]);

  async function loadVehicles() {
    try {
      setLoading(true);
      
      // Preparar filtros para el servicio
      const serviceFilters = {
        type: filters.type && filters.type !== "all" ? filters.type : undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        minYear: filters.minYear ? parseInt(filters.minYear) : undefined,
        maxYear: filters.maxYear ? parseInt(filters.maxYear) : undefined,
      };

      const data = await vehicleService.getActiveVehicles(serviceFilters);
      
      // Aplicar filtro de búsqueda de texto en el cliente
      let filteredData = data;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = data.filter(vehicle =>
          vehicle.title.toLowerCase().includes(searchLower) ||
          vehicle.brand.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower) ||
          vehicle.type.toLowerCase().includes(searchLower) ||
          vehicle.city.toLowerCase().includes(searchLower)
        );
      }

      // Aplicar filtro de ciudad
      if (filters.city && filters.city !== "all") {
        filteredData = filteredData.filter(vehicle => vehicle.city === filters.city);
      }

      setVehicles(filteredData);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  }

  const getPrimaryImage = (vehicle: Vehicle) => {
    const primaryImage = vehicle.vehicle_images?.find(img => img.is_primary);
    return primaryImage?.thumbnail_url || vehicle.vehicle_images?.[0]?.thumbnail_url || '/placeholder.svg';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section for Vehicles Page */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Encuentra tu vehículo ideal
            </h1>
            <p className="text-lg text-muted-foreground">
              Explora nuestra amplia selección de carros y motos en Colombia. Usa los filtros para encontrar exactamente lo que buscas.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <SearchFilters onFilterChange={setFilters} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-4">
                No se encontraron vehículos con los filtros seleccionados
              </p>
              <p className="text-muted-foreground">
                Intenta ajustar tus criterios de búsqueda
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-muted-foreground">
                Mostrando {vehicles.length} {vehicles.length === 1 ? 'vehículo' : 'vehículos'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    id={vehicle.id}
                    slug={vehicle.slug}
                    image={getPrimaryImage(vehicle)}
                    title={vehicle.title}
                    city={vehicle.city}
                    year={vehicle.year}
                    price={vehicle.price}
                    type={vehicle.type}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Vehicles;