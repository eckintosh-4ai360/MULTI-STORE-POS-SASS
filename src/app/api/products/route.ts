import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";
import { requireAuth, isNextResponse } from "../../../utils/apiAuth";
import { writeAuditLog, buildAuditContext } from "../../../utils/auditLogger";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (isNextResponse(auth)) return auth;
    const data = await req.json();
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        barcode: data.barcode,
        price: parseFloat(data.price),
        costPrice: parseFloat(data.costPrice),
        stock: parseInt(data.stock),
        lowStockThreshold: parseInt(data.lowStockThreshold) || 10,
        expiryDate: data.expiryDate || null,
        image: data.image || null,
        categoryId: data.categoryId,
        storeId: data.storeId,
      },
    });

    // Audit
    const actor = await prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true, name: true, role: true, email: true, organizationId: true } });
    if (actor?.organizationId) {
      writeAuditLog({
        action: "PRODUCT_CREATED",
        resourceType: "Product",
        resourceId: newProduct.id,
        resourceLabel: newProduct.name,
        metadata: { price: newProduct.price, stock: newProduct.stock, storeId: newProduct.storeId },
        context: buildAuditContext(req, actor, { storeId: data.storeId }),
      });
    }

    return NextResponse.json(newProduct);
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (isNextResponse(auth)) return auth;
    const data = await req.json();

    // Support stock adjustments through a specific request type
    if (data.action === "adjustStock") {
      const { productId, qty, type, note } = data;

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      const newStock = type === "IN" || type === "TRANSFER"
        ? product.stock + qty
        : Math.max(0, product.stock - qty);

      const [updatedProduct, log] = await prisma.$transaction([
        prisma.product.update({ where: { id: productId }, data: { stock: newStock } }),
        prisma.inventoryLog.create({
          data: { productId, productName: product.name, type, qty, storeId: product.storeId, note: note || null },
        }),
      ]);

      // Audit
      const actor = await prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true, name: true, role: true, email: true, organizationId: true } });
      if (actor?.organizationId) {
        writeAuditLog({
          action: "INVENTORY_ADJUSTED",
          resourceType: "Product",
          resourceId: product.id,
          resourceLabel: product.name,
          metadata: { type, qty, oldStock: product.stock, newStock, note },
          context: buildAuditContext(req, actor, { storeId: product.storeId }),
        });
      }

      return NextResponse.json({ product: updatedProduct, log });
    }

    // Normal product updates
    const { id, ...updateData } = data;
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: updateData.name,
        barcode: updateData.barcode,
        price: parseFloat(updateData.price),
        costPrice: parseFloat(updateData.costPrice),
        stock: parseInt(updateData.stock),
        lowStockThreshold: parseInt(updateData.lowStockThreshold),
        expiryDate: updateData.expiryDate || null,
        image: updateData.image || null,
        categoryId: updateData.categoryId,
        storeId: updateData.storeId,
      },
    });

    // Audit
    const actor = await prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true, name: true, role: true, email: true, organizationId: true } });
    if (actor?.organizationId) {
      writeAuditLog({
        action: "PRODUCT_UPDATED",
        resourceType: "Product",
        resourceId: updatedProduct.id,
        resourceLabel: updatedProduct.name,
        metadata: { price: updatedProduct.price, stock: updatedProduct.stock },
        context: buildAuditContext(req, actor, { storeId: updateData.storeId }),
      });
    }

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (isNextResponse(auth)) return auth;
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id } });

    await prisma.inventoryLog.deleteMany({ where: { productId: id } });
    const deletedProduct = await prisma.product.delete({ where: { id } });

    // Audit
    if (product) {
      const actor = await prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true, name: true, role: true, email: true, organizationId: true } });
      if (actor?.organizationId) {
        writeAuditLog({
          action: "PRODUCT_DELETED",
          resourceType: "Product",
          resourceId: product.id,
          resourceLabel: product.name,
          metadata: { storeId: product.storeId },
          context: buildAuditContext(req, actor, { storeId: product.storeId }),
        });
      }
    }

    return NextResponse.json(deletedProduct);
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
