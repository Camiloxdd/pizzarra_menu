import { supabase } from "./supabase"

export interface User {
  id: string
  email: string
  nombre: string
  rol: "admin" | "usuario"
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Usuarios de prueba (mientras se configura la tabla en Supabase)
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    nombre: "Administrador",
    rol: "admin",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    email: "chef@example.com",
    password: "chef123",
    nombre: "Chef Juan",
    rol: "usuario",
    created_at: new Date().toISOString(),
  },
]

// Funciones de autenticación
export async function loginUser(email: string, password: string): Promise<AuthResponse | null> {
  try {
    // Intentar primero desde Supabase
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, email, nombre, rol, created_at")
      .eq("email", email)
      .eq("password", password)
      .single()

    if (!error && data) {
      // Login exitoso desde Supabase
      const token = generateToken(data.id, data.email)
      
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_id", data.id)
        localStorage.setItem("user_email", data.email)
        localStorage.setItem("user_name", data.nombre)
        localStorage.setItem("user_role", data.rol)
      }

      return {
        user: data as User,
        token,
      }
    }

    // Si hay error en Supabase, usar usuarios de demo
    const demoUser = (DEMO_USERS as Array<User & { password: string }>).find(
      (u) => u.email === email && u.password === password
    )

    if (demoUser) {
      const token = generateToken(demoUser.id, demoUser.email)
      
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_id", demoUser.id)
        localStorage.setItem("user_email", demoUser.email)
        localStorage.setItem("user_name", demoUser.nombre)
        localStorage.setItem("user_role", demoUser.rol)
      }

      return {
        user: {
          id: demoUser.id,
          email: demoUser.email,
          nombre: demoUser.nombre,
          rol: demoUser.rol,
          created_at: demoUser.created_at,
        },
        token,
      }
    }

    return null
  } catch (error) {
    console.error("Login error:", error)
    // Fallback a usuarios de demo si hay error crítico
    const demoUser = (DEMO_USERS as Array<User & { password: string }>).find(
      (u) => u.email === email && u.password === password
    )

    if (demoUser) {
      const token = generateToken(demoUser.id, demoUser.email)
      
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_id", demoUser.id)
        localStorage.setItem("user_email", demoUser.email)
        localStorage.setItem("user_name", demoUser.nombre)
        localStorage.setItem("user_role", demoUser.rol)
      }

      return {
        user: {
          id: demoUser.id,
          email: demoUser.email,
          nombre: demoUser.nombre,
          rol: demoUser.rol,
          created_at: demoUser.created_at,
        },
        token,
      }
    }

    return null
  }
}

