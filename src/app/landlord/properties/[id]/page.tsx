"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { columns as unitColumns } from './unit-columns'

const api = axios.create({
  baseURL: '/api',
})

const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['landlordProperty', id],
    queryFn: async () => {
      // We need a new endpoint for a single property
      const { data } = await api.get(`/landlord/properties/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const { data: property, isLoading } = useProperty(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!property) {
    return <div>Property not found</div>
  }

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{property.name}</CardTitle>
          <CardDescription>{property.address}, {property.city}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Type: {property.type}</p>
          <p>Total Units: {property.totalUnits}</p>
        </CardContent>
      </Card>
      <h2 className="text-2xl font-bold mb-4">Units</h2>
      <DataTable columns={unitColumns} data={property.units || []} />
    </div>
  )
}
