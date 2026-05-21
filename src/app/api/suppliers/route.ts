import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newSupplier = await prisma.supplier.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        balance: parseFloat(data.balance) || 0.0,
        storeId: data.storeId || null,
      },
    });
    return NextResponse.json(newSupplier);
  } catch (error: any) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ error: error.message || "Failed to create supplier" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: updateData.name,
        phone: updateData.phone,
        email: updateData.email || null,
        address: updateData.address || null,
        balance: parseFloat(updateData.balance) || 0.0,
        storeId: updateData.storeId || null,
      },
    });
    return NextResponse.json(updatedSupplier);
  } catch (error: any) {
    console.error("Error updating supplier:", error);
    return NextResponse.json({ error: error.message || "Failed to update supplier" }, { status: 500 });
  }
}
