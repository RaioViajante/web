/** Small ZIP writer for the fixed Gallery collection: stored entries, UTF-8 names.
 * Images are already compressed. No compression library or client worker is needed.
 * The local and central records use the ZIP 2.0 format; timestamps are omitted.
 */
export function galleryZip(
  files: { name: string; data: Uint8Array<ArrayBuffer> }[],
): Blob {
  const local: BlobPart[] = [],
    central: BlobPart[] = [];
  let offset = 0,
    centralSize = 0;
  for (const file of files) {
    const name = new TextEncoder().encode(file.name);
    let crc = 0xffffffff;
    for (const byte of file.data) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++)
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const header = new DataView(new ArrayBuffer(30));
    header.setUint32(0, 0x04034b50, true);
    header.setUint16(4, 20, true);
    header.setUint16(6, 0x0800, true);
    header.setUint16(12, 33, true); // DOS epoch: 1980-01-01; not an artwork date.
    header.setUint32(14, crc, true);
    header.setUint32(18, file.data.length, true);
    header.setUint32(22, file.data.length, true);
    header.setUint16(26, name.length, true);
    const directory = new DataView(new ArrayBuffer(46));
    directory.setUint32(0, 0x02014b50, true);
    directory.setUint16(4, 20, true);
    new Uint8Array(directory.buffer).set(
      new Uint8Array(header.buffer).subarray(4, 30),
      6,
    );
    directory.setUint32(42, offset, true);
    local.push(header.buffer, name, file.data);
    central.push(directory.buffer, name);
    offset += 30 + name.length + file.data.length;
    centralSize += 46 + name.length;
  }
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  return new Blob([...local, ...central, end.buffer], {
    type: "application/zip",
  });
}
export function saveGalleryBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
