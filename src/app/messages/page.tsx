"use client"

import { useState } from 'react'
import { ConversationList } from './conversation-list'
import { MessageView } from './message-view'
import { useAuth } from '@/hooks/use-auth'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export default function MessagesPage() {
  const { data: auth, isLoading } = useAuth()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!auth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to view your messages.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={25} minSize={20}>
                    <ConversationList
                        selectedConversationId={selectedConversationId}
                        onSelectConversation={setSelectedConversationId}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={75}>
                    <MessageView conversationId={selectedConversationId} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    </div>
  )
}
