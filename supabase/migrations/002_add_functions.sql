-- Función para incrementar vistas de vehículo
CREATE OR REPLACE FUNCTION increment_vehicle_views(vehicle_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE vehicles 
  SET views_count = views_count + 1
  WHERE id = vehicle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener vehículos destacados
CREATE OR REPLACE FUNCTION get_featured_vehicles(limit_count INTEGER DEFAULT 6)
RETURNS SETOF vehicles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM vehicles
  WHERE status = 'active' 
    AND is_featured = true
    AND (featured_until IS NULL OR featured_until > NOW())
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar vehículos por texto
CREATE OR REPLACE FUNCTION search_vehicles(search_query TEXT)
RETURNS SETOF vehicles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM vehicles
  WHERE status = 'active'
    AND (
      title ILIKE '%' || search_query || '%'
      OR brand ILIKE '%' || search_query || '%'
      OR model ILIKE '%' || search_query || '%'
      OR description ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    CASE 
      WHEN title ILIKE '%' || search_query || '%' THEN 1
      WHEN brand ILIKE '%' || search_query || '%' THEN 2
      WHEN model ILIKE '%' || search_query || '%' THEN 3
      ELSE 4
    END,
    is_featured DESC,
    created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;