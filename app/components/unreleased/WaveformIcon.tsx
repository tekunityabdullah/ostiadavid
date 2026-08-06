// A static, decorative "audio pulse" glyph used as the placeholder for
// tracks without cover art — both the small grid tiles and the large
// Now Playing view use this, sized via the `size` prop and colored via
// currentColor (pass a text-white/* className to the wrapper).
export default function WaveformIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 160"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 100 L50 100 L70 40 L90 130 L100 20 L110 130 L130 40 L150 100 L190 100"
        stroke="currentColor"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
