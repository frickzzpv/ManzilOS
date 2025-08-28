"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, Wrench } from "lucide-react"

export default function PropertyManagerDashboard() {
  useEffect(() => {
    const token = localStorage.getItem('manzilos_token')
    if (!token) {
      window.location.href = '/'
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Manager Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage properties, tenants, and maintenance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Property Management
              </CardTitle>
              <CardDescription>Manage properties and units</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Property management features coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Tenant Management
              </CardTitle>
              <CardDescription>Manage tenants and leases</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Tenant management features coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Maintenance
              </CardTitle>
              <CardDescription>Handle maintenance requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Maintenance features coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}