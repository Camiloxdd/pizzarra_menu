"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { Order } from "@/lib/types"
import { STATUS_CONFIG } from "@/lib/types"
import { fetchOrdersFromSupabase, updateOrderStatusInSupabase, updateItemStatusInSupabase } from "@/lib/orders-service"
import { getCurrentUser, logoutUser, isAuthenticated } from "@/lib/auth-service"
import { KitchenHeader } from "@/components/kitchen-header"
import { FilterSidebar, MobileFilterBar } from "@/components/filter-sidebar"
import type { FilterType } from "@/components/filter-sidebar"
import { OrdersGrid } from "@/components/orders-grid"
import { NewOrderDialog } from "@/components/new-order-dialog"
import { LoginScreen } from "@/components/login-screen"
import { isOrderOverdue } from "@/components/order-card"

export default function KitchenDashboard() {
  const [user, setUser] = useState<string | null>(null)
  const [isAuth, setIsAuth] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>("todos")

  // Verificar autenticación al cargar
  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser && isAuthenticated()) {
      setUser(currentUser.nombre)
      setIsAuth(true)
    }
  }, [])

  // Load orders from Supabase when user logs in and set up polling
  useEffect(() => {
    if (!user || !isAuth) return

    // Función para cargar pedidos desde Supabase
    const loadOrders = async () => {
      try {
        const fetchedOrders = await fetchOrdersFromSupabase()
        setOrders((prevOrders) => {
          // Detectar nuevos pedidos para notificación sonora
          const newOrderIds = fetchedOrders
            .map((o) => o.id)
            .filter((id) => !prevOrders.some((prev) => prev.id === id))
          
          if (newOrderIds.length > 0 && prevOrders.length > 0) {
            // Reproducir sonido de notificación (no en la primera carga)
            playNotificationSound()
          }
          
          return fetchedOrders
        })
        setLoading(false)
      } catch (error) {
        console.error("Failed to load orders:", error)
        setLoading(false)
      }
    }

    // Cargar ordenes inmediatamente
    setLoading(true)
    loadOrders()

    // Configurar polling cada 30 segundos
    const pollInterval = setInterval(() => {
      loadOrders()
    }, 30000)

    // Limpiar intervalo cuando usuario se desconecta
    return () => clearInterval(pollInterval)
  }, [user, isAuth])

  // Función para reproducir notificación sonora
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.5)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.warn("Could not play notification sound:", error)
    }
  }, [])

  // Función para imprimir factura optimizada para POS
  const printInvoice = useCallback((order: Order, newStatus: string) => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factura ${order.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: 80mm;
            background: white;
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            padding: 0;
            margin: 0;
          }
          
          .receipt {
            width: 100%;
            padding: 5mm;
            text-align: center;
          }
          
          .header {
            border-bottom: 2px solid #000;
            padding-bottom: 3mm;
            margin-bottom: 3mm;
            font-weight: bold;
            font-size: 14px;
          }
          
          .order-number {
            font-size: 16px;
            font-weight: bold;
            margin: 2mm 0;
          }
          
          .section-title {
            font-weight: bold;
            margin-top: 2mm;
            margin-bottom: 1mm;
            text-align: left;
          }
          
          .info-line {
            text-align: left;
            font-size: 10px;
            margin: 1mm 0;
            word-break: break-word;
          }
          
          .separator {
            border-bottom: 1px dashed #000;
            margin: 2mm 0;
          }
          
          .separator-solid {
            border-bottom: 2px solid #000;
            margin: 2mm 0;
          }
          
          table {
            width: 100%;
            font-size: 10px;
            border-collapse: collapse;
            margin: 2mm 0;
          }
          
          table thead {
            border-bottom: 1px solid #000;
          }
          
          table th {
            text-align: left;
            padding: 1mm;
            font-weight: bold;
          }
          
          table td {
            padding: 1mm;
            text-align: left;
          }
          
          .qty {
            text-align: center;
            width: 15mm;
          }
          
          .price {
            text-align: right;
            width: 20mm;
          }
          
          .item-name {
            flex: 1;
          }
          
          .totals-section {
            margin: 2mm 0;
          }
          
          .total-line {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin: 1mm 0;
          }
          
          .total-final {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 14px;
            border-top: 2px solid #000;
            padding-top: 2mm;
            margin-top: 2mm;
          }
          
          .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 3mm;
            border-top: 1px dashed #000;
            padding-top: 2mm;
          }
          
          .thank-you {
            font-weight: bold;
            font-size: 11px;
            margin: 1mm 0;
          }
          
          .status {
            font-size: 10px;
            margin: 1mm 0;
          }
          
          @media print {
            body {
              width: 80mm;
              margin: 0;
              padding: 0;
            }
            .receipt {
              padding: 2mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div>PIZZARRA LA PIEDRA</div>
            <div style="font-size: 10px;">Sistema de Entregas</div>
          </div>
          
          <div class="separator"></div>
          
          <div class="order-number">${order.id}</div>
          
          <div class="separator"></div>
          
          <div class="section-title">INFORMACIÓN DEL PEDIDO</div>
          <div class="info-line"><strong>Cliente:</strong> ${order.clientName || 'N/A'}</div>
          <div class="info-line"><strong>Teléfono:</strong> ${order.phone || 'N/A'}</div>
          <div class="info-line"><strong>Dirección:</strong> ${order.address || 'N/A'}</div>
          <div class="info-line"><strong>Barrio:</strong> ${order.neighborhood || 'N/A'}</div>
          <div class="info-line"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
          <div class="info-line"><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
          
          <div class="separator"></div>
          
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">PRODUCTO</th>
                <th class="qty">CANT</th>
                <th class="price">VALOR</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td class="qty">${item.quantity}</td>
                  <td class="price">$${(item.quantity * (item.price || 0)).toFixed(0)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          
          <div class="separator-solid"></div>
          
          <div class="totals-section">
            <div class="total-line">
              <span>SUBTOTAL:</span>
              <span>$${order.subtotal?.toFixed(0) || '0'}</span>
            </div>
            <div class="total-line">
              <span>DOMICILIO:</span>
              <span>$${order.deliveryFee || order.domicilio || '0'}</span>
            </div>
            <div class="total-final">
              <span>TOTAL A PAGAR:</span>
              <span>$${order.total?.toFixed(0) || '0'}</span>
            </div>
          </div>
          
          <div class="separator"></div>
          
          <div class="footer">
            <div class="thank-you">¡GRACIAS POR SU COMPRA!</div>
            <div class="status">Estado: ${newStatus === 'entregado' ? 'ENTREGADO' : newStatus.toUpperCase()}</div>
            <div style="margin-top: 2mm; font-size: 9px;">
              Pedido ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(invoiceHTML)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }, [])

  const counts = useMemo(() => {
    const c: Record<FilterType, number> = {
      todos: orders.filter((o) => o.status !== "entregado").length,
      nuevo: 0,
      en_progreso: 0,
      listo: 0,
      entregado: 0,
      demorados: 0,
    }
    for (const order of orders) {
      c[order.status]++
      if (isOrderOverdue(order)) {
        c.demorados++
      }
    }
    return c
  }, [orders])

  const handleStatusChange = useCallback((orderId: string) => {
    // Actualizar el estado local primero
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        const config = STATUS_CONFIG[order.status]
        if (!config.next) return order
        
        const newStatus = config.next

        // Si cambia a "entregado", imprimir factura
        if (newStatus === "entregado") {
          setTimeout(() => {
            printInvoice(order, newStatus)
          }, 500)
        }
        
        // Actualizar en Supabase de forma asíncrona
        updateOrderStatusInSupabase(orderId, newStatus).catch((error) => {
          console.error("Failed to update order status in database:", error)
        })
        
        return {
          ...order,
          status: newStatus,
          updatedAt: new Date(),
        }
      })
    )
  }, [])

  const handleAddComment = useCallback(
    (orderId: string, text: string, author: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order
          return {
            ...order,
            comments: [
              ...order.comments,
              {
                id: `c-${Date.now()}`,
                text,
                author,
                timestamp: new Date(),
              },
            ],
            updatedAt: new Date(),
          }
        })
      )
    },
    []
  )

  const handleTogglePriority = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        return { ...order, priority: !order.priority, updatedAt: new Date() }
      })
    )
  }, [])

  const handleItemStatusChange = useCallback((orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        return {
          ...order,
          items: order.items.map((item) => {
            if (item.id !== itemId) return item
            const itemConfig = { nuevo: "en_preparacion", en_preparacion: "listo", listo: "servido", servido: "servido" }
            const newStatus = itemConfig[item.status as keyof typeof itemConfig] as any
            
            // Actualizar en Supabase de forma asíncrona
            updateItemStatusInSupabase(orderId, itemId, newStatus).catch((error) => {
              console.error("Failed to update item status in database:", error)
            })
            
            return {
              ...item,
              status: newStatus,
            }
          }),
          updatedAt: new Date(),
        }
      })
    )
  }, [])

  const handleAddOrder = useCallback(
    (tableNumber: number, items: { name: string; quantity: number; notes?: string }[]) => {
      const newOrder: Order = {
        id: `PED-${String(orders.length + 1).padStart(3, "0")}`,
        tableNumber,
        items: items.map((item, i) => ({
          id: `i-${Date.now()}-${i}`,
          ...item,
          status: "nuevo" as const,
        })),
        status: "nuevo",
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: false,
      }
      setOrders((prev) => [newOrder, ...prev])
    },
    [orders.length]
  )

  // Show login if no user
  if (!user || !isAuth) {
    return <LoginScreen onLogin={(username) => {
      setUser(username)
      setIsAuth(true)
    }} />
  }

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    setIsAuth(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <KitchenHeader
        userName={user}
        activeOrderCount={counts.todos}
        onLogout={handleLogout}
      />

      {/* Mobile filter */}
      <MobileFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <FilterSidebar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              {loading ? (
                "Cargando pedidos..."
              ) : activeFilter === "todos" ? (
                "Pedidos activos"
              ) : activeFilter === "demorados" ? (
                "Pedidos demorados (+30 min)"
              ) : (
                `Pedidos - ${activeFilter === "nuevo" ? "Nuevos" : activeFilter === "en_progreso" ? "En Progreso" : activeFilter === "listo" ? "Listos" : "Entregados"}`
              )}
            </h2>
            <NewOrderDialog onAddOrder={handleAddOrder} />
          </div>

          <OrdersGrid
            orders={orders}
            filter={activeFilter}
            onItemStatusChange={handleItemStatusChange}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
            onTogglePriority={handleTogglePriority}
          />
        </main>
      </div>
    </div>
  )
}
