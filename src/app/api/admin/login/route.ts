// app/api/admin/login/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const { password } = await request.json()
    if (password === process.env.NEXT_ADMIN_PWD) {
        const res = NextResponse.json({ success: true })
        // Set login cookie cmsAuth=true
        res.cookies.set('cmsAuth', 'true', { path: '/', maxAge: 60 * 60 * 24 })
        return res
    }
    return NextResponse.json({ success: false }, { status: 401 })
}
