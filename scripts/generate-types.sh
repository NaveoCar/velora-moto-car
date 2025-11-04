#!/bin/bash

# Script para regenerar tipos de Supabase
# Uso: ./scripts/generate-types.sh

PROJECT_ID="bhsebdziddckcoelteyq"

echo "🔄 Regenerando tipos de Supabase..."
echo "Project ID: $PROJECT_ID"
echo ""

npx supabase gen types typescript --project-id $PROJECT_ID > src/integrations/supabase/types.ts

if [ $? -eq 0 ]; then
    echo "✅ Tipos generados exitosamente en src/integrations/supabase/types.ts"
else
    echo "❌ Error al generar tipos"
    exit 1
fi