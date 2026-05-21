import React, { useState, useMemo } from "react";
import { usePOSStore, PaymentMethod, Sale } from "../store/posStore";
import { POSProductGrid } from "../components/pos/POSProductGrid";
import { POSCart } from "../components/pos/POSCart";
import { HeldSalesModal } from "../components/pos/HeldSalesModal";
import { PaymentModal } from "../components/pos/PaymentModal";
import { ReceiptModal } from "../components/pos/ReceiptModal";

export const POSPage: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    heldSales,
    holdSale,
    completeSale,
    cartDiscount,
    currentStoreId,
    stores,
    categories,
  } = usePOSStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPayment, setShowPayment] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showHeld, setShowHeld] = useState(false);

  const store = stores.find((s) => s.id === currentStoreId);
  const taxRate = store?.taxRate ?? 15;

  const storeProducts = useMemo(
    () => products.filter((p) => p.storeId === currentStoreId && p.stock > 0),
    [products, currentStoreId]
  );

  const categoryIds = useMemo(
    () => [...new Set(storeProducts.map((p) => p.categoryId))],
    [storeProducts]
  );

  const filteredProducts = useMemo(
    () =>
      storeProducts.filter((p) => {
        const matchSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
        const matchCat = selectedCategory === "all" || p.categoryId === selectedCategory;
        return matchSearch && matchCat;
      }),
    [storeProducts, search, selectedCategory]
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty * (1 - item.discount / 100),
    0
  );
  const discountAmount = subtotal * (cartDiscount / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;

  const getCategoryLabel = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat?.name ?? catId;
  };

  const handleCheckout = () => setShowPayment(true);

  const handlePaymentConfirm = async (method: PaymentMethod, amountPaid: number) => {
    const sale = await completeSale(method, amountPaid);
    if (sale) {
      setCompletedSale(sale);
      setShowPayment(false);
    }
  };

  return (
    <div className="flex h-full gap-4">
      <POSProductGrid
        products={filteredProducts}
        categories={categoryIds}
        storeProducts={storeProducts}
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cart={cart}
        onAddToCart={addToCart}
        heldCount={heldSales.length}
        onShowHeld={() => setShowHeld(true)}
        getCategoryLabel={getCategoryLabel}
      />

      <POSCart
        total={total}
        subtotal={subtotal}
        taxAmount={taxAmount}
        discountAmount={discountAmount}
        taxRate={taxRate}
        onCheckout={handleCheckout}
        onHold={() => holdSale()}
      />

      {showPayment && (
        <PaymentModal
          total={total}
          onConfirm={handlePaymentConfirm}
          onCancel={() => setShowPayment(false)}
        />
      )}

      {showHeld && <HeldSalesModal onClose={() => setShowHeld(false)} />}

      {completedSale && (
        <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />
      )}
    </div>
  );
};
