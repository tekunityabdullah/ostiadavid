import type { ButtonHTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";

// Shared visual language for every admin form/card/button, so Products,
// Unreleased, and Albums stop looking like three separately-styled pages.

export const fieldLabelClass = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-white/50";

export const inputClass =
  "h-11 w-full border border-white/15 bg-white/[0.03] px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white focus:bg-white/[0.05]";

export const textareaClass =
  "w-full resize-none border border-white/15 bg-white/[0.03] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white focus:bg-white/[0.05]";

export const fileInputClass =
  "h-11 w-full border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition file:mr-3 file:h-7 file:border-0 file:bg-white file:px-3 file:text-[11px] file:font-semibold file:uppercase file:tracking-wide file:text-black focus:border-white";

interface FieldProps {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, children, className = "" }: FieldProps) {
  return (
    <div className={`grid gap-2 ${className}`}>
      <label className={fieldLabelClass}>{label}</label>
      {children}
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  );
}

export function AdminCard({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`border border-white/10 bg-white/[0.02] p-5 md:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function AdminPageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <section className="grid gap-3 border-b border-white/15 pb-6">
      <p className="text-xs uppercase tracking-[0.24em] text-white/45">{eyebrow}</p>
      <h1 className="text-3xl font-medium uppercase tracking-tight md:text-5xl">{title}</h1>
    </section>
  );
}

export function CardHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-white/40">{eyebrow}</p>
      )}
      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white/85">{title}</h3>
    </div>
  );
}

interface AdminModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Shared edit-form overlay — used wherever a tile needs an "Edit" action
// without navigating away from the list it belongs to.
export function AdminModal({ title, onClose, children }: AdminModalProps) {
  return (
    <div
      className="fixed inset-0 z-200 flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-white/15 bg-black p-5 md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white/85">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-2 p-2 text-white/50 transition hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "h-11 bg-white px-5 text-black hover:bg-white/85",
  secondary: "h-11 border border-white/20 px-5 text-white hover:border-white/50 hover:bg-white/5",
  danger:
    "h-9 border border-red-500/30 bg-red-500/[0.06] px-3 text-[11px] text-red-300 hover:border-red-400/60 hover:bg-red-500/10",
};

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function AdminButton({ variant = "primary", className = "", ...props }: AdminButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.15em] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}
