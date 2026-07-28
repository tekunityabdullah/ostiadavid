"use client";

import { useEffect, useRef, useState } from "react";

interface BackgroundClipVideoProps {
  desktopSrc: string;
  mobileSrc: string;
  className?: string;
}

// A single <video> element whose src is picked in JS based on viewport,
// instead of rendering both desktop and mobile <video> tags and hiding one
// with CSS — CSS display:none doesn't stop a preloading <video> from
// downloading, so the old approach fetched both clips on every page load.
// Nothing renders until the right source is known, so only one file is
// ever requested.
export default function BackgroundClipVideo({
  desktopSrc,
  mobileSrc,
  className = "",
}: BackgroundClipVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const update = () => setSrc(mql.matches ? desktopSrc : mobileSrc);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [desktopSrc, mobileSrc]);

  // Browsers pause playback on a source swap — force it back to life, and
  // retry on tab refocus in case autoplay was initially blocked.
  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.play().catch(() => {});

    const onVisible = () => {
      if (!document.hidden) video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [src]);

  if (!src) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      controls={false}
      controlsList="nodownload nofullscreen noremoteplayback"
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
