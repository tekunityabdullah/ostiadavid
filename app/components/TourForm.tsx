"use client";

export default function TourForm() {
  return (
    <form
      className="w-full max-w-[448px] flex flex-col items-center gap-1"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="w-full">
        <input
          className="w-full px-4 py-3 bg-transparent border-0 border-b border-black/30 text-white text-center text-sm font-sans outline-none transition-colors duration-200 focus:border-white placeholder:text-white"
          type="email"
          id="tour-email"
          aria-label="Enter Email For Updates"
          placeholder="ENTER EMAIL FOR UPDATES"
          required
        />
      </div>

      <div className="flex items-center gap-3 mt-1">
        <input
          type="checkbox"
          id="tour-terms"
          required
          className="appearance-none w-4 h-4 border border-white bg-white/97 cursor-pointer relative checked:after:content-[''] checked:after:absolute checked:after:left-1 checked:after:top-px checked:after:w-[5px] checked:after:h-[9px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-white checked:after:rotate-45"
        />
        <label
          className="text-[10px] capitalize tracking-tight font-medium text-white cursor-pointer uppercase"
          htmlFor="tour-terms"
        >
          I Agree to terms
        </label>
      </div>

      <button
        className="mt-4 px-8 py-2 text-xs uppercase tracking-tight font-medium font-sans text-black bg-white border-none cursor-pointer transition-colors duration-200 hover:bg-[#e5e5e5] active:scale-95"
        type="submit"
      >
        SUBMIT
      </button>
    </form>
  );
}
