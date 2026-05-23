import { ShoppingCart } from "lucide-react";
import { Plus, Minus } from "lucide-react";

export function AddToCartButton({
  onClick,
  text = "Add To Cart",
  full = true,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        ${full ? "w-full" : ""}
        
        flex items-center justify-center gap-2
        
        py-3 px-5 rounded-xl
        
        bg-[#D44B1A]
        hover:bg-[#b83d13]
        
        text-white
        font-bold text-sm
        
        transition-all duration-200
      `}
    >

      <ShoppingCart size={16} />

      {text}

    </button>
  );
}


export  function QtyControl({
  qty,
  onInc,
  onDec,
}) {
  return (
    <div className="flex items-center gap-2">

      <button
        onClick={onDec}
        className="
          w-7 h-7 rounded-lg
          bg-[#E8D5C0]/60
          hover:bg-[#E8D5C0]
          flex items-center justify-center
        "
      >
        <Minus
          size={13}
          className="text-[#D44B1A]"
        />
      </button>

      <span className="w-5 text-center font-bold text-sm">
        {qty}
      </span>

      <button
        onClick={onInc}
        className="
          w-7 h-7 rounded-lg
          bg-[#D44B1A]
          hover:bg-[#b83d13]
          flex items-center justify-center
        "
      >
        <Plus
          size={13}
          className="text-white"
        />
      </button>

    </div>
  );
}