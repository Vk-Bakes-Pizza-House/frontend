import { MapPin } from "lucide-react";

export  function AddressBox({
  value,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-2">

      <label className="
        flex items-center gap-2
        text-sm font-bold
        text-[#2D1400]
      ">
        <MapPin
          size={15}
          className="text-[#D44B1A]"
        />

        Delivery Address
      </label>

      <textarea
        rows={1}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Enter your address..."
        className="
          w-full p-3 rounded-xl
          border-2 border-[#E8D5C0]
          focus:border-[#D44B1A]
          outline-none resize-none
          text-sm
        "
      />

    </div>
  );
}

export  function CartSummary({
  subtotal,
  deliveryFee,
  total,
  remaining,
}) {
  return (
    <div className="
      bg-[#FFF8F3]
      border border-[#E8D5C0]
      rounded-xl p-4
    ">

      <div className="flex justify-between mb-2">
        <span className="text-sm text-[#8B6A4F]">
          Subtotal
        </span>

        <span className="font-semibold">
          ₹{subtotal}
        </span>
      </div>

      <div className="flex justify-between mb-2">
        <span className="text-sm text-[#8B6A4F]">
          Delivery Fee
        </span>

         {deliveryFee === 0 ? (
          <span className="text-green-600 font-bold text-xs">FREE 🎉</span>
        ) : (
          <span className="text-[#8B6A4F]">₹{deliveryFee}</span>
        )}
      </div>
      

      <div className="
        border-t border-[#E8D5C0]
        pt-3 mt-3
        flex justify-between
      ">
        <span className="
          font-bold text-[#2D1400]
        ">
          Total
        </span>

        <span className="
          font-black text-[#D44B1A]
        ">
          ₹{total}
        </span>
      </div>

      <p className="
        text-xs text-[#8B6A4F]
        mt-2
      ">
        💵 Cash on Delivery
      </p>

    </div>
  );
}
