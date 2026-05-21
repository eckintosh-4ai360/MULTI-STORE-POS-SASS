import React from "react";
import { Product } from "../../store/posStore";
import { Badge } from "../ui/Badge";
import { Search, PauseCircle } from "lucide-react";
import { cn } from "../../utils/cn";

interface POSProductGridProps {
  products: Product[];
  categories: string[];
  storeProducts: Product[];
  search: string;
  setSearch: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  cart: { productId: string; qty: number }[];
  onAddToCart: (product: Product) => void;
  heldCount: number;
  onShowHeld: () => void;
  getCategoryLabel: (catId: string) => string;
}

export const POSProductGrid: React.FC<POSProductGridProps> = ({
  products,
  categories,
  storeProducts,
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  cart,
  onAddToCart,
  heldCount,
  onShowHeld,
  getCategoryLabel,
}) => {
  const getProductEmoji = (name: string) => {
    if (name.startsWith("Coca")) return "🥤";
    if (name.startsWith("Pepsi")) return "🫙";
    if (name.startsWith("Pringles")) return "🥫";
    if (name.startsWith("Samsung")) return "📱";
    if (name.includes("Earbuds")) return "🎧";
    if (name.includes("Cable")) return "🔌";
    if (name.includes("Shirt")) return "👕";
    if (name.includes("Dress")) return "👗";
    if (name.includes("Bag")) return "🎒";
    if (name.includes("Ice")) return "🍦";
    if (name.includes("Biscuit")) return "🍪";
    if (name.includes("Shampoo") || name.includes("Shoulders")) return "🧴";
    return "📦";
  };

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden">
      {/* Search + Held Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search product or scan barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm"
          />
        </div>
        <button
          onClick={onShowHeld}
          className="relative p-2.5 glass-card border border-white/30 rounded-xl hover:bg-white/80 transition active:scale-95"
          title="Held Sales"
        >
          <PauseCircle size={20} className="text-amber-500" />
          {heldCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {heldCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition",
            selectedCategory === "all"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
              : "bg-white/60 text-gray-600 hover:bg-white/80 border border-white/40"
          )}
        >
          All Products
        </button>
        {categories.map((catId) => (
          <button
            key={catId}
            onClick={() => setSelectedCategory(catId)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition",
              selectedCategory === catId
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "bg-white/60 text-gray-600 hover:bg-white/80 border border-white/40"
            )}
          >
            {getCategoryLabel(catId)} ({storeProducts.filter((p) => p.categoryId === catId).length})
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto">
        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search size={40} className="mx-auto mb-2 opacity-40" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
            {products.map((product) => {
              const inCart = cart.find((c) => c.productId === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => onAddToCart(product)}
                  className={cn(
                    "glass-card rounded-2xl p-3 text-left transition hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border",
                    inCart
                      ? "border-indigo-400/60 ring-2 ring-indigo-200/50"
                      : "border-white/40"
                  )}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-50/80 to-gray-100/80 rounded-xl mb-2.5 overflow-hidden flex items-center justify-center border border-white/50">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">{getProductEmoji(product.name)}</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 truncate leading-snug">
                    {product.name}
                  </p>
                  <p className="text-sm font-bold text-indigo-600 mt-0.5">
                    GHS {product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        product.stock <= product.lowStockThreshold
                          ? "text-amber-500"
                          : "text-gray-400"
                      )}
                    >
                      {product.stock} in stock
                    </span>
                    {inCart && <Badge variant="info">{inCart.qty}</Badge>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
