"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { PropertyForm } from './property-form'

const api = axios.create({
  baseURL: '/api',
})

const useProperties = () => {
  return useQuery({
    queryKey: ['landlordProperties'],
    queryFn: async () => {
      const { data } = await api.get('/landlord/properties')
      return data
    },
  })
}

export default function PropertiesPage() {
  const { data: properties, isLoading } = useProperties()

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
        <h1 className="text-3xl font-bold">Properties</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
              <DialogDescription>
                Fill in the details of your new property.
              </DialogDescription>
            </DialogHeader>
            <PropertyForm />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={properties || []} />
    </div>
  )
}
