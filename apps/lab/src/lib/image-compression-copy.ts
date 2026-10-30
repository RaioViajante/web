import type { LocaleId } from "../../../../site/locales.ts";
import type { PluralForms } from "./plural-core.ts";
import type { LoadFailure, OutputFormat, Preset } from "./image-compression.ts";

// Strings of the image compression lab, one complete catalog per registry
// locale. Format names (JPEG, WebP, PNG) are technical identifiers and read the
// same in both languages. Sizes use decimal units: 1 kB is 1,000 bytes.

export interface ImageCompressionCopy {
  caption: string;
  imageBand: string;
  choose: string;
  useSample: string;
  fileHelp: string;
  presetsBand: string;
  presetsAria: string;
  presets: Record<Preset["id"], { name: string; hint: string }>;
  settingsBand: string;
  formatLabel: string;
  formatNames: Record<OutputFormat, string>;
  qualityLabel: string;
  /** `{quality}`: the number only, 1 to 100. */
  qualityValue: string;
  qualityLossless: string;
  scaleLabel: string;
  /** `{percent}`, already formatted. */
  scaleValue: string;
  transparencyNote: string;
  resultBand: string;
  resultHeaders: readonly [string, string, string];
  rows: {
    file: string;
    dimensions: string;
    saved: string;
    factor: string;
    raw: string;
  };
  measured: string;
  theoretical: string;
  /** `{count}`, formatted by the page. */
  exactBytes: PluralForms;
  /** `{width}`, `{height}`, `{megapixels}`. */
  dimensionsValue: string;
  /** `{value}` is a formatted percentage; the output is smaller. */
  savedValue: string;
  largerValue: string;
  /** `{factor}`: how many raw pixel bytes per encoded byte. */
  factorValue: string;
  compareBand: string;
  compareLabel: string;
  original: string;
  result: string;
  showDifference: string;
  zoom: string;
  differenceNote: string;
  originalAlt: string;
  resultAlt: string;
  differenceAlt: string;
  sweepBand: string;
  sweepRun: string;
  sweepHeaders: readonly [string, string, string];
  sweepCaption: string;
  sweepNote: string;
  sweepLossless: string;
  messages: {
    ready: string;
    loading: string;
    /** `{name}`, `{width}`, `{height}`, `{size}`. */
    loaded: string;
    sampleLoaded: string;
    problems: Record<LoadFailure, string>;
    /** `{format}`. */
    unsupported: string;
    encodeFailed: string;
    noImage: string;
    /** `{size}`, `{saved}`. */
    smaller: string;
    /** `{size}`, `{larger}`. */
    larger: string;
    sweepDone: string;
    sweepSkipped: string;
    sweepBusy: string;
    preset: string;
  };
  conceptsHeading: string;
  concepts: readonly { term: string; text: string }[];
  limitsHeading: string;
  limits: readonly string[];
  noscript: string;
}

