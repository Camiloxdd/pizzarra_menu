"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NewOrderItem {
  name: string
  quantity: number
  notes: string
}

interface NewOrderDialogProps {
  onAddOrder: (tableNumber: number, items: { name: string; quantity: number; notes?: string }[]) => void
}

export function NewOrderDialog({ onAddOrder }: NewOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [tableNumber, setTableNumber] = useState("")
  const [items, setItems] = useState<NewOrderItem[]>([
    { name: "", quantity: 1, notes: "" },
  ])

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, notes: "" }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof NewOrderItem, value: string | number) => {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const handleSubmit = () => {
    const table = parseInt(tableNumber)
    if (!table || items.some((item) => !item.name.trim())) return

    onAddOrder(
      table,
      items.map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity,
        notes: item.notes.trim() || undefined,
      }))
    )

    // Reset
    setTableNumber("")
    setItems([{ name: "", quantity: 1, notes: "" }])
    setOpen(false)
  }

  const isValid =
    tableNumber &&
    parseInt(tableNumber) > 0 &&
    items.every((item) => item.name.trim() && item.quantity > 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Nuevo Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nuevo Pedido</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="table" className="text-foreground">Numero de Mesa</Label>
            <Input
              id="table"
              type="number"
              min={1}
              placeholder="Ej: 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Productos</Label>
            {items.map((item, index) => (
              <div key={index} className="flex flex-col gap-1.5 rounded-lg bg-secondary/50 p-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nombre del producto"
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", parseInt(e.target.value) || 1)
                    }
                    className="w-16 text-center font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Notas especiales (opcional)"
                  value={item.notes}
                  onChange={(e) => updateItem(index, "notes", e.target.value)}
                  className="text-xs"
                />
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={addItem} className="gap-1.5">
              <Plus className="size-3.5" />
              Agregar Producto
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Crear Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
