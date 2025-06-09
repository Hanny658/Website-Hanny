// app/api/admin/cleanup/gone-cheapies/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
    try {
        const result = await prisma.cheapie.deleteMany({ where: { stock: 'gone' } })
        return NextResponse.json({ deleted: result.count })
    } catch (err) {
        console.error('Deleting gone cheapies failed:', err)
        return NextResponse.json({ deleted: 0 }, { status: 500 })
    }
}
