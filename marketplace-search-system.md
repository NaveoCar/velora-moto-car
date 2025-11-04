
# Sistema de Búsqueda Avanzada - Naveo Marketplace

## 🔍 Arquitectura del Sistema de Búsqueda

### Modelo de Datos Completo

```sql
-- Continuación del modelo de búsqueda...

-- Vista materializada para búsquedas rápidas
CREATE MATERIALIZED VIEW vehicle_search_view AS
SELECT 
  v.id,
  v.title,
  v.slug,
  v.type,
  v.brand,
  v.model,
  v.year,
  v.price,
  v.mileage,
  v.transmission,
  v.fuel_type,
  v.condition,
  v.city,
  v.department,
  v.status,
  v.is_featured,
  v.boost_level,
  v.created_at,
  v.views_count,
  v.favorites_count,
  v.search_vector,
  -- Imagen principal
  (SELECT url FROM vehicle_images WHERE vehicle_id = v.id AND is_primary = true LIMIT 1) as primary_image,
  -- Información del vendedor
  p.full_name as seller_name,
  p.avatar_url as seller_avatar,
  sd.business_name,
  sd.rating as seller_rating,
  sd.response_time_hours,
  -- Score de relevancia (para ordenamiento)
  CASE 
    WHEN v.is_featured THEN 1000
    ELSE 0
  END + (v.boost_level * 100) + (v.views_count * 0.1) + (v.favorites_count * 0.5) as relevance_score
FROM vehicles v
JOIN profiles p ON v.seller_id = p.id
LEFT JOIN seller_details sd ON p.id = sd.profile_id
WHERE v.status = 'active';

-- Índices para la vista
CREATE INDEX idx_search_view_type_brand ON vehicle_search_view(type, brand);
CREATE INDEX idx_search_view_price ON vehicle_search_view(price);
CREATE INDEX idx_search_view_year ON vehicle_search_view(year);
CREATE INDEX idx_search_view_location ON vehicle_search_view(city, department);
CREATE INDEX idx_search_view_relevance ON vehicle_search_view(relevance_score DESC);

-- Actualizar la vista cada hora
CREATE OR REPLACE FUNCTION refresh_vehicle_search_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY vehicle_search_view;
END;
$$ LANGUAGE plpgsql;

-- Sugerencias de búsqueda
CREATE TABLE public.search_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term TEXT UNIQUE NOT NULL,
  category TEXT, -- 'brand', 'model', 'type', 'location'
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Popular suggestions basadas en búsquedas
CREATE OR REPLACE FUNCTION update_search_suggestions()
RETURNS void AS $$
BEGIN
  -- Actualizar popularidad de marcas
  INSERT INTO search_suggestions (term, category, popularity)
  SELECT DISTINCT brand, 'brand', COUNT(*) 
  FROM vehicles 
  WHERE status = 'active'
  GROUP BY brand
  ON CONFLICT (term) 
  DO UPDATE SET popularity = EXCLUDED.popularity;
  
  -- Actualizar popularidad de modelos
  INSERT INTO search_suggestions (term, category, popularity)
  SELECT DISTINCT CONCAT(brand, ' ', model), 'model', COUNT(*) 
  FROM vehicles 
  WHERE status = 'active'
  GROUP BY brand, model
  ON CONFLICT (term) 
  DO UPDATE SET popularity = EXCLUDED.popularity;
END;
$$ LANGUAGE plpgsql;
```

### Servicio de Búsqueda Avanzada

