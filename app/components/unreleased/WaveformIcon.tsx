// The client-provided placeholder banner used for tracks without cover art
// — both the small grid tiles and the large Now Playing view use this.
// Pass `fill` to scale it up to its container (like object-cover on a real
// image) instead of a fixed pixel `size`. The image already has its own
// black background and gray waveform baked in, so unlike the SVG this
// replaced, `className` color utilities (e.g. text-gray-400) no longer do
// anything — harmless to still pass, just inert.
export default function WaveformIcon({
  size = 40,
  fill = false,
  className = "",
}: {
  size?: number;
  fill?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/audio-placeholder.png"
      alt=""
      aria-hidden="true"
      style={fill ? undefined : { width: size, height: size }}
      className={`${fill ? "h-full w-full" : ""} object-cover ${className}`}
    />
  );
}
