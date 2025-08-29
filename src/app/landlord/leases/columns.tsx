"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
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
import { toast } from "sonner"

// This would be in a separate file in a real app
async function sendForSignature(leaseId: string) {
    // Here you would call your API which in turn calls the esign-service
    console.log(`Sending lease ${leaseId} for signature...`);
    toast.info(`Sending lease ${leaseId} for signature...`);
    await new Promise(res => setTimeout(res, 1000));
    toast.success(`Lease ${leaseId} sent for signature.`);
}


export type Lease = {
  id: string
  status: string
  startDate: string
  endDate: string
  monthlyRent: number
  signatureStatus: string
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
  {
    accessorKey: "signatureStatus",
    header: "Signature",
    cell: ({ row }) => {
      const status = row.original.signatureStatus
      return <Badge variant="outline">{status}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lease = row.original

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
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuSeparator />
            {lease.signatureStatus === 'PENDING' && (
                 <DropdownMenuItem onClick={() => sendForSignature(lease.id)}>
                    Send for Signature
                </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
