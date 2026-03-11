"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, X } from "lucide-react"
import type { User } from "@/lib/auth-service"
import { getAllUsers, registerUser, deleteUser as deleteUserFromDB, updateUser, isAdmin } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface UserFormData {
  email: string
  password: string
  nombre: string
  rol: "admin" | "usuario"
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    nombre: "",
    rol: "usuario",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Verificar si es admin
  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive">No tienes permiso para acceder a esta página</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const data = await getAllUsers()
    setUsers(data)
    setLoading(false)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.email || !formData.password || !formData.nombre) {
      setError("Completa todos los campos")
      return
    }

    const newUser = await registerUser(
      formData.email,
      formData.password,
      formData.nombre,
      formData.rol
    )

    if (newUser) {
      setSuccess("Usuario creado exitosamente")
      setFormData({ email: "", password: "", nombre: "", rol: "usuario" })
      setIsOpen(false)
      loadUsers()
    } else {
      setError("Error al crear el usuario. Verifica que el email no exista.")
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!editingUser) return

    if (!formData.nombre) {
      setError("Completa todos los campos")
      return
    }

    const updated = await updateUser(editingUser.id, {
      nombre: formData.nombre,
      rol: formData.rol,
    })

    if (updated) {
      setSuccess("Usuario actualizado exitosamente")
      setEditingUser(null)
      setFormData({ email: "", password: "", nombre: "", rol: "usuario" })
      setIsOpen(false)
      loadUsers()
    } else {
      setError("Error al actualizar el usuario")
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return

    const success = await deleteUserFromDB(deletingUser.id)

    if (success) {
      setSuccess("Usuario eliminado exitosamente")
      setDeletingUser(null)
      loadUsers()
    } else {
      setError("Error al eliminar el usuario")
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: "",
      nombre: user.nombre,
      rol: user.rol,
    })
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
    setEditingUser(null)
    setFormData({ email: "", password: "", nombre: "", rol: "usuario" })
    setError("")
    setSuccess("")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de usuarios</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingUser(null)}>
              <Plus className="size-4 mr-2" />
              Nuevo usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar usuario" : "Crear nuevo usuario"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={editingUser ? handleUpdateUser : handleAddUser}
              className="flex flex-col gap-4"
            >
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Ej: Chef Juan"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="juan@example.com"
                  disabled={!!editingUser}
                />
              </div>

              {!editingUser && (
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="rol">Rol</Label>
                <Select value={formData.rol} onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    rol: value as "admin" | "usuario",
                  })
                }>
                  <SelectTrigger id="rol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-600 bg-green-100 p-2 rounded">
                  {success}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  {editingUser ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                    Rol
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                    Registro
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground font-medium">
                      {user.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        variant={user.rol === "admin" ? "default" : "secondary"}
                      >
                        {user.rol === "admin" ? "Admin" : "Usuario"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingUser(user)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar a {deletingUser?.nombre}? Esta acción
            no se puede deshacer.
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel className="flex-1">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
