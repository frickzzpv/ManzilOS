import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { z } from 'zod'

const expenseSchema = z.object({
    propertyId: z.string().min(1),
    category: z.string().min(1),
    amount: z.number().positive(),
    description: z.string().optional(),
    date: z.string().datetime(),
})

export async function GET(request: NextRequest) {
    try {
        const session = await getUserSession(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const expenses = await db.expense.findMany({
            where: { organizationId: session.organizationId },
            include: { property: true }
        })

        return NextResponse.json(expenses)
    } catch (error) {
        console.error('Get expenses error:', error)
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
        const validation = expenseSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }

        const { propertyId, category, amount, description, date } = validation.data

        const property = await db.property.findFirst({ where: { id: propertyId, organizationId: session.organizationId }})
        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }

        const expense = await db.expense.create({
            data: {
                organizationId: session.organizationId,
                propertyId,
                category,
                amount,
                description,
                date: new Date(date),
            }
        })

        return NextResponse.json(expense, { status: 201 })

    } catch (error) {
        console.error('Create expense error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
