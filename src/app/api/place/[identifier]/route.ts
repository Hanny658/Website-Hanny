// app/api/place/[identifier]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: {params: Promise<{ identifier: string }>}
) {
  const { identifier } = await params

  try {
    const place = await prisma.place.findUnique({
      where: { identifier },
      // include: { cheapies: true }, // Uncomment if including related Cheapie
    })

    if (!place) {
      return NextResponse.json(
        { error: 'Related Place not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(place)
  } catch (error) {
    console.error('[API][Place][GET one] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: {params: Promise<{ identifier: string }>}
) {
  const { identifier } = await params

  try {
    const body = await request.json()
    const { name, lng, lat } = body

    if (
      (name !== undefined && typeof name !== 'string') ||
      (lng !== undefined && typeof lng !== 'number') ||
      (lat !== undefined && typeof lat !== 'number')
    ) {
      return NextResponse.json(
        {
          error:
            'name shall be string, lng/lat are number, and please at least update something.',
        },
        { status: 400 }
      )
    }

    const updated = await prisma.place.update({
      where: { identifier },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(lng !== undefined ? { lng } : {}),
        ...(lat !== undefined ? { lat } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[API][Place][PUT] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: {params: Promise<{ identifier: string }>}
) {
  const { identifier } = await params

  try {
    // First delete all cheapie in the Place
    await prisma.cheapie.deleteMany({ where: { store: identifier } })
    await prisma.place.delete({ where: { identifier } })

    // 204 status shall have no body, therefore new NextResponse(null, { status: 204 })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[API][Place][DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
