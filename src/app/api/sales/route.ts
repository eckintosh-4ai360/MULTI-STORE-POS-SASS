import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";
import { requireAuth, isNextResponse } from "../../../utils/apiAuth";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (isNextResponse(auth)) return auth;
    const data = await req.json();
    const {
      invoiceNo,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      paymentMethod,
      amountPaid,
      change,
      storeId,
      userId,
      customerId,
      customerName,
      status,
    } = data;

    // We do a Prisma transaction to ensure:
    // 1. Sale is created.
    // 2. Products stock are decremented.
    // 3. Inventory logs are added for each sold product.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Sale
      const createdSale = await tx.sale.create({
        data: {
          invoiceNo,
          subtotal: parseFloat(subtotal),
          taxAmount: parseFloat(taxAmount),
          discountAmount: parseFloat(discountAmount),
          total: parseFloat(total),
          paymentMethod,
          amountPaid: parseFloat(amountPaid),
          change: parseFloat(change),
          storeId,
          userId,
          customerId: customerId || null,
          customerName: customerName || null,
          status: status || "completed",
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              qty: parseInt(item.qty),
              price: parseFloat(item.price),
              discount: parseFloat(item.discount),
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Decrement stock and add inventory logs for each item
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const newStock = Math.max(0, product.stock - item.qty);
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              productName: item.productName,
              type: "SALE",
              qty: item.qty,
              storeId,
              note: `Sale ${invoiceNo}`,
            },
          });
        }
      }

      return createdSale;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating sale transaction:", error);
    return NextResponse.json({ error: error.message || "Failed to process sale transaction" }, { status: 500 });
  }
}
