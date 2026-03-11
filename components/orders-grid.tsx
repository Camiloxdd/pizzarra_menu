"use client"

import type { Order } from "@/lib/types"
import type { FilterType } from "./filter-sidebar"
import { OrderCard, isOrderOverdue } from "./order-card"
import { ClipboardList } from "lucide-react"

interface OrdersGridProps {
  orders: Order[]
  filter: FilterType
  onStatusChange: (orderId: string) => void
  onItemStatusChange: (orderId: string, itemId: string) => void
  onAddComment: (orderId: string, text: string, author: string) => void
  onTogglePriority: (orderId: string) => void
}

export function OrdersGrid({
  orders,
  filter,
  onStatusChange,
  onItemStatusChange,
  onAddComment,
  onTogglePriority,
}: OrdersGridProps) {
  const filteredOrders =
    filter === "todos"
      ? orders.filter((o) => o.status !== "entregado")
      : filter === "demorados"
        ? orders.filter((o) => isOrderOverdue(o))
        : orders.filter((o) => o.status === filter)

  // Sort: overdue first, then priority, then newest
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aOverdue = isOrderOverdue(a)
    const bOverdue = isOrderOverdue(b)
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
    if (a.priority !== b.priority) return a.priority ? -1 : 1
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  if (sortedOrders.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
        <div className="flex items-center justify-center rounded-full bg-secondary p-4">
          <ClipboardList className="size-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-foreground">Sin pedidos</p>
          <p className="text-sm text-muted-foreground">
            {filter === "demorados"
              ? "No hay pedidos demorados, todo va bien"
              : "No hay pedidos con este estado"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {sortedOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onStatusChange={onStatusChange}
          onItemStatusChange={onItemStatusChange}
          onAddComment={onAddComment}
          onTogglePriority={onTogglePriority}
        />
      ))}
    </div>
  )
}
