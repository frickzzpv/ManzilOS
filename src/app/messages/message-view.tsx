"use client"

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { io, Socket } from "socket.io-client";

const api = axios.create({
  baseURL: '/api',
})

const useMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return []
      const { data } = await api.get(`/conversations/${conversationId}/messages`)
      return data
    },
    enabled: !!conversationId,
  })
}

const sendMessage = ({ conversationId, content }: { conversationId: string, content: string }) => {
    return api.post(`/conversations/${conversationId}/messages`, { content })
}

interface MessageViewProps {
  conversationId: string | null
}

export function MessageView({ conversationId }: MessageViewProps) {
  const { data: auth } = useAuth()
  const queryClient = useQueryClient()
  const { data: messages, isLoading } = useMessages(conversationId)
  const [newMessage, setNewMessage] = useState('')
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);


  useEffect(() => {
    if (!conversationId || !auth?.token) return;

    const socket = io({ path: '/api/socketio' });
    socketRef.current = socket;

    socket.on('connect', () => {
        socket.emit('authenticate', auth.token);
        socket.emit('join_conversation', conversationId);
    });

    socket.on('new_message', (message: any) => {
        queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
            return oldData ? [...oldData, message] : [message];
        });
    });

    return () => {
        socket.emit('leave_conversation', conversationId);
        socket.disconnect();
    };
  }, [conversationId, auth?.token, queryClient]);

  const mutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
        setNewMessage('')
        // The message will be added via the websocket event, so no need to invalidate here
    }
  })

  const handleSendMessage = () => {
    if (newMessage.trim() && conversationId) {
      mutation.mutate({ conversationId, content: newMessage })
    }
  }

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/50">
        <p>Select a conversation to start messaging</p>
      </div>
    )
  }

  if (isLoading) {
    return <div className="h-full flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        {/* Header with other participant's name could go here */}
        <h3 className="font-semibold">Conversation</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg: any) => (
          <div
            key={msg.id}
            className={`flex items-end space-x-2 ${
              msg.sender.id === auth?.userId ? 'justify-end' : ''
            }`}
          >
            {msg.sender.id !== auth?.userId && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.sender.avatar} />
                    <AvatarFallback>{msg.sender.name?.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                msg.sender.id === auth?.userId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
          />
          <Button onClick={handleSendMessage} disabled={mutation.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
