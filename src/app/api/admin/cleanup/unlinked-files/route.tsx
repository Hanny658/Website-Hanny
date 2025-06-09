// app/api/admin/cleanup/unlinked-files/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    let files: string[] = []
    try {
        files = await fs.promises.readdir(uploadsDir)
    } catch (err) {
        console.error('Reading uploads directory failed:', err)
        return NextResponse.json({ removed: 0 }, { status: 500 })
    }

    // Collect all referenced filenames from models
    const cheapies = await prisma.cheapie.findMany({ select: { image: true } })
    const referenced = new Set<string>()
    cheapies.forEach(c => {
        if (c.image) {
            const filename = path.basename(c.image)
            referenced.add(filename)
        }
    })
    // TODO: add other models with file fields as needed

    // Determine unlinked files
    const unlinked = files.filter(f => !referenced.has(f))

    // Remove them
    let removedCount = 0
    for (const fname of unlinked) {
        try {
            await fs.promises.unlink(path.join(uploadsDir, fname))
            removedCount++
        } catch (err) {
            console.error('Failed to delete file', fname, err)
        }
    }

    return NextResponse.json({ removed: removedCount })
}
