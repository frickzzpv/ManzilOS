"use client"

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Bell, Check } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications')
      return data
    },
  })
}

export function NotificationCenter() {
  const queryClient = useQueryClient()
  const { data: auth } = useAuth()
  const { data: notifications, isLoading } = useNotifications()

  const markAsRead = useMutation({
    mutationFn: (notificationIds: string[]) => api.post('/notifications', { notificationIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  useEffect(() => {
    if (!auth?.token) return

    const socket = io({
      path: '/api/socketio',
    })

    socket.on('connect', () => {
      socket.emit('authenticate', auth.token)
    })

    socket.on('notification', (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.info(notification.title)
    })

    return () => {
      socket.disconnect()
    }
  }, [queryClient, auth])

  const unreadCount = notifications?.filter((n: any) => !n.readAt).length || 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Notifications</h4>
            <p className="text-sm text-muted-foreground">
              You have {unreadCount} unread messages.
            </p>
          </div>
          <div className="grid gap-2">
            {notifications?.map((n: any) => (
              <div
                key={n.id}
                className="mb-2 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={() => {
                const unreadIds = notifications.filter((n: any) => !n.readAt).map((n: any) => n.id)
                markAsRead.mutate(unreadIds)
              }}
            >
              <Check className="mr-2 h-4 w-4" /> Mark all as read
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
