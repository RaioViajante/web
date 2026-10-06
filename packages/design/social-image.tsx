import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ImageResponse } from "@vercel/og";

export const socialImageSize = { width: 1200, height: 630 } as const;

/** Build-time only. All app builds run from apps/<site>, including on Vercel. */
const directory = resolve(process.cwd(), "../../packages/design");
let assets: ReturnType<typeof loadAssets> | undefined;
async function loadAssets() {
  const [regular, bold, avatar, css] = await Promise.all([
    readFile(resolve(directory, "fonts/NotoSansMono-400.ttf")),
    readFile(resolve(directory, "fonts/NotoSansMono-700.ttf")),
    readFile(resolve(directory, "assets/character/avatar.png")),
    readFile(resolve(directory, "styles/tokens.css"), "utf8"),
  ]);
  const token = (name: string) => {
    const value = css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
    if (!value) throw new Error(`Missing social image token: ${name}`);
    return value;
  };
  return {
    avatar: `data:image/png;base64,${avatar.toString("base64")}`,
    bg: token("bg"),
    fg: token("fg"),
    muted: token("fg-2"),
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
