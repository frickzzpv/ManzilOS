"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wrench, Plus, Upload } from "lucide-react"
import { toast } from "sonner"
import Link from 'next/link'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
}

interface MaintenanceTabProps {
  requests: MaintenanceRequest[]
  onCreateRequest: (request: { title: string; description: string; category: string; priority: string; images: string[] }) => Promise<void>
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800'
    case 'PENDING': return 'bg-yellow-100 text-yellow-800'
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

export function MaintenanceTab({ requests, onCreateRequest }: MaintenanceTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM'
  })

  const [files, setFiles] = useState<FileList | null>(null)

  const handleCreate = async () => {
    // This is a mock upload. In a real app, you would upload to a service like S3.
    const uploadedImageUrls = files ? await Promise.all(
      Array.from(files).map(async (file) => {
        toast.info(`Uploading ${file.name}...`)
        // Simulate upload delay
        await new Promise(res => setTimeout(res, 1000))
        toast.success(`${file.name} uploaded`)
        return `https://example.com/uploads/${file.name}`
      })
    ) : []

    await onCreateRequest({ ...newRequest, images: uploadedImageUrls })
    setIsCreateDialogOpen(false)
    setNewRequest({ title: '', description: '', category: '', priority: 'MEDIUM' })
    setFiles(null)
  }

  return (
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
                        <div>
                          <Label htmlFor="images">Images</Label>
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="dropzone-file"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                              </div>
                              <Input id="dropzone-file" type="file" className="hidden" multiple onChange={(e) => setFiles(e.target.files)} />
                            </label>
                          </div>
                          {files && (
                            <div className="mt-2 text-sm text-gray-500">
                              Selected files: {Array.from(files).map(f => f.name).join(', ')}
                            </div>
                          )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!newRequest.title || !newRequest.description || !newRequest.category}>
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
          {requests.map((request) => (
            <Link href={`/maintenance/${request.id}`} key={request.id} className="block hover:bg-gray-50">
                <div className="flex items-center justify-between p-4 border rounded-lg">
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
            </Link>
          ))}
          {requests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No maintenance requests found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
