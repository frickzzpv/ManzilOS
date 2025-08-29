"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PaymentModal } from './PaymentModal'

interface Payment {
  id: string
  amount: number
  dueDate: string
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE'
  method: string
}

interface PaymentsTabProps {
  payments: Payment[]
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

export function PaymentsTab({ payments }: PaymentsTabProps) {
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)

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
                    <Dialog open={selectedPaymentId === payment.id} onOpenChange={(isOpen) => !isOpen && setSelectedPaymentId(null)}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setSelectedPaymentId(payment.id)} size="sm">
                                Pay Now
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Pay Rent</DialogTitle>
                                <DialogDescription>
                                    Enter your card details to pay {formatCurrency(payment.amount)}.
                                </DialogDescription>
                            </DialogHeader>
                            <PaymentModal paymentId={payment.id} onSuccess={() => setSelectedPaymentId(null)} />
                        </DialogContent>
                    </Dialog>
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
