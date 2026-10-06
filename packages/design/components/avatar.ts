/**
 * The avatar animation frames (root home). Kept apart from art.tsx so sites
 * that never animate the avatar do not bundle ten images. Frame 4 is the
 * centered avatar.
 */
import frame01 from "../assets/character/avatar-frames/frame-01.png";
import frame02 from "../assets/character/avatar-frames/frame-02.png";
import frame03 from "../assets/character/avatar-frames/frame-03.png";
import frame04 from "../assets/character/avatar-frames/frame-04.png";
import frame05 from "../assets/character/avatar-frames/frame-05.png";
import frame06 from "../assets/character/avatar-frames/frame-06.png";
import frame07 from "../assets/character/avatar-frames/frame-07.png";
import frame08 from "../assets/character/avatar-frames/frame-08.png";
import frame09 from "../assets/character/avatar-frames/frame-09.png";
import frame10 from "../assets/character/avatar-frames/frame-10.png";

type StaticAsset = string | { src: string };
const src = (asset: StaticAsset) =>
  typeof asset === "string" ? asset : asset.src;

/** Intrinsic size of every frame; displayed at 112px. */
export const AVATAR_FRAME_SIZE = 224;

export const avatarFrames: readonly string[] = [
  frame01,
  frame02,
  frame03,
  frame04,
  frame05,
  frame06,
  frame07,
  frame08,
  frame09,
  frame10,
].map(src);
