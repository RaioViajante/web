import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ImageResponse } from "@vercel/og";
import type { LocaleId } from "../../site/locales";
import { catalogFor } from "./catalog";

export const socialImageSize = { width: 1200, height: 630 } as const;

/** Build-time only. All app builds run from apps/<site>, including on Vercel. */
const directory = resolve(process.cwd(), "../../packages/design");
let assets: ReturnType<typeof loadAssets> | undefined;
async function loadAssets() {
  const [regular, bold, avatar, css, projectCss] = await Promise.all([
    readFile(resolve(directory, "fonts/NotoSansMono-400.ttf")),
    readFile(resolve(directory, "fonts/NotoSansMono-700.ttf")),
    readFile(resolve(directory, "assets/character/avatar.png")),
    readFile(resolve(directory, "styles/tokens.css"), "utf8"),
    readFile(resolve(directory, "styles/project-art.css"), "utf8"),
  ]);
  const token = (name: string, source = css) => {
    const value = source
      .match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]
      ?.trim();
    if (!value) throw new Error(`Missing social image token: ${name}`);
    return value;
  };
  return {
    avatar: `data:image/png;base64,${avatar.toString("base64")}`,
    bg: token("bg"),
    fg: token("fg"),
    muted: token("fg-2"),
    quiet: token("rule-note"),
    faint: token("table-rule"),
    frame: token("block-button"),
    card: token("card"),
    address: token("block"),
    quadraBlue: token("quadra-blue", projectCss),
    quadraChalk: token("quadra-chalk", projectCss),
    stuccoInk: token("stucco-ink", projectCss),
    fonts: [
      {
        name: "Noto Sans Mono",
        data: regular,
        weight: 400 as const,
        style: "normal" as const,
      },
      {
        name: "Noto Sans Mono",
        data: bold,
        weight: 700 as const,
        style: "normal" as const,
      },
    ],
  };
}

type Assets = Awaited<ReturnType<typeof loadAssets>>;

/** One brand composition for every page and both social protocols. */
export async function createSocialImage(
  site: string,
  title: string,
  origin: string,
) {
  const data = await (assets ??= loadAssets());
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: 64,
        backgroundColor: data.bg,
        color: data.fg,
        fontFamily: "Noto Sans Mono",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          fontSize: 30,
          color: data.muted,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- image renderer */}
        <img src={data.avatar} width={112} height={112} alt="" />
        <span>{site}</span>
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          fontWeight: 700,
          fontSize: title.length > 90 ? 40 : title.length > 55 ? 48 : 60,
          lineHeight: 1.25,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", color: data.muted, fontSize: 22 }}>
        {new URL(origin).host}
      </div>
    </div>,
    { ...socialImageSize, fonts: data.fonts },
  );
}

/** The four sites, in the order every footer lists them. */
const family = ["root", "dump", "docs", "lab"] as const;
export type FamilySite = (typeof family)[number];
const familyNames: Record<FamilySite, string> = {
  root: "raioviajante.com",
  dump: "dump",
  docs: "docs",
  lab: "lab",
};

/** A dotted leader row, as the sites draw them: `name ····· note`. */
function Leader({
  name,
  note,
  data,
}: {
  name: string;
  note: string;
  data: Assets;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
      <span>{name}</span>
      <span
        style={{
          display: "flex",
          flex: 1,
          marginBottom: 8,
          borderBottom: `2px dashed ${data.faint}`,
        }}
      />
      <span style={{ color: data.muted, fontSize: 16 }}>{note}</span>
    </div>
  );
}

/** Dump's quiet detail: columns of a hex dump, the same on every build. */
function hexColumn(start: number, seed: number) {
  let state = seed;
  const byte = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return ((state >> 16) & 255).toString(16).padStart(2, "0");
  };
  return Array.from(
    { length: 30 },
    (_, line) =>
      `${(start + line * 16).toString(16).padStart(8, "0")}  ${Array.from(
        { length: 6 },
        byte,
      ).join(" ")}`,
  );
}

function HexDump({ side, data }: { side: "left" | "right"; data: Assets }) {
  const lines = hexColumn(
    side === "left" ? 0x7ff000 : 0x7ff200,
    side === "left" ? 7 : 11,
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        [side]: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: side === "left" ? "flex-start" : "flex-end",
        fontSize: 13,
        lineHeight: 1.9,
        color: data.faint,
      }}
    >
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}

/**
 * The home of each of the four sites: the avatar, the site's name and line,
 * one quiet detail of its own and the four sites, this one brightest. Root
 * has no detail on purpose: it does not show projects. Dump's is a hex dump,
 * Docs' its search line (from the shared catalog), Lab's the fidelity rows
 * it passes in.
 */
