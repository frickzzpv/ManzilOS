"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, DollarSign, Users, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"

interface DashboardStats {
  totalProperties: number
  totalUnits: number
  occupiedUnits: number
  totalTenants: number
  monthlyRevenue: number
  pendingPayments: number
  overduePayments: number
  occupancyRate: number
}

interface RecentPayment {
  id: string
  tenantName: string
  unitNumber: string
  amount: number
  status: 'PAID' | 'PENDING' | 'OVERDUE'
  dueDate: string
}

interface MaintenanceRequest {
  id: string
  title: string
  unitNumber: string
  tenantName: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  createdAt: string
}

export default function LandlordDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    occupancyRate: 0
  })

  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('manzilos_token')
      if (!token) {
        window.location.href = '/'
        return
      }

      // Load dashboard stats
      const statsResponse = await fetch('/api/landlord/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load recent payments
      const paymentsResponse = await fetch('/api/landlord/dashboard/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        setRecentPayments(paymentsData)
      }

      // Load maintenance requests
      const maintenanceResponse = await fetch('/api/landlord/dashboard/maintenance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (maintenanceResponse.ok) {
        const maintenanceData = await maintenanceResponse.json()
        setMaintenanceRequests(maintenanceData)
      }

    } catch (error) {
      console.error('Load dashboard data error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Landlord Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your properties, tenants, and finances</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalUnits} total units
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.occupiedUnits} occupied units
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingPayments} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTenants}</div>
              <p className="text-xs text-muted-foreground">
                Active tenants
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Rent Collection</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Rent Payments</CardTitle>
                <CardDescription>Latest payment activities across all properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{payment.tenantName}</p>
                          <p className="text-sm text-gray-500">Unit {payment.unitNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-gray-500">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                        </div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {recentPayments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No recent payments found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Recent maintenance activities and requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-gray-500">{request.tenantName} - Unit {request.unitNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        <p className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {maintenanceRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No maintenance requests found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Overview</CardTitle>
                <CardDescription>Summary of all your properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Property management features coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}