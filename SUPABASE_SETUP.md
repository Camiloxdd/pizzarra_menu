# Integración con Supabase - Guía de Configuración

## Paso 1: Obtener la ANON KEY

1. Ve a: https://app.supabase.com/project/nvprqwoqgpfltxpqvwhn/settings/api
2. En la sección "Project API keys", busca "anon public"
3. Copia el token (es largo y comienza con `eyJhbGci...`)
4. Pega el valor en `.env.local` en la variable `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Paso 2: Verificar la estructura de la tabla

La tabla `pedidos_whatsapp` debe tener las siguientes columnas:
- `id`: UUID o STRING (identificador único)
- `cliente`: TEXT (nombre del cliente)
- `telefono`: TEXT (número de teléfono)
- `direccion`: TEXT (dirección de entrega)
- `barrio`: TEXT (barrio)
- `productos`: JSONB o TEXT (array de productos con estructura: `[{nombre: string, cantidad: number, notas?: string}]`)
- `subtotal`: NUMERIC
- `domicilio`: NUMERIC
- `total`: NUMERIC
- `created_at`: TIMESTAMP
- `pendiente`: BOOLEAN (true = en proceso, false = entregado)

## Paso 3: Estructura esperada de productos

Cada producto debe tener:
```json
{
  "nombre": "nombre del producto",
  "cantidad": 2,
  "notas": "observaciones opcionales"
}
```

O si usan otros nombres de campos:
```json
{
  "name": "nombre del producto",
  "quantity": 2,
  "notes": "observaciones opcionales"
}
```

## Paso 4: Recargar la aplicación

Una vez configurada la ANON_KEY, inicia/reinicia el servidor de desarrollo:
```bash
npm run dev
```

Los pedidos deberían cargar automáticamente cuando loguearse en la aplicación.

## Troubleshooting

Si no ves los pedidos:
1. Verifica que la ANON_KEY está correctamente configurada en `.env.local`
2. Abre la consola del navegador (F12) para ver errores
3. Verifica que la tabla `pedidos_whatsapp` existe y tiene datos
4. Comprueba que las políticas de Row Level Security (RLS) de la tabla permiten lectura pública
