// Offline image courier. Node 24, standard library only.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const PNG = Buffer.from([137,80,78,71,13,10,26,10]);
function fail(message: string, code = 10): never {
  console.error(`error: ${message}`); process.exit(code);
}
// CRC-32 over each chunk's type and payload (PNG/ISO 3309).
function crc32(b: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of b) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function validatePng(b: Buffer): number {
  let offset = 8, chunks = 0, sawData = false, endedData = false;
  while (offset < b.length) {
    if (offset + 12 > b.length) fail(`PNG truncated chunk header at byte ${offset}`, 12);
    const length = b.readUInt32BE(offset);
    const end = offset + 12 + length;
    if (end > b.length) fail(`PNG chunk at byte ${offset} exceeds file bounds`, 12);
    const type = b.toString('ascii', offset+4, offset+8);
    if (!/^[A-Za-z]{4}$/.test(type) || (b[offset+6] & 32)) fail(`Invalid PNG chunk type at ${offset}`, 12);
    const expected = b.readUInt32BE(end-4);
    const actual = crc32(b.subarray(offset+4,end-4));
    if (actual !== expected) fail(`PNG ${type} CRC mismatch at byte ${offset}: stored ${expected}, computed ${actual}`, 12);
    if (chunks === 0 && (type !== 'IHDR' || length !== 13)) fail('PNG must begin with a 13-byte IHDR', 12);
    if (chunks > 0 && type === 'IHDR') fail('Duplicate PNG IHDR', 12);
    if (type === 'IDAT') {
      if (endedData) fail('PNG IDAT chunks must be consecutive', 12);
      sawData = true;
    } else if (sawData) endedData = true;
    chunks++;
    if (type === 'IEND') {
      if (length !== 0 || !sawData || end !== b.length) fail('PNG has invalid IEND, missing IDAT, or trailing bytes', 12);
      return chunks;
    }
    offset = end;
  }
  return fail('PNG missing IEND', 12);
}
function dimensions(b: Buffer): [number, number] {
  if (b.subarray(0,8).equals(PNG)) {
    if (b.length < 33 || b.toString('ascii',12,16) !== 'IHDR') fail('PNG header missing');
    return [b.readUInt32BE(16), b.readUInt32BE(20)];
  }
  if (b[0] !== 255 || b[1] !== 216 || b[2] !== 255) fail('Expected PNG or JPEG magic bytes');
  let p = 2;
  while (p < b.length) {
    if (b[p++] !== 255) fail('Invalid JPEG marker');
    while (b[p] === 255) p++;
    const marker = b[p++];
    if (marker === 217 || marker === 218) break;
    if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
    if (p+2 > b.length) fail('Truncated JPEG segment');
    const n = b.readUInt16BE(p);
    if (n < 2 || p+n > b.length) fail('Invalid JPEG segment length');
    if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
      if (n < 8) fail('Truncated JPEG frame');
      return [b.readUInt16BE(p+5), b.readUInt16BE(p+3)];
    }
    p += n;
  }
  return fail('JPEG dimensions missing');
}
try {
const source = join(dirname(fileURLToPath(import.meta.url)), 'entry.png');
const b = readFileSync(source);
if (b.length > 1048576) fail(`Image exceeds 1048576 bytes: ${b.length}`);
const isPng = b.subarray(0,8).equals(PNG);
const chunkCount = isPng ? validatePng(b) : 0;
const [width,height] = dimensions(b);
console.log(`Validated bundled ${isPng ? 'PNG' : 'JPEG'}: ${source}${isPng ? `; ${chunkCount} chunk CRCs passed` : ''}`);
if (!width || !height || width > 1024 || height > 1024) fail(`Invalid dimensions ${width}x${height}`);
const outputDir = process.env.MAKEFUN_OUTPUT_DIR?.trim() || '/output';
mkdirSync(outputDir,{recursive:true});
const destination = join(outputDir,'entry.png');
writeFileSync(destination,b);
if (!readFileSync(destination).equals(b)) fail('Written copy differs from bundled image',11);
console.log(`Summary: ${b.length} bytes | ${width}x${height} | verification=PASS (byte-for-byte${isPng ? ", all PNG chunk CRCs" : ""}) | output=${destination}`);

} catch (error) {
  fail(`Image courier failed: ${error instanceof Error ? error.message : String(error)}`, 13);
}
