import { stuccoPhotos } from "@raioviajante/design/stucco";
import { StuccoPlay } from "./StuccoPlay";
import "./stucco-art.css";

// The art repeats the demo's hero, so its words are the demo's own English in
// both languages, and it is hidden from assistive technology.
const captions = [
  "Light slots · living room",
  "Cove ceiling · social area",
  "Light lines · living room",
  "Light lines · outdoor kitchen",
];
const sizes = "(max-width: 760px) 72vw, 300px";

function Slides() {
  return stuccoPhotos.map((photo, index) => (
    // eslint-disable-next-line @next/next/no-img-element -- static derivative with its own srcset
    <img
      key={photo.src}
      className={`st-sl s${index + 1}`}
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={sizes}
      alt=""
      width={photo.width}
      height={photo.height}
      loading="lazy"
      decoding="async"
    />
  ));
}

function SiteHeader({ phone = false }: { phone?: boolean }) {
  return (
    <span className={phone ? "st-top st-pt" : "st-top"}>
      <span className="st-logo">
        {["S", "T", "U", "C", "C", "O"].map((letter, index) => (
          <b key={index}>{letter}</b>
        ))}
        <i />
      </span>
      <span className="st-burg">
        <i />
        <i />
        <i />
      </span>
      {phone ? null : <span className="st-lbl">HOME</span>}
      <span className="st-q">→ GET A QUOTE</span>
    </span>
  );
}

function HeroText({ phone = false }: { phone?: boolean }) {
  return (
    <span className={phone ? "st-txt st-ptxt" : "st-txt"}>
      <span className="st-cap">
        {captions.map((caption, index) => (
          <span key={caption} className={`s${index + 1}`}>
            0{index + 1} / 04 · {caption}
          </span>
        ))}
      </span>
      <span className="st-h">
        The detail that
        <br />
        transforms the space.
      </span>
      <span className="st-dots">
        {captions.map((caption, index) => (
          <i key={caption} className={`s${index + 1}`} />
        ))}
      </span>
    </span>
  );
}

/** A browser and a phone running the demo's hero slideshow in sync. */
export function StuccoArt() {
  return (
    <StuccoPlay>
      <span className="st-win">
        <span className="st-bar">
          <i />
          <i />
          <i />
          <span className="st-url">raioviajante.com/work/stucco</span>
        </span>
        <span className="st-view">
          <Slides />
          <span className="st-sh" />
          <SiteHeader />
          <HeroText />
        </span>
      </span>
      <span className="st-phone">
        <span className="st-pv">
          <Slides />
          <span className="st-sh" />
          <SiteHeader phone />
          <HeroText phone />
        </span>
      </span>
    </StuccoPlay>
  );
}
