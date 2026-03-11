-- Crear tabla de usuarios para CocinaFlow
-- Ejecuta este script en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice en email para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Crear índice en rol para filtrar por administradores
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Insertar usuarios de prueba (opcional - comentar si no quieres datos de prueba)
-- Nota: En producción, hashear las contraseñas con bcrypt o similar
INSERT INTO usuarios (email, password, nombre, rol) VALUES
  ('admin@example.com', 'admin123', 'Administrador', 'admin'),
  ('chef@example.com', 'chef123', 'Chef Juan', 'usuario')
ON CONFLICT (email) DO NOTHING;

-- Habilitar Row Level Security (RLS) si lo deseas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Crear políticas de RLS (opcional)
CREATE POLICY "Allow users to view their own profile" ON usuarios
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Allow admins to manage all users" ON usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND rol = 'admin'
    )
  );
