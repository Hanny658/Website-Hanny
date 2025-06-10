/* eslint-disable @typescript-eslint/no-explicit-any */
// File: app/api/user/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

interface Params {
    params: Promise<{ id: string }>
}

// GET /api/user/:id — return a single user
export async function GET(_req: Request, { params }: Params) {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }
    return NextResponse.json(user);
}

// PUT /api/user/:id — update a user's fields
export async function PUT(req: Request, { params }: Params) {
    const { id } = await params;
    const data = await req.json();
    const updateData: Record<string, any> = {};

    // Only allow specific fields to be updated
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) {
        // Hash new password before saving
        updateData.password = await hash(data.password, 12);
    }

    try {
        const updated = await prisma.user.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}

// DELETE /api/user/:id — remove a user by id
export async function DELETE(_req: Request, { params }: Params) {
    const { id } = await params;
    try {
        await prisma.user.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.log(error.message);
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}