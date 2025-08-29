"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Home, Wrench, Users } from "lucide-react"
import { toast } from "sonner"

export default function Home() {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtp, setShowOtp] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState("")

  const handleSendOtp = async () => {
    if (!phone || !selectedRole) {
      toast.error("Please enter phone number and select your role")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, role: selectedRole }),
      })

      const data = await response.json()

      if (data.success) {
        setShowOtp(true)
        setUserId(data.userId)
        toast.success(`OTP sent to ${phone}`)
      } else {
        toast.error(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      toast.error('Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp, userId }),
      })

      const data = await response.json()

      if (data.success) {
        // The token is now in an httpOnly cookie
        localStorage.setItem('manzilos_user', JSON.stringify(data.user))

        toast.success('Login successful!')

        // Redirect based on role
        setTimeout(() => {
          const redirectMap = {
            'TENANT': '/tenant',
            'LANDLORD': '/landlord',
            'PROPERTY_MANAGER': '/manager',
            'VENDOR': '/vendor'
          }
          window.location.href = redirectMap[data.user.role] || '/'
        }, 1000)
      } else {
        toast.error(data.error || 'Invalid OTP')
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      toast.error('Failed to verify OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building className="h-12 w-12 text-purple-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">ManzilOS</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Property & Community Management SaaS
            </p>
          </div>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Welcome to ManzilOS</CardTitle>
              <CardDescription>
                Sign in to manage your properties, tenants, and community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+971 50 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={showOtp}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">I am a</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole} disabled={showOtp}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tenant">
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-2" />
                            Tenant
                          </div>
                        </SelectItem>
                        <SelectItem value="landlord">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Landlord
                          </div>
                        </SelectItem>
                        <SelectItem value="property_manager">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Property Manager
                          </div>
                        </SelectItem>
                        <SelectItem value="vendor">
                          <div className="flex items-center">
                            <Wrench className="h-4 w-4 mr-2" />
                            Service Vendor
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {!showOtp ? (
                    <Button
                      onClick={handleSendOtp}
                      className="w-full"
                      disabled={!phone || !selectedRole || isLoading}
                    >
                      {isLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                        />
                      </div>
                      <Button
                        onClick={handleVerifyOtp}
                        className="w-full"
                        disabled={otp.length !== 6 || isLoading}
                      >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setShowOtp(false)
                          setOtp("")
                        }}
                        disabled={isLoading}
                      >
                        Change Phone Number
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      Registration is currently by invitation only.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Please contact your property manager to get access.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Supporting landlords, tenants, and vendors across the Middle East</p>
            <div className="flex items-center justify-center mt-2 space-x-4">
              <span>🇦🇪 UAE</span>
              <span>🇸🇦 KSA</span>
              <span>🇶🇦 Qatar</span>
              <span>🇰🇼 Kuwait</span>
              <span>🇴🇲 Oman</span>
              <span>🇧🇭 Bahrain</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}