import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('buyer' | 'seller' | 'admin')[];
  requireVerification?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireVerification = false 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Mostrar loader mientras se carga el estado de autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Verificar si el email está verificado (si es requerido)
  if (requireVerification && !profile?.email_verified) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center">
          <div className="mb-4">
            <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mx-auto">
              <svg
                className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Verifica tu email</h2>
          <p className="text-muted-foreground mb-4">
            Necesitas verificar tu dirección de email antes de acceder a esta página.
            Revisa tu bandeja de entrada y haz clic en el enlace de verificación.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="text-primary hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Verificar roles permitidos
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center">
          <div className="mb-4">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground mb-4">
            No tienes permisos para acceder a esta página.
            {profile.role === 'buyer' && allowedRoles.includes('seller') && (
              <span className="block mt-2">
                ¿Quieres vender vehículos?{' '}
                <a href="/upgrade-to-seller" className="text-primary hover:underline">
                  Conviértete en vendedor
                </a>
              </span>
            )}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="text-primary hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Si pasa todas las validaciones, renderizar el contenido
  return <>{children}</>;
}