"use client"

import {
  Inbox,
  Flame,
  CookingPot,
  CircleCheck,
  Truck,
  AlertTriangle,
  LayoutGrid,
} from "lucide-react"
import type { OrderStatus } from "@/lib/types"

export type FilterType = OrderStatus | "todos" | "demorados"

interface FilterSidebarProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  counts: Record<FilterType, number>
}

const filters: { key: FilterType; label: string; icon: React.ElementType; colorClass: string }[] = [
  { key: "todos", label: "Todos", icon: LayoutGrid, colorClass: "text-foreground" },
  { key: "nuevo", label: "Nuevos", icon: Inbox, colorClass: "text-status-new" },
  { key: "en_progreso", label: "En Progreso", icon: CookingPot, colorClass: "text-status-progress" },
  { key: "listo", label: "Listos", icon: CircleCheck, colorClass: "text-status-ready" },
  { key: "entregado", label: "Entregados", icon: Truck, colorClass: "text-status-delivered" },
  { key: "demorados", label: "Demorados", icon: AlertTriangle, colorClass: "text-status-overdue" },
]

export function FilterSidebar({ activeFilter, onFilterChange, counts }: FilterSidebarProps) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
      <nav className="flex flex-col gap-1 p-3" role="tablist" aria-label="Filtrar pedidos">
        <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Filtrar por estado
        </p>
        {filters.map((filter) => {
          const Icon = filter.icon
          const isActive = activeFilter === filter.key
          const isOverdue = filter.key === "demorados"
          const count = counts[filter.key]

          return (
            <button
              key={filter.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange(filter.key)}
              className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Icon className={`size-4 shrink-0 ${isActive ? filter.colorClass : ""}`} />
              <span className="flex-1 text-left">{filter.label}</span>
              {count > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-mono font-semibold ${
                    isOverdue && count > 0
                      ? "bg-status-overdue/15 text-status-overdue"
                      : isActive
                        ? "bg-muted text-foreground"
                        : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Legend */}
      <div className="mt-auto border-t border-border p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Indicadores
        </p>
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flame className="size-3 text-status-new" />
            <span>Prioritario / Urgente</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-3 text-status-overdue" />
            <span>{'>'} 30 min sin entregar</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

// Mobile filter bar
export function MobileFilterBar({
  activeFilter,
  onFilterChange,
  counts,
}: FilterSidebarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-card px-4 py-2 lg:hidden">
      {filters.map((filter) => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.key
        const count = counts[filter.key]

        return (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {filter.label}
            {count > 0 && (
              <span className="font-mono">{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
