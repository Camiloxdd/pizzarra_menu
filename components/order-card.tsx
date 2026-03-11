"use client"

import { useState, useEffect } from "react"
import {
  ChevronRight,
  Clock,
  Flame,
  MessageSquare,
  AlertTriangle,
} from "lucide-react"
import type { Order } from "@/lib/types"
import { STATUS_CONFIG, ITEM_STATUS_CONFIG } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrderDetailDialog } from "./order-detail-dialog"

const OVERDUE_MS = 30 * 60 * 1000 // 30 minutes

interface OrderCardProps {
  order: Order
  onStatusChange: (orderId: string) => void
  onItemStatusChange: (orderId: string, itemId: string) => void
  onAddComment: (orderId: string, text: string, author: string) => void
  onTogglePriority: (orderId: string) => void
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Ahora"
  if (diffMins < 60) return `${diffMins}m`
  const hours = Math.floor(diffMins / 60)
  return `${hours}h ${diffMins % 60}m`
}

export function isOrderOverdue(order: Order): boolean {
  if (order.status === "entregado") return false
  return Date.now() - order.createdAt.getTime() > OVERDUE_MS
}

export function OrderCard({
  order,
  onStatusChange,
  onItemStatusChange,
  onAddComment,
  onTogglePriority,
}: OrderCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [, setTick] = useState(0)
  const config = STATUS_CONFIG[order.status]
  
  // Validar que el estado sea válido
  if (!config) {
    console.warn(`Invalid order status: ${order.status}`)
    return null
  }
  
  const nextConfig = config.next ? STATUS_CONFIG[config.next] : null
  const isUrgent = order.priority && order.status !== "entregado"
  const overdue = isOrderOverdue(order)

  // Re-render every 30s to update overdue status
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <article
        onClick={() => setDialogOpen(true)}
        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border transition-all hover:shadow-lg ${
          overdue
            ? "border-status-overdue/60 shadow-[0_0_15px_-3px] shadow-status-overdue/25"
            : isUrgent
              ? "border-primary/40 shadow-[0_0_10px_-3px] shadow-primary/15"
              : "border-border hover:border-muted-foreground/30"
        } bg-card`}
        style={overdue ? { animation: "pulse-glow 3s ease-in-out infinite" } : undefined}
      >
        {/* Top accent line */}
        <div className={`h-1 w-full ${overdue ? "bg-status-overdue" : config.bgClass}`} />

        <div className="flex flex-col gap-3 p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">
                {order.id}
              </span>
              {isUrgent && <Flame className="size-3.5 text-primary" />}
              {overdue && <AlertTriangle className="size-3.5 text-status-overdue" />}
            </div>
            <Badge
              className={`${overdue ? "bg-status-overdue text-status-overdue-foreground" : `${config.bgClass} ${config.textClass}`} border-transparent text-[11px]`}
            >
              {overdue ? "Demorado" : config.label}
            </Badge>
          </div>

          {/* Table + Time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
              Mesa {order.tableNumber}
            </span>
            <span className={`flex items-center gap-1 ${overdue ? "font-semibold text-status-overdue" : ""}`}>
              <Clock className="size-3" />
              {getTimeAgo(order.createdAt)}
            </span>
            {order.comments.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                {order.comments.length}
              </span>
            )}
          </div>

          {/* Items */}
          <div className="flex flex-col gap-1.5">
            {order.items.slice(0, 5).map((item) => {
              const itemConfig = ITEM_STATUS_CONFIG[item.status]
              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-2 rounded-md bg-secondary/30 px-2.5 py-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-4 min-w-4 items-center justify-center rounded bg-secondary font-mono text-[10px] font-bold text-secondary-foreground">
                      {item.quantity}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      {item.notes && (
                        <p className="truncate text-[10px] text-primary font-medium">Nota: {item.notes}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={`${itemConfig.bgClass} ${itemConfig.textClass} border-transparent text-[9px] shrink-0`}>
                    {itemConfig.label}
                  </Badge>
                </div>
              )
            })}
            {order.items.length > 5 && (
              <span className="text-xs text-muted-foreground px-2">
                +{order.items.length - 5} más...
              </span>
            )}
          </div>

          {/* Last comment */}
          {order.comments.length > 0 && (
            <div className="rounded-lg bg-secondary/50 px-3 py-2">
              <p className="line-clamp-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {order.comments[order.comments.length - 1].author}:
                </span>{" "}
                {order.comments[order.comments.length - 1].text}
              </p>
            </div>
          )}

          {/* Action */}
          <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
            {nextConfig && (
              <Button
                onClick={() => onStatusChange(order.id)}
                size="sm"
                className={`flex-1 ${nextConfig.bgClass} ${nextConfig.textClass} border-transparent hover:opacity-90`}
              >
                {nextConfig.label}
                <ChevronRight className="ml-1 size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </article>

      <OrderDetailDialog
        order={order}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStatusChange={onStatusChange}
        onItemStatusChange={onItemStatusChange}
        onAddComment={onAddComment}
        onTogglePriority={onTogglePriority}
        isOverdue={overdue}
      />
    </>
  )
}