export const imageCompressionCopy = {
  en: {
    caption: "bench · runs in this browser",
    imageBand: "Image",
    choose: "Choose an image",
    useSample: "use the sample picture",
    fileHelp:
      "The file is read by this tab and never uploaded. JPEG, PNG, WebP, GIF, AVIF or BMP up to 20 MB and 36 megapixels, as far as your browser can decode them.",
    presetsBand: "Presets",
    presetsAria: "Presets",
    presets: {
      web: {
        name: "web photo",
        hint: "JPEG at quality 80, full size: the usual trade for photos.",
      },
      preview: {
        name: "small preview",
        hint: "WebP at quality 60 and half the width and height: a quarter of the pixels.",
      },
      lossless: {
        name: "lossless",
        hint: "PNG keeps every pixel. Great for flat graphics, large for photos.",
      },
      extreme: {
        name: "extreme",
        hint: "JPEG at quality 10. Look at the edges and the flat color areas.",
      },
      resize: {
        name: "resize only",
        hint: "PNG at half size: fewer pixels, no loss from the encoder.",
      },
    },
    settingsBand: "Settings",
    formatLabel: "Output format",
    formatNames: {
      jpeg: "JPEG · lossy",
      webp: "WebP · lossy",
      png: "PNG · lossless",
    },
    qualityLabel: "Quality",
    qualityValue: "{quality} of 100",
    qualityLossless:
      "PNG has no quality setting: it keeps every pixel, so only the size changes the result.",
    scaleLabel: "Size",
    scaleValue: "{percent} of the original width and height",
    transparencyNote:
      "JPEG has no transparency: transparent areas are drawn on white.",
    resultBand: "Result",
    resultHeaders: ["", "original", "output"],
    rows: {
      file: "File size",
      dimensions: "Dimensions",
      saved: "Compared with the original",
      factor: "Uncompressed size per encoded byte",
      raw: "Uncompressed pixels",
    },
    measured: "measured",
    theoretical: "theoretical",
    exactBytes: { one: "{count} byte", other: "{count} bytes" },
    dimensionsValue: "{width} × {height} px · {megapixels} MP",
    savedValue: "{value} smaller",
    largerValue: "{value} larger",
    factorValue: "{factor} to 1",
    compareBand: "Compare",
    compareLabel: "Position of the divider",
    original: "original",
    result: "result",
    showDifference: "show difference",
    zoom: "zoom 4×",
    differenceNote:
      "The difference view shows how far each pixel moved, amplified 8 times. Black means identical. It compares at the output size.",
    originalAlt: "The original image",
    resultAlt: "The re-encoded image",
    differenceAlt:
      "Amplified difference between the original and the re-encoded image",
    sweepBand: "Quality sweep",
    sweepRun: "measure every quality",
    sweepHeaders: ["quality", "file size", "of the original"],
    sweepCaption:
      "Measured file size at each quality with the current format and size",
    sweepNote:
      "Each row is a real encode in this browser. On photos the curve is steep at the top: the last quality points cost the most bytes.",
    sweepLossless: "PNG has no quality to sweep. Choose JPEG or WebP.",
    messages: {
      ready:
        "Choose an image, or use the sample picture, then change the settings.",
      loading: "Reading the image…",
      loaded: "{name}: {width} × {height} px, {size}.",
      sampleLoaded:
        "Sample picture loaded: {width} × {height} px, {size} as PNG.",
      problems: {
        empty: "That file is empty.",
        "too-large": "That file is over 20 MB.",
        "not-an-image": "That file is not an image.",
        "unsupported-type": "This lab does not read that image type.",
        "decode-failed":
          "Your browser could not decode that image. It may be damaged or in a format this browser does not read.",
        "too-many-pixels":
          "That image is over 36 megapixels, too large to process safely in a tab.",
        stale: "A newer choice replaced this one.",
      },
      unsupported:
        "This browser did not produce {format}: it returned PNG instead. Pick another format.",
      encodeFailed:
        "The browser could not encode the image with these settings.",
      noImage: "Choose an image first.",
      smaller: "Output {size}, {saved}.",
      larger:
        "Output {size}, {larger}. Re-encoding does not always shrink a file.",
      sweepDone: "Measured the file size at every quality.",
      sweepSkipped: "The sweep needs JPEG or WebP and an image.",
      sweepBusy: "Measuring…",
      preset: "Preset “{name}” applied. {hint}",
    },
    conceptsHeading: "What to watch",
    concepts: [
      {
        term: "lossy and lossless",
        text: "JPEG and WebP (here) discard detail the eye notices least, and quality sets how much. PNG keeps every pixel exactly, so it only shrinks by finding patterns, which works well on flat graphics and poorly on photos.",
      },
      {
        term: "re-encoding",
        text: "Every lossy save starts from decoded pixels and throws away more. Saving a JPEG as JPEG again is not free, and the artifacts of the first save are now part of the picture.",
      },
      {
        term: "resizing",
        text: "Fewer pixels usually shrink the file whatever the format, and the loss is blurriness, not blocks. Resize only and quality are two different dials; compare the “small preview” and “resize only” presets.",
      },
      {
        term: "artifacts",
        text: "At low quality look for blocks along edges, ringing (halos) around the sharp disc and square, smeared fine stripes and banding in the smooth gradient. The difference view makes them visible.",
      },
      {
        term: "measured, not promised",
        text: "Byte counts come from the file this browser’s encoder produced. They differ between browsers and versions, so the same settings can give different sizes elsewhere. No target size can be guaranteed from a quality setting; this page does not try.",
      },
    ],
    limitsHeading: "Limits",
    limits: [
      "This is a teaching experiment, not a compression tool. It does not try to hit a size and does not produce a download.",
      "It uses your browser’s own encoders (canvas). Mochifile’s engine uses its own codecs so results match across browsers; the numbers here will not match it.",
      "WebP encoding is missing in some browsers; the page detects it and says so instead of showing a PNG as WebP. AVIF and GIF are readable but not offered as outputs.",
      "The pixel size is read from the file header and anything over 36 megapixels (or whose header cannot be read) is refused before decoding. AVIF is not accepted because its size cannot be checked that way. Animated GIFs use their first frame. EXIF orientation is applied; other metadata and color profiles are not kept.",
      "Some browsers (notably Safari) limit canvas size, so a very large image may fail to encode at full size, and browsers that protect against fingerprinting add noise to canvas readback, which would show up in the difference view. Zoom magnifies the centre only.",
      "Everything stays in this tab: no upload, no storage, no download. Previews are drawn on canvases and the decoded image is released when you pick another one or leave the page.",
    ],
    noscript:
      "The lab needs JavaScript to read and re-encode an image in your browser.",
  },
  "pt-BR": {
    caption: "bancada · executa neste navegador",
    imageBand: "Imagem",
    choose: "Escolher uma imagem",
    useSample: "usar a imagem de exemplo",
    fileHelp:
      "O arquivo é lido por esta aba e nunca é enviado. JPEG, PNG, WebP, GIF, AVIF ou BMP de até 20 MB e 36 megapixels, desde que o navegador consiga decodificá-los.",
    presetsBand: "Predefinições",
    presetsAria: "Predefinições",
    presets: {
      web: {
        name: "foto para web",
        hint: "JPEG com qualidade 80, tamanho original: a troca usual para fotos.",
      },
      preview: {
        name: "prévia pequena",
        hint: "WebP com qualidade 60 e metade da largura e da altura: um quarto dos pixels.",
      },
      lossless: {
        name: "sem perdas",
        hint: "O PNG mantém todos os pixels. Ótimo para gráficos chapados, grande para fotos.",
      },
      extreme: {
        name: "extremo",
        hint: "JPEG com qualidade 10. Observe as bordas e as áreas de cor chapada.",
      },
      resize: {
        name: "só redimensionar",
        hint: "PNG na metade do tamanho: menos pixels, sem perda causada pelo codificador.",
      },
    },
    settingsBand: "Ajustes",
    formatLabel: "Formato de saída",
    formatNames: {
      jpeg: "JPEG · com perdas",
      webp: "WebP · com perdas",
      png: "PNG · sem perdas",
    },
    qualityLabel: "Qualidade",
    qualityValue: "{quality} de 100",
    qualityLossless:
      "O PNG não tem ajuste de qualidade: mantém todos os pixels, então só o tamanho muda o resultado.",
    scaleLabel: "Tamanho",
    scaleValue: "{percent} da largura e da altura originais",
    transparencyNote:
      "O JPEG não tem transparência: as áreas transparentes são desenhadas sobre branco.",
    resultBand: "Resultado",
    resultHeaders: ["", "original", "saída"],
    rows: {
      file: "Tamanho do arquivo",
      dimensions: "Dimensões",
      saved: "Em relação ao original",
      factor: "Tamanho sem compressão por byte codificado",
      raw: "Pixels sem compressão",
    },
    measured: "medido",
    theoretical: "teórico",
    exactBytes: {
      one: "{count} byte",
      other: "{count} bytes",
      none: "nenhum byte",
    },
    dimensionsValue: "{width} × {height} px · {megapixels} MP",
    savedValue: "{value} menor",
    largerValue: "{value} maior",
    factorValue: "{factor} para 1",
    compareBand: "Comparar",
    compareLabel: "Posição do divisor",
    original: "original",
    result: "resultado",
    showDifference: "mostrar diferença",
    zoom: "zoom 4×",
    differenceNote:
      "A visão de diferença mostra o quanto cada pixel mudou, amplificado 8 vezes. Preto significa idêntico. A comparação é feita no tamanho da saída.",
    originalAlt: "A imagem original",
    resultAlt: "A imagem recodificada",
    differenceAlt:
      "Diferença amplificada entre a imagem original e a recodificada",
    sweepBand: "Varredura de qualidade",
    sweepRun: "medir todas as qualidades",
    sweepHeaders: ["qualidade", "tamanho do arquivo", "do original"],
    sweepCaption:
      "Tamanho de arquivo medido em cada qualidade, com o formato e o tamanho atuais",
    sweepNote:
      "Cada linha é uma codificação real neste navegador. Em fotos a curva é íngreme no topo: os últimos pontos de qualidade custam mais bytes.",
    sweepLossless: "O PNG não tem qualidade para varrer. Escolha JPEG ou WebP.",
    messages: {
      ready:
        "Escolha uma imagem, ou use a imagem de exemplo, e depois mude os ajustes.",
      loading: "Lendo a imagem…",
      loaded: "{name}: {width} × {height} px, {size}.",
      sampleLoaded:
        "Imagem de exemplo carregada: {width} × {height} px, {size} em PNG.",
      problems: {
        empty: "Esse arquivo está vazio.",
        "too-large": "Esse arquivo passa de 20 MB.",
        "not-an-image": "Esse arquivo não é uma imagem.",
        "unsupported-type": "Este laboratório não lê esse tipo de imagem.",
        "decode-failed":
          "O navegador não conseguiu decodificar essa imagem. Ela pode estar danificada ou em um formato que este navegador não lê.",
        "too-many-pixels":
          "Essa imagem passa de 36 megapixels, grande demais para processar com segurança numa aba.",
        stale: "Uma escolha mais nova substituiu esta.",
      },
      unsupported:
        "Este navegador não produziu {format}: devolveu PNG no lugar. Escolha outro formato.",
      encodeFailed:
        "O navegador não conseguiu codificar a imagem com esses ajustes.",
      noImage: "Escolha uma imagem primeiro.",
      smaller: "Saída de {size}, {saved}.",
      larger:
        "Saída de {size}, {larger}. Recodificar nem sempre diminui um arquivo.",
      sweepDone: "O tamanho do arquivo foi medido em todas as qualidades.",
      sweepSkipped: "A varredura precisa de JPEG ou WebP e de uma imagem.",
      sweepBusy: "Medindo…",
      preset: "Predefinição “{name}” aplicada. {hint}",
    },
    conceptsHeading: "O que observar",
    concepts: [
      {
        term: "com e sem perdas",
        text: "JPEG e WebP (aqui) descartam o detalhe que o olho menos percebe, e a qualidade define quanto. O PNG mantém cada pixel exatamente, então só diminui ao achar padrões, o que funciona bem em gráficos chapados e mal em fotos.",
      },
      {
        term: "recodificação",
        text: "Todo salvamento com perdas parte de pixels já decodificados e joga fora mais coisa. Salvar um JPEG como JPEG de novo não sai de graça, e os artefatos do primeiro salvamento agora fazem parte da imagem.",
      },
      {
        term: "redimensionar",
        text: "Menos pixels em geral diminuem o arquivo em qualquer formato, e a perda é desfoque, não blocos. Só redimensionar e qualidade são dois ajustes diferentes; compare as predefinições “prévia pequena” e “só redimensionar”.",
      },
      {
        term: "artefatos",
        text: "Em qualidade baixa procure blocos nas bordas, halos ao redor do disco e do quadrado nítidos, listras finas borradas e faixas no degradê suave. A visão de diferença os deixa visíveis.",
      },
      {
        term: "medido, não prometido",
        text: "As contagens de bytes vêm do arquivo que o codificador deste navegador produziu. Elas mudam entre navegadores e versões, então os mesmos ajustes podem dar tamanhos diferentes em outro lugar. Nenhum tamanho-alvo pode ser garantido a partir de um ajuste de qualidade; esta página nem tenta.",
      },
    ],
    limitsHeading: "Limites",
    limits: [
      "Este é um experimento didático, não uma ferramenta de compressão. Ele não tenta atingir um tamanho e não gera download.",
      "Usa os codificadores do próprio navegador (canvas). O motor do Mochifile usa codecs próprios para que os resultados sejam iguais entre navegadores; os números daqui não vão coincidir com os dele.",
      "A codificação em WebP falta em alguns navegadores; a página detecta isso e avisa em vez de mostrar um PNG como se fosse WebP. AVIF e GIF podem ser lidos, mas não são oferecidos como saída.",
      "O tamanho em pixels é lido do cabeçalho do arquivo, e o que passa de 36 megapixels (ou tem cabeçalho ilegível) é recusado antes de decodificar. O AVIF não é aceito porque o tamanho dele não pode ser verificado assim. GIFs animados usam o primeiro quadro. A orientação EXIF é aplicada; os outros metadados e os perfis de cor não são mantidos.",
      "Alguns navegadores (principalmente o Safari) limitam o tamanho do canvas, então uma imagem muito grande pode falhar ao codificar no tamanho total, e navegadores que protegem contra rastreamento acrescentam ruído à leitura do canvas, o que apareceria na visão de diferença. O zoom amplia apenas o centro.",
      "Tudo fica nesta aba: sem envio, sem armazenamento, sem download. As prévias são desenhadas em canvas, e a imagem decodificada é liberada quando você escolhe outra ou sai da página.",
    ],
    noscript:
      "O laboratório precisa de JavaScript para ler e recodificar uma imagem no seu navegador.",
  },
} satisfies Record<LocaleId, ImageCompressionCopy>;
