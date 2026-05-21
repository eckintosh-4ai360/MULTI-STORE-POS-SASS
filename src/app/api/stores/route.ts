import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newStore = await prisma.store.create({
      data: {
        name: data.name,
        location: data.location,
        currency: data.currency,
        taxRate: data.taxRate,
        status: data.status || "active",
        logo: data.logo || null,
        receiptHeader: data.receiptHeader || null,
        receiptFooter: data.receiptFooter || null,
      },
    });
    return NextResponse.json(newStore);
  } catch (error: any) {
    console.error("Error creating store:", error);
    return NextResponse.json({ error: error.message || "Failed to create store" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    const updatedStore = await prisma.store.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updatedStore);
  } catch (error: any) {
    console.error("Error updating store:", error);
    return NextResponse.json({ error: error.message || "Failed to update store" }, { status: 500 });
  }
}
