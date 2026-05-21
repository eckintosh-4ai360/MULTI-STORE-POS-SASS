import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";
import bcrypt from "bcryptjs";
import { requireAuth, isNextResponse } from "../../../utils/apiAuth";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (isNextResponse(auth)) return auth;
    // Only admins can create users
    if (!['super_admin', 'store_admin'].includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const data = await req.json();
    const password = data.password || "password123";
    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status || "active",
        storeId: data.storeId || null,
        passwordHash: passwordHash,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (isNextResponse(auth)) return auth;
    // Only admins can update users
    if (!['super_admin', 'store_admin'].includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const data = await req.json();
    const { id, password, ...updateData } = data;

    const updatePayload: any = { ...updateData };
    if (password) {
      updatePayload.passwordHash = bcrypt.hashSync(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatePayload,
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
