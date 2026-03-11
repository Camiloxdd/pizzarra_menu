"use client"

import { useState } from "react"
import { ChefHat, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginUser } from "@/lib/auth-service"

interface LoginScreenProps {
  onLogin: (username: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Ingresa tu email y contraseña")
      return
    }

    setIsLoading(true)

    try {
      const result = await loginUser(email, password)

      if (result) {
        onLogin(result.user.nombre)
      } else {
        setError("Email o contraseña incorrectos. Intenta de nuevo.")
      }
    } catch (err) {
      setError("Error al intentar iniciar sesión. Intenta de nuevo.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-sm flex-col gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary">
            <ChefHat className="size-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              CocinaFlow
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sistema de gestión de pedidos
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-sm text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError("")
              }}
              className="h-11 bg-card text-foreground placeholder:text-muted-foreground"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-sm text-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                className="h-11 bg-card pr-10 text-foreground placeholder:text-muted-foreground"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex gap-2 rounded-lg bg-destructive/10 px-3 py-2">
              <AlertCircle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 gap-2 text-sm font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Iniciando sesión...
              </span>
            ) : (
              <>
                Entrar
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        {/* Info */}
        <div className="rounded-lg bg-secondary/50 p-4 text-center">
          <p className="text-xs text-muted-foreground font-semibold mb-2">
            📝 Credenciales de prueba:
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <span className="text-foreground font-medium">Admin:</span>{" "}
              admin@example.com / admin123
            </p>
            <p>
              <span className="text-foreground font-medium">Usuario:</span>{" "}
              chef@example.com / chef123
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
            Los datos se sincronizarán con Supabase cuando configures la tabla
          </p>
        </div>
      </div>
    </div>
  )
}
