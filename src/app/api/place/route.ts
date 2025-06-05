// app/api/place/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/place    → Get all Place record
// POST /api/place   → Create a new Place
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || undefined;

    const places = await prisma.place.findMany({
      where: name
        ? { name: { contains: name, mode: 'insensitive' } }
        : {},
      orderBy: { identifier: 'asc' },
    });

    return NextResponse.json(places);
  } catch (error) {
    console.error('[API][Place][GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, name, lng, lat } = body;

    if (
      !identifier ||
      typeof identifier !== 'string' ||
      !name ||
      typeof name !== 'string' ||
      typeof lng !== 'number' ||
      typeof lat !== 'number'
    ) {
      return NextResponse.json(
        {
          error:
            'Please provide identifier(string)、name(string)、lng(number)、lat(number)',
        },
        { status: 400 }
      );
    }

    const newPlace = await prisma.place.create({
      data: { identifier, name, lng, lat },
    });

    return NextResponse.json(newPlace, { status: 201 });
  } catch (error) {
    console.error('[API][Place][POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
