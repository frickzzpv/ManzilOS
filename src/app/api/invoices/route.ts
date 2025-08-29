import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { z } from 'zod'

const invoiceSchema = z.object({
    leaseId: z.string().min(1),
    amount: z.number().positive(),
    dueDate: z.string().datetime(),
})

export async function GET(request: NextRequest) {
    try {
        const session = await getUserSession(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const invoices = await db.invoice.findMany({
            where: { organizationId: session.organizationId },
            include: { lease: { include: { tenant: true, unit: true } } }
        })

        return NextResponse.json(invoices)
    } catch (error) {
        console.error('Get invoices error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession(request)
        if (!session || !['LANDLORD', 'PROPERTY_MANAGER'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validation = invoiceSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }

        const { leaseId, amount, dueDate } = validation.data

        const lease = await db.lease.findFirst({ where: { id: leaseId, organizationId: session.organizationId }})
        if (!lease) {
            return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
        }

        const invoice = await db.invoice.create({
            data: {
                organizationId: session.organizationId,
                leaseId,
                amount,
                dueDate: new Date(dueDate),
            }
        })

        return NextResponse.json(invoice, { status: 201 })

    } catch (error) {
        console.error('Create invoice error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
