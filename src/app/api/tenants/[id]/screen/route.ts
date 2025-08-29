import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession(request)
    if (!session || !['LANDLORD', 'PROPERTY_MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = params.id

    // In a real app, you would integrate with a screening service like Checkr.
    // For now, we'll just simulate the process.

    await db.user.updateMany({
      where: {
        id: tenantId,
        organizationId: session.organizationId,
      },
      data: { screeningStatus: 'IN_PROGRESS' },
    })

    // Simulate the time it takes for screening
    setTimeout(async () => {
      await db.user.updateMany({
        where: { id: tenantId },
        // In a real app, you'd get the result from the screening service
        data: { screeningStatus: 'COMPLETED' },
      })
      console.log(`Screening completed for tenant ${tenantId}`)
    }, 30000) // 30 seconds

    return NextResponse.json({ success: true, message: 'Tenant screening process started.' })
  } catch (error) {
    console.error('Tenant screening error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
