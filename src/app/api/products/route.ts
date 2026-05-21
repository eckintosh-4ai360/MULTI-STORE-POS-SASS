import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";

export async function POST(req: Request) {
  try {
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
    return NextResponse.json(newProduct);
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
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
        prisma.product.update({
          where: { id: productId },
          data: { stock: newStock }
        }),
        prisma.inventoryLog.create({
          data: {
            productId,
            productName: product.name,
            type,
            qty,
            storeId: product.storeId,
            note: note || null
          }
        })
      ]);
      
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
    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    
    // We should delete product inventory logs or let it delete cascading if we set it up.
    // In our schema, we have a relation. Let's delete inventory logs for the product first.
    await prisma.inventoryLog.deleteMany({
      where: { productId: id }
    });
    
    const deletedProduct = await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json(deletedProduct);
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
