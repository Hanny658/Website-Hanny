// app/api/cheapie/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cheapieId = parseInt(id, 10)
  if (isNaN(cheapieId)) {
    return NextResponse.json(
      { error: 'Missing or wrong ID' },
      { status: 400 }
    )
  }

  try {
    const cheapie = await prisma.cheapie.findUnique({
      where: { id: cheapieId },
      // include: { place: true }, // if need to find related Place, uncomment
    })

    if (!cheapie) {
      return NextResponse.json(
        { error: 'Fail to find Cheapie' },
        { status: 404 }
      )
    }
    return NextResponse.json(cheapie)
  } catch (error) {
    console.error('[API][Cheapie][GET one] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cheapieId = parseInt(id, 10)
  if (isNaN(cheapieId)) {
    return NextResponse.json(
      { error: 'Missing or incorrect id para' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const { name, store, quantity, price, exp, image, stock } = body

    if (
      (name !== undefined && typeof name !== 'string') ||
      (store !== undefined && typeof store !== 'string') ||
      (quantity !== undefined && typeof quantity !== 'number') ||
      (price !== undefined && typeof price !== 'number')
    ) {
      return NextResponse.json(
        {
          error:
            'Please make sure name、store are string, quantity、price are numbers, exp is ISO string',
        },
        { status: 400 }
      )
    }

    if ( (quantity <= 0) || (price < 0) ) {
      return NextResponse.json(
        {
          error:
            'Please make sure quantity and price are larger (for price equal) than 0',
        },
        { status: 400 }
      )
    }

    if (store) {
      const placeExists = await prisma.place.findUnique({
        where: { identifier: store },
      })
      if (!placeExists) {
        return NextResponse.json(
          { error: 'Not found related Place from Cheapie' },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.cheapie.update({
      where: { id: cheapieId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(store !== undefined ? { store } : {}),
        ...(quantity !== undefined ? { quantity } : {}),
        ...(price !== undefined ? { price } : {}),
        ...(stock !== undefined ? { stock } : {}),
        ...((exp !== undefined && exp !== '') ? { exp: new Date(exp) } : {}),
        ...(image !== undefined ? { image } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[API][Cheapie][PUT] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cheapieId = parseInt(id, 10)
  if (isNaN(cheapieId)) {
    return NextResponse.json(
      { error: 'Missing or wrong ID' },
      { status: 400 }
    )
  }

  try {
    await prisma.cheapie.delete({ where: { id: cheapieId } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[API][Cheapie][DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
