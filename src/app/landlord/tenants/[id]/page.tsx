"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const api = axios.create({
  baseURL: '/api',
})

const useTenant = (id: string) => {
  return useQuery({
    queryKey: ['landlordTenant', id],
    queryFn: async () => {
      // We need a new endpoint for a single tenant
      const { data } = await api.get(`/landlord/tenants/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export default function TenantDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const { data: tenant, isLoading } = useTenant(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!tenant) {
    return <div>Tenant not found</div>
  }

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
            <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={tenant.avatar} />
                    <AvatarFallback>{tenant.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">{tenant.name}</CardTitle>
                    <CardDescription>{tenant.email} - {tenant.phone}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Badge>{tenant.status}</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Lease Information</CardTitle>
            </CardHeader>
            <CardContent>
                {tenant.tenantLeases.length > 0 ? (
                    tenant.tenantLeases.map((lease: any) => (
                        <div key={lease.id}>
                            <p>Property: {lease.unit.property.name}</p>
                            <p>Unit: {lease.unit.number}</p>
                            <p>Rent: ${lease.monthlyRent}/month</p>
                            <p>Status: <Badge>{lease.status}</Badge></p>
                        </div>
                    ))
                ) : (
                    <p>No active leases.</p>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Payment history would be fetched from another endpoint */}
                <p>Payment history coming soon...</p>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
