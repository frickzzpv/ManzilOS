import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notification-service'

// This is a simulated cron job. In a production environment, this would be
// triggered by a real cron service (e.g., Vercel Cron Jobs, GitHub Actions).
// We are securing it with a secret to prevent unauthorized access.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    const now = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(now.getDate() + 60);

    const expiringLeases = await db.lease.findMany({
      where: {
        endDate: {
          gte: now,
          lte: sixtyDaysFromNow,
        },
        status: 'active',
        renewalOfferStatus: 'NOT_SENT',
      },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
        organization: {
            include: {
                users: {
                    where: { role: 'PROPERTY_MANAGER' }
                }
            }
        }
      },
    });

    for (const lease of expiringLeases) {
        const message = `Lease for Unit ${lease.unit.number} (${lease.tenant.name}) at ${lease.unit.property.name} is expiring on ${lease.endDate.toLocaleDateString()}.`;

        // Notify all property managers in the organization
        for (const manager of lease.organization.users) {
            await createNotification({
                userId: manager.id,
                type: 'LEASE_RENEWAL',
                title: 'Lease Expiring Soon',
                message,
                channel: 'PUSH',
            });
        }
    }

    return NextResponse.json({ success: true, count: expiringLeases.length });

  } catch (error) {
    console.error('Error checking lease renewals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
