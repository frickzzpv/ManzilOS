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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from 'axios'
import { toast } from 'sonner'

export type MaintenanceJob = {
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
}

const api = axios.create({
    baseURL: '/api',
})

const updateJobStatus = ({ id, status }: { id: string, status: string }) => {
    return api.patch(`/maintenance/requests/${id}`, { status })
}

const JobActions = ({ job }: { job: MaintenanceJob }) => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: updateJobStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorJobs'] })
            toast.success('Job status updated')
        },
        onError: () => {
            toast.error('Failed to update job status')
        }
    })

    const handleAccept = () => {
        mutation.mutate({ id: job.id, status: 'IN_PROGRESS' })
    }

    const handleComplete = () => {
        mutation.mutate({ id: job.id, status: 'COMPLETED' })
    }

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
            <Link href={`/maintenance/${job.id}`}>
                <DropdownMenuItem>View Details</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            {job.status === 'PENDING' && (
                <DropdownMenuItem onClick={handleAccept}>Accept Job</DropdownMenuItem>
            )}
            {job.status === 'IN_PROGRESS' && (
                <DropdownMenuItem onClick={handleComplete}>Complete Job</DropdownMenuItem>
            )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const columns: ColumnDef<MaintenanceJob>[] = [
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
    cell: ({ row }) => <JobActions job={row.original} />,
  },
]
