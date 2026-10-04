import { SoundToggle } from "./SoundToggle";

export function SiteHeader() {
  return (
    <header className="rv-frame" aria-label="Site header">
      <div className="rv-topline">
        <SoundToggle />
        <span>raioviajante.com</span>
      </div>
    </header>
  );
}
