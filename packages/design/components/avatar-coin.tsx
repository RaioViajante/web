import { AVATAR_FRAME_SIZE, avatarFrames } from "./avatar";

/** How long each of the ten frames shows, in milliseconds. */
export const AVATAR_DURATIONS = [
  250, 150, 150, 300, 200, 300, 400, 400, 250, 600,
] as const;

/** The frame shown at rest and with reduced motion: the centered avatar. */
export const AVATAR_REST_FRAME = 3;

/**
 * The index-header avatar as a looping ten-frame animation that flips on
 * click. Static markup: the shared behavior script (`avatar-coin.ts`) runs the
 * loop, so Next and Astro apps render it the same way.
 */
export function AvatarCoin({
  label = "Flip RaioViajante avatar",
  reducedMotionLabel = "Illustrated RaioViajante character",
}: {
  /** The accessible name; an app that renders another language supplies its own. */
  label?: string;
  reducedMotionLabel?: string;
} = {}) {
  return (
    <button
      type="button"
      className="avatar-coin"
      aria-label={label}
      data-avatar-label={label}
      data-avatar-reduced-label={reducedMotionLabel}
      data-avatar-coin
      data-frames={JSON.stringify(avatarFrames)}
      data-durations={AVATAR_DURATIONS.join(",")}
      data-rest={AVATAR_REST_FRAME}
      data-sound="flip"
      data-sound-on="click"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- shared across Next.js and Astro */}
      <img
        className="rv-avatar"
        src={avatarFrames[AVATAR_REST_FRAME]}
        alt=""
        width={AVATAR_FRAME_SIZE}
        height={AVATAR_FRAME_SIZE}
        decoding="async"
        fetchPriority="high"
      />
    </button>
  );
}
