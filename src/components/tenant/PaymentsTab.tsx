"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react"

interface Payment {
  id: string
  amount: number
  dueDate: string
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE'
  method: string
}

interface PaymentsTabProps {
  payments: Payment[]
  onPayRent: (paymentId: string) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800'
    case 'PENDING': return 'bg-yellow-100 text-yellow-800'
    case 'OVERDUE': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED'
  }).format(amount)
}

export function PaymentsTab({ payments, onPayRent }: PaymentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Rent Payments
        </CardTitle>
        <CardDescription>Your payment history and upcoming rent</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium">{formatCurrency(payment.amount)}</p>
                  <p className="text-sm text-gray-500">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={getStatusColor(payment.status)}>
                  {payment.status}
                </Badge>
                {payment.status === 'PENDING' && (
                  <Button
                    onClick={() => onPayRent(payment.id)}
                    size="sm"
                  >
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payment records found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
