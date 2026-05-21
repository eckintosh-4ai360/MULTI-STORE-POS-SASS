import { usePOSStore } from "../store/posStore";

/**
 * Returns a currency formatter function that uses the current store's currency symbol.
 * Falls back to "GHS" if no store is selected.
 */
export function useCurrency() {
  const { stores, currentStoreId } = usePOSStore();
  const store = stores.find(s => s.id === currentStoreId);
  const symbol = store?.currency ?? "GHS";

  return {
    symbol,
    format: (amount: number) => `${symbol} ${amount.toFixed(2)}`,
  };
}
