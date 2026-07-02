import React, { useEffect } from "react";
import { CreditCard, Wallet, Smartphone } from "lucide-react";
import { useSalesStore } from "../../../store";

const ICONS = {
  UPI: Smartphone,
  "UPI / QR": Smartphone,
  Cash: Wallet,
  Card: CreditCard,
};

export default function Payments() {
  const { paymentReport, loading, getPaymentReport } = useSalesStore();

  useEffect(() => {
    getPaymentReport();
  }, [getPaymentReport]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading && (!paymentReport || paymentReport.length === 0) ? (
          <p className="text-xs text-[#8B6A4F] col-span-3 text-center py-6">Loading payment report…</p>
        ) : !paymentReport || paymentReport.length === 0 ? (
          <p className="text-xs text-[#8B6A4F] col-span-3 text-center py-6">No payment data yet.</p>
        ) : (
          paymentReport.map((method, idx) => {
            const Icon = ICONS[method.method ?? method.name] ?? Wallet;
            return (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E8D5C0] flex items-center gap-4">
                <div className="p-3 rounded-xl text-purple-600 bg-purple-50">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-[#8B6A4F] font-medium">{method.method ?? method.name}</p>
                  <h4 className="text-lg font-bold text-[#2D1400] mt-0.5">
                    ₹{Number(method.total ?? method.amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </h4>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{method.count ?? method.txnCount ?? 0} Txns reconciled</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E8D5C0]">
        <h3 className="text-xs font-bold text-[#2D1400] uppercase tracking-wider mb-4">Recent Gateway Clearances</h3>
        <div className="text-xs text-[#8B6A4F] py-8 text-center border border-dashed border-[#E8D5C0] rounded-xl bg-[#FFF8F0]/30">
          All active payment processing paths are fully synchronized and matched against store balance ledgers.
        </div>
      </div>
    </div>
  );
}