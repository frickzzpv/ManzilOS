"use client"

import { useAuth } from '@/hooks/use-auth'
import {
    Sidebar,
    SidebarProvider,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar'
import { LayoutDashboard, Building, Users, FileText, Wrench } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    title: 'Dashboard',
    href: '/landlord',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: 'Properties',
    href: '/landlord/properties',
    icon: <Building className="h-4 w-4" />,
  },
  {
    title: 'Tenants',
    href: '/landlord/tenants',
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: 'Leases',
    href: '/landlord/leases',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: 'Maintenance',
    href: '/landlord/maintenance',
    icon: <Wrench className="h-4 w-4" />,
  },
]

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: auth, isLoading } = useAuth()
  const pathname = usePathname()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!auth || !['LANDLORD', 'PROPERTY_MANAGER'].includes(auth.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
        <div className="flex min-h-screen">
            <Sidebar>
                <SidebarContent>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <Link href={item.href}>
                                    <SidebarMenuButton isActive={pathname === item.href}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    </SidebarProvider>
  )
}
