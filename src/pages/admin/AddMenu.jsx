import { useState, useEffect } from "react";
import { ListTree, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useMenuStore from "../../store/menuStore"; // Apne store ka sahi path check karein

export default function AddMenu() {
  const { categories, fetchCategories, addCategory, deleteCategory, loading } = useMenuStore();
  
  const [category, setCategory] = useState("");
  const [emoji, setEmoji] = useState("");

  // Page load hote hi existing categories fetch karein
  useEffect(() => {
    if (fetchCategories) fetchCategories();
  }, []);

  console.log("Current Categories:", categories); // Debugging ke liye
  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category.trim()) {
      toast.error("Category ka naam likhna zaroori hai!");
      return;
    }
    const res = await addCategory({ 
      category: category.trim(), 
      emoji: emoji.trim() || "🍽️" // Agar emoji nahi dala toh default set hoga
    });

    if (res?.success || res) {
      toast.success(`${category} category successfully add ho gayi!`);
      setCategory("");
      setEmoji("");
    } else {
      toast.error("Kuch gadbad hui, category add nahi ho payi.");
    }
  };

  // Optional: Category Delete Handler (Agar aapke store mein deleteCategory implemented hai)
  const handleDelete = async (id, catName) => {
    if (window.confirm(`Kya aap "${catName}" category ko delete karna chahte hain?`)) {
      if (deleteCategory) {
        await deleteCategory(id);
        toast.info("Category remove kar di gayi.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1A0A00] p-4 md:p-8 text-[#C8A882]">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <ListTree className="text-[#F5A623]" size={24} />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5A623] font-serif">Add New Category</h2>
            <p className="text-xs text-[#C8A882]/60 font-sans tracking-wide">Yahan se aap apne menu ke main sections (e.g. Cakes, Pizzas) manage kar sakte hain.</p>
          </div>
        </div>

        {/* Category Add Form */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Category Name Input */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider opacity-60">Category Name</label>
              <input
                type="text"
                placeholder="e.g., Custom Cakes, Bakes"
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#F5A623] outline-none transition-all placeholder:text-stone-600"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            {/* Emoji Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider opacity-60">Icon / Emoji</label>
              <input
                type="text"
                placeholder="e.g., 🎂, 🍕"
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white text-center focus:border-[#F5A623] outline-none transition-all placeholder:text-stone-600"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
              />
            </div>

          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto float-right bg-[#F5A623] text-[#1A0A00] font-black px-6 py-3 rounded-xl hover:bg-[#D44B1A] hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#F5A623]/5"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Plus size={16} /> Save Category
              </>
            )}
          </button>
          
          <div className="clear-both"></div>
        </form>

        {/* Existing Categories List Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-black/20 px-5 py-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Active Menus ({categories?.length || 0})</span>
          </div>

          <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
            {categories && categories.length > 0 ? (
              categories.map((cat,index) => (
                <div key={cat.index} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg bg-black/40 w-10 h-10 rounded-xl flex items-center justify-center border border-white/5">
                      {cat.emoji || "🍽️"}
                    </span>
                    <span className="font-semibold text-sm text-[#FFF8F0]">{cat.category}</span>
                  </div>

                  {/* Delete Button */}
                  {deleteCategory && (
                    <button
                      onClick={() => handleDelete(cat._id, cat.category)}
                      className="p-2 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs opacity-50">
                Koi category nahi mili. Upar diye gaye form se pehli category add karein!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}