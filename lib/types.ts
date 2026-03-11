export type OrderStatus = "nuevo" | "en_progreso" | "listo" | "entregado"
export type ItemStatus = "nuevo" | "en_preparacion" | "listo" | "servido"

export interface OrderItem {
  id: string
  name: string
  quantity: number
  notes?: string
  status: ItemStatus
  price?: number
}

export interface OrderComment {
  id: string
  text: string
  author: string
  timestamp: Date
}

export interface Order {
  id: string
  tableNumber: number
  items: OrderItem[]
  status: OrderStatus
  comments: OrderComment[]
  createdAt: Date
  updatedAt: Date
  priority: boolean
  // Datos de Supabase
  clientName?: string
  phone?: string
  address?: string
  neighborhood?: string
  subtotal?: number
  deliveryFee?: number
  domicilio?: number
  total?: number
  customer?: string
}

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; next: OrderStatus | null; color: string; bgClass: string; textClass: string }
> = {
  nuevo: {
    label: "Nuevo",
    next: "en_progreso",
    color: "status-new",
    bgClass: "bg-status-new",
    textClass: "text-status-new-foreground",
  },
  en_progreso: {
    label: "En Progreso",
    next: "listo",
    color: "status-progress",
    bgClass: "bg-status-progress",
    textClass: "text-status-progress-foreground",
  },
  listo: {
    label: "Listo",
    next: "entregado",
    color: "status-ready",
    bgClass: "bg-status-ready",
    textClass: "text-status-ready-foreground",
  },
  entregado: {
    label: "Entregado",
    next: null,
    color: "status-delivered",
    bgClass: "bg-status-delivered",
    textClass: "text-status-delivered-foreground",
  },
}

export const ITEM_STATUS_CONFIG: Record<
  ItemStatus,
  { label: string; next: ItemStatus | null; color: string; bgClass: string; textClass: string }
> = {
  nuevo: {
    label: "Nuevo",
    next: "en_preparacion",
    color: "status-new",
    bgClass: "bg-status-new",
    textClass: "text-status-new-foreground",
  },
  en_preparacion: {
    label: "En Prep.",
    next: "listo",
    color: "status-progress",
    bgClass: "bg-status-progress",
    textClass: "text-status-progress-foreground",
  },
  listo: {
    label: "Listo",
    next: "servido",
    color: "status-ready",
    bgClass: "bg-status-ready",
    textClass: "text-status-ready-foreground",
  },
  servido: {
    label: "Servido",
    next: null,
    color: "status-delivered",
    bgClass: "bg-status-delivered",
    textClass: "text-status-delivered-foreground",
  },
}
