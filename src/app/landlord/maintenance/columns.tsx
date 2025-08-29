"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"

export type MaintenanceRequest = {
  id: string
  title: string
  status: string
  priority: string
  createdAt: string
  unit: {
    number: string
    property: {
      name: string
    }
  }
  tenant: {
    name: string
  }
}

export const columns: ColumnDef<MaintenanceRequest>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
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
    accessorKey: "createdAt",
    header: "Reported On",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.priority
      return <Badge>{priority}</Badge>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return <Badge>{status}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const request = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link href={`/maintenance/${request.id}`}>
                <DropdownMenuItem>View Details</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Assign Vendor</DropdownMenuItem>
            <DropdownMenuItem>Update Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
