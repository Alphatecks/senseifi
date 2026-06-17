"use client";

import { useEffect, useRef } from "react";

type TransparentVideoProps = {
  src: string;
  className?: string;
  threshold?: number;
  scale?: number;
  align?: "top" | "bottom";
};

export default function TransparentVideo({
  src,
  className = "",
  threshold = 38,
  scale = 1,
  align = "bottom",
}: TransparentVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!video || !canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let active = true;

    const render = () => {
      if (!active) return;

      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      if (video.readyState >= 2 && video.videoWidth > 0) {
        ctx.clearRect(0, 0, width, height);

        const videoAspect = video.videoWidth / video.videoHeight;
        const containerAspect = width / height;

        let drawWidth = width;
        let drawHeight = height;
        let offsetX = 0;
        let offsetY = 0;

        if (videoAspect > containerAspect) {
          drawHeight = width / videoAspect;
          offsetY = height - drawHeight;
        } else {
          drawWidth = height * videoAspect;
          offsetX = (width - drawWidth) / 2;
          offsetY = height - drawHeight;
        }

        drawWidth *= scale;
        drawHeight *= scale;
        offsetX = (width - drawWidth) / 2;
        offsetY = align === "top" ? 0 : height - drawHeight;

        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

        const frame = ctx.getImageData(0, 0, width, height);
        const { data } = frame;
        const softEdge = 24;

        for (let i = 0; i < data.length; i += 4) {
          const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

          if (luminance < threshold) {
            data[i + 3] = 0;
          } else if (luminance < threshold + softEdge) {
            data[i + 3] = Math.round(((luminance - threshold) / softEdge) * 255);
          }
        }

        ctx.putImageData(frame, 0, 0);
      }

      raf = requestAnimationFrame(render);
    };

    const onReady = () => {
      void video.play().catch(() => {});
      render();
    };

    video.addEventListener("loadeddata", onReady);
    if (video.readyState >= 2) onReady();

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      video.removeEventListener("loadeddata", onReady);
    };
  }, [src, threshold, scale, align]);

  return (
    <div ref={containerRef} className={className}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="sr-only"
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
