"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home } from "lucide-react"

interface LeaseInfo {
  id: string
  unitNumber: string
  propertyAddress: string
  startDate: string
  endDate: string
  monthlyRent: number
  status: string
  unitId: string
}

interface LeaseInfoCardProps {
  leaseInfo: LeaseInfo | null
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED'
  }).format(amount)
}

export function LeaseInfoCard({ leaseInfo }: LeaseInfoCardProps) {
  if (!leaseInfo) {
    return (
        <Card className="mb-8">
            <CardHeader><CardTitle>Lease Information</CardTitle></CardHeader>
            <CardContent><p>No active lease found.</p></CardContent>
        </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Home className="h-5 w-5 mr-2" />
          Your Lease Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Unit</p>
            <p className="font-semibold">{leaseInfo.unitNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Monthly Rent</p>
            <p className="font-semibold">{formatCurrency(leaseInfo.monthlyRent)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lease Period</p>
            <p className="font-semibold">
              {new Date(leaseInfo.startDate).toLocaleDateString()} - {new Date(leaseInfo.endDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <Badge className={getStatusColor(leaseInfo.status)}>
              {leaseInfo.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
