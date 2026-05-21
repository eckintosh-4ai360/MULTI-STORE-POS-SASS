import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newHeldSale = await prisma.heldSale.create({
      data: {
        id: data.id,
        customerId: data.customerId || null,
        note: data.note || null,
        heldAt: data.heldAt ? new Date(data.heldAt) : new Date(),
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            price: parseFloat(item.price) || 0.0,
            qty: parseInt(item.qty) || 0,
            discount: parseFloat(item.discount) || 0.0,
            stock: parseInt(item.stock) || 0,
          })),
        },
      },
      include: {
        items: true,
      },
    });
    return NextResponse.json(newHeldSale);
  } catch (error: any) {
    console.error("Error creating held sale:", error);
    return NextResponse.json({ error: error.message || "Failed to create held sale" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await prisma.heldSale.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting held sale:", error);
    return NextResponse.json({ error: error.message || "Failed to delete held sale" }, { status: 500 });
  }
}
