"use client";

import Image from "next/image";
import { AVATAR_FRAME_SIZE, avatarFrames } from "@raioviajante/design/avatar";
import { useEffect, useState } from "react";

const durations = [250, 150, 150, 300, 200, 300, 400, 400, 250, 600] as const;
const frames = avatarFrames.map((src, index) => ({
  src,
  duration: durations[index],
}));

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
        width={AVATAR_FRAME_SIZE}
        height={AVATAR_FRAME_SIZE}
        className="rv-avatar"
        priority
        unoptimized
        onAnimationEnd={() => setFlipping(false)}
      />
    </button>
  );
}
