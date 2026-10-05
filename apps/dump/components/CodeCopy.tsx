"use client";

import { useEffect } from "react";

export function CodeCopy() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>(".prose pre");
    const buttons: HTMLButtonElement[] = [];
    blocks.forEach((block) => {
      const code = block.querySelector("code");
      if (!code) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "copy";
      button.setAttribute("aria-label", "Copy code block");
      button.addEventListener("click", async () => {
        await navigator.clipboard.writeText(code.textContent ?? "");
        button.textContent = "copied";
        window.setTimeout(() => {
          button.textContent = "copy";
        }, 1800);
      });
      block.appendChild(button);
      buttons.push(button);
    });
    return () => {
      buttons.forEach((button) => button.remove());
    };
  }, []);
  return null;
}