export async function createSiteSocialImage(
  site: FamilySite,
  locale: LocaleId,
  line: string,
  rows?: readonly { name: string; note: string }[],
) {
  const data = await (assets ??= loadAssets());
  const detail = {
    search:
      site === "docs" ? catalogFor(locale).search.prompts.docs : undefined,
    rows: site === "lab" ? rows : undefined,
  };
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        paddingBottom: 56,
        backgroundColor: data.bg,
        color: data.fg,
        fontFamily: "Noto Sans Mono",
        textAlign: "center",
      }}
    >
      {site === "dump" ? <HexDump side="left" data={data} /> : null}
      {site === "dump" ? <HexDump side="right" data={data} /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- image renderer */}
      <img
        src={data.avatar}
        width={132}
        height={132}
        alt=""
        style={{ borderRadius: 66 }}
      />
      <div
        style={{
          display: "flex",
          marginTop: 26,
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {site === "root" ? "RaioViajante" : familyNames[site]}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 22,
          fontSize: 25,
          lineHeight: 1.4,
          color: data.muted,
        }}
      >
        {line}
      </div>
      {detail.search || detail.rows ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: 640,
            marginTop: 34,
            fontSize: 18,
            textAlign: "left",
          }}
        >
          {detail.search ? (
            <Leader name="search_" note={`${detail.search}  /`} data={data} />
          ) : null}
          {detail.rows?.map((row) => (
            <Leader
              key={row.name}
              name={row.name}
              note={row.note}
              data={data}
            />
          ))}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 44,
          left: 0,
          display: "flex",
          justifyContent: "center",
          gap: 14,
          fontSize: 18,
          color: data.quiet,
        }}
      >
        {family.flatMap((item, index) => [
          index ? <span key={`dot-${item}`}>·</span> : null,
          <span
            key={item}
            style={item === site ? { color: data.fg } : undefined}
          >
            {familyNames[item]}
          </span>,
        ])}
      </div>
    </div>,
    { ...socialImageSize, fonts: data.fonts },
  );
}

/** The cases whose social card draws their card art. */
export type SocialCase = "stucco" | "quadra";

async function caseArt(id: SocialCase) {
  const file = (name: string) =>
    readFile(resolve(directory, "assets/social", name)).then(
      (buffer) => `data:image/jpeg;base64,${buffer.toString("base64")}`,
    );
  const [desktop, phone, background] = await Promise.all([
    file(`${id}-desktop.jpg`),
    file(`${id}-phone.jpg`),
    id === "quadra" ? file("quadra-background.jpg") : undefined,
  ]);
  return { desktop, phone, background };
}

/**
 * A case page: its kicker, name and one line on the left, its address
 * below, and on the right the card's browser and phone showing the demo.
 */
export async function createCaseSocialImage(
  id: SocialCase,
  text: { kicker: string; title: string; line: string; address: string },
) {
  const data = await (assets ??= loadAssets());
  const art = await caseArt(id);
  const width = 560;
  const height = 350;
  const view = id === "quadra" ? data.quadraChalk : data.stuccoInk;
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: data.bg,
        color: data.fg,
        fontFamily: "Noto Sans Mono",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 72,
          bottom: 64,
          left: 72,
          display: "flex",
          flexDirection: "column",
          width: 470,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 17,
            letterSpacing: "0.14em",
            color: data.muted,
          }}
        >
          {text.kicker}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 14,
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {text.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 22,
            lineHeight: 1.5,
            color: data.muted,
          }}
        >
          {text.line}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: "auto",
            fontSize: 20,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 5,
              backgroundColor: data.muted,
            }}
          />
          {text.address}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: (630 - height) / 2,
          right: 56,
          display: "flex",
          width,
          height,
          overflow: "hidden",
          borderRadius: 22,
          backgroundColor: id === "quadra" ? data.quadraBlue : data.card,
        }}
      >
        {art.background ? (
          // eslint-disable-next-line @next/next/no-img-element -- image renderer
          <img
            src={art.background}
            width={width}
            height={height}
            alt=""
            style={{ position: "absolute", objectFit: "cover" }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            top: height * 0.08,
            left: width * 0.05,
            display: "flex",
            flexDirection: "column",
            width: width * 0.8,
            height: height * 0.95,
            overflow: "hidden",
            borderRadius: "9px 9px 0 0",
            backgroundColor: view,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              height: 24,
              padding: "0 8px",
              backgroundColor: data.frame,
            }}
          >
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: data.quiet,
                }}
              />
            ))}
            <span
              style={{
                display: "flex",
                marginLeft: 6,
                padding: "0 7px",
                borderRadius: 6,
                backgroundColor: data.address,
                fontSize: 10,
                color: data.muted,
              }}
            >
              raioviajante.com/work/{id}
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- image renderer */}
          <img
            src={art.desktop}
            width={width * 0.8}
            height={(width * 0.8 * 960) / 1600}
            alt=""
            style={{ objectFit: "cover", objectPosition: "0 0" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            right: width * 0.035,
            bottom: -height * 0.07,
            display: "flex",
            width: width * 0.23,
            height: (width * 0.23 * 1090) / 640,
            overflow: "hidden",
            border: `3px solid ${data.stuccoInk}`,
            borderRadius: 16,
            backgroundColor: view,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- image renderer */}
          <img
            src={art.phone}
            width={width * 0.23}
            height={(width * 0.23 * 1090) / 640}
            alt=""
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </div>,
    { ...socialImageSize, fonts: data.fonts },
  );
}
