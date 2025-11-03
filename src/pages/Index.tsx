import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import VehicleCard from "@/components/VehicleCard";
import SearchFilters, { FilterState } from "@/components/SearchFilters";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import NaveoCarChat from "@/components/NaveoCarChat";
import vehicle1 from "@/assets/vehicle-1.jpg";
import vehicle2 from "@/assets/vehicle-2.jpg";
import vehicle3 from "@/assets/vehicle-3.jpg";
import vehicle4 from "@/assets/vehicle-4.jpg";
import vehicle5 from "@/assets/vehicle-5.jpg";
import vehicle6 from "@/assets/vehicle-6.jpg";

const Index = () => {
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
  const vehicles = [
    {
      id: 1,
      image: vehicle1,
      title: "BMW Serie 5 2023",
      city: "Bogotá",
      year: 2023,
      price: 185000000,
      type: "Sedán"
    },
    {
      id: 2,
      image: vehicle2,
      title: "MG ZS 2024",
      city: "Medellín",
      year: 2024,
      price: 95000000,
      type: "SUV"
    },
    {
      id: 3,
      image: vehicle3,
      title: "Kawasaki Ninja 2023",
      city: "Cali",
      year: 2023,
      price: 42000000,
      type: "Moto"
    },
    {
      id: 4,
      image: vehicle4,
      title: "Toyota Hilux 2024",
      city: "Barranquilla",
      year: 2024,
      price: 165000000,
      type: "Camioneta"
    },
    {
      id: 5,
      image: vehicle5,
      title: "Chevrolet Spark GT 2023",
      city: "Cartagena",
      year: 2023,
      price: 38000000,
      type: "Hatchback"
    },
    {
      id: 6,
      image: vehicle6,
      title: "Kawasaki Versys 650 2024",
      city: "Bucaramanga",
      year: 2024,
      price: 48000000,
      type: "Moto"
    }
  ];

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Búsqueda por texto
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          vehicle.title.toLowerCase().includes(searchLower) ||
          vehicle.type.toLowerCase().includes(searchLower) ||
          vehicle.city.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro por tipo
      if (filters.type && filters.type !== "all" && vehicle.type !== filters.type) return false;

      // Filtro por ciudad
      if (filters.city && filters.city !== "all" && vehicle.city !== filters.city) return false;

      // Filtro por precio
      if (filters.minPrice && vehicle.price < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && vehicle.price > parseInt(filters.maxPrice)) return false;

      // Filtro por año
      if (filters.minYear && vehicle.year < parseInt(filters.minYear)) return false;
      if (filters.maxYear && vehicle.year > parseInt(filters.maxYear)) return false;

      return true;
    });
  }, [vehicles, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      <section id="vehiculos" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Vehículos destacados
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Descubre los mejores carros y motos disponibles en Colombia
            </p>
          </div>

          <div className="mb-8">
            <SearchFilters onFilterChange={setFilters} />
          </div>

          {filteredVehicles.length === 0 ? (
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
                Mostrando {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehículo' : 'vehículos'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    id={vehicle.id}
                    image={vehicle.image}
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

      <Features />
      <Testimonials />
      <FAQ />
      <NaveoCarChat />
      <Footer />
    </div>
  );
};

export default Index;
