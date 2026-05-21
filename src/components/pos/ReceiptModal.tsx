import React, { useRef } from "react";
import { usePOSStore, Sale } from "../../store/posStore";
import { Printer, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { format } from "date-fns";

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const { stores } = usePOSStore();
  const store = stores.find((s) => s.id === sale.storeId);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // Clone receipt content into the print root
    const printRoot = document.getElementById("receipt-print-root");
    if (printRoot && printRef.current) {
      printRoot.innerHTML = printRef.current.innerHTML;
      window.print();
      printRoot.innerHTML = "";
    }
  };

  const receiptContent = (
    <div ref={printRef} className="p-5 font-mono text-xs space-y-1 bg-gray-50/80">
      <p className="text-center font-bold text-sm text-gray-800">{store?.name}</p>
      <p className="text-center text-gray-500">{store?.location}</p>
      {store?.receiptHeader && <p className="text-center text-gray-400">{store.receiptHeader}</p>}
      <div className="border-t border-dashed border-gray-300 my-2" />
      <div className="flex justify-between text-gray-500">
        <span>{format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm")}</span>
        <span>{sale.invoiceNo}</span>
      </div>
      {sale.customerName && <p className="text-gray-600">Customer: {sale.customerName}</p>}
      <div className="border-t border-dashed border-gray-300 my-2" />
      {sale.items.map((item, i) => (
        <div key={i} className="flex justify-between">
          <span className="flex-1 text-gray-700">
            {item.productName} x{item.qty}
            {item.discount > 0 ? ` (-${item.discount}%)` : ""}
          </span>
          <span className="text-gray-800 font-medium">
            {store?.currency ?? "GHS"} {(item.price * item.qty * (1 - item.discount / 100)).toFixed(2)}
          </span>
        </div>
      ))}
      <div className="border-t border-dashed border-gray-300 my-2" />
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span>{store?.currency ?? "GHS"} {sale.subtotal.toFixed(2)}</span>
      </div>
      {sale.discountAmount > 0 && (
        <div className="flex justify-between text-red-500">
          <span>Discount</span>
          <span>-{store?.currency ?? "GHS"} {sale.discountAmount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between text-gray-600">
        <span>Tax ({store?.taxRate}%)</span>
        <span>{store?.currency ?? "GHS"} {sale.taxAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-sm text-gray-800 pt-1 border-t border-dashed border-gray-300">
        <span>TOTAL</span>
        <span>{store?.currency ?? "GHS"} {sale.total.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-500">
        <span>Paid ({sale.paymentMethod.replace("_", " ")})</span>
        <span>{store?.currency ?? "GHS"} {sale.amountPaid.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-500">
        <span>Change</span>
        <span>{store?.currency ?? "GHS"} {sale.change.toFixed(2)}</span>
      </div>
      <div className="border-t border-dashed border-gray-300 my-2" />
      {store?.receiptFooter && <p className="text-center text-gray-400">{store.receiptFooter}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-modal rounded-3xl w-full max-w-sm overflow-hidden animate-scaleIn">
        <div className="p-6 text-center border-b border-white/20">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/30">
            <CheckCircle size={28} className="text-white" />
          </div>
          <h3 className="font-bold text-gray-800 text-xl">Sale Complete!</h3>
          <p className="text-gray-500 text-sm mt-1">
            Change: <span className="font-semibold text-emerald-600">{store?.currency ?? "GHS"} {sale.change.toFixed(2)}</span>
          </p>
        </div>
        {receiptContent}
        <div className="p-4 flex gap-2 bg-white/50">
          <Button variant="secondary" className="flex-1" icon={<Printer size={16} />} onClick={handlePrint}>Print</Button>
          <Button className="flex-1" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
};