```typescript
// services/search.service.ts
import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  query?: string;
  type?: string;
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  transmission?: string[];
  fuelType?: string[];
  condition?: string[];
  city?: string;
  department?: string;
  features?: string[];
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  vehicles: VehicleSearchResult[];
  total: number;
  facets: SearchFacets;
  suggestions: string[];
}

export interface SearchFacets {
  types: FacetItem[];
  brands: FacetItem[];
  priceRanges: FacetItem[];
  years: FacetItem[];
  cities: FacetItem[];
}

export interface FacetItem {
  value: string;
  count: number;
}

export class SearchService {
  // Búsqueda principal
  async searchVehicles(filters: SearchFilters): Promise<SearchResult> {
    const { page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    // Construir query base
    let query = supabase
      .from('vehicle_search_view')
      .select('*', { count: 'exact' });

    // Aplicar búsqueda de texto si existe
    if (filters.query) {
      query = query.textSearch('search_vector', filters.query, {
        type: 'websearch',
        config: 'spanish'
      });
    }

    // Aplicar filtros
    query = this.applyFilters(query, filters);

    // Aplicar ordenamiento
    query = this.applySorting(query, filters.sortBy);

    // Paginación
    query = query.range(offset, offset + limit - 1);

    // Ejecutar query
    const { data, error, count } = await query;

    if (error) throw error;

    // Obtener facetas en paralelo
    const facets = await this.getFacets(filters);

    // Obtener sugerencias si hay query
    const suggestions = filters.query 
      ? await this.getSuggestions(filters.query)
      : [];

    // Guardar en historial si hay usuario autenticado
    if (filters.query) {
      await this.saveSearchHistory(filters, count || 0);
    }

    return {
      vehicles: data || [],
      total: count || 0,
      facets,
      suggestions
    };
  }

  // Aplicar filtros al query
  private applyFilters(query: any, filters: SearchFilters) {
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.brand) {
      query = query.eq('brand', filters.brand);
    }

    if (filters.model) {
      query = query.eq('model', filters.model);
    }

    // Rango de precio
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    // Rango de año
    if (filters.minYear) {
      query = query.gte('year', filters.minYear);
    }
    if (filters.maxYear) {
      query = query.lte('year', filters.maxYear);
    }

    // Rango de kilometraje
    if (filters.minMileage) {
      query = query.gte('mileage', filters.minMileage);
    }
    if (filters.maxMileage) {
      query = query.lte('mileage', filters.maxMileage);
    }

    // Filtros múltiples
    if (filters.transmission?.length) {
      query = query.in('transmission', filters.transmission);
    }

    if (filters.fuelType?.length) {
      query = query.in('fuel_type', filters.fuelType);
    }

    if (filters.condition?.length) {
      query = query.in('condition', filters.condition);
    }

    // Ubicación
    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.department) {
      query = query.eq('department', filters.department);
    }

    return query;
  }

  // Aplicar ordenamiento
  private applySorting(query: any, sortBy?: string) {
    switch (sortBy) {
      case 'price_asc':
        return query.order('price', { ascending: true });
      case 'price_desc':
        return query.order('price', { ascending: false });
      case 'year_desc':
        return query.order('year', { ascending: false });
      case 'mileage_asc':
        return query.order('mileage', { ascending: true });
      case 'relevance':
      default:
        return query.order('relevance_score', { ascending: false });
    }
  }

  // Obtener facetas para filtros
  private async getFacets(filters: SearchFilters): Promise<SearchFacets> {
    // Query base para facetas (sin paginación)
    let baseQuery = supabase
      .from('vehicle_search_view')
      .select('type, brand, price, year, city');

    // Aplicar solo filtros relevantes (no el que estamos facetando)
    if (filters.query) {
      baseQuery = baseQuery.textSearch('search_vector', filters.query);
    }

    const { data } = await baseQuery;

    if (!data) return this.getEmptyFacets();

    // Calcular facetas
    const facets: SearchFacets = {
      types: this.calculateFacet(data, 'type'),
      brands: this.calculateFacet(data, 'brand'),
      priceRanges: this.calculatePriceRanges(data),
      years: this.calculateYearFacet(data),
      cities: this.calculateFacet(data, 'city')
    };

    return facets;
  }

  // Calcular faceta simple
  private calculateFacet(data: any[], field: string): FacetItem[] {
    const counts = data.reduce((acc, item) => {
      const value = item[field];
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([value, count]) => ({ value, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Calcular rangos de precio
  private calculatePriceRanges(data: any[]): FacetItem[] {
    const ranges = [
      { min: 0, max: 50000000, label: 'Menos de $50M' },
      { min: 50000000, max: 100000000, label: '$50M - $100M' },
      { min: 100000000, max: 200000000, label: '$100M - $200M' },
      { min: 200000000, max: 500000000, label: '$200M - $500M' },
      { min: 500000000, max: Infinity, label: 'Más de $500M' }
    ];

    return ranges.map(range => ({
      value: range.label,
      count: data.filter(item => 
        item.price >= range.min && item.price < range.max
      ).length
    })).filter(item => item.count > 0);
  }

  // Calcular faceta de años
  private calculateYearFacet(data: any[]): FacetItem[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let year = currentYear; year >= currentYear - 10; year--) {
      const count = data.filter(item => item.year === year).length;
      if (count > 0) {
        years.push({ value: year.toString(), count });
      }
    }

    return years;
  }

  // Obtener sugerencias de búsqueda
  async getSuggestions(query: string): Promise<string[]> {
    const { data } = await supabase
      .from('search_suggestions')
      .select('term')
      .ilike('term', `${query}%`)
      .order('popularity', { ascending: false })
      .limit(5);

    return data?.map(item => item.term) || [];
  }

  // Guardar búsqueda en historial
  private async saveSearchHistory(filters: SearchFilters, resultsCount: number) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    await supabase
      .from('search_history')
      .insert({
        user_id: userId,
        query: filters.query,
        filters: filters,
        results_count: resultsCount
      });
  }

  // Búsqueda guardada
  async saveSearch(name: string, filters: SearchFilters) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: userId,
        name,
        filters
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // Obtener búsquedas guardadas
  async getSavedSearches() {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return [];

    const { data } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return data || [];
  }

  // Autocompletar
  async autocomplete(query: string): Promise<AutocompleteResult[]> {
    // Buscar en marcas y modelos
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('brand, model')
      .or(`brand.ilike.%${query}%,model.ilike.%${query}%`)
      .limit(10);

    // Buscar en sugerencias
    const { data: suggestions } = await supabase
      .from('search_suggestions')
      .select('term, category')
      .ilike('term', `%${query}%`)
      .limit(5);

    // Combinar resultados
    const results: AutocompleteResult[] = [];

    // Agregar vehículos
    vehicles?.forEach(v => {
      results.push({
        type: 'vehicle',
        value: `${v.brand} ${v.model}`,
        category: 'Vehículos'
      });
    });

    // Agregar sugerencias
    suggestions?.forEach(s => {
      results.push({
        type: 'suggestion',
        value: s.term,
        category: s.category
      });
    });

    return results;
  }

  private getEmptyFacets(): SearchFacets {
    return {
      types: [],
      brands: [],
      priceRanges: [],
      years: [],
      cities: []
    };
  }
}
```

