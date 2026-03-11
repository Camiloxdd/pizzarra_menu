import { supabase } from "./supabase"
import type { Order, OrderItem } from "./types"

interface SupabaseOrder {
  id: string
  cliente: string
  telefono: string
  direccion: string
  barrio: string
  productos: any[] | string
  subtotal: number
  domicilio: number
  total: number
  created_at: string
  estado?: string
  pendiente?: boolean | null
}

export async function fetchOrdersFromSupabase(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("pedidos_whatsapp")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching orders:", error)
      return []
    }

    if (!data || data.length === 0) {
      console.warn("No orders found in Supabase")
      return []
    }

    return data.map((order: SupabaseOrder) => {
      let products: OrderItem[] = []
      const orderId = String(order.id) // Convertir id a string

      // Parse productos JSON if it's a string
      try {
        let productsData = null
        
        if (typeof order.productos === "string") {
          // Validar que no sea una string vacía
          if (order.productos && order.productos.trim()) {
            productsData = JSON.parse(order.productos)
          }
        } else {
          productsData = order.productos
        }

        if (Array.isArray(productsData)) {
          products = productsData.map((product, index) => ({
            id: `${orderId}-p${index}`,
            name: product.nombre || product.name || "Producto desconocido",
            quantity: product.cantidad || product.quantity || 1,
            notes: product.notas || product.notes || undefined,
            status: "nuevo" as const,
            price: product.precio || product.price || 0,
          }))
        }
      } catch (e) {
        console.error("Error parsing products for order", orderId, ":", e)
      }

      // Determine status based on estado field from Supabase
      const validStatuses: Array<"nuevo" | "en_progreso" | "listo" | "entregado"> = ["nuevo", "en_progreso", "listo", "entregado"]
      let status: "nuevo" | "en_progreso" | "listo" | "entregado" = "nuevo"
      
      // Use estado field if it's valid
      if (order.estado && validStatuses.includes(order.estado as any)) {
        status = order.estado as "nuevo" | "en_progreso" | "listo" | "entregado"
      }
      // Fallback to pendiente field if estado is not set
      else if (!order.estado && order.pendiente === false) {
        status = "entregado"
      }

      return {
        id: `PED-${orderId.slice(0, 6).toUpperCase()}`,
        tableNumber: parseInt(orderId.slice(0, 2)) || 1,
        items: products.length > 0 ? products : [
          {
            id: `${orderId}-default`,
            name: "Pedido de WhatsApp",
            quantity: 1,
            status: "nuevo" as const,
          }
        ],
        status,
        comments: [
          {
            id: `c-${orderId}`,
            text: `Cliente: ${order.cliente} | ${order.barrio}`,
            author: "Sistema",
            timestamp: new Date(order.created_at),
          }
        ],
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.created_at),
        priority: false,
        // Datos de Supabase
        clientName: order.cliente,
        phone: order.telefono,
        address: order.direccion,
        neighborhood: order.barrio,
        subtotal: order.subtotal,
        deliveryFee: order.domicilio,
        domicilio: order.domicilio,
        total: order.total,
      }
    })
  } catch (error) {
    console.error("Unexpected error fetching orders:", error)
    return []
  }
}

export async function updateOrderStatusInSupabase(
  orderId: string,
  newStatus: "nuevo" | "en_progreso" | "listo" | "entregado"
): Promise<boolean> {
  try {
    // Extraer el ID numérico del formato "PED-37"
    const numericId = parseInt(orderId.replace("PED-", ""))
    
    if (isNaN(numericId)) {
      console.error("Invalid order ID format:", orderId)
      return false
    }

    const { error } = await supabase
      .from("pedidos_whatsapp")
      .update({ estado: newStatus })
      .eq("id", numericId)

    if (error) {
      console.error("Error updating order status:", error)
      return false
    }

    console.log(`Order ${orderId} status updated to ${newStatus}`)
    return true
  } catch (error) {
    console.error("Unexpected error updating order status:", error)
    return false
  }
}

export async function updateItemStatusInSupabase(
  orderId: string,
  itemId: string,
  newStatus: "nuevo" | "en_preparacion" | "listo" | "servido"
): Promise<boolean> {
  try {
    // Extraer el ID numérico del formato "PED-37"
    const numericId = parseInt(orderId.replace("PED-", ""))
    
    if (isNaN(numericId)) {
      console.error("Invalid order ID format:", orderId)
      return false
    }

    // Obtener el pedido actual para actualizar el array de productos
    const { data: order, error: fetchError } = await supabase
      .from("pedidos_whatsapp")
      .select("productos")
      .eq("id", numericId)
      .single()

    if (fetchError || !order) {
      console.error("Error fetching order:", fetchError)
      return false
    }

    // Parsear y actualizar los productos
    let productos = typeof order.productos === "string" 
      ? JSON.parse(order.productos) 
      : order.productos

    if (Array.isArray(productos)) {
      // Buscar el índice del producto por su ID
      const productIndex = productos.findIndex((p, idx) => {
        return itemId.includes(`p${idx}`) || itemId === `${numericId}-p${idx}`
      })

      if (productIndex !== -1) {
        productos[productIndex].estado = newStatus
      }
    }

    // Actualizar el pedido con los productos modificados
    const { error: updateError } = await supabase
      .from("pedidos_whatsapp")
      .update({ productos: JSON.stringify(productos) })
      .eq("id", numericId)

    if (updateError) {
      console.error("Error updating item status:", updateError)
      return false
    }

    console.log(`Item ${itemId} status updated to ${newStatus}`)
    return true
  } catch (error) {
    console.error("Unexpected error updating item status:", error)
    return false
  }
}
