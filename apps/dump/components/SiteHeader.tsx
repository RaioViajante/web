import { SoundToggle } from "@/components/SoundToggle";

export function SiteHeader() {
  return (
    <header className="rv-frame" aria-label="Site header">
      <div className="rv-topline">
        <SoundToggle />
      </div>
    </header>
  );
}
