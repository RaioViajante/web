"use client";

import { useEffect } from "react";
import { startBehavior } from "./behavior";

/** Starts the shared client behavior. Render once in the root layout. */
export function Behavior() {
  useEffect(() => startBehavior(), []);
  return null;
}
