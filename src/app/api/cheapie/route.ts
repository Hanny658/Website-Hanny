// app/api/cheapie/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET  /api/cheapie    → Get all Cheapie (filters apply, e.g. ?store=xxx / ?name=xxx)
// POST /api/cheapie    → create a new Cheapie
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const store = searchParams.get('store') || undefined;
    const name = searchParams.get('name') || undefined;

    const cheapies = await prisma.cheapie.findMany({
      where: {
        ...(store ? { store } : {}),
        ...(name
          ? { name: { contains: name, mode: 'insensitive' } }
          : {}),
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(cheapies);
  } catch (error) {
    console.error('[API][Cheapie][GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, store, quantity, price, exp, image, stock } = body;

    if (
      !name ||
      typeof name !== 'string' ||
      !store ||
      typeof store !== 'string' ||
      typeof quantity !== 'number' ||
      typeof price !== 'number'
    ) {
      return NextResponse.json(
        {
          error:
            'Please provide name(string)、store(string)、quantity(number)、price(number)、exp(optional ISO string), image(optional thou)',
        },
        { status: 400 }
      );
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

    // Check Place
    const placeExists = await prisma.place.findUnique({
      where: { identifier: store },
    });
    if (!placeExists) {
      return NextResponse.json(
        { error: 'Related Place does not exist' },
        { status: 400 }
      );
    }

    const newCheapie = await prisma.cheapie.create({
      data: {
        name,
        store,
        quantity,
        price,
        stock,
        ...((exp && exp !== '') ? { exp: new Date(exp) } : {}),
        ...(image ? { image } : {}),
      },
    });

    return NextResponse.json(newCheapie, { status: 201 });
  } catch (error) {
    console.error('[API][Cheapie][POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
