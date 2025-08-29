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
import { TenantForm } from './tenant-form'

const api = axios.create({
  baseURL: '/api',
})

const useTenants = () => {
  return useQuery({
    queryKey: ['landlordTenants'],
    queryFn: async () => {
      const { data } = await api.get('/landlord/tenants')
      return data
    },
  })
}

export default function TenantsPage() {
  const { data: tenants, isLoading } = useTenants()

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
        <h1 className="text-3xl font-bold">Tenants</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
              <DialogDescription>
                Invite a new tenant to your property.
              </DialogDescription>
            </DialogHeader>
            <TenantForm />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={tenants || []} emptyStateMessage={
        <div className="text-center">
            <h3 className="text-lg font-semibold">No Tenants Found</h3>
            <p className="text-muted-foreground">Get started by adding your first tenant.</p>
        </div>
      } />
    </div>
  )
}
