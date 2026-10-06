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
export function AvatarCoin() {
  return (
    <button
      type="button"
      className="avatar-coin"
      aria-label="Flip RaioViajante avatar"
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
