import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newCategory = await prisma.category.create({
      data: {
        name: data.name,
        storeId: data.storeId,
      },
    });
    return NextResponse.json(newCategory);
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
