import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Vehicles from "./pages/Vehicles";
import PublishVehicle from "./pages/PublishVehicle";
import VehicleDetails from "./pages/VehicleDetails";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/vehiculos" element={<Vehicles />} />
            <Route path="/vehiculo/:id" element={<VehicleDetails />} />
            
            {/* Rutas de autenticación */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Rutas protegidas - Solo vendedores */}
            <Route
              path="/publicar"
              element={
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <PublishVehicle />
                </ProtectedRoute>
              }
            />
            
            {/* Ruta catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
