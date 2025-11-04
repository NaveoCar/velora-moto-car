import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { vehicleService } from '@/services/vehicle.service';
import type { Vehicle } from '@/types/vehicle.types';
import { 
  MoreVertical, 
  Edit, 
  Pause, 
  Play, 
  Trash, 
  Eye, 
  CheckCircle, 
  Plus,
  Loader2
} from 'lucide-react';

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadVehicles();
  }, [activeTab]);

  async function loadVehicles() {
    try {
      setLoading(true);
      const filters = activeTab !== 'all' ? { status: activeTab } : undefined;
      const data = await vehicleService.getSellerVehicles(undefined, filters);
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los vehículos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(vehicleId: string, newStatus: string) {
    try {
      if (newStatus === 'active') {
        await vehicleService.publishVehicle(vehicleId);
      } else if (newStatus === 'paused') {
        await vehicleService.pauseVehicle(vehicleId);
      } else if (newStatus === 'sold') {
        await vehicleService.markAsSold(vehicleId);
      }

      toast({
        title: 'Estado actualizado',
        description: 'El vehículo ha sido actualizado correctamente',
      });

      loadVehicles();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(vehicleId: string) {
    try {
      await vehicleService.deleteVehicle(vehicleId);
      
      toast({
        title: 'Vehículo eliminado',
        description: 'El vehículo ha sido eliminado correctamente',
      });

      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
      loadVehicles();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el vehículo',
        variant: 'destructive',
      });
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      active: 'default',
      paused: 'outline',
      sold: 'default',
      expired: 'destructive',
    };

    const labels: Record<string, string> = {
      draft: 'Borrador',
      active: 'Activo',
      paused: 'Pausado',
      sold: 'Vendido',
      expired: 'Expirado',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPrimaryImage = (vehicle: Vehicle) => {
    const primaryImage = vehicle.vehicle_images?.find(img => img.is_primary);
    return primaryImage?.thumbnail_url || vehicle.vehicle_images?.[0]?.thumbnail_url || '/placeholder.svg';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Mis Vehículos</h1>
            <p className="text-muted-foreground text-lg">
              Gestiona tus publicaciones de vehículos
            </p>
          </div>
          <Button onClick={() => navigate('/publicar')}>
            <Plus className="h-4 w-4 mr-2" />
            Publicar Vehículo
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="draft">Borradores</TabsTrigger>
            <TabsTrigger value="paused">Pausados</TabsTrigger>
            <TabsTrigger value="sold">Vendidos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {vehicles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">No hay vehículos</h3>
                    <p className="text-muted-foreground mb-4">
                      {activeTab === 'all' 
                        ? 'Aún no has publicado ningún vehículo'
                        : `No tienes vehículos en estado "${activeTab}"`
                      }
                    </p>
                    <Button onClick={() => navigate('/publicar')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Publicar tu primer vehículo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={getPrimaryImage(vehicle)}
                          alt={vehicle.title}
                          className="w-32 h-24 object-cover rounded"
                        />

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{vehicle.title}</h3>
                              <p className="text-muted-foreground">
                                {vehicle.brand} {vehicle.model} • {vehicle.year}
                              </p>
                              <p className="text-xl font-bold mt-1">
                                ${vehicle.price.toLocaleString('es-CO')} COP
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {getStatusBadge(vehicle.status)}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/vehiculo/${vehicle.slug}`)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver publicación
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem onClick={() => navigate(`/editar/${vehicle.id}`)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>

                                  {vehicle.status === 'draft' && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'active')}>
                                      <Play className="mr-2 h-4 w-4" />
                                      Publicar
                                    </DropdownMenuItem>
                                  )}

                                  {vehicle.status === 'active' && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'paused')}>
                                      <Pause className="mr-2 h-4 w-4" />
                                      Pausar
                                    </DropdownMenuItem>
                                  )}

                                  {vehicle.status === 'paused' && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'active')}>
                                      <Play className="mr-2 h-4 w-4" />
                                      Reactivar
                                    </DropdownMenuItem>
                                  )}

                                  {vehicle.status !== 'sold' && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'sold')}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Marcar como vendido
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      setVehicleToDelete(vehicle.id);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {vehicle.views_count} vistas
                            </span>
                            <span>{vehicle.city}, {vehicle.department}</span>
                            <span>
                              Publicado: {new Date(vehicle.created_at).toLocaleDateString('es-CO')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El vehículo será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => vehicleToDelete && handleDelete(vehicleToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}