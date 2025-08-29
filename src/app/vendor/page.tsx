"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { useAuth } from '@/hooks/use-auth'

const api = axios.create({
  baseURL: '/api',
})

const useVendorJobs = () => {
  return useQuery({
    queryKey: ['vendorJobs'],
    queryFn: async () => {
      const { data } = await api.get('/vendor/jobs')
      return data
    },
  })
}

export default function VendorDashboardPage() {
  const { data: auth, isLoading: isAuthLoading } = useAuth()
  const { data: jobs, isLoading: areJobsLoading } = useVendorJobs()

  const isLoading = isAuthLoading || areJobsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!auth || auth.role !== 'VENDOR') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Jobs</h1>
      </div>
      <DataTable columns={columns} data={jobs || []} />
    </div>
  )
}