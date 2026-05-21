import { NextResponse } from "next/server";
import { prisma } from "../../../utils/prismaClient";

export async function GET() {
  try {
    // 1. Check if database has stores. If not, perform automatic seed.
    const storeCount = await prisma.store.count();
    
    if (storeCount === 0) {
      console.log("Database is empty. Initializing automatic seed...");
      
      // Seed Stores
      const stores = await Promise.all([
        prisma.store.create({
          data: {
            id: "s1",
            name: "Accra Mall Branch",
            location: "Accra, Greater Accra",
            currency: "GHS",
            taxRate: 15.0,
            status: "active",
            receiptHeader: "Thank you for shopping with us!",
            receiptFooter: "Visit us again soon."
          }
        }),
        prisma.store.create({
          data: {
            id: "s2",
            name: "Kumasi Central",
            location: "Kumasi, Ashanti Region",
            currency: "GHS",
            taxRate: 15.0,
            status: "active",
            receiptHeader: "Kumasi's Best Store",
            receiptFooter: "Call us: 0244-123456"
          }
        }),
        prisma.store.create({
          data: {
            id: "s3",
            name: "Takoradi Harbour",
            location: "Takoradi, Western Region",
            currency: "GHS",
            taxRate: 15.0,
            status: "active",
            receiptHeader: "Quality Products, Fair Prices",
            receiptFooter: "Follow us on social media"
          }
        })
      ]);

      // Seed Users
      await Promise.all([
        prisma.user.create({
          data: {
            id: "u1",
            name: "Super Admin",
            email: "admin@multipos.com",
            role: "super_admin",
            status: "active",
            storeId: null
          }
        }),
        prisma.user.create({
          data: {
            id: "u2",
            name: "Kwame Asante",
            email: "kwame@multipos.com",
            role: "store_admin",
            status: "active",
            storeId: "s1"
          }
        }),
        prisma.user.create({
          data: {
            id: "u3",
            name: "Ama Boateng",
            email: "ama@multipos.com",
            role: "cashier",
            status: "active",
            storeId: "s1"
          }
        }),
        prisma.user.create({
          data: {
            id: "u4",
            name: "Kofi Mensah",
            email: "kofi@multipos.com",
            role: "manager",
            status: "active",
            storeId: "s2"
          }
        }),
        prisma.user.create({
          data: {
            id: "u5",
            name: "Abena Osei",
            email: "abena@multipos.com",
            role: "cashier",
            status: "active",
            storeId: "s2"
          }
        }),
        prisma.user.create({
          data: {
            id: "u6",
            name: "Yaw Darko",
            email: "yaw@multipos.com",
            role: "cashier",
            status: "inactive",
            storeId: "s3"
          }
        })
      ]);

      // Seed Categories
      await Promise.all([
        prisma.category.create({ data: { id: "c1", name: "Beverages", storeId: "s1" } }),
        prisma.category.create({ data: { id: "c2", name: "Snacks", storeId: "s1" } }),
        prisma.category.create({ data: { id: "c3", name: "Electronics", storeId: "s2" } }),
        prisma.category.create({ data: { id: "c4", name: "Clothing", storeId: "s3" } }),
        prisma.category.create({ data: { id: "c5", name: "Dairy", storeId: "s1" } }),
        prisma.category.create({ data: { id: "c6", name: "Toiletries", storeId: "s2" } })
      ]);

      // Seed Products
      await Promise.all([
        prisma.product.create({ data: { id: "p1", name: "Coca-Cola 500ml", barcode: "5000112637922", price: 5.50, costPrice: 3.80, stock: 120, categoryId: "c1", storeId: "s1", lowStockThreshold: 20 } }),
        prisma.product.create({ data: { id: "p2", name: "Pepsi 330ml Can", barcode: "5000112645292", price: 4.00, costPrice: 2.60, stock: 8, categoryId: "c1", storeId: "s1", lowStockThreshold: 20, expiryDate: "2025-06-30" } }),
        prisma.product.create({ data: { id: "p3", name: "Pringles Original", barcode: "5053990103065", price: 18.00, costPrice: 12.00, stock: 45, categoryId: "c2", storeId: "s1", lowStockThreshold: 10 } }),
        prisma.product.create({ data: { id: "p4", name: "Digestive Biscuits", barcode: "5000168014527", price: 8.50, costPrice: 5.50, stock: 60, categoryId: "c2", storeId: "s1", lowStockThreshold: 15 } }),
        prisma.product.create({ data: { id: "p5", name: "Fan Milk Ice Cream", barcode: "6001007071015", price: 6.00, costPrice: 4.00, stock: 3, categoryId: "c5", storeId: "s1", lowStockThreshold: 10, expiryDate: "2025-03-15" } }),
        prisma.product.create({ data: { id: "p6", name: "Samsung Galaxy A05", barcode: "8806094904697", price: 850.00, costPrice: 680.00, stock: 15, categoryId: "c3", storeId: "s2", lowStockThreshold: 5 } }),
        prisma.product.create({ data: { id: "p7", name: "Wireless Earbuds Pro", barcode: "6941487222789", price: 120.00, costPrice: 75.00, stock: 32, categoryId: "c3", storeId: "s2", lowStockThreshold: 8 } }),
        prisma.product.create({ data: { id: "p8", name: "USB-C Charging Cable", barcode: "0728028222789", price: 25.00, costPrice: 12.00, stock: 5, categoryId: "c3", storeId: "s2", lowStockThreshold: 10 } }),
        prisma.product.create({ data: { id: "p9", name: "Head & Shoulders 400ml", barcode: "8001090522924", price: 35.00, costPrice: 24.00, stock: 28, categoryId: "c6", storeId: "s2", lowStockThreshold: 10 } }),
        prisma.product.create({ data: { id: "p10", name: "Men's Polo Shirt", barcode: "9780143127796", price: 65.00, costPrice: 42.00, stock: 22, categoryId: "c4", storeId: "s3", lowStockThreshold: 5 } }),
        prisma.product.create({ data: { id: "p11", name: "Ladies Ankara Dress", barcode: "9780143127797", price: 120.00, costPrice: 80.00, stock: 18, categoryId: "c4", storeId: "s3", lowStockThreshold: 5 } }),
        prisma.product.create({ data: { id: "p12", name: "Kids School Bag", barcode: "9780143127798", price: 45.00, costPrice: 28.00, stock: 12, categoryId: "c4", storeId: "s3", lowStockThreshold: 5 } })
      ]);

      // Seed Customers
      await Promise.all([
        prisma.customer.create({ data: { id: "cu1", name: "Emmanuel Quartey", phone: "0244-111222", email: "eq@gmail.com", storeId: "s1", creditBalance: 0 } }),
        prisma.customer.create({ data: { id: "cu2", name: "Fatima Ibrahim", phone: "0501-334455", storeId: "s1", creditBalance: 45.50 } }),
        prisma.customer.create({ data: { id: "cu3", name: "Bright Owusu", phone: "0277-567890", storeId: "s2", creditBalance: 0 } }),
        prisma.customer.create({ data: { id: "cu4", name: "Akosua Ntim", phone: "0242-998877", storeId: "s3", creditBalance: 120.00 } })
      ]);

      // Seed Suppliers
      await Promise.all([
        prisma.supplier.create({ data: { id: "sup1", name: "Accra Beverages Ltd", phone: "0302-123456", email: "orders@accrabev.com", address: "Industrial Area, Accra", balance: 0, storeId: "s1" } }),
        prisma.supplier.create({ data: { id: "sup2", name: "TechSource Ghana", phone: "0302-654321", email: "supply@techsource.gh", address: "Ring Road, Kumasi", balance: 1500, storeId: "s2" } }),
        prisma.supplier.create({ data: { id: "sup3", name: "Fashion Hub Imports", phone: "0312-111222", balance: 0, storeId: "s3" } })
      ]);

      // Seed Inventory Logs
      await Promise.all([
        prisma.inventoryLog.create({ data: { id: "il1", productId: "p1", productName: "Coca-Cola 500ml", type: "IN", qty: 50, storeId: "s1", note: "Monthly restock", createdAt: new Date(Date.now() - 86400000 * 3) } }),
        prisma.inventoryLog.create({ data: { id: "il2", productId: "p2", productName: "Pepsi 330ml Can", type: "OUT", qty: 12, storeId: "s1", note: "Damaged stock removed", createdAt: new Date(Date.now() - 86400000 * 2) } }),
        prisma.inventoryLog.create({ data: { id: "il3", productId: "p6", productName: "Samsung Galaxy A05", type: "IN", qty: 5, storeId: "s2", note: "New shipment", createdAt: new Date(Date.now() - 86400000) } }),
        prisma.inventoryLog.create({ data: { id: "il4", productId: "p8", productName: "USB-C Charging Cable", type: "TRANSFER", qty: 10, storeId: "s2", note: "Transfer from Accra", createdAt: new Date() } })
      ]);

      // Seed Sales
      const now = new Date();
      const salesPromises = Array.from({ length: 40 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(i / 3));
        const storeId = ["s1", "s2", "s3"][i % 3];
        const total = parseFloat((Math.random() * 300 + 20).toFixed(2));
        const tax = parseFloat((total * 0.15).toFixed(2));
        return prisma.sale.create({
          data: {
            id: `sale_${i + 1}`,
            invoiceNo: `INV-${storeId.toUpperCase()}-${String(1000 + i).padStart(4, "0")}`,
            subtotal: parseFloat((total - tax).toFixed(2)),
            taxAmount: tax,
            discountAmount: 0.0,
            total,
            paymentMethod: ["cash", "mobile_money", "card"][i % 3],
            amountPaid: total,
            change: 0.0,
            storeId,
            userId: i % 2 === 0 ? "u3" : "u2",
            createdAt: date,
            status: "completed",
            items: {
              create: [
                {
                  productId: "p1",
                  productName: "Coca-Cola 500ml",
                  qty: 2,
                  price: 5.50,
                  discount: 0.0
                }
              ]
            }
          }
        });
      });
      await Promise.all(salesPromises);

      console.log("Automatic seed completed successfully!");
    }

    // 2. Fetch all data collections from Neon DB
    const [
      stores,
      users,
      categories,
      products,
      customers,
      sales,
      inventoryLogs,
      suppliers,
      purchaseOrders,
      heldSales
    ] = await Promise.all([
      prisma.store.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.sale.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: true }
      }),
      prisma.inventoryLog.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.supplier.findMany({ orderBy: { name: "asc" } }),
      prisma.purchaseOrder.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: true }
      }),
      prisma.heldSale.findMany({
        orderBy: { heldAt: "desc" },
        include: { items: true }
      })
    ]);

    // Strip passwordHash before sending to client
    const sanitizedUsers = users.map(({ passwordHash, ...userWithoutPassword }) => userWithoutPassword);

    return NextResponse.json({
      stores,
      users: sanitizedUsers,
      categories,
      products,
      customers,
      sales,
      inventoryLogs,
      suppliers,
      purchaseOrders,
      heldSales
    });
  } catch (error: any) {
    console.error("Error in /api/init:", error);
    return NextResponse.json({ error: error.message || "Failed to initialize POS state" }, { status: 500 });
  }
}
