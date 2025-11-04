# Guía de Configuración de Supabase

## 📋 Pasos para Configurar la Base de Datos

### 1. Acceder al SQL Editor de Supabase

1. Ve a tu proyecto en https://app.supabase.com
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **New Query**

### 2. Ejecutar la Migración

1. Abre el archivo `supabase/migrations/001_initial_schema.sql`
2. Copia TODO el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona Ctrl/Cmd + Enter)

⏱️ **Tiempo estimado**: 10-15 segundos

### 3. Verificar que se Crearon las Tablas

En el menú lateral de Supabase, ve a **Table Editor** y deberías ver:

- ✅ profiles
- ✅ seller_details
- ✅ verification_documents
- ✅ vehicles
- ✅ vehicle_images
- ✅ vehicle_features
- ✅ vehicle_history

### 4. Verificar Storage Buckets

1. Ve a **Storage** en el menú lateral
2. Deberías ver dos buckets:
   - ✅ vehicle-images (público)
   - ✅ verification-documents (privado)

### 5. Regenerar Tipos de TypeScript

Ahora que las tablas existen, necesitas regenerar los tipos:

```bash
# Opción 1: Usando Supabase CLI (recomendado)
npx supabase gen types typescript --project-id [bhsebdziddckcoelteyq] > src/integrations/supabase/types.ts

# Opción 2: Desde el dashboard de Supabase
# 1. Ve a Settings > API
# 2. Copia el Project ID
# 3. Ejecuta el comando de arriba con tu Project ID
```

**¿Dónde encontrar tu Project ID?**
- Dashboard de Supabase > Settings > General > Reference ID

### 6. Verificar la Configuración

Ejecuta este comando para verificar que todo está funcionando:

```bash
npm run dev
```

Los errores de TypeScript en `auth.service.ts` deberían desaparecer después de regenerar los tipos.

## 🧪 Probar la Configuración

### Crear un Usuario de Prueba

Puedes crear un usuario de prueba desde el SQL Editor:

```sql
-- Esto creará un usuario y su perfil automáticamente gracias al trigger
-- Nota: Usa el Authentication de Supabase en producción
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Usuario de Prueba", "phone": "3001234567"}'::jsonb
);
```

O mejor aún, usa la interfaz de Supabase:
1. Ve a **Authentication** > **Users**
2. Haz clic en **Add User**
3. Ingresa email y contraseña

## 🔍 Consultas Útiles para Verificar

```sql
-- Ver todos los perfiles
SELECT * FROM public.profiles;

-- Ver estructura de la tabla vehicles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vehicles';

-- Verificar que los triggers funcionan
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Ver políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## ⚠️ Solución de Problemas

### Error: "relation already exists"
**Solución**: Algunas tablas ya existen. Puedes:
1. Eliminar las tablas existentes y volver a ejecutar
2. O comentar las líneas que dan error

### Error: "permission denied"
**Solución**: Asegúrate de estar usando el SQL Editor como admin

### Error: "function already exists"
**Solución**: Las funciones ya existen. Puedes ignorar o usar `CREATE OR REPLACE`

### Los tipos de TypeScript siguen con errores
**Solución**: 
1. Verifica que ejecutaste el comando de regeneración de tipos
2. Reinicia el servidor de desarrollo (`npm run dev`)
3. Reinicia VS Code si es necesario

## 📊 Estructura de la Base de Datos

### Tablas Principales

```
auth.users (Supabase)
    ↓
profiles (1:1)
    ↓
seller_details (1:1 opcional)
    ↓
vehicles (1:N)
    ↓
vehicle_images (1:N)
vehicle_features (1:N)
vehicle_history (1:N)
```

### Relaciones Clave

- Un **usuario** tiene un **perfil**
- Un **perfil** puede tener **seller_details** (si es vendedor)
- Un **vendedor** puede tener múltiples **vehículos**
- Un **vehículo** puede tener múltiples **imágenes** y **características**

## 🔐 Seguridad (RLS)

Todas las tablas tienen Row Level Security (RLS) habilitado:

- ✅ Los usuarios solo pueden ver vehículos activos o sus propios vehículos
- ✅ Los vendedores solo pueden modificar sus propios vehículos
- ✅ Los perfiles son públicos pero solo editables por el dueño
- ✅ Las imágenes y documentos están protegidos por políticas de storage

## 📝 Próximos Pasos

Una vez completada la configuración:

1. ✅ Regenerar tipos de TypeScript
2. ✅ Verificar que no hay errores en el código
3. ✅ Crear las páginas de Login y Registro
4. ✅ Integrar el AuthProvider en la aplicación
5. ✅ Probar el registro y login de usuarios

---

**¿Necesitas ayuda?** Revisa el archivo `IMPLEMENTATION_STATUS.md` para más detalles.