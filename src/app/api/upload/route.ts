/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'
import { writeFile, mkdirSync, existsSync } from 'fs'
import { promisify } from 'util'
import path from 'path'
import sharp from 'sharp'

// Wrap writeFile to Promise 
const writeFileAsync = promisify(writeFile)

// busboy/sharp needs nodejs
export const runtime = 'nodejs'

/**
 * POST /api/upload
 *
 * - Limit：if file buffer is greater than 5M, return 413
 * - if final file sized > 1MB, use sharp to compress it to JPEG(quality: 80)
 * - write it to public/uploads/{timestamp}-{rand}.{ext}, then give back { url }
 */
export async function POST(request: NextRequest) {
    // turn NextRequest.headers to a universal object
    const headers = Object.fromEntries(request.headers.entries())

    // import Busboy dynamically for ESM runtime
    let BusboyFactory: any
    try {
        const imported = await import('busboy')
        BusboyFactory = (imported as any).default || (imported as any).Busboy || imported
    } catch (err) {
        console.error('[API][Upload] Cannot import busboy：', err)
        return NextResponse.json(
            { error: 'Internal Server Error: failed to load file handling system.' },
            { status: 500 }
        )
    }

    return new Promise<NextResponse>(async (resolve) => {
        try {
            const busboy = BusboyFactory({ headers })
            let fileBuffer: Buffer = Buffer.alloc(0)
            let originalFilename: string = ''
            let fileTooLarge = false

            busboy.on(
                'file',
                (
                    _fieldname: string,
                    fileStream: NodeJS.ReadableStream,
                    info: { filename: string; encoding: string; mimeType: string }
                ) => {
                    originalFilename = info.filename

                    fileStream.on('data', (chunk: Buffer) => {
                        fileBuffer = Buffer.concat([fileBuffer, chunk])
                        if (fileBuffer.length > 5 * 1024 * 1024) {
                            // > 5MB, mark as too big. Tag it 
                            fileTooLarge = true
                            fileStream.resume()
                        }
                    })
                }
            )

            busboy.on('finish', async () => {
                if (fileTooLarge) {
                    return resolve(
                        NextResponse.json(
                            { error: '文件过大，最大支持 5 MB' },
                            { status: 413 }
                        )
                    )
                }
                if (!originalFilename) {
                    return resolve(
                        NextResponse.json(
                            { error: '未检测到 “file” 上传字段' },
                            { status: 400 }
                        )
                    )
                }
                try {
                    let finalBuffer: Buffer = fileBuffer

                    // for final buffer > 1MB, use sharp to convert it to JPEG
                    if (fileBuffer.length > 1 * 1024 * 1024) {
                        finalBuffer = await sharp(fileBuffer)
                            .jpeg({ quality: 80 })
                            .toBuffer()
                    }

                    // check dir: public/uploads
                    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
                    if (!existsSync(uploadsDir)) {
                        mkdirSync(uploadsDir, { recursive: true })
                    }

                    // generate the unique filename：timestamp-rand.ext
                    const timestamp = Date.now()
                    const randomStr = Math.random().toString(36).slice(2, 8)
                    const ext = path.extname(originalFilename) || '.jpg'
                    const filename = `${timestamp}-${randomStr}${ext}`
                    const filePath = path.join(uploadsDir, filename)

                    // Finally write it to local
                    await writeFileAsync(filePath, finalBuffer)

                    // give the url back
                    const publicUrl = `/uploads/${filename}`
                    return resolve(NextResponse.json({ url: publicUrl }))
                } catch (err) {
                    console.error('[API][Upload] 写入或压缩失败：', err)
                    return resolve(
                        NextResponse.json(
                            { error: '保存文件失败' },
                            { status: 500 }
                        )
                    )
                }
            })

            // turn NextRequest.body to ArrayBuffer, then to Node.js Buffer for passing to Busboy
            const arrayBuffer = await request.arrayBuffer()
            const buffer: Buffer = Buffer.from(arrayBuffer)
            const bufferStream = Readable.from(buffer)
            bufferStream.pipe(busboy)
        } catch (err) {
            console.error('[API][Upload] 解析请求失败：', err)
            return resolve(
                NextResponse.json(
                    { error: '解析文件失败' },
                    { status: 500 }
                )
            )
        }
    })
}