### Componente de Búsqueda Avanzada

```typescript
// components/search/AdvancedSearch.tsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, Filter, X, Save } from 'lucide-react';
import { SearchService, SearchFilters } from '@/services/search.service';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';

export function AdvancedSearch({ onResults }: { onResults: (results: any) => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [facets, setFacets] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  const searchService = new SearchService();

  const debouncedQuery = useDebounce(filters.query || '', 300);

  // Inicializar filtros desde URL
  useEffect(() => {
    const initialFilters: SearchFilters = {
      query: searchParams.get('q') || undefined,
      type: searchParams.get('type') || undefined,
      brand: searchParams.get('brand') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      // ... más filtros
    };
    setFilters(initialFilters);
  }, []);

  // Ejecutar búsqueda cuando cambian los filtros
  useEffect(() => {
    performSearch();
  }, [debouncedQuery, filters.type, filters.brand, filters.minPrice, filters.maxPrice]);

  // Obtener sugerencias
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      searchService.getSuggestions(debouncedQuery).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const results = await searchService.searchVehicles(filters);
      onResults(results);
      setFacets(results.facets);
      
      // Actualizar URL
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      });
      setSearchParams(params);
    } catch (error) {
      toast({
        title: 'Error en la búsqueda',
        description: 'No se pudieron cargar los resultados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilter = (key: keyof SearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({ query: filters.query });
  };

  const saveSearch = async () => {
    try {
      const name = prompt('Nombre para esta búsqueda:');
      if (!name) return;

      await searchService.saveSearch(name, filters);
      toast({
        title: 'Búsqueda guardada',
        description: 'Recibirás notificaciones de nuevos vehículos'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la búsqueda',
        variant: 'destructive'
      });
    }
  };

  const activeFiltersCount = Object.keys(filters).filter(key => key !== 'query').length;

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por marca, modelo o características..."
            value={filters.query || ''}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10"
          />
          
          {/* Sugerencias */}
          {suggestions.length > 0 && (
            <Card className="absolute top-full mt-1 w-full z-10">
              <ul className="py-2">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => updateFilter('query', suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
        
        <Button onClick={performSearch} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
        
        <Button variant="outline" onClick={saveSearch}>
          <Save className="h-4 w-4" />
        </Button>
      </div>

      {/* Filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          
          {filters.type && (
            <Badge variant="secondary">
              {filters.type}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => clearFilter('type')}
              />
            </Badge>
          )}
          
          {filters.brand && (
            <Badge variant="secondary">
              {filters.brand}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => clearFilter('brand')}
              />
            </Badge>
          )}
          
          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="secondary">
              Precio: ${filters.minPrice?.toLocaleString()} - ${filters.maxPrice?.toLocaleString()}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => {
                  clearFilter('minPrice');
                  clearFilter('maxPrice');
                }}
              />
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
          >
            Limpiar todos
          </Button>
        </div>
      )}

      {/* Panel de filtros avanzados */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros avanzados
              {activeFiltersCount > 0 && (
                <Badge>{activeFiltersCount}</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              {/* Tipo de vehículo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de vehículo</label>
                <Select 
                  value={filters.type || ''} 
                  onValueChange={(value) => updateFilter('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {facets.types?.map((type: any) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.value} ({type.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Marca</label>
                <Select 
                  value={filters.brand || ''} 
                  onValueChange={(value) => updateFilter('brand', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las marcas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {facets.brands?.map((brand: any) => (
                      <SelectItem key={brand.value} value={brand.value}>
                        {brand.value} ({brand.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rango de precio */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Rango de precio</label>
                <div className="space-y-4">
                  <Slider
                    min={0}
                    max={1000000000}
                    step={10000000}
                    value={[filters.minPrice || 0, filters.maxPrice || 1000000000]}
                    onValueChange={([min, max]) => {
                      updateFilter('minPrice', min);
                      updateFilter('maxPrice', max);
                    }}
                  />
                  <div className="flex justify-between text-sm">
                    <span>${(filters.minPrice || 0).toLocaleString()}</span>
                    <span>${(filters.maxPrice || 1000000000).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Año */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Año</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Desde"
                    value={filters.minYear || ''}
                    onChange={(e) => updateFilter('minYear', Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Hasta"
                    value={filters.maxYear || ''}
                    onChange={(e) => updateFilter('maxYear', Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Transmisión */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Transmisión</label>
                <div className="space-y-2">
                  {['manual', 'automatic', 'semi-automatic'].map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.transmission?.includes(type)}
                        onCheckedChange={(checked) => {
                          const current = filters.transmission || [];
                          if (checked) {
                            updateFilter('transmission', [...current, type]);
                          } else {
                            updateFilter('transmission', current.filter(t => t !== type));
                          }
                        }}
                      />
                      <label htmlFor={type} className="text-sm capitalize">
                        {type.replace('-', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combustible */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Combustible</label>
                <div className="space-y-2">
                  {['gasoline', 'diesel', 'electric', 'hybrid'].map(fuel => (
                    <div key={fuel} className="flex items-center space-x-2">
                      <Checkbox
                        id={fuel}
                        checked={filters.fuelType?.includes(fuel)}
                        onCheckedChange={(checked) => {
                          const current = filters.fuelType || [];
                          if (checked) {
                            updateFilter('fuelType', [...current, fuel]);
                          } else {
                            updateFilter('fuelType', current.filter(f => f !== fuel));
                          }
                        }}
                      />
                      <label htmlFor={fuel} className="text-sm capitalize">
                        {fuel}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
```

