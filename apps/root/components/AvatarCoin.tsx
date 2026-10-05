"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const frames = [
  { src: "/art/avatar/frame-01.webp", duration: 250 },
  { src: "/art/avatar/frame-02.webp", duration: 150 },
  { src: "/art/avatar/frame-03.webp", duration: 150 },
  { src: "/art/avatar/frame-04.webp", duration: 400 },
  { src: "/art/avatar/frame-05.webp", duration: 600 },
  { src: "/art/avatar/frame-06.webp", duration: 650 },
  { src: "/art/avatar/frame-07.webp", duration: 250 },
  { src: "/art/avatar/frame-08.webp", duration: 550 },
] as const;

const centeredFrame = 3;

export function AvatarCoin() {
  const [frameIndex, setFrameIndex] = useState<number>(centeredFrame);
  const [flipping, setFlipping] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let timeoutId: number | undefined;
    let disposed = false;
    let loopGeneration = 0;
    let preloadPromise: Promise<void> | undefined;

    const stopLoop = () => {
      window.clearTimeout(timeoutId);
      timeoutId = undefined;
    };

    const showFrame = (index: number) => {
      if (disposed || motionPreference.matches) return;

      setFrameIndex(index);
      timeoutId = window.setTimeout(
        () => showFrame((index + 1) % frames.length),
        frames[index].duration,
      );
    };

    const updateMotionPreference = () => {
      const generation = ++loopGeneration;
      stopLoop();
      setFrameIndex(centeredFrame);
      setReducedMotion(motionPreference.matches);
      if (motionPreference.matches) {
        setFlipping(false);
        return;
      }

      preloadPromise ??= Promise.all(
        frames.map(
          ({ src }) =>
            new Promise<void>((resolve, reject) => {
              const image = new window.Image();
              image.onload = () => {
                void image.decode().then(resolve, resolve);
              };
              image.onerror = reject;
              image.src = src;
            }),
        ),
      ).then(() => undefined);

      void preloadPromise.then(
        () => {
          if (
            !disposed &&
            generation === loopGeneration &&
            !motionPreference.matches
          ) {
            showFrame(0);
          }
        },
        () => {
          // Keep the centered frame visible if any frame cannot be loaded.
        },
      );
    };

    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);

    return () => {
      disposed = true;
      loopGeneration++;
      stopLoop();
      motionPreference.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  return (
    <button
      type="button"
      className={`avatar-coin${flipping ? " is-flipping" : ""}`}
      aria-label={
        reducedMotion
          ? "Illustrated RaioViajante character"
          : "Flip RaioViajante avatar"
      }
      disabled={reducedMotion}
      data-sound={reducedMotion ? undefined : "flip"}
      data-sound-on="click"
      onClick={() => setFlipping(true)}
    >
      <Image
        src={frames[frameIndex].src}
        alt=""
        width={432}
        height={432}
        className="home-avatar"
        priority
        unoptimized
        onAnimationEnd={() => setFlipping(false)}
      />
    </button>
  );
}
