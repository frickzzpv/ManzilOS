"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Plus } from "lucide-react"

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

interface VisitorPassesTabProps {
  passes: VisitorPass[]
  onCreatePass: (pass: { visitorName: string; visitorPhone: string; purpose: string; validFrom: string; validTo: string; }) => Promise<void>
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'used': return 'bg-blue-100 text-blue-800'
    case 'expired': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function VisitorPassesTab({ passes, onCreatePass }: VisitorPassesTabProps) {
  const [isVisitorPassDialogOpen, setIsVisitorPassDialogOpen] = useState(false)
  const [newVisitorPass, setNewVisitorPass] = useState({
    visitorName: '',
    visitorPhone: '',
    purpose: '',
    validFrom: '',
    validTo: ''
  })

  const handleCreate = async () => {
    await onCreatePass(newVisitorPass)
    setIsVisitorPassDialogOpen(false)
    setNewVisitorPass({ visitorName: '', visitorPhone: '', purpose: '', validFrom: '', validTo: '' })
  }

  return (
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
                  <Button onClick={handleCreate} disabled={!newVisitorPass.visitorName || !newVisitorPass.validFrom || !newVisitorPass.validTo}>
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
          {passes.map((pass) => (
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
          {passes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No visitor passes found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
