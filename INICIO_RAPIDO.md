# 🚀 Sistema de Autenticación - Guía Rápida de Inicio

## 🎯 ¿Por qué veo error de login?

El sistema tiene un **fallback automático** para que funcione incluso sin la tabla de Supabase. Los cambios que implementé permiten que uses el sistema inmediatamente con usuarios de prueba.

## ✅ Acceso Inmediato

Puedes entrar AHORA mismo con estas credenciales:

### 👨‍💼 **Administrador**
```
Email: admin@example.com
Contraseña: admin123
```

### 👨‍🍳 **Usuario estándar**
```
Email: chef@example.com
Contraseña: chef123
```

## 🔧 Sistema de Fallback

El sistema funciona en 3 capas:

1. **Capa 1: Supabase (cuando esté configurado)**
   - Autentica contra la tabla `usuarios` en Supabase
   - Los datos se sincronizarán automáticamente

2. **Capa 2: Usuarios de Demo (siempre disponible)**
   - `admin@example.com` / `admin123`
   - `chef@example.com` / `chef123`
   - Funcionan incluso sin Supabase

3. **Capa 3: SessionStorage (para nuevos usuarios)**
   - Nuevos usuarios se guardan en sessionStorage
   - Persisten durante la sesión actual

## 📊 Gestión de Usuarios

### ✅ Funciona ahora (sin Supabase):
- ✅ Login con usuarios de demo
- ✅ Ver lista de usuarios
- ✅ Crear nuevos usuarios (se guardan en sessionStorage)
- ✅ Editar usuarios
- ✅ Eliminar usuarios
- ✅ Panel de administración

### ⚠️ Nota importante:
Los usuarios nuevos que crees se guardan en `sessionStorage`, que significa que se pierden al cerrar el navegador. Cuando configures Supabase, se guardarán permanentemente en la base de datos.

## 🔐 Configurar Supabase (Opcional pero recomendado)

### Paso 1: Abre Supabase
1. Ve a tu proyecto en Supabase
2. Click en **SQL Editor**
3. Crea una nueva query

### Paso 2: Copia y ejecuta el SQL
Ve al archivo `SETUP_USUARIOS.sql` en el proyecto y copia todo el contenido, luego pégalo en Supabase y ejecuta.

O copia este SQL:

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
```

### Paso 3: ¡Listo!
Una vez ejecutado el SQL, el sistema automáticamente:
- ✅ Usará Supabase en lugar del fallback
- ✅ Sincronizará los usuarios que crees
- ✅ Los datos persistirán después de cercarre sesión

## 🎛️ Panel de Administración

### Acceso:
- **URL**: http://localhost:3001/admin/usuarios
- **Requiere**: Estar logueado como admin
- **Botón**: Click en el ícono de rueda en el header

### Funciones:
- 📋 Ver todos los usuarios registrados
- ➕ Agregar nuevos usuarios
- ✏️ Editar nombre y rol
- 🗑️ Eliminar usuarios

## 🔄 Flujo Completo sin Supabase

1. Abre http://localhost:3001
2. Ingresa: `admin@example.com` / `admin123`
3. ¡Ya estás dentro! Puedes ver todos los pedidos
4. Click en la rueda (settings) → Ir a administración
5. Crea nuevos usuarios si lo necesitas

## 🚨 Errores Comunes

### "Login error: {}"
- **Causa**: La tabla no existe en Supabase (normal)
- **Solución**: Usa los usuarios de demo proporcionados
- **O**: Configura Supabase según los pasos anteriores

### Nuevos usuarios se pierden al recargar
- **Causa**: Se guardan en sessionStorage, no en la BD
- **Solución**: Configura Supabase para almacenamiento permanente

### No veo el botón de admin
- **Causa**: Tu usuario no tiene rol 'admin'
- **Solución**: Únicamente editar en Supabase o usa admin@example.com

## 📱 Resumen Rápido

| Característica | Sin Supabase | Con Supabase |
|---|---|---|
| Login | ✅ Demo users | ✅ BD + Demo |
| Crear usuarios | ✅ SessionStorage | ✅ BD permanente |
| Panel admin | ✅ Funciona | ✅ Funciona |
| Datos persisten | ❌ Session | ✅ Permanente |

## 💡 Next Steps

1. ✅ Prueba el login ahora mismo: `admin@example.com` / `admin123`
2. ⭕ Prueba crear un usuario nuevo en el panel admin
3. ⭕ (Opcional) Configura Supabase para almacenamiento permanente
4. ⭕ Cambia las contraseñas de los usuarios de demo

¡Disfruta del sistema! 🎉
