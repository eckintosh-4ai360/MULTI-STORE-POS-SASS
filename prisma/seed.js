/* eslint-disable no-console */
/**
 * Seed script for MultiPOS demo data.
 * Run with: npx prisma db seed   (or: node prisma/seed.js)
 * Idempotent — skips if the demo organization already exists.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEMO_SLUG = "multipos-demo";
const DEMO_PASSWORD = "password123";

async function main() {
  const existing = await prisma.organization.findUnique({ where: { slug: DEMO_SLUG } });
  if (existing) {
    console.log("Demo data already seeded — skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // 1. Organization + subscription
  const org = await prisma.organization.create({
    data: {
      name: "MultiPOS Demo",
      slug: DEMO_SLUG,
      ownerEmail: "admin@multipos.com",
      subscription: {
        create: { plan: "starter", status: "trialing", trialEnd },
      },
    },
  });

  // 2. Stores
  const accra = await prisma.store.create({
    data: {
      name: "Accra Main Store",
      location: "Accra",
      currency: "GHS",
      taxRate: 0,
      status: "active",
      organizationId: org.id,
      receiptHeader: "MultiPOS · Accra Main Store",
      receiptFooter: "Thank you for shopping with us!",
    },
  });
  const kumasi = await prisma.store.create({
    data: {
      name: "Kumasi Branch",
      location: "Kumasi",
      currency: "GHS",
      taxRate: 0,
      status: "active",
      organizationId: org.id,
      receiptHeader: "MultiPOS · Kumasi Branch",
      receiptFooter: "Thank you for shopping with us!",
    },
  });

  // 3. Users
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@multipos.com",
      passwordHash,
      role: "super_admin",
      status: "active",
      organizationId: org.id,
      storeId: null,
    },
  });
  const kwame = await prisma.user.create({
    data: {
      name: "Kwame Asante",
      email: "kwame@multipos.com",
      passwordHash,
      role: "store_admin",
      status: "active",
      organizationId: org.id,
      storeId: accra.id,
    },
  });
  await prisma.user.create({
    data: {
      name: "Ama Mensah",
      email: "ama@multipos.com",
      passwordHash,
      role: "cashier",
      status: "active",
      organizationId: org.id,
      storeId: accra.id,
    },
  });
  const kofi = await prisma.user.create({
    data: {
      name: "Kofi Boateng",
      email: "kofi@multipos.com",
      passwordHash,
      role: "manager",
      status: "active",
      organizationId: org.id,
      storeId: kumasi.id,
    },
  });

  // 4. Categories
  const cat = async (name, storeId) =>
    prisma.category.create({ data: { name, storeId } });

  const accraBev = await cat("Beverages", accra.id);
  const accraSnacks = await cat("Snacks", accra.id);
  const accraGroceries = await cat("Groceries", accra.id);
  const accraToiletries = await cat("Toiletries", accra.id);
  const kumasiBev = await cat("Beverages", kumasi.id);
  const kumasiSnacks = await cat("Snacks", kumasi.id);
  const kumasiElectronics = await cat("Electronics", kumasi.id);

  // 5. Products
  const product = (storeId, categoryId, name, barcode, price, costPrice, stock, low = 10) =>
    prisma.product.create({
      data: { name, barcode, price, costPrice, stock, lowStockThreshold: low, storeId, categoryId },
    });

  const pCoke = await product(accra.id, accraBev.id, "Coca-Cola 330ml", "89000001", 8, 5.5, 120, 20);
  const pMalta = await product(accra.id, accraBev.id, "Malta Guinness", "89000002", 10, 7, 80, 15);
  const pLays = await product(accra.id, accraSnacks.id, "Lay's Chips", "89000003", 12, 8.5, 60, 10);
  const pBiscuit = await product(accra.id, accraSnacks.id, "Chocolate Digestive", "89000004", 9, 6, 55, 10);
  const pRice = await product(accra.id, accraGroceries.id, "Rice 5kg", "89000005", 120, 95, 40, 8);
  const pOil = await product(accra.id, accraGroceries.id, "Cooking Oil 1L", "89000006", 65, 52, 35, 8);
  const pPaste = await product(accra.id, accraToiletries.id, "Toothpaste", "89000007", 25, 18, 50, 10);
  const pSoap = await product(accra.id, accraToiletries.id, "Bathing Soap", "89000008", 15, 10, 90, 15);

  const pFanta = await product(kumasi.id, kumasiBev.id, "Fanta Orange", "89010001", 8, 5.5, 100, 20);
  const pWater = await product(kumasi.id, kumasiBev.id, "Bottled Water 1.5L", "89010002", 3.5, 2, 200, 30);
  const pChips = await product(kumasi.id, kumasiSnacks.id, "Plantain Chips", "89010003", 10, 6.5, 45, 10);
  const pCable = await product(kumasi.id, kumasiElectronics.id, "USB Charging Cable", "89010004", 25, 15, 30, 5);
  const pEarbuds = await product(kumasi.id, kumasiElectronics.id, "Wireless Earbuds", "89010005", 80, 55, 15, 5);

  // 6. Customers
  const accraCustomers = [
    { name: "Kofi Mensah", phone: "0201111111" },
    { name: "Abena Owusu", phone: "0242222222", email: "abena@example.com" },
    { name: "Yaw Darko", phone: "0273333333" },
  ];
  const kumasiCustomers = [
    { name: "Akosua Serwaa", phone: "0504444444" },
    { name: "Kwabena Appiah", phone: "0555555555" },
  ];
  const createdAccraCustomers = [];
  for (const c of accraCustomers) {
    createdAccraCustomers.push(await prisma.customer.create({ data: { ...c, storeId: accra.id } }));
  }
  const createdKumasiCustomers = [];
  for (const c of kumasiCustomers) {
    createdKumasiCustomers.push(await prisma.customer.create({ data: { ...c, storeId: kumasi.id } }));
  }

  // 7. Sales spread over the last 7 days
  let invoiceCounter = 1001;
  const sale = async ({ daysAgo, hoursAgo, storeId, userId, items, paymentMethod, customerId, customerName }) => {
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const discountAmount = items.reduce((s, i) => s + i.discount, 0);
    const total = subtotal - discountAmount;
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - (hoursAgo || 0) * 3600000);
    return prisma.sale.create({
      data: {
        invoiceNo: `INV-${invoiceCounter++}`,
        subtotal,
        taxAmount: 0,
        discountAmount,
        total,
        paymentMethod,
        amountPaid: total,
        change: 0,
        status: "completed",
        customerName,
        createdAt,
        storeId,
        userId,
        customerId,
        items: {
          create: items.map((i) => ({
            productName: i.productName,
            productId: i.productId,
            qty: i.qty,
            price: i.price,
            discount: i.discount,
          })),
        },
      },
    });
  };

  const item = (p, qty, discount = 0) => ({ productId: p.id, productName: p.name, qty, price: p.price, discount });

  // Accra sales
  await sale({ daysAgo: 6, hoursAgo: 10, storeId: accra.id, userId: kwame.id, paymentMethod: "cash", customerId: createdAccraCustomers[0].id, customerName: createdAccraCustomers[0].name, items: [item(pCoke, 4), item(pLays, 2)] });
  await sale({ daysAgo: 6, hoursAgo: 14, storeId: accra.id, userId: kwame.id, paymentMethod: "mobile_money", customerId: createdAccraCustomers[1].id, customerName: createdAccraCustomers[1].name, items: [item(pRice, 2), item(pOil, 1), item(pSoap, 3)] });
  await sale({ daysAgo: 5, hoursAgo: 9, storeId: accra.id, userId: kwame.id, paymentMethod: "card", items: [item(pMalta, 6), item(pBiscuit, 2)] });
  await sale({ daysAgo: 5, hoursAgo: 16, storeId: accra.id, userId: kwame.id, paymentMethod: "cash", customerId: createdAccraCustomers[2].id, customerName: createdAccraCustomers[2].name, items: [item(pPaste, 2), item(pSoap, 5), item(pCoke, 2)] });
  await sale({ daysAgo: 4, hoursAgo: 11, storeId: accra.id, userId: kwame.id, paymentMethod: "mobile_money", items: [item(pRice, 1), item(pOil, 2), item(pLays, 3)] });
  await sale({ daysAgo: 3, hoursAgo: 13, storeId: accra.id, userId: kwame.id, paymentMethod: "cash", items: [item(pCoke, 10), item(pMalta, 4)] });
  await sale({ daysAgo: 2, hoursAgo: 10, storeId: accra.id, userId: kwame.id, paymentMethod: "card", customerId: createdAccraCustomers[1].id, customerName: createdAccraCustomers[1].name, items: [item(pBiscuit, 4), item(pPaste, 1), item(pCoke, 3)] });
  await sale({ daysAgo: 1, hoursAgo: 12, storeId: accra.id, userId: kwame.id, paymentMethod: "mobile_money", items: [item(pOil, 3), item(pRice, 1)] });
  await sale({ daysAgo: 0, hoursAgo: 3, storeId: accra.id, userId: kwame.id, paymentMethod: "cash", customerId: createdAccraCustomers[0].id, customerName: createdAccraCustomers[0].name, items: [item(pCoke, 6), item(pLays, 1), item(pSoap, 2)] });
  await sale({ daysAgo: 0, hoursAgo: 8, storeId: accra.id, userId: kwame.id, paymentMethod: "card", items: [item(pMalta, 3), item(pPaste, 2)] });

  // Kumasi sales
  await sale({ daysAgo: 6, hoursAgo: 12, storeId: kumasi.id, userId: kofi.id, paymentMethod: "cash", customerId: createdKumasiCustomers[0].id, customerName: createdKumasiCustomers[0].name, items: [item(pWater, 12), item(pChips, 3)] });
  await sale({ daysAgo: 5, hoursAgo: 10, storeId: kumasi.id, userId: kofi.id, paymentMethod: "mobile_money", items: [item(pFanta, 6), item(pChips, 2)] });
  await sale({ daysAgo: 4, hoursAgo: 15, storeId: kumasi.id, userId: kofi.id, paymentMethod: "card", customerId: createdKumasiCustomers[1].id, customerName: createdKumasiCustomers[1].name, items: [item(pEarbuds, 1), item(pCable, 2)] });
  await sale({ daysAgo: 3, hoursAgo: 11, storeId: kumasi.id, userId: kofi.id, paymentMethod: "cash", items: [item(pWater, 20), item(pFanta, 4)] });
  await sale({ daysAgo: 2, hoursAgo: 13, storeId: kumasi.id, userId: kofi.id, paymentMethod: "mobile_money", items: [item(pCable, 3), item(pChips, 4)] });
  await sale({ daysAgo: 1, hoursAgo: 9, storeId: kumasi.id, userId: kofi.id, paymentMethod: "cash", customerId: createdKumasiCustomers[0].id, customerName: createdKumasiCustomers[0].name, items: [item(pFanta, 8), item(pWater, 6)] });
  await sale({ daysAgo: 0, hoursAgo: 5, storeId: kumasi.id, userId: kofi.id, paymentMethod: "card", items: [item(pEarbuds, 2), item(pCable, 1)] });

  // 8. A few inventory logs (restock entries)
  const invLog = (productId, productName, storeId, type, qty, note, daysAgo) =>
    prisma.inventoryLog.create({
      data: {
        productId,
        productName,
        storeId,
        type,
        qty,
        note,
        createdAt: new Date(Date.now() - daysAgo * 86400000),
      },
    });

  await invLog(pCoke.id, pCoke.name, accra.id, "IN", 120, "Initial stock", 7);
  await invLog(pRice.id, pRice.name, accra.id, "IN", 40, "Supplier delivery", 5);
  await invLog(pWater.id, pWater.name, kumasi.id, "IN", 200, "Initial stock", 7);
  await invLog(pEarbuds.id, pEarbuds.name, kumasi.id, "IN", 15, "Supplier delivery", 4);
  await invLog(pCoke.id, pCoke.name, accra.id, "SALE", 6, "POS sale", 0);

  console.log("Seeded MultiPOS demo data:");
  console.log(`  Org: ${org.name} (${org.slug})`);
  console.log(`  Stores: ${accra.name}, ${kumasi.name}`);
  console.log(`  Users: ${superAdmin.email}, ${kwame.email}, ama@multipos.com, ${kofi.email}`);
  console.log(`  Password for all demo users: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
