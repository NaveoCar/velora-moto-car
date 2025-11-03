import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  type: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  transmission: string;
  fuelType: string;
}

const SearchFilters = ({ onFilterChange }: SearchFiltersProps) => {
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

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      search: "",
      type: "",
      city: "",
      minPrice: "",
      maxPrice: "",
      minYear: "",
      maxYear: "",
      transmission: "",
      fuelType: "",
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de vehículo</Label>
        <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Sedán">Sedán</SelectItem>
            <SelectItem value="SUV">SUV</SelectItem>
            <SelectItem value="Camioneta">Camioneta</SelectItem>
            <SelectItem value="Hatchback">Hatchback</SelectItem>
            <SelectItem value="Moto">Moto</SelectItem>
            <SelectItem value="Deportivo">Deportivo</SelectItem>
            <SelectItem value="Van">Van</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Ciudad</Label>
        <Select value={filters.city} onValueChange={(value) => handleFilterChange("city", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Bogotá">Bogotá</SelectItem>
            <SelectItem value="Medellín">Medellín</SelectItem>
            <SelectItem value="Cali">Cali</SelectItem>
            <SelectItem value="Barranquilla">Barranquilla</SelectItem>
            <SelectItem value="Cartagena">Cartagena</SelectItem>
            <SelectItem value="Bucaramanga">Bucaramanga</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Rango de precio (COP)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Mínimo"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Máximo"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Año</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Desde"
            value={filters.minYear}
            onChange={(e) => handleFilterChange("minYear", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Hasta"
            value={filters.maxYear}
            onChange={(e) => handleFilterChange("maxYear", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transmission">Transmisión</Label>
        <Select value={filters.transmission} onValueChange={(value) => handleFilterChange("transmission", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Manual">Manual</SelectItem>
            <SelectItem value="Automática">Automática</SelectItem>
            <SelectItem value="Semiautomática">Semiautomática</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fuelType">Combustible</Label>
        <Select value={filters.fuelType} onValueChange={(value) => handleFilterChange("fuelType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Gasolina">Gasolina</SelectItem>
            <SelectItem value="Diésel">Diésel</SelectItem>
            <SelectItem value="Eléctrico">Eléctrico</SelectItem>
            <SelectItem value="Híbrido">Híbrido</SelectItem>
            <SelectItem value="Gas">Gas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por marca, modelo o palabra clave..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Botón de filtros para móvil */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Refina tu búsqueda de vehículos
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Filtros para desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Filtros</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type-desktop">Tipo</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger id="type-desktop">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Sedán">Sedán</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Camioneta">Camioneta</SelectItem>
                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                  <SelectItem value="Moto">Moto</SelectItem>
                  <SelectItem value="Deportivo">Deportivo</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city-desktop">Ciudad</Label>
              <Select value={filters.city} onValueChange={(value) => handleFilterChange("city", value)}>
                <SelectTrigger id="city-desktop">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Bogotá">Bogotá</SelectItem>
                  <SelectItem value="Medellín">Medellín</SelectItem>
                  <SelectItem value="Cali">Cali</SelectItem>
                  <SelectItem value="Barranquilla">Barranquilla</SelectItem>
                  <SelectItem value="Cartagena">Cartagena</SelectItem>
                  <SelectItem value="Bucaramanga">Bucaramanga</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-desktop">Precio máximo</Label>
              <Input
                id="price-desktop"
                type="number"
                placeholder="Ej: 100000000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year-desktop">Año mínimo</Label>
              <Input
                id="year-desktop"
                type="number"
                placeholder="Ej: 2020"
                value={filters.minYear}
                onChange={(e) => handleFilterChange("minYear", e.target.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchFilters;