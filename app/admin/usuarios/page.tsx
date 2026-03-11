"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UsersManagement } from "@/components/users-management"
import { isAdmin, getCurrentUser } from "@/lib/auth-service"
import Link from "next/link"

export default function AdminUsersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    setIsAuthenticated(!!user)
    setIsAdminUser(isAdmin())
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Debes iniciar sesión primero</p>
          <Link href="/">
            <Button>Volver al dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdminUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">No tienes permiso para acceder a esta página</p>
          <Link href="/">
            <Button>Volver al dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-border">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Administración</h1>
        </div>

        {/* Content */}
        <div className="p-6">
          <UsersManagement />
        </div>
      </div>
    </div>
  )
}
