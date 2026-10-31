import type {
  Decoded,
  Dimensions,
  Encoder,
  OutputFormat,
} from "./image-compression.ts";
import { HEAD_BYTES, mimeOf, readDimensions } from "./image-compression.ts";

// The browser side of the `Encoder` the session drives: decoding with
// `createImageBitmap` and encoding with a canvas. This module is imported by the
// page script only; tests use fakes instead.

type Surface = OffscreenCanvas | HTMLCanvasElement;

function surface(size: Dimensions): Surface {
  if (typeof OffscreenCanvas !== "undefined")
    return new OffscreenCanvas(size.width, size.height);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  return canvas;
}

function draw(
  source: ImageBitmap,
  size: Dimensions,
  flatten: boolean,
): {
  canvas: Surface;
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
} {
  const canvas = surface(size);
  const context = canvas.getContext("2d") as
    CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!context) throw new Error("no 2d context");
  if (flatten) {
    // JPEG has no alpha: transparent pixels would turn black, so draw on white.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size.width, size.height);
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, size.width, size.height);
  return { canvas, context };
}

function toBlob(
  canvas: Surface,
  type: string,
  quality: number | undefined,
): Promise<Blob> {
  if ("convertToBlob" in canvas) return canvas.convertToBlob({ type, quality });
  return new Promise((resolve, reject) =>
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))),
      type,
      quality,
    ),
  );
}

export interface BitmapDecoded extends Decoded {
  bitmap: ImageBitmap;
}

export const browserEncoder: Encoder = {
  async probe(file: Blob): Promise<Dimensions | null> {
    return readDimensions(
      new Uint8Array(await file.slice(0, HEAD_BYTES).arrayBuffer()),
    );
  },
  async decode(file: Blob): Promise<BitmapDecoded> {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    return {
      bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  },
  async encode(
    source: Decoded,
    size: Dimensions,
    format: OutputFormat,
    quality: number | undefined,
  ): Promise<Blob> {
    const { canvas } = draw(
      (source as BitmapDecoded).bitmap,
      size,
      format === "jpeg",
    );
    try {
      return await toBlob(canvas, mimeOf[format], quality);
    } finally {
      // Release the backing store now instead of waiting for garbage collection.
      canvas.width = 0;
      canvas.height = 0;
    }
  },
};

/** Draws a bitmap on a visible canvas at `size`. */
export function drawOn(
  target: HTMLCanvasElement,
  bitmap: ImageBitmap,
  size: Dimensions,
  onWhite = false,
): void {
  target.width = size.width;
  target.height = size.height;
  // These canvases are read back for the difference view.
  const context = target.getContext("2d", { willReadFrequently: true })!;
  if (onWhite) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size.width, size.height);
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, size.width, size.height);
}

export function readPixels(canvas: HTMLCanvasElement): Uint8ClampedArray {
  return canvas
    .getContext("2d")!
    .getImageData(0, 0, canvas.width, canvas.height).data;
}

/** Puts RGBA pixels on a visible canvas. */
export function paintPixels(
  target: HTMLCanvasElement,
  pixels: Uint8ClampedArray,
  size: Dimensions,
): void {
  target.width = size.width;
  target.height = size.height;
  target
    .getContext("2d")!
    .putImageData(
      new ImageData(new Uint8ClampedArray(pixels), size.width, size.height),
      0,
      0,
    );
}