### Algoritmo de Relevancia y Ranking

```typescript
// services/ranking.service.ts
export class RankingService {
  // Calcular score de relevancia para un vehículo
  calculateRelevanceScore(vehicle: Vehicle, searchContext: SearchContext): number {
    let score = 0;

    // 1. Coincidencia de búsqueda (0-100 puntos)
    if (searchContext.query) {
      score += this.calculateTextMatchScore(vehicle, searchContext.query);
    }

    // 2. Popularidad (0-50 puntos)
    score += this.calculatePopularityScore(vehicle);

    // 3. Frescura (0-30 puntos)
    score += this.calculateFreshnessScore(vehicle);

    // 4. Calidad del anuncio (0-40 puntos)
    score += this.calculateQualityScore(vehicle);

    // 5. Vendedor confiable (0-30 puntos)
    score += this.calculateSellerScore(vehicle);

    // 6. Boost pagado (multiplicador)
    if (vehicle.is_featured) {
      score *= 2;
    } else if (vehicle.boost_level > 0) {
      score *= (1 + vehicle.boost_level * 0.3);
    }

    // 7. Penalizaciones
    score -= this.calculatePenalties(vehicle);

    return Math.max(0, score);
  }

  private calculateTextMatchScore(vehicle: Vehicle, query: string): number {
    const queryTerms = query.toLowerCase().split(' ');
    let matchScore = 0;

    queryTerms.forEach(term => {
      // Coincidencia exacta en título: 20 puntos
      if (vehicle.title.toLowerCase().includes(term)) {
        matchScore += 20;
      }
      // Coincidencia en marca/modelo: 15 puntos
      if (vehicle.brand.toLowerCase().includes(term) || 
          vehicle.model.toLowerCase().includes(term)) {
        matchScore += 15;
      }
      // Coincidencia en descripción: 5 puntos
      if (vehicle.description?.