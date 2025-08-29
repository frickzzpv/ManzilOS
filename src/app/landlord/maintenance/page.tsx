"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

const api = axios.create({
  baseURL: '/api',
})

const useMaintenanceRequests = () => {
  return useQuery({
    queryKey: ['landlordMaintenanceRequests'],
    queryFn: async () => {
      const { data } = await api.get('/maintenance/requests')
      return data
    },
  })
}

export default function MaintenancePage() {
  const { data: requests, isLoading } = useMaintenanceRequests()

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
        <h1 className="text-3xl font-bold">Maintenance Requests</h1>
      </div>
      <DataTable columns={columns} data={requests || []} />
    </div>
  )
}
