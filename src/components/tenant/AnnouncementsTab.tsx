"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

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

interface AnnouncementsTabProps {
  announcements: Announcement[]
}

export function AnnouncementsTab({ announcements }: AnnouncementsTabProps) {
  return (
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
  )
}
