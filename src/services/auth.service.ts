import { supabase } from '@/integrations/supabase/client';
import type { 
  RegisterData, 
  LoginData, 
  Profile, 
  SellerUpgradeData 
} from '@/types/auth.types';

export class AuthService {
  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterData) {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (authError) throw authError;

    // El perfil se crea automáticamente con un trigger en Supabase
    // Ver: supabase/migrations/create_profile_trigger.sql

    return authData;
  }

  /**
   * Iniciar sesión
   */
  async login(data: LoginData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (error) throw error;

    // Cargar perfil completo
    const profile = await this.getProfile(authData.user.id);
    
    return { ...authData, profile };
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  /**
   * Obtener perfil completo con datos de vendedor si aplica
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        seller_details (*)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return null;
    }

    return data as Profile;
  }

  /**
   * Actualizar perfil
   */
  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Upgrade a vendedor
   */
  async upgradeToSeller(userId: string, sellerData: SellerUpgradeData) {
    // 1. Actualizar rol en profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'seller' })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 2. Crear seller_details
    const { data, error } = await supabase
      .from('seller_details')
      .insert({
        profile_id: userId,
        business_name: sellerData.business_name,
        business_type: sellerData.business_type,
        ruc_dni: sellerData.ruc_dni,
        address: sellerData.address,
        city: sellerData.city,
        department: sellerData.department,
        active: true
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Subir documento de verificación
   */
  async uploadVerificationDocument(
    userId: string, 
    file: File, 
    documentType: 'dni' | 'ruc' | 'license' | 'utility_bill'
  ) {
    // 1. Subir archivo a Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 2. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(uploadData.path);

    // 3. Guardar referencia en DB
    const { data, error } = await supabase
      .from('verification_documents')
      .insert({
        profile_id: userId,
        document_type: documentType,
        document_url: publicUrl,
        status: 'pending' as const
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Verificar email
   */
  async verifyEmail(token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) throw error;
    return data;
  }

  /**
   * Solicitar reset de contraseña
   */
  async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) throw error;
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  }

  /**
   * Suscribirse a cambios de autenticación
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// Exportar instancia singleton
export const authService = new AuthService();