"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LeaseForm } from './lease-form'

const api = axios.create({
  baseURL: '/api',
})

const useLeases = () => {
  return useQuery({
    queryKey: ['landlordLeases'],
    queryFn: async () => {
      const { data } = await api.get('/landlord/leases')
      return data
    },
  })
}

export default function LeasesPage() {
  const { data: leases, isLoading } = useLeases()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Leases</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Lease
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Lease</DialogTitle>
              <DialogDescription>
                Create a new lease agreement.
              </DialogDescription>
            </DialogHeader>
            <LeaseForm />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={leases || []} emptyStateMessage={
        <div className="text-center">
            <h3 className="text-lg font-semibold">No Leases Found</h3>
            <p className="text-muted-foreground">Get started by creating your first lease.</p>
        </div>
      } />
    </div>
  )
}
