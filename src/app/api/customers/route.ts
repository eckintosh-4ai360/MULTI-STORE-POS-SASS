import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newCustomer = await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        storeId: data.storeId,
        creditBalance: parseFloat(data.creditBalance) || 0.0,
      },
    });
    return NextResponse.json(newCustomer);
  } catch (error: any) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: error.message || "Failed to create customer" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name: updateData.name,
        phone: updateData.phone,
        email: updateData.email || null,
        storeId: updateData.storeId,
        creditBalance: parseFloat(updateData.creditBalance) || 0.0,
      },
    });
    return NextResponse.json(updatedCustomer);
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: error.message || "Failed to update customer" }, { status: 500 });
  }
}