export async function registerUser(
  email: string,
  password: string,
  nombre: string,
  rol: "admin" | "usuario" = "usuario"
): Promise<User | null> {
  try {
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      nombre,
      rol,
      created_at: new Date().toISOString(),
    }

    // Intentar guardar en Supabase
    const { data, error } = await supabase
      .from("usuarios")
      .insert({
        email,
        password,
        nombre,
        rol,
      })
      .select("id, email, nombre, rol, created_at")
      .single()

    if (!error && data) {
      return data as User
    }

    // Fallback: guardar en sessionStorage
    if (typeof window !== "undefined") {
      const users = JSON.parse(sessionStorage.getItem("demo_users") || "[]")
      users.push({ ...newUser, password })
      sessionStorage.setItem("demo_users", JSON.stringify(users))
    }

    return newUser
  } catch (error) {
    console.error("Register error:", error)
    // Fallback: guardar en sessionStorage
    if (typeof window !== "undefined") {
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        nombre,
        rol,
        created_at: new Date().toISOString(),
      }
      const users = JSON.parse(sessionStorage.getItem("demo_users") || "[]")
      users.push({ ...newUser, password })
      sessionStorage.setItem("demo_users", JSON.stringify(users))
      return newUser
    }
    return null
  }
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .update(updates)
      .eq("id", userId)
      .select("id, email, nombre, rol, created_at")
      .single()

    if (!error && data) {
      return data as User
    }

    // Fallback: actualizar en sessionStorage
    if (typeof window !== "undefined") {
      const users = JSON.parse(sessionStorage.getItem("demo_users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === userId)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates }
        sessionStorage.setItem("demo_users", JSON.stringify(users))
        return users[userIndex] as User
      }
    }

    return null
  } catch (error) {
    console.error("Update user error:", error)
    // Fallback: actualizar en sessionStorage
    if (typeof window !== "undefined") {
      const users = JSON.parse(sessionStorage.getItem("demo_users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === userId)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates }
        sessionStorage.setItem("demo_users", JSON.stringify(users))
        return users[userIndex] as User
      }
    }
    return null
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", userId)

    if (!error) {
      return true
    }

    // Fallback: eliminar de sessionStorage
    if (typeof window !== "undefined") {
      const users = JSON.parse(sessionStorage.getItem("demo_users") || "[]")
      const filtered = users.filter((u: any) => u.id !== userId)
      sessionStorage.setItem("demo_users", JSON.stringify(filtered))
      return true
    }

    return false
  } catch (error) {
    console.error("Delete user error:", error)
    // Fallback: eliminar de sessionStorage
    if (typeof window !== "undefined") {
      const users = JSON.parse(sessionStorage.getItem("demo_users") || "[]")
      const filtered = users.filter((u: any) => u.id !== userId)
      sessionStorage.setItem("demo_users", JSON.stringify(filtered))
      return true
    }
    return false
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, email, nombre, rol, created_at")
      .order("created_at", { ascending: false })

    if (!error && data) {
      return (data || []) as User[]
    }

    // Fallback: obtener de sessionStorage y combinar con usuarios de demo
    if (typeof window !== "undefined") {
      const sessionUsers = JSON.parse(sessionStorage.getItem("demo_users") || "[]")
      const allUsers = [...DEMO_USERS.map((u) => ({
        id: u.id,
        email: u.email,
        nombre: u.nombre,
        rol: u.rol,
        created_at: u.created_at,
      })), ...sessionUsers]
      
      // Eliminar duplicados
      const unique = Array.from(
        new Map(allUsers.map((u) => [u.email, u])).values()
      )
      
      return unique.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    return DEMO_USERS.map((u) => ({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      rol: u.rol,
      created_at: u.created_at,
    }))
  } catch (error) {
    console.error("Get users error:", error)
    // Fallback: obtener de sessionStorage y usuarios de demo
    if (typeof window !== "undefined") {
      const sessionUsers = JSON.parse(sessionStorage.getItem("demo_users") || "[]")
      const allUsers = [...DEMO_USERS.map((u) => ({
        id: u.id,
        email: u.email,
        nombre: u.nombre,
        rol: u.rol,
        created_at: u.created_at,
      })), ...sessionUsers]
      
      const unique = Array.from(
        new Map(allUsers.map((u) => [u.email, u])).values()
      )
      
      return unique.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    return DEMO_USERS.map((u) => ({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      rol: u.rol,
      created_at: u.created_at,
    }))
  }
}

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_id")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_name")
    localStorage.removeItem("user_role")
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const userId = localStorage.getItem("user_id")
  const userEmail = localStorage.getItem("user_email")
  const userName = localStorage.getItem("user_name")
  const userRole = localStorage.getItem("user_role")

  if (!userId || !userEmail || !userName || !userRole) {
    return null
  }

  return {
    id: userId,
    email: userEmail,
    nombre: userName,
    rol: userRole as "admin" | "usuario",
    created_at: new Date().toISOString(),
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("auth_token")
}

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("user_role") === "admin"
}

// Generar un token JWT simple (en producción usar jsonwebtoken)
function generateToken(userId: string, email: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = btoa(
    JSON.stringify({
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 horas
    })
  )
  const signature = btoa(`${header}.${payload}`)
  return `${header}.${payload}.${signature}`
}
