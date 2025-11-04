import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '@/services/auth.service';
import type { Profile } from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario al montar
  useEffect(() => {
    loadUser();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        } else if (event === 'USER_UPDATED' && session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadUser() {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        await loadProfile(currentUser.id);
      }
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err instanceof Error ? err.message : 'Error loading user');
    } finally {
      setLoading(false);
    }
  }

  async function loadProfile(userId: string) {
    try {
      const userProfile = await authService.getProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setError(null);
      setLoading(true);
      const { user: authUser, profile: userProfile } = await authService.login({
        email,
        password
      });
      setUser(authUser);
      setProfile(userProfile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullName: string, phone?: string) {
    try {
      setError(null);
      setLoading(true);
      await authService.register({
        email,
        password,
        fullName,
        phone
      });
      // El usuario debe verificar su email antes de poder iniciar sesión
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrarse';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
      setProfile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(message);
      throw err;
    }
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id);
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}