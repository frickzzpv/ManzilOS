import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is landlord or property manager
    if (!['LANDLORD', 'PROPERTY_MANAGER'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get organization stats
    const organization = await db.organization.findUnique({
      where: { id: session.organizationId },
      include: {
        properties: {
          include: {
            units: {
              include: {
                leases: {
                  where: { status: 'active' }
                },
                maintenance: true
              }
            }
          }
        },
        leases: {
          where: { status: 'active' }
        },
        payments: {
          where: {
            dueDate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Calculate stats
    const totalProperties = organization.properties.length
    const totalUnits = organization.properties.reduce((sum, prop) => sum + prop.units.length, 0)
    const occupiedUnits = organization.properties.reduce((sum, prop) =>
      sum + prop.units.filter(unit => unit.status === 'occupied').length, 0
    )
    const totalTenants = organization.leases.length
    const monthlyRevenue = organization.payments
      .filter(payment => payment.status === 'COMPLETED')
      .reduce((sum, payment) => sum + payment.amount, 0)
    const pendingPayments = organization.payments
      .filter(payment => payment.status === 'PENDING').length
    const overduePayments = organization.payments
      .filter(payment =>
        payment.status === 'PENDING' &&
        new Date(payment.dueDate) < new Date()
      ).length
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0
    const openMaintenanceRequests = organization.properties.reduce((sum, prop) =>
        sum + prop.units.reduce((unitSum, unit) =>
            unitSum + unit.maintenance.filter(m => m.status === 'PENDING' || m.status === 'IN_PROGRESS').length,
        0),
    0)

    return NextResponse.json({
      totalProperties,
      totalUnits,
      occupiedUnits,
      totalTenants,
      monthlyRevenue,
      pendingPayments,
      overduePayments,
      occupancyRate,
      openMaintenanceRequests
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}