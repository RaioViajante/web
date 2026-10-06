"use client";

import { useEffect } from "react";
import { attachSearch } from "./search/client";

export function SearchBehavior() {
  useEffect(() => attachSearch(), []);
  return null;
}
