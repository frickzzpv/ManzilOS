"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, DollarSign, Wrench, Bell, Calendar, Users, Plus, QrCode } from "lucide-react"
import { toast } from "sonner"

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

interface Payment {
  id: string
  amount: number
  dueDate: string
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE'
  method: string
}

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
}

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  createdAt: string
  property?: {
    name: string
    address: string
  }
}

interface VisitorPass {
  id: string
  visitorName: string
  visitorPhone?: string
  purpose?: string
  validFrom: string
  validTo: string
  status: string
  qrCode: string
  qrCodeImage?: string
  unit: {
    number: string
  }
}

export default function TenantDashboard() {
  const [leaseInfo, setLeaseInfo] = useState<LeaseInfo | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [visitorPasses, setVisitorPasses] = useState<VisitorPass[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isVisitorPassDialogOpen, setIsVisitorPassDialogOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM'
  })
  const [newVisitorPass, setNewVisitorPass] = useState({
    visitorName: '',
    visitorPhone: '',
    purpose: '',
    validFrom: '',
    validTo: ''
  })

  useEffect(() => {
    loadTenantData()
  }, [])

  const loadTenantData = async () => {
    try {
      const token = localStorage.getItem('manzilos_token')
      if (!token) {
        console.log('No token found, redirecting to home')
        window.location.href = '/'
        return
      }

      console.log('Loading tenant data with token:', token.substring(0, 20) + '...')

      // Load lease information
      const leaseResponse = await fetch('/api/tenant/lease', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Lease response status:', leaseResponse.status)

      if (leaseResponse.ok) {
        const leaseData = await leaseResponse.json()
        console.log('Lease data:', leaseData)
        setLeaseInfo(leaseData)
      } else {
        const errorData = await leaseResponse.json()
        console.log('Lease error:', errorData)
        if (leaseResponse.status === 404) {
          // No active lease found, but we can still show other features
          console.log('No active lease found')
        }
      }

      // Load payments
      const paymentsResponse = await fetch('/api/tenant/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Payments response status:', paymentsResponse.status)

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        console.log('Payments data:', paymentsData)
        setPayments(paymentsData)
      }

      // Load maintenance requests
      const maintenanceResponse = await fetch('/api/tenant/maintenance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Maintenance response status:', maintenanceResponse.status)

      if (maintenanceResponse.ok) {
        const maintenanceData = await maintenanceResponse.json()
        console.log('Maintenance data:', maintenanceData)
        setMaintenanceRequests(maintenanceData)
      }

      // Load announcements
      const announcementsResponse = await fetch('/api/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Announcements response status:', announcementsResponse.status)

      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json()
        console.log('Announcements data:', announcementsData)
        setAnnouncements(announcementsData)
      }

      // Load visitor passes
      const visitorPassesResponse = await fetch('/api/visitor-passes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Visitor passes response status:', visitorPassesResponse.status)

      if (visitorPassesResponse.ok) {
        const visitorPassesData = await visitorPassesResponse.json()
        console.log('Visitor passes data:', visitorPassesData)
        setVisitorPasses(visitorPassesData)
      }

    } catch (error) {
      console.error('Load tenant data error:', error)
      toast.error('Failed to load tenant data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMaintenanceRequest = async () => {
    if (!leaseInfo) return

    try {
      const token = localStorage.getItem('manzilos_token')
      const response = await fetch('/api/maintenance/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newRequest,
          unitId: leaseInfo.unitId
        })
      })

      if (response.ok) {
        toast.success('Maintenance request created successfully')
        setIsCreateDialogOpen(false)
        setNewRequest({ title: '', description: '', category: '', priority: 'MEDIUM' })
        loadTenantData() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create maintenance request')
      }
    } catch (error) {
      console.error('Create maintenance request error:', error)
      toast.error('Failed to create maintenance request')
    }
  }

  const handleCreateVisitorPass = async () => {
    if (!leaseInfo) return

    try {
      const token = localStorage.getItem('manzilos_token')
      const response = await fetch('/api/visitor-passes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newVisitorPass,
          unitId: leaseInfo.unitId
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Visitor pass created successfully')
        setIsVisitorPassDialogOpen(false)
        setNewVisitorPass({ visitorName: '', visitorPhone: '', purpose: '', validFrom: '', validTo: '' })
        loadTenantData() // Refresh data

        // Show QR code if available
        if (data.visitorPass?.qrCodeImage) {
          // In a real app, you would show the QR code in a modal or download it
          console.log('QR Code generated:', data.visitorPass.qrCodeImage)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create visitor pass')
      }
    } catch (error) {
      console.error('Create visitor pass error:', error)
      toast.error('Failed to create visitor pass')
    }
  }

  const handlePayRent = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('manzilos_token')
      const response = await fetch(`/api/tenant/payments/${paymentId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Payment processed successfully')
        loadTenantData() // Refresh data
      } else {
        toast.error('Failed to process payment')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to process payment')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
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

  // Check if user is authenticated
  const token = localStorage.getItem('manzilos_token')
  if (!token) {
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

        {/* Lease Information Card */}
        {leaseInfo && (
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
        )}

        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Rent Payments</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="visitor-passes">Visitor Passes</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
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
                            onClick={() => handlePayRent(payment.id)}
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
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Wrench className="h-5 w-5 mr-2" />
                      Maintenance Requests
                    </CardTitle>
                    <CardDescription>Your maintenance requests and their status</CardDescription>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Maintenance Request</DialogTitle>
                        <DialogDescription>
                          Submit a new maintenance request for your unit
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={newRequest.title}
                            onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                            placeholder="Brief description of the issue"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={newRequest.category} onValueChange={(value) => setNewRequest({...newRequest, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="plumbing">Plumbing</SelectItem>
                              <SelectItem value="electrical">Electrical</SelectItem>
                              <SelectItem value="hvac">HVAC</SelectItem>
                              <SelectItem value="carpentry">Carpentry</SelectItem>
                              <SelectItem value="painting">Painting</SelectItem>
                              <SelectItem value="cleaning">Cleaning</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select value={newRequest.priority} onValueChange={(value) => setNewRequest({...newRequest, priority: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newRequest.description}
                            onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                            placeholder="Detailed description of the issue"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateMaintenanceRequest} disabled={!newRequest.title || !newRequest.description || !newRequest.category}>
                            Create Request
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-gray-500">{request.description}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
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

          <TabsContent value="visitor-passes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <QrCode className="h-5 w-5 mr-2" />
                      Visitor Passes
                    </CardTitle>
                    <CardDescription>Create and manage visitor QR passes</CardDescription>
                  </div>
                  <Dialog open={isVisitorPassDialogOpen} onOpenChange={setIsVisitorPassDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Pass
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Visitor Pass</DialogTitle>
                        <DialogDescription>
                          Generate a QR code pass for your visitor
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="visitorName">Visitor Name</Label>
                          <Input
                            id="visitorName"
                            value={newVisitorPass.visitorName}
                            onChange={(e) => setNewVisitorPass({...newVisitorPass, visitorName: e.target.value})}
                            placeholder="Enter visitor's full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="visitorPhone">Visitor Phone (Optional)</Label>
                          <Input
                            id="visitorPhone"
                            value={newVisitorPass.visitorPhone}
                            onChange={(e) => setNewVisitorPass({...newVisitorPass, visitorPhone: e.target.value})}
                            placeholder="+971 50 123 4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="purpose">Purpose (Optional)</Label>
                          <Input
                            id="purpose"
                            value={newVisitorPass.purpose}
                            onChange={(e) => setNewVisitorPass({...newVisitorPass, purpose: e.target.value})}
                            placeholder="Visit purpose"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="validFrom">Valid From</Label>
                            <Input
                              id="validFrom"
                              type="datetime-local"
                              value={newVisitorPass.validFrom}
                              onChange={(e) => setNewVisitorPass({...newVisitorPass, validFrom: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="validTo">Valid To</Label>
                            <Input
                              id="validTo"
                              type="datetime-local"
                              value={newVisitorPass.validTo}
                              onChange={(e) => setNewVisitorPass({...newVisitorPass, validTo: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsVisitorPassDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateVisitorPass} disabled={!newVisitorPass.visitorName || !newVisitorPass.validFrom || !newVisitorPass.validTo}>
                            Create Pass
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visitorPasses.map((pass) => (
                    <div key={pass.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{pass.visitorName}</p>
                          <p className="text-sm text-gray-500">
                            {pass.purpose && `Purpose: ${pass.purpose}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            Valid: {new Date(pass.validFrom).toLocaleDateString()} - {new Date(pass.validTo).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(pass.status)}>
                          {pass.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <QrCode className="h-4 w-4 mr-2" />
                          QR Code
                        </Button>
                      </div>
                    </div>
                  ))}
                  {visitorPasses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No visitor passes found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Announcements
                </CardTitle>
                <CardDescription>Important updates from your property manager</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{announcement.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            announcement.type === 'urgent' ? 'bg-red-100 text-red-800' :
                            announcement.type === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {announcement.type}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{announcement.content}</p>
                      {announcement.property && (
                        <p className="text-sm text-gray-500">
                          Property: {announcement.property.name}
                        </p>
                      )}
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No announcements at this time
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}