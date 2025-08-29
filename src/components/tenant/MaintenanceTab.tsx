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
    const uploadedImageUrls = files ? await Promise.all(
      Array.from(files).map(async (file) => {
        toast.info(`Uploading ${file.name}...`)
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
                {/* Form fields from previous implementation */}
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
