import { usePOSStore } from "../store/posStore";

/** The official symbol for the Ghanaian Cedi */
export const GHC = "GH₵";

/**
 * Returns a currency formatter function that always uses GH₵.
 * The `symbol` field is GH₵ regardless of the store's currency code.
 */
export function useCurrency() {
  const { stores, currentStoreId } = usePOSStore();
  const store = stores.find((s) => s.id === currentStoreId);
  // We always display GH₵ — keep the DB field as "GH₵" for Paystack compatibility
  const symbol = store?.currency ? GHC : GHC;

  return {
    symbol,
    format: (amount: number) => `${GHC} ${amount.toFixed(2)}`,
  };
}
