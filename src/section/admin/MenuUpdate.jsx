export default function MenuUpdates() {

  return (
    <div className="space-y-6">

      <div>
        <h1 className="
          text-2xl font-black
          text-[#2D1400]
        ">
          Menu Updates
        </h1>

        <p className="
          text-sm text-[#8B6A4F]
          mt-1
        ">
          Manage menu announcements
          and availability.
        </p>
      </div>

      {/* Form */}
      <div className="
        bg-white
        border border-[#E8D5C0]
        rounded-2xl
        p-6
        space-y-4
      ">

        <div>
          <label className="
            text-sm font-bold
            text-[#2D1400]
          ">
            Update Title
          </label>

          <input
            type="text"
            placeholder="Pizza Offer Today"
            className="
              mt-2 w-full
              border border-[#E8D5C0]
              rounded-xl
              px-4 py-3
              outline-none
              focus:border-[#D44B1A]
            "
          />
        </div>

        <div>
          <label className="
            text-sm font-bold
            text-[#2D1400]
          ">
            Description
          </label>

          <textarea
            rows={4}
            placeholder="Write update..."
            className="
              mt-2 w-full
              border border-[#E8D5C0]
              rounded-xl
              px-4 py-3
              outline-none
              resize-none
              focus:border-[#D44B1A]
            "
          />
        </div>

        <button
          className="
            bg-[#D44B1A]
            hover:bg-[#b83d13]
            text-white
            px-5 py-3
            rounded-xl
            font-bold
            transition-all
          "
        >
          Save Update
        </button>

      </div>

    </div>
  );
}