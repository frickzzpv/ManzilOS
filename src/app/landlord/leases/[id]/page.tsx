"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const api = axios.create({
  baseURL: '/api',
})

const useLease = (id: string) => {
  return useQuery({
    queryKey: ['landlordLease', id],
    queryFn: async () => {
      const { data } = await api.get(`/landlord/leases/${id}`)
      return data
    },
    enabled: !!id,
  })
}

const makeRenewalOffer = (id: string) => {
    return api.post(`/landlord/leases/${id}/make-renewal-offer`)
}

export default function LeaseDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { data: lease, isLoading } = useLease(id)

  const mutation = useMutation({
    mutationFn: makeRenewalOffer,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['landlordLease', id] })
        toast.success('Renewal offer sent to tenant.')
    },
    onError: () => {
        toast.error('Failed to send renewal offer.')
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!lease) {
    return <div>Lease not found</div>
  }

  return (
    <div>
        <Card>
            <CardHeader>
                <CardTitle>Lease Details</CardTitle>
                <CardDescription>
                    {lease.unit.property.name} - Unit {lease.unit.number}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p><strong>Tenant:</strong> {lease.tenant.name}</p>
                <p><strong>Term:</strong> {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</p>
                <p><strong>Monthly Rent:</strong> ${lease.monthlyRent}</p>
                <p><strong>Status:</strong> <Badge>{lease.status}</Badge></p>
                <p><strong>Signature:</strong> <Badge variant="outline">{lease.signatureStatus}</Badge></p>
                <p><strong>Renewal:</strong> <Badge variant="outline">{lease.renewalOfferStatus}</Badge></p>

                {lease.renewalOfferStatus === 'NOT_SENT' && (
                    <Button onClick={() => mutation.mutate(id)} disabled={mutation.isPending}>
                        {mutation.isPending ? 'Sending...' : 'Make Renewal Offer'}
                    </Button>
                )}
            </CardContent>
        </Card>
    </div>
  )
}
