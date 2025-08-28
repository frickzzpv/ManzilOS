"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const getAuthToken = () => {
    if (typeof window === 'undefined') {
        return null
    }
    return localStorage.getItem('manzilos_token')
}

api.interceptors.request.use(config => {
    const token = getAuthToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

const useMaintenanceRequest = (id: string) => {
  return useQuery({
    queryKey: ['maintenanceRequest', id],
    queryFn: async () => {
      const { data } = await api.get(`/maintenance/requests/${id}`)
      return data
    },
    enabled: !!id,
  })
}

const useMaintenanceComments = (id: string) => {
    return useQuery({
        queryKey: ['maintenanceComments', id],
        queryFn: async () => {
            const { data } = await api.get(`/maintenance/requests/${id}/comments`)
            return data
        },
        enabled: !!id,
    })
}

const useMaintenanceStatusHistory = (id: string) => {
    return useQuery({
        queryKey: ['maintenanceStatusHistory', id],
        queryFn: async () => {
            const { data } = await api.get(`/maintenance/requests/${id}/status-history`)
            return data
        },
        enabled: !!id,
    })
}

export default function MaintenanceRequestDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const [newComment, setNewComment] = useState('')

  const { data: request, isLoading: isRequestLoading } = useMaintenanceRequest(id)
  const { data: comments, isLoading: areCommentsLoading } = useMaintenanceComments(id)
  const { data: history, isLoading: isHistoryLoading } = useMaintenanceStatusHistory(id)

  const addComment = useMutation({
    mutationFn: (content: string) => api.post(`/maintenance/requests/${id}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceComments', id] })
      setNewComment('')
      toast.success('Comment added')
    },
    onError: () => {
        toast.error('Failed to add comment')
    }
  })

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment.mutate(newComment)
    }
  }

  if (isRequestLoading || areCommentsLoading || isHistoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!request) {
    return <div>Request not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{request.title}</CardTitle>
          <CardDescription>
            {new Date(request.createdAt).toLocaleString()} - Priority: <Badge>{request.priority}</Badge> - Status: <Badge>{request.status}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{request.description}</p>

          {request.images && JSON.parse(request.images).length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Images</h4>
              <div className="flex space-x-2">
                {JSON.parse(request.images).map((img: string) => (
                  <img key={img} src={img} alt="Maintenance request attachment" className="h-32 w-32 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h4 className="font-semibold mb-4">Comments</h4>
                <div className="space-y-4 mb-4">
                    {comments?.map((comment: any) => (
                        <div key={comment.id} className="flex items-start space-x-4">
                            <Avatar>
                                <AvatarImage src={comment.user.avatar} />
                                <AvatarFallback>{comment.user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{comment.user.name} <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</span></p>
                                <p>{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex w-full items-center space-x-2">
                    <Input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <Button onClick={handleAddComment} disabled={addComment.isPending}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div>
                <h4 className="font-semibold mb-4">Status History</h4>
                <div className="space-y-4">
                    {history?.map((entry: any) => (
                        <div key={entry.id} className="flex items-start space-x-4">
                            <Avatar>
                                <AvatarImage src={entry.changedBy.avatar} />
                                <AvatarFallback>{entry.changedBy.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{entry.changedBy.name} updated status to <Badge>{entry.status}</Badge></p>
                                <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
