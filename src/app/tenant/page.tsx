"use client"

import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { LeaseInfoCard } from '@/components/tenant/LeaseInfoCard'
import { PaymentsTab } from '@/components/tenant/PaymentsTab'
import { MaintenanceTab } from '@/components/tenant/MaintenanceTab'
import { VisitorPassesTab } from '@/components/tenant/VisitorPassesTab'
import { AnnouncementsTab } from '@/components/tenant/AnnouncementsTab'
import { useAuth } from '@/hooks/use-auth'
import {
  useLeaseInfo,
  usePayments,
  useMaintenanceRequests,
  useAnnouncements,
  useVisitorPasses
} from '@/hooks/use-tenant-data'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default function TenantDashboard() {
  const queryClient = useQueryClient()
  const { data: auth, isLoading: isAuthLoading } = useAuth()

  const { data: leaseInfo, isLoading: isLeaseLoading } = useLeaseInfo()
  const { data: payments, isLoading: arePaymentsLoading } = usePayments()
  const { data: maintenanceRequests, isLoading: areMaintenanceRequestsLoading } = useMaintenanceRequests()
  const { data: announcements, isLoading: areAnnouncementsLoading } = useAnnouncements()
  const { data: visitorPasses, isLoading: areVisitorPassesLoading } = useVisitorPasses()

  const createMaintenanceRequest = useMutation({
    mutationFn: (newRequest: any) => api.post('/maintenance/requests', newRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceRequests'] })
      toast.success('Maintenance request created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create maintenance request')
    }
  })

  const createVisitorPass = useMutation({
    mutationFn: (newPass: any) => api.post('/visitor-passes', newPass),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitorPasses'] })
      toast.success('Visitor pass created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create visitor pass')
    }
  })

  const payRent = useMutation({
    mutationFn: (paymentId: string) => api.post(`/tenant/payments/${paymentId}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Payment processed successfully')
    },
    onError: () => {
      toast.error('Failed to process payment')
    }
  })

  const handleCreateMaintenanceRequest = async (request: any) => {
    if (!leaseInfo) return
    await createMaintenanceRequest.mutateAsync({ ...request, unitId: leaseInfo.unitId })
  }

  const handleCreateVisitorPass = async (pass: any) => {
    if (!leaseInfo) return
    await createVisitorPass.mutateAsync({ ...pass, unitId: leaseInfo.unitId })
  }

  const handlePayRent = async (paymentId: string) => {
    await payRent.mutateAsync(paymentId)
  }

  const isLoading = useMemo(() => {
    return isAuthLoading || isLeaseLoading || arePaymentsLoading || areMaintenanceRequestsLoading || areAnnouncementsLoading || areVisitorPassesLoading
  }, [isAuthLoading, isLeaseLoading, arePaymentsLoading, areMaintenanceRequestsLoading, areAnnouncementsLoading, areVisitorPassesLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!auth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access the tenant dashboard</p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your lease, payments, and maintenance requests</p>
        </div>

        <LeaseInfoCard leaseInfo={leaseInfo} />

        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Rent Payments</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="visitor-passes">Visitor Passes</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <PaymentsTab payments={payments || []} onPayRent={handlePayRent} />
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <MaintenanceTab requests={maintenanceRequests || []} onCreateRequest={handleCreateMaintenanceRequest} />
          </TabsContent>

          <TabsContent value="visitor-passes" className="space-y-4">
            <VisitorPassesTab passes={visitorPasses || []} onCreatePass={handleCreateVisitorPass} />
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <AnnouncementsTab announcements={announcements || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}