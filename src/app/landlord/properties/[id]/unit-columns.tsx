"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Unit = {
  id: string
  number: string
  type: string
  status: string
  rentAmount: number
}

export const columns: ColumnDef<Unit>[] = [
  {
    accessorKey: "number",
    header: "Unit Number",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const variant = status === 'occupied' ? 'destructive' : 'default'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: "rentAmount",
    header: "Rent Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("rentAmount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]
