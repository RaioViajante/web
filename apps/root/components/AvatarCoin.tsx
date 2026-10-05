"use client";

import Image from "next/image";
import { useState } from "react";

export function AvatarCoin() {
  const [flipping, setFlipping] = useState(false);

  return (
    <button
      type="button"
      className={`avatar-coin${flipping ? " is-flipping" : ""}`}
      aria-label="Flip RaioViajante avatar"
      data-sound="flip"
      data-sound-on="click"
      onClick={() => setFlipping(true)}
    >
      <Image
        src="/art/portrait.webp"
        alt="Illustrated RaioViajante character"
        width={108}
        height={108}
        className="home-avatar"
        priority
        onAnimationEnd={() => setFlipping(false)}
      />
    </button>
  );
}
