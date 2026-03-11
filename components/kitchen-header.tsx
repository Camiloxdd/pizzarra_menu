"use client"

import { ChefHat, Clock, LogOut, User, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { isAdmin } from "@/lib/auth-service"
import Link from "next/link"

interface KitchenHeaderProps {
  userName: string
  activeOrderCount: number
  onLogout: () => void
}

export function KitchenHeader({ userName, activeOrderCount, onLogout }: KitchenHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setIsAdminUser(isAdmin())
  }, [])

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
          <ChefHat className="size-5 text-primary-foreground" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-base font-bold tracking-tight text-foreground">Pizzarra la Piedra</h1>
        </div>
        <div className="hidden h-5 w-px bg-border lg:block" />
        <span className="hidden text-sm text-muted-foreground lg:block">
          {activeOrderCount} {activeOrderCount === 1 ? "pedido activo" : "pedidos activos"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-4" />
          <time className="text-sm font-mono tabular-nums">
            {currentTime.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </time>
        </div>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm text-foreground">
            <User className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">{userName}</span>
          </span>
          {isAdminUser && (
            <Link href="/admin/usuarios">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                title="Administración"
              >
                <Settings className="size-4" />
                <span className="sr-only">Administración</span>
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
            <span className="sr-only">Cerrar sesion</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
