import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const session = await getUserSession(request)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = cookies().get('manzilos_token')?.value

  return NextResponse.json({ ...session, token })
}
