
import { useState } from "react";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useFQAStore } from "../../store";


// const INITIAL_FAQS = [
//   { q: "Delivery hone mein kitna time lagta hai?", a: "Usually 25–40 minutes lagte hain, jo aapki location aur order size par depend karta hai. Order confirm karte waqt hum aapko estimated time bata denge." },
//   { q: "Aap kaun-kaun se areas mein deliver karte hain?", a: "Hum locally hamare aas-paas ke neighborhood mein deliver karte hain. Aapka area covered hai ya nahi, yeh check karne ke liye hume WhatsApp par message karein." },
//   { q: "Kya main order dene ke baad use change kar sakta hoon?", a: "Haan! Jab tak hum food prepare karna start nahi karte, tab tak aap WhatsApp par message karke change karwa sakte hain. Ek baar preparation shuru ho gayi, toh change nahi ho payega." },
//   { q: "Main sirf akele Ice Cream order kyun nahi kar sakta?", a: "Ice cream jaldi melt (pighal) jaati hai, isliye hum ise sirf Pizza, Bake ya Cake ke order ke sath hi deliver karte hain taaki aap tak sahi condition mein पहुंचे. Aap chahein toh direct hamare store se aakar pickup kar sakte hain!" },
//   { q: "Kya main delivery ki jagah khud store aakar pickup kar sakta hoon?", a: "Bilkul! Bas apne WhatsApp message mein 'store pickup' mention kar dein, aapse koi delivery charge nahi liya jayega." },
//   { q: "Custom Cake kaise order karein?", a: "Custom Cake wale page par jaayein, wahan size, flavour, message aur delivery date fill karein, phir 'Send Order on WhatsApp' par tap karein. Hum direct aapse price aur details confirm kar lenge." },
//   { q: "Agar mujhe kisi food item se allergy hai toh kya karein?", a: "Please apni allergy ke baare mein WhatsApp message mein saaf-saaf bata dein. Hum poori koshish karenge aapke according prepare karne ki, aur agar safely prepare nahi ho payega toh aapko इन्फॉर्म kar denge." },
// ];

function ManageFaq() {
//   const [faqs, setFaqs] = useState(INITIAL_FAQS);
const { FAQS, addFaq, deleteFaq } = useFQAStore();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // Naya FAQ add karne ka function
  const handleAddFaq = (e) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      toast.warning("Please Question aur Answer dono fill karein!");
      return;
    }

    const newFaq = {
      q: question.trim(),
      a: answer.trim()
    };

    addFaq(newFaq);
    setQuestion(""); // Input reset
    setAnswer("");   // Input reset
    toast.success("Naya FAQ successfully add ho gaya!");
  };

  // FAQ delete karne ka function
  const handleDeleteFaq = (indexToDelete) => {
    deleteFaq(indexToDelete);
    toast.info("FAQ remove kar diya gaya.");
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="text-orange-600" size={28} />
          <h2 className="text-2xl font-bold text-stone-800">Manage FAQs (Hinglish)</h2>
        </div>

        {/* Form to Add FAQ */}
        <form onSubmit={handleAddFaq} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm mb-8">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">Add New Question</h3>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Question (Sawaal)</label>
              <input
                type="text"
                placeholder="e.g., Kya delivery free hai?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Answer (Jawaab)</label>
              <textarea
                rows="3"
                placeholder="e.g., Haan, ₹300 se upar ke orders par delivery bilkul free hai."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all active:scale-95 shadow-md shadow-orange-100 self-end "
            >
              <Plus size={16} /> Add to FAQ List
            </button>
          </div>
        </form>

        {/* Live Preview / FAQ List */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="bg-stone-100 px-5 py-3.5 border-b border-stone-200 flex justify-between items-center">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Total FAQs ({FAQS.length})</span>
          </div>

          <div className="divide-y divide-stone-100">
            {FAQS.map((faq, index) => (
              <div key={index} className="p-5 flex gap-4 items-start justify-between group hover:bg-stone-50/50 transition-colors">
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-stone-800 flex items-start gap-1.5">
                    <span className="text-orange-600 font-mono text-xs mt-0.5">Q.</span>
                    {faq.q}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1.5 pl-4 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={handleDeleteFaq()}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete FAQ"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ManageFaq;