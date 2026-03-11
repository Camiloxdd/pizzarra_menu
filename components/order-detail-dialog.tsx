"use client"

import { useState } from "react"
import {
  ChevronRight,
  Clock,
  Flame,
  MessageSquare,
  Send,
  AlertTriangle,
  User,
  ChevronDown,
} from "lucide-react"
import type { Order } from "@/lib/types"
import { STATUS_CONFIG, ITEM_STATUS_CONFIG } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OrderDetailDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (orderId: string) => void
  onItemStatusChange: (orderId: string, itemId: string) => void
  onAddComment: (orderId: string, text: string, author: string) => void
  onTogglePriority: (orderId: string) => void
  isOverdue: boolean
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Ahora mismo"
  if (diffMins < 60) return `Hace ${diffMins} min`
  const hours = Math.floor(diffMins / 60)
  return `Hace ${hours}h ${diffMins % 60}m`
}

export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
  onStatusChange,
  onItemStatusChange,
  onAddComment,
  onTogglePriority,
  isOverdue,
}: OrderDetailDialogProps) {
  const [commentText, setCommentText] = useState("")
  const [commentAuthor, setCommentAuthor] = useState("")
  const config = STATUS_CONFIG[order.status]
  const nextConfig = config.next ? STATUS_CONFIG[config.next] : null

  const handleAddComment = () => {
    if (commentText.trim() && commentAuthor.trim()) {
      onAddComment(order.id, commentText.trim(), commentAuthor.trim())
      setCommentText("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg gap-0 overflow-hidden p-0 bg-card text-card-foreground">
        {/* Top accent */}
        <div className={`h-1.5 w-full ${isOverdue ? "bg-status-overdue" : config.bgClass}`} />

        <DialogHeader className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <span className="font-mono">{order.id}</span>
              <Badge className={`${isOverdue ? "bg-status-overdue text-status-overdue-foreground" : `${config.bgClass} ${config.textClass}`} border-transparent`}>
                {isOverdue ? "Demorado" : config.label}
              </Badge>
              {isOverdue && (
                <AlertTriangle className="size-4 text-status-overdue" />
              )}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="rounded bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
              Mesa {order.tableNumber}
            </span>
            <span className={`flex items-center gap-1 ${isOverdue ? "text-status-overdue font-medium" : ""}`}>
              <Clock className="size-3.5" />
              {getTimeAgo(order.createdAt)}
            </span>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] px-5">
          {/* Items */}
          <section className="pb-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Productos ({order.items.length})
            </h3>
            <div className="flex flex-col gap-2">
              {order.items.map((item) => {
                const itemConfig = ITEM_STATUS_CONFIG[item.status]
                const nextItemConfig = itemConfig.next ? ITEM_STATUS_CONFIG[itemConfig.next] : null
                return (
                  <div
                    key={item.id}
                    className="rounded-lg bg-secondary/50 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="flex h-6 min-w-6 items-center justify-center rounded bg-secondary font-mono text-sm font-bold text-secondary-foreground">
                          {item.quantity}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          {item.notes && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-primary">
                              <AlertTriangle className="size-3" />
                              {item.notes}
                            </p>
                          )}
                          <div className="mt-2 flex gap-1">
                            <Badge className={`${itemConfig.bgClass} ${itemConfig.textClass} border-transparent text-[9px]`}>
                              {itemConfig.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {nextItemConfig && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onItemStatusChange(order.id, item.id)}
                          className={`mt-1 h-6 px-2 text-[10px] ${nextItemConfig.bgClass} ${nextItemConfig.textClass} border-transparent hover:opacity-90`}
                        >
                          <ChevronDown className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Comments */}
          <section className="border-t border-border pb-4 pt-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <MessageSquare className="size-3.5" />
              Comentarios ({order.comments.length})
            </h3>
            {order.comments.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                Sin comentarios todavia
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {order.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg bg-secondary/50 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <User className="size-3" />
                        {comment.author}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(comment.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="w-28 rounded-lg border border-input bg-secondary px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Textarea
                  placeholder="Escribe un comentario..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-10 flex-1 resize-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!commentText.trim() || !commentAuthor.trim()}
                className="self-end"
              >
                <Send className="size-3.5" />
                Enviar
              </Button>
            </div>
          </section>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-border px-5 py-3">
          <Button
            variant={order.priority ? "default" : "secondary"}
            size="sm"
            onClick={() => onTogglePriority(order.id)}
            className={
              order.priority
                ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
                : ""
            }
          >
            <Flame className="size-4" />
            {order.priority ? "Prioritario" : "Marcar Urgente"}
          </Button>
          <div className="flex-1" />
          {nextConfig && (
            <Button
              onClick={() => {
                onStatusChange(order.id)
                if (config.next === "entregado") onOpenChange(false)
              }}
              className={`${nextConfig.bgClass} ${nextConfig.textClass} hover:opacity-90 border-transparent`}
            >
              Mover a {nextConfig.label}
              <ChevronRight className="ml-1 size-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
