import React from "react";
import { usePOSStore } from "../../store/posStore";
import { X, PlayCircle, Trash2, PauseCircle } from "lucide-react";
import { format } from "date-fns";

interface HeldSalesModalProps {
  onClose: () => void;
}

export const HeldSalesModal: React.FC<HeldSalesModalProps> = ({ onClose }) => {
  const { heldSales, resumeHeldSale, deleteHeldSale } = usePOSStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-modal rounded-3xl w-full max-w-sm overflow-hidden animate-scaleIn">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <PauseCircle size={18} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Held Sales</h3>
              <p className="text-[11px] text-gray-400">{heldSales.length} cart(s) on hold</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-2.5 max-h-96 overflow-y-auto">
          {heldSales.length === 0 ? (
            <div className="text-center py-10">
              <PauseCircle size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">No held sales</p>
            </div>
          ) : (
            heldSales.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 p-3.5 bg-white/60 border border-white/40 rounded-2xl hover:bg-white/80 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{h.items.length} item(s)</p>
                  {h.note && <p className="text-xs text-gray-500 truncate">{h.note}</p>}
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {format(new Date(h.heldAt), "HH:mm · dd MMM")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { resumeHeldSale(h.id); onClose(); }}
                    className="p-2 rounded-xl text-indigo-500 hover:bg-indigo-50 transition"
                    title="Resume"
                  >
                    <PlayCircle size={18} />
                  </button>
                  <button
                    onClick={() => deleteHeldSale(h.id)}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
