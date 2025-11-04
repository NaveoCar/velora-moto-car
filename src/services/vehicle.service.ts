import { supabase } from '@/integrations/supabase/client';
import type { 
  Vehicle, 
  VehicleCreateData, 
  VehicleFilters 
} from '@/types/vehicle.types';

export class VehicleService {
  /**
   * Crear un nuevo vehículo
   */
  async createVehicle(data: VehicleCreateData, images: File[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // 1. Generar slug único
    const slug = this.generateSlug(data.title);

    // 2. Crear vehículo en la base de datos
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .insert({
        seller_id: user.id,
        title: data.title,
        slug,
        description: data.description,
        type: data.type,
        brand: data.brand,
        model: data.model,
        year: data.year,
        price: data.price,
        negotiable: data.negotiable ?? true,
        mileage: data.mileage,
        transmission: data.transmission,
        fuel_type: data.fuel_type,
        engine_size: data.engine_size,
        color: data.color,
        doors: data.doors,
        seats: data.seats,
        condition: data.condition,
        owners_count: data.owners_count ?? 1,
        accident_history: data.accident_history ?? false,
        service_history: data.service_history ?? false,
        city: data.city,
        department: data.department,
        address: data.address,
        status: 'draft'
      })
      .select()
      .single();

    if (vehicleError) throw vehicleError;

    // 3. Subir imágenes si hay
    if (images.length > 0) {
      await this.uploadVehicleImages(vehicle.id, images);
    }

    // 4. Registrar en historial
    await this.addHistory(vehicle.id, 'created', data);

    return vehicle;
  }

  /**
   * Actualizar un vehículo existente
   */
  async updateVehicle(vehicleId: string, updates: Partial<VehicleCreateData>) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId)
      .select()
      .single();

    if (error) throw error;

    await this.addHistory(vehicleId, 'updated', updates);

    return data;
  }

  /**
   * Publicar vehículo (cambiar de draft a active)
   */
  async publishVehicle(vehicleId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 días por defecto

    const { data, error } = await supabase
      .from('vehicles')
      .update({
        status: 'active',
        published_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .eq('id', vehicleId)
      .select()
      .single();

    if (error) throw error;

    await this.addHistory(vehicleId, 'published', { status: 'active' });

    return data;
  }

  /**
   * Pausar vehículo
   */
  async pauseVehicle(vehicleId: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({ status: 'paused' })
      .eq('id', vehicleId)
      .select()
      .single();

    if (error) throw error;

    await this.addHistory(vehicleId, 'paused', { status: 'paused' });

    return data;
  }

  /**
   * Marcar como vendido
   */
  async markAsSold(vehicleId: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        status: 'sold',
        sold_at: new Date().toISOString()
      })
      .eq('id', vehicleId)
      .select()
      .single();

    if (error) throw error;

    await this.addHistory(vehicleId, 'sold', { status: 'sold' });

    return data;
  }

  /**
   * Eliminar vehículo
   */
  async deleteVehicle(vehicleId: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId);

    if (error) throw error;
  }

  /**
   * Obtener vehículo por ID
   */
  async getVehicleById(vehicleId: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_images (
          id,
          url,
          thumbnail_url,
          medium_url,
          position,
          is_primary
        ),
        profiles!seller_id (
          id,
          full_name,
          avatar_url,
          seller_details (
            business_name,
            rating,
            response_time_hours
          )
        )
      `)
      .eq('id', vehicleId)
      .single();

    if (error) {
      console.error('Error fetching vehicle:', error);
      return null;
    }

    return data as unknown as Vehicle;
  }

  /**
   * Obtener vehículo por slug
   */
  async getVehicleBySlug(slug: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_images (
          id,
          url,
          thumbnail_url,
          medium_url,
          position,
          is_primary
        ),
        profiles!seller_id (
          id,
          full_name,
          avatar_url,
          seller_details (
            business_name,
            rating,
            response_time_hours
          )
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching vehicle:', error);
      return null;
    }

    // Incrementar contador de vistas
    await this.incrementViews(data.id);

    return data as unknown as Vehicle;
  }

  /**
   * Obtener vehículos del vendedor
   */
  async getSellerVehicles(sellerId?: string, filters?: VehicleFilters) {
    const { data: { user } } = await supabase.auth.getUser();
    const targetSellerId = sellerId || user?.id;

    if (!targetSellerId) throw new Error('Seller ID requerido');

    let query = supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_images (
          url,
          thumbnail_url,
          is_primary
        )
      `)
      .eq('seller_id', targetSellerId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data as unknown as Vehicle[];
  }

  /**
   * Obtener vehículos activos (para listado público)
   */
  async getActiveVehicles(filters?: VehicleFilters) {
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_images (
          url,
          thumbnail_url,
          is_primary
        ),
        profiles!seller_id (
          full_name,
          seller_details (
            business_name,
            rating
          )
        )
      `)
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.brand) {
      query = query.eq('brand', filters.brand);
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.minYear) {
      query = query.gte('year', filters.minYear);
    }

    if (filters?.maxYear) {
      query = query.lte('year', filters.maxYear);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data as unknown as Vehicle[];
  }

  /**
   * Subir imágenes del vehículo
   */
  async uploadVehicleImages(vehicleId: string, files: File[]) {
    const uploadPromises = files.map(async (file, index) => {
      // 1. Subir a Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${vehicleId}/${Date.now()}_${index}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(uploadData.path);

      // 3. Guardar en base de datos
      const { error: dbError } = await supabase
        .from('vehicle_images')
        .insert({
          vehicle_id: vehicleId,
          url: publicUrl,
          thumbnail_url: `${publicUrl}?width=300`,
          medium_url: `${publicUrl}?width=800`,
          position: index,
          is_primary: index === 0
        });

      if (dbError) throw dbError;

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Eliminar imagen
   */
  async deleteVehicleImage(imageId: string, imagePath: string) {
    // 1. Eliminar de storage
    const { error: storageError } = await supabase.storage
      .from('vehicle-images')
      .remove([imagePath]);

    if (storageError) console.error('Error deleting from storage:', storageError);

    // 2. Eliminar de base de datos
    const { error: dbError } = await supabase
      .from('vehicle_images')
      .delete()
      .eq('id', imageId);

    if (dbError) throw dbError;
  }

  /**
   * Incrementar contador de vistas
   */
  private async incrementViews(vehicleId: string) {
    const { error } = await supabase.rpc('increment_vehicle_views', {
      vehicle_id: vehicleId
    });

    if (error) console.error('Error incrementing views:', error);
  }

  /**
   * Agregar al historial
   */
  private async addHistory(
    vehicleId: string,
    action: 'created' | 'updated' | 'published' | 'paused' | 'sold',
    changes: any
  ) {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('vehicle_history')
      .insert({
        vehicle_id: vehicleId,
        user_id: user?.id,
        action,
        changes
      });

    if (error) console.error('Error adding history:', error);
  }

  /**
   * Generar slug único
   */
  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${baseSlug}-${Date.now()}`;
  }
}

// Exportar instancia singleton
export const vehicleService = new VehicleService();