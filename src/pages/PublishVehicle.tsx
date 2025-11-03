import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

const PublishVehicle = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    brand: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    city: "",
    transmission: "",
    fuelType: "",
    color: "",
    doors: "",
    condition: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast({
        title: "Límite de imágenes",
        description: "Puedes subir máximo 10 imágenes",
        variant: "destructive",
      });
      return;
    }

    setImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validación básica
      if (!formData.title || !formData.type || !formData.price || images.length === 0) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa todos los campos obligatorios y añade al menos una imagen",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Aquí se implementaría la lógica de subida a Supabase
      // Por ahora simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "¡Vehículo publicado!",
        description: "Tu vehículo ha sido publicado exitosamente",
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al publicar tu vehículo. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Publicar vehículo</h1>
          <p className="text-muted-foreground text-lg">
            Completa la información de tu vehículo para publicarlo en Naveo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imágenes */}
          <Card>
            <CardHeader>
              <CardTitle>Imágenes del vehículo</CardTitle>
              <CardDescription>Añade hasta 10 fotos de tu vehículo (obligatorio)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 10 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Añadir foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del anuncio *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ej: BMW Serie 5 2023"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de vehículo *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="brand">Marca *</Label>
                  <Input
                    id="brand"
                    name="brand"
                    placeholder="Ej: BMW"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    name="model"
                    placeholder="Ej: Serie 5"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Año *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    placeholder="2023"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Precio (COP) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="185000000"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage">Kilometraje</Label>
                  <Input
                    id="mileage"
                    name="mileage"
                    type="number"
                    placeholder="15000"
                    value={formData.mileage}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Bogotá"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe las características y estado de tu vehículo..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Características técnicas */}
          <Card>
            <CardHeader>
              <CardTitle>Características técnicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmisión</Label>
                  <Select value={formData.transmission} onValueChange={(value) => handleSelectChange("transmission", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automática">Automática</SelectItem>
                      <SelectItem value="Semiautomática">Semiautomática</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelType">Tipo de combustible</Label>
                  <Select value={formData.fuelType} onValueChange={(value) => handleSelectChange("fuelType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gasolina">Gasolina</SelectItem>
                      <SelectItem value="Diésel">Diésel</SelectItem>
                      <SelectItem value="Eléctrico">Eléctrico</SelectItem>
                      <SelectItem value="Híbrido">Híbrido</SelectItem>
                      <SelectItem value="Gas">Gas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    name="color"
                    placeholder="Negro"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doors">Número de puertas</Label>
                  <Input
                    id="doors"
                    name="doors"
                    type="number"
                    placeholder="4"
                    value={formData.doors}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Estado</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nuevo">Nuevo</SelectItem>
                      <SelectItem value="Usado - Excelente">Usado - Excelente</SelectItem>
                      <SelectItem value="Usado - Bueno">Usado - Bueno</SelectItem>
                      <SelectItem value="Usado - Regular">Usado - Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nombre completo *</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    placeholder="Juan Pérez"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Teléfono *</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    placeholder="3001234567"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="contactEmail">Correo electrónico *</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Publicando..." : "Publicar vehículo"}
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default PublishVehicle;