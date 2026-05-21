import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newOrder = await prisma.purchaseOrder.create({
      data: {
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        total: parseFloat(data.total) || 0.0,
        storeId: data.storeId,
        status: data.status || "pending",
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            qty: parseInt(item.qty) || 0,
            cost: parseFloat(item.cost) || 0.0,
          })),
        },
      },
      include: {
        items: true,
      },
    });
    return NextResponse.json(newOrder);
  } catch (error: any) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json({ error: error.message || "Failed to create purchase order" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, action } = await req.json();
    if (action === "receive") {
      const order = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
      }
      if (order.status !== "pending") {
        return NextResponse.json({ error: "Purchase order is already processed" }, { status: 400 });
      }

      // Execute status update, stock increments, and inventory logs in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.purchaseOrder.update({
          where: { id },
          data: { status: "received" },
          include: { items: true },
        });

        for (const item of order.items) {
          // Increment product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.qty,
              },
            },
          });

          // Create inventory log
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              productName: item.productName,
              type: "IN",
              qty: item.qty,
              storeId: order.storeId,
              note: `Received PO from ${order.supplierName}`,
            },
          });
        }

        return updatedOrder;
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating purchase order:", error);
    return NextResponse.json({ error: error.message || "Failed to update purchase order" }, { status: 500 });
  }
}
