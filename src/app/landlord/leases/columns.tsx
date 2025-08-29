"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Lease = {
  id: string
  status: string
  startDate: string
  endDate: string
  monthlyRent: number
  tenant: {
    name: string
  }
  unit: {
    number: string
    property: {
      name: string
    }
  }
}

export const columns: ColumnDef<Lease>[] = [
  {
    accessorKey: "unit.property.name",
    header: "Property",
  },
  {
    accessorKey: "unit.number",
    header: "Unit",
  },
  {
    accessorKey: "tenant.name",
    header: "Tenant",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString(),
  },
  {
    accessorKey: "monthlyRent",
    header: "Rent",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("monthlyRent"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const variant = status === 'active' ? 'default' : 'destructive'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
]
