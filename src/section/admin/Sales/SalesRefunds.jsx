// import React, { useEffect } from "react";
// import { AlertCircle } from "lucide-react";
// import { useRefundsStore } from "../../store/useRefundsStore";

// export default function SalesRefunds() {
//   const { refunds, loading, fetchAll } = useRefundsStore();

//   useEffect(() => {
//     fetchAll();
//   }, [fetchAll]);

//   return (
//     <div className="bg-white p-6 rounded-2xl border border-[#E8D5C0] space-y-6">
//       <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs font-medium">
//         <AlertCircle size={16} className="shrink-0" />
//         <span>Refund reversals trigger automated webhooks back to payment gateways. Reversals generally credit consumer checking routing accounts within 5–7 banking collection cycles.</span>
//       </div>

//       <div className="overflow-hidden border border-[#E8D5C0] rounded-xl">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-[#FFF8F0] border-b border-[#E8D5C0] text-xs font-bold text-[#2D1400]">
//               <th className="p-3.5">Reference ID</th>
//               <th className="p-3.5">Filing Date</th>
//               <th className="p-3.5">Reason Statement</th>
//               <th className="p-3.5">Reversal Sum</th>
//               <th className="p-3.5 text-right">Status</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-[#E8D5C0]/60 text-xs text-[#2D1400]">
//             {loading ? (
//               <tr><td colSpan={5} className="p-6 text-center text-[#8B6A4F]">Loading…</td></tr>
//             ) : refunds.length === 0 ? (
//               <tr><td colSpan={5} className="p-6 text-center text-[#8B6A4F]">No refunds recorded.</td></tr>
//             ) : (
//               refunds.map((ref) => (
//                 <tr key={ref._id} className="hover:bg-[#FFF8F0]/20">
//                   <td className="p-3.5 font-mono font-bold text-gray-500">{ref._id}</td>
//                   <td className="p-3.5">
//                     {new Date(ref.createdAt ?? ref.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
//                   </td>
//                   <td className="p-3.5 font-medium">{ref.reason}</td>
//                   <td className="p-3.5 font-bold text-red-600">-₹{Number(ref.amount).toFixed(2)}</td>
//                   <td className="p-3.5 text-right">
//                     <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${ref.status === "Completed" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
//                       {ref.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function SalesRefunds() {
  const refunds = [
    { id: "REF-401", date: "24 June 2026", reason: "Order Cancelled by User", amount: "₹450.00", status: "Completed" },
    { id: "REF-402", date: "21 June 2026", reason: "Damaged Delivery claims", amount: "₹800.00", status: "Processing" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E8D5C0] space-y-6">
      <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs font-medium">
        <AlertCircle size={16} className="shrink-0" />
        <span>Refund reversals trigger automated webhooks back to payment gateways. Reversals generally credit consumer checking routing accounts within 5–7 banking collection cycles.</span>
      </div>

      <div className="overflow-hidden border border-[#E8D5C0] rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFF8F0] border-b border-[#E8D5C0] text-xs font-bold text-[#2D1400]">
              <th className="p-3.5">Reference ID</th>
              <th className="p-3.5">Filing Date</th>
              <th className="p-3.5">Reason Statement</th>
              <th className="p-3.5">Reversal Sum</th>
              <th className="p-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8D5C0]/60 text-xs text-[#2D1400]">
            {refunds.map((ref) => (
              <tr key={ref.id} className="hover:bg-[#FFF8F0]/20">
                <td className="p-3.5 font-mono font-bold text-gray-500">{ref.id}</td>
                <td className="p-3.5">{ref.date}</td>
                <td className="p-3.5 font-medium">{ref.reason}</td>
                <td className="p-3.5 font-bold text-red-600">-{ref.amount}</td>
                <td className="p-3.5 text-right">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${ref.status === "Completed" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
                    {ref.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}