"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { submitTourEmail, type TourFormState } from "../tour/actions";

const initialState: TourFormState = { ok: false, message: "" };

export default function TourForm() {
  const [state, dispatch, pending] = useActionState(submitTourEmail, initialState);

  if (state.ok) {
    return (
      <div className="w-full max-w-[448px] flex flex-col items-center gap-2 text-center">
        <p className="text-sm uppercase tracking-tight text-white">You&apos;re on the list.</p>
        <p className="text-xs text-white/50">We&apos;ll email you as soon as dates are announced.</p>
      </div>
    );
  }

  return (
    <form action={dispatch} className="w-full max-w-[448px] flex flex-col items-center gap-1">
      <div className="w-full">
        <input
          className="w-full px-4 py-3 bg-transparent border-0 border-b border-black/30 text-white text-center text-sm font-sans outline-none transition-colors duration-200 focus:border-white placeholder:text-white"
          type="email"
          name="email"
          id="tour-email"
          aria-label="Enter Email For Updates"
          placeholder="ENTER EMAIL FOR UPDATES"
          required
        />
      </div>

      <div className="flex items-center gap-3 mt-1">
        <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
          {/* Checkboxes are replaced elements — browsers never render
              ::before/::after content on an <input>, so a checked:after
              checkmark silently never shows up. This puts the checkmark on
              a sibling icon instead, toggled via the peer-checked state. */}
          <input
            type="checkbox"
            id="tour-terms"
            required
            className="peer relative h-4 w-4 cursor-pointer appearance-none border border-white bg-white/97"
          />
          <Check
            size={11}
            strokeWidth={3}
            className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-black peer-checked:block"
          />
        </div>
        <label
          className="text-[10px] capitalize tracking-tight font-medium text-white cursor-pointer uppercase"
          htmlFor="tour-terms"
        >
          I Agree to terms
        </label>
      </div>

      {!state.ok && state.message && (
        <p className="mt-2 text-xs text-red-300 text-center">{state.message}</p>
      )}

      <button
        className="mt-4 px-8 py-2 text-xs uppercase tracking-tight font-medium font-sans text-black bg-white border-none cursor-pointer transition-colors duration-200 hover:bg-[#e5e5e5] active:scale-95 disabled:opacity-50"
        type="submit"
        disabled={pending}
      >
        {pending ? "SUBMITTING..." : "SUBMIT"}
      </button>
    </form>
  );
}
