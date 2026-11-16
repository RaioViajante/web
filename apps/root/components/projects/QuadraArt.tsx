import { quadraCard, type QuadraImage } from "@raioviajante/design/quadra";
import { StuccoPlay } from "./StuccoPlay";
import "./stucco-art.css";
import "./quadra-art.css";

// The art repeats the demo's own screens, in its own English, so it is the
// same in both languages and hidden from assistive technology.

function Slides({
  images,
  sizes,
}: {
  images: readonly QuadraImage[];
  sizes: string;
}) {
  return images.map((image, index) => (
    // eslint-disable-next-line @next/next/no-img-element -- static derivative with its own srcset
    <img
      key={image.src}
      className={`st-sl s${index + 1}`}
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      alt=""
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
    />
  ));
}

/** A browser and a phone cycling through the demo's screens on the court-blue card. */
export function QuadraArt() {
  return (
    <StuccoPlay className="qd">
      {/* eslint-disable-next-line @next/next/no-img-element -- static derivative */}
      <img
        className="qd-bg"
        src={quadraCard.background.src}
        alt=""
        width={quadraCard.background.width}
        height={quadraCard.background.height}
        loading="lazy"
        decoding="async"
      />
      <span className="st-win">
        <span className="st-bar">
          <i />
          <i />
          <i />
          <span className="st-url">raioviajante.com/work/quadra</span>
        </span>
        <span className="st-view">
          <Slides
            images={quadraCard.desktop}
            sizes="(max-width: 760px) 72vw, 300px"
          />
        </span>
      </span>
      <span className="st-phone">
        <span className="st-pv">
          <Slides
            images={quadraCard.mobile}
            sizes="(max-width: 760px) 22vw, 90px"
          />
        </span>
      </span>
    </StuccoPlay>
  );
}
