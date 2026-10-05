# OG image font

Open Graph images use two Latin-subset static weights of Noto Sans Mono. They
were produced from the variable font in the official Google Fonts repository,
instantiated at width 100 and weights 400/700, then subset to U+0020–U+017F.
The original font is licensed under the SIL Open Font License 1.1; the license
is retained in `OFL-NotoSansMono.txt`.

The main site loads Noto Sans Mono through `next/font/google`. `ImageResponse`
needs local TTF bytes, so these small files are used only by the OG image routes.
