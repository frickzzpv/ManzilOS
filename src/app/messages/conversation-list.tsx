"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

const api = axios.create({
  baseURL: '/api',
})

const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get('/conversations')
      return data
    },
  })
}

interface ConversationListProps {
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const { data: auth } = useAuth()
  const { data: conversations, isLoading } = useConversations()

  const getOtherParticipant = (participants: any[]) => {
    return participants.find((p) => p.userId !== auth?.userId)?.user
  }

  return (
    <div className="h-full flex flex-col border-r">
        <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
            {isLoading && <p className="p-4">Loading conversations...</p>}
            {conversations?.map((convo: any) => {
                const otherParticipant = getOtherParticipant(convo.participants)
                return (
                    <div
                        key={convo.id}
                        className={cn(
                            "p-4 cursor-pointer hover:bg-accent flex items-center space-x-3",
                            selectedConversationId === convo.id && "bg-accent"
                        )}
                        onClick={() => onSelectConversation(convo.id)}
                    >
                        <Avatar>
                            <AvatarImage src={otherParticipant?.avatar} />
                            <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold truncate">{otherParticipant?.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                                {convo.messages[0]?.content}
                            </p>
                        </div>
                    </div>
                )}
            )}
        </div>
    </div>
  )
}
