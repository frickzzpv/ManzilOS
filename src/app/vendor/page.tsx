"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wrench, Clock, CheckCircle, AlertTriangle, DollarSign, Star } from "lucide-react"
import { toast } from "sonner"

interface MaintenanceJob {
  id: string
  title: string
  description: string
  category: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
  scheduledDate?: string
  estimatedCost?: number
  actualCost?: number
  unit: {
    number: string
    property: {
      name: string
      address: string
    }
  }
  tenant: {
    name: string
    phone: string
  }
}

interface VendorProfile {
  id: string
  name: string
  email: string
  phone: string
  category: string
  status: string
  rating: number
  specialties: string[]
}

export default function VendorDashboard() {
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null)
  const [pendingJobs, setPendingJobs] = useState<MaintenanceJob[]>([])
  const [activeJobs, setActiveJobs] = useState<MaintenanceJob[]>([])
  const [completedJobs, setCompletedJobs] = useState<MaintenanceJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<MaintenanceJob | null>(null)
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')
  const [actualCost, setActualCost] = useState('')

  useEffect(() => {
    loadVendorData()
  }, [])

  const loadVendorData = async () => {
    try {
      const token = localStorage.getItem('manzilos_token')
      if (!token) {
        window.location.href = '/'
        return
      }

      // Load vendor profile
      const profileResponse = await fetch('/api/vendor/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setVendorProfile(profileData)
      }

      // Load pending jobs
      const pendingResponse = await fetch('/api/vendor/jobs?status=PENDING', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingJobs(pendingData)
      }

      // Load active jobs
      const activeResponse = await fetch('/api/vendor/jobs?status=IN_PROGRESS', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (activeResponse.ok) {
        const activeData = await activeResponse.json()
        setActiveJobs(activeData)
      }

      // Load completed jobs
      const completedResponse = await fetch('/api/vendor/jobs?status=COMPLETED', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (completedResponse.ok) {
        const completedData = await completedResponse.json()
        setCompletedJobs(completedData)
      }

    } catch (error) {
      console.error('Load vendor data error:', error)
      toast.error('Failed to load vendor data')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('manzilos_token')
      const response = await fetch(`/api/vendor/jobs/${jobId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Job accepted successfully')
        loadVendorData() // Refresh data
      } else {
        toast.error('Failed to accept job')
      }
    } catch (error) {
      console.error('Accept job error:', error)
      toast.error('Failed to accept job')
    }
  }

  const handleCompleteJob = async () => {
    if (!selectedJob) return

    try {
      const token = localStorage.getItem('manzilos_token')
      const response = await fetch(`/api/vendor/jobs/${selectedJob.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: completionNotes,
          actualCost: actualCost ? parseFloat(actualCost) : null
        })
      })

      if (response.ok) {
        toast.success('Job completed successfully')
        setIsJobDetailOpen(false)
        setCompletionNotes('')
        setActualCost('')
        setSelectedJob(null)
        loadVendorData() // Refresh data
      } else {
        toast.error('Failed to complete job')
      }
    } catch (error) {
      console.error('Complete job error:', error)
      toast.error('Failed to complete job')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
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

  const openJobDetail = (job: MaintenanceJob) => {
    setSelectedJob(job)
    setCompletionNotes('')
    setActualCost(job.actualCost?.toString() || '')
    setIsJobDetailOpen(true)
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Vendor Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your service requests and jobs</p>
            </div>
            {vendorProfile && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold">{vendorProfile.name}</p>
                  <p className="text-sm text-gray-500">{vendorProfile.category}</p>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm">{vendorProfile.rating.toFixed(1)}</span>
                  </div>
                </div>
                <Badge className={
                  vendorProfile.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  vendorProfile.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {vendorProfile.status}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingJobs.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting acceptance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobs.length}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedJobs.length}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorProfile?.rating.toFixed(1) || '0.0'}</div>
              <p className="text-xs text-muted-foreground">
                Customer rating
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Jobs</TabsTrigger>
            <TabsTrigger value="active">Active Jobs</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Pending Jobs
                </CardTitle>
                <CardDescription>Jobs assigned to you that need acceptance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-gray-500">
                            {job.unit.property.name} - Unit {job.unit.number}
                          </p>
                          <p className="text-xs text-gray-400">
                            {job.tenant.name} • {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getPriorityColor(job.priority)}>
                          {job.priority}
                        </Badge>
                        <Button
                          onClick={() => handleAcceptJob(job.id)}
                          size="sm"
                        >
                          Accept Job
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => openJobDetail(job)}
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingJobs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No pending jobs found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Active Jobs
                </CardTitle>
                <CardDescription>Jobs currently in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-gray-500">
                            {job.unit.property.name} - Unit {job.unit.number}
                          </p>
                          <p className="text-xs text-gray-400">
                            {job.tenant.name} • {job.scheduledDate ? `Scheduled: ${new Date(job.scheduledDate).toLocaleDateString()}` : 'Not scheduled'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getPriorityColor(job.priority)}>
                          {job.priority}
                        </Badge>
                        <Button
                          onClick={() => openJobDetail(job)}
                          size="sm"
                        >
                          Complete Job
                        </Button>
                      </div>
                    </div>
                  ))}
                  {activeJobs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No active jobs found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Completed Jobs
                </CardTitle>
                <CardDescription>Your finished jobs and work history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-gray-500">
                            {job.unit.property.name} - Unit {job.unit.number}
                          </p>
                          <p className="text-xs text-gray-400">
                            {job.tenant.name} • Completed: {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {job.actualCost && (
                          <span className="text-sm font-medium">
                            {formatCurrency(job.actualCost)}
                          </span>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => openJobDetail(job)}
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {completedJobs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No completed jobs found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Job Detail Dialog */}
        <Dialog open={isJobDetailOpen} onOpenChange={setIsJobDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Job Details</DialogTitle>
              <DialogDescription>
                View and manage job information
              </DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Job Title</Label>
                    <p className="text-sm text-gray-600">{selectedJob.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm text-gray-600">{selectedJob.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge className={getPriorityColor(selectedJob.priority)}>
                      {selectedJob.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedJob.status)}>
                      {selectedJob.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600">{selectedJob.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Property</Label>
                    <p className="text-sm text-gray-600">{selectedJob.unit.property.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Unit</Label>
                    <p className="text-sm text-gray-600">Unit {selectedJob.unit.number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tenant</Label>
                    <p className="text-sm text-gray-600">{selectedJob.tenant.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Contact</Label>
                    <p className="text-sm text-gray-600">{selectedJob.tenant.phone}</p>
                  </div>
                </div>

                {selectedJob.estimatedCost && (
                  <div>
                    <Label className="text-sm font-medium">Estimated Cost</Label>
                    <p className="text-sm text-gray-600">{formatCurrency(selectedJob.estimatedCost)}</p>
                  </div>
                )}

                {selectedJob.status === 'IN_PROGRESS' && (
                  <>
                    <div>
                      <Label htmlFor="actualCost">Actual Cost (Optional)</Label>
                      <Input
                        id="actualCost"
                        type="number"
                        placeholder="0.00"
                        value={actualCost}
                        onChange={(e) => setActualCost(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="completionNotes">Completion Notes</Label>
                      <Textarea
                        id="completionNotes"
                        placeholder="Describe the work completed..."
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsJobDetailOpen(false)}>
                        Close
                      </Button>
                      <Button onClick={handleCompleteJob}>
                        Complete Job
                      </Button>
                    </div>
                  </>
                )}

                {selectedJob.status === 'COMPLETED' && selectedJob.actualCost && (
                  <div>
                    <Label className="text-sm font-medium">Final Cost</Label>
                    <p className="text-sm text-gray-600">{formatCurrency(selectedJob.actualCost)}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}