import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage(): never {
  redirect("https://raioviajante.com/about");
}
