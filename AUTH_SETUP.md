# Sistema de Autenticación JWT - Guía de Implementación

## 📋 Resumen

Se ha implementado un sistema de autenticación completo con:
- ✅ Login con email y contraseña (sin acceso rápido)
- ✅ Sistema de roles (Admin y Usuario)
- ✅ CRUD de usuarios para administradores
- ✅ JWT para mantener sesiones
- ✅ Protección de rutas administrativas

## 🔧 Requisitos Previos

1. **Tabla de usuarios en Supabase**
   - Ejecuta el script `SETUP_USUARIOS.sql` en el SQL Editor de Supabase
   - O copia y pega manualmente los comandos SQL

## 📝 Configuración

### 1. Crear la tabla de usuarios en Supabase

Ve a tu proyecto Supabase → SQL Editor → crea una nueva queries y ejecuta:

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

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Insertar usuarios de prueba (opcional)
INSERT INTO usuarios (email, password, nombre, rol) VALUES
  ('admin@example.com', 'admin123', 'Administrador', 'admin'),
  ('chef@example.com', 'chef123', 'Chef Juan', 'usuario')
ON CONFLICT (email) DO NOTHING;
```

### 2. Usuarios de prueba (después de ejecutar el SQL)

```
Para Admin:
- Email: admin@example.com
- Contraseña: admin123

Para Usuario:
- Email: chef@example.com
- Contraseña: chef123
```

## 🚀 Características

### Login
- Campo de email y contraseña
- Sin acceso rápido (más seguro)
- Notificaciones de error claras
- La sesión se guarda en localStorage

### Panel de Administración
- Accesible solo para usuarios con rol "admin"
- URL: `/admin/usuarios`
- Botón con ícono de rueda en el header (solo para admins)

### Gestión de Usuarios (CRUD)
- **Ver**: Lista de todos los usuarios registrados
- **Crear**: Agregar nuevos usuarios con rol
- **Editar**: Cambiar nombre y rol (email no editable)
- **Eliminar**: Remover usuarios del sistema

## 🔐 Seguridad (Notas Importantes)

⚠️ **IMPORTANTE**: En producción, implementa estas mejoras:

1. **Hash de contraseña**: Usa bcrypt en el backend
2. **JWT real**: Usa librería `jsonwebtoken` en lugar de base64
3. **HTTPS**: Siempre usa conexión segura
4. **Backend**: Mueve la autenticación a un backend (Node.js/Python/etc)
5. **Tokens con expiración**: Implementa refresh tokens
6. **Rate limiting**: Limita intentos de login

## 📂 Archivos Nuevos/Modificados

### Nuevos:
- `lib/auth-service.ts` - Servicios de autenticación
- `components/users-management.tsx` - CRUD de usuarios
- `app/admin/usuarios/page.tsx` - Página de administración
- `SETUP_USUARIOS.sql` - Script SQL
- `AUTH_SETUP.md` - Esta documentación

### Modificados:
- `components/login-screen.tsx` - Nuevo login sin acceso rápido
- `components/kitchen-header.tsx` - Agregado botón de admin
- `app/page.tsx` - Integración con autenticación JWT

## 🔄 Flujo de Autenticación

```
1. Usuario ingresa email y contraseña en login
2. loginUser() valida contra Supabase
3. Si es válido:
   - Genera JWT
   - Guarda token en localStorage
   - Redirige al dashboard
4. En cada sesión:
   - Verifica si hay token valido
   - Si no hay, muestra login
   - Si hay, carga dashboard y datos

5. En logout:
   - Borra token de localStorage
   - Redirige a login
```

## 🛠️ API de Autenticación

### Principales funciones:

```typescript
// Login
loginUser(email: string, password: string): Promise<AuthResponse>

// Registrar usuario (solo admins)
registerUser(email, password, nombre, rol): Promise<User>

// Actualizar usuario
updateUser(userId, updates): Promise<User>

// Eliminar usuario
deleteUser(userId): Promise<boolean>

// Obtener todos los usuarios
getAllUsers(): Promise<User[]>

// Obtener usuario actual
getCurrentUser(): User | null

// Verificar autenticación
isAuthenticated(): boolean

// Verificar si es admin
isAdmin(): boolean

// Logout
logoutUser(): void
```

## 📱 Interfaz de Usuario

### Login:
- Email input
- Contraseña input (con toggle show/hide)
- Botón Entrar
- Mensaje de error si credenciales son incorrectas

### Dashboard (con cambios):
- Nuevo botón de admin (rueda) en header
- Botón de logout mejorado

### Panel de Admin (`/admin/usuarios`):
- Tabla de usuarios
- Botón "Nuevo usuario"
- Botones de editar y eliminar por usuario
- Modal de crear/editar usuario
- Confirmación antes de eliminar

## 🐛 Troubleshooting

**P: Me sale "Credenciales incorrectas" aunque escribí bien**
- R: Verifica que la tabla exista en Supabase
- R: Comprueba que los datos coincidan exactamente (mayúsculas/minúsculas)
- R: Revisa la consola del navegador para más detalles

**P: No veo el botón de admin**
- R: Verifica que tu usuario tenga rol = 'admin' en Supabase
- R: Recarga la página (Ctrl+F5)

**P: Puedo acceder a /admin/usuarios aunque no soy admin**
- R: La validación está en el cliente; agrega validación en el backend para mayor seguridad

## 🎯 Próximos Pasos Recomendados

1. ✅ Crear tabla de usuarios en Supabase
2. ✅ Probar login con usuarios de ejemplo
3. ✅ Probar CRUD de usuarios en panel admin
4. ⭕ Implementar backend seguro para autenticación
5. ⭕ Usar hash para contraseñas (bcrypt)
6. ⭕ Implementar JWT real con expiración
7. ⭕ Agregar 2FA (autenticación de dos factores)

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador (F12)
2. Verifica los logs de Supabase
3. Asegúrate de que la tabla existay tenga datos
4. Comprueba que las variables de entorno estén configuradas
