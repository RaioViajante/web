import { chromium, devices } from "@playwright/test";
import { ports } from "../security/local-servers.mjs";

// Deterministic page weight: what a cold mobile load of each representative
// page transfers from its own app, measured in Chromium over CDP (encoded bytes
// on the wire for "transfer", decoded bytes for "size"). Nothing here is a
// timing, so it does not vary from run to run.
const TYPES = {
  Script: "script",
  Stylesheet: "stylesheet",
  Font: "font",
  Image: "image",
  Document: "document",
};

export async function weigh(page) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ...devices["Pixel 7"] });
  const tab = await context.newPage();
  const origin = `http://127.0.0.1:${ports[page.app]}`;
  const external = [];
  await tab.route(
    (url) =>
      !/^http:\/\/127\.0\.0\.1:\d+$/.test(url.origin) &&
      /^https?:$/.test(url.protocol),
    (route) => {
      external.push(route.request().url());
      return route.abort("blockedbyclient");
    },
  );
  const cdp = await context.newCDPSession(tab);
  await cdp.send("Network.enable");
  const requests = new Map();
  cdp.on("Network.responseReceived", (e) => {
    requests.set(e.requestId, {
      url: e.response.url,
      type: e.type,
      status: e.response.status,
      mime: e.response.mimeType,
      transfer: 0,
      size: 0,
    });
  });
  cdp.on("Network.dataReceived", (e) => {
    const r = requests.get(e.requestId);
    if (r) r.size += e.dataLength;
  });
  cdp.on("Network.loadingFinished", (e) => {
    const r = requests.get(e.requestId);
    if (r) r.transfer = e.encodedDataLength;
  });
  await tab.goto(origin + page.path, { waitUntil: "networkidle" });
  await tab.waitForTimeout(500);
  const images = await tab.evaluate(() =>
    [...document.images].map((img) => {
      const box = img.getBoundingClientRect();
      return {
        src: img.currentSrc || img.src,
        natural: [img.naturalWidth, img.naturalHeight],
        shown: [Math.round(box.width), Math.round(box.height)],
        reserved: img.hasAttribute("width") && img.hasAttribute("height"),
        lazy: img.loading === "lazy",
        aboveFold: box.top < innerHeight && box.bottom > 0 && box.width > 0,
        complete: img.complete,
      };
    }),
  );
  const preloads = await tab.evaluate(() =>
    [...document.querySelectorAll('link[rel="preload"][as="font"]')].map(
      (l) => l.href,
    ),
  );
  await browser.close();

  const rows = [...requests.values()].filter((r) => r.url.startsWith(origin));
  const sum = (type) => {
    const subset = type ? rows.filter((r) => TYPES[r.type] === type) : rows;
    return {
      transfer: subset.reduce((n, r) => n + r.transfer, 0),
      size: subset.reduce((n, r) => n + r.size, 0),
      count: subset.length,
    };
  };
  return {
    total: sum(),
    script: sum("script"),
    stylesheet: sum("stylesheet"),
    font: sum("font"),
    image: sum("image"),
    document: sum("document"),
    requests: rows.length,
    external,
    failures: rows
      .filter((r) => r.status >= 400)
      .map((r) => `${r.status} ${r.url}`),
    images,
    imageRows: rows.filter((r) => r.type === "Image"),
    fonts: rows
      .filter((r) => r.type === "Font")
      .map((r) => r.url.replace(origin, "")),
    preloads: preloads.map((u) => u.replace(origin, "")),
    scripts: rows
      .filter((r) => r.type === "Script")
      .map((r) => ({
        name: r.url.replace(origin, ""),
        transfer: r.transfer,
        size: r.size,
      }))
      .sort((a, b) => b.transfer - a.transfer),
  };
}
