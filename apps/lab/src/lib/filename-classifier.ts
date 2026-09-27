/** Sweep 3544d36: Python 3.14 POSIX Path.suffix, then lowercase matching. */
export function classifyFilename(filename: string) {
  const name =
    filename
      .split("/")
      .filter((part) => part && part !== ".")
      .at(-1) ?? "";
  const withoutLeadingDots = name.replace(/^\.+/, "");
  const dot = withoutLeadingDots.lastIndexOf(".");
  const suffix = dot < 0 ? "" : withoutLeadingDots.slice(dot).toLowerCase();
  const category = [".jpg", ".png", ".jpeg", ".gif", ".webp"].includes(suffix)
    ? "Images"
    : [".docx", ".pdf", ".md", ".txt"].includes(suffix)
      ? "Documents"
      : [".zip", ".rar", ".7z", ".tar", ".gz"].includes(suffix)
        ? "Archives"
        : "Other";
  return { filename, suffix, category };
}
