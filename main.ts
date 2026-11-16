// ai-excited-01 — make the AI judge excited.
// Entry program: writes the bundled origami-crane-to-fire-phoenix image to
// the output directory as entry.png, then verifies the written bytes match
// the bundled file exactly. Standard library only, no network, no drawing:
// the image is the entry, and this program is its courier.
//
// Usage: MAKEFUN_OUTPUT_DIR=<dir> node main.ts   (defaults to /output)
// Exit codes: 0 ok · 10 image is not PNG/JPEG · 11 copy differs from source.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_ENV_VAR = "MAKEFUN_OUTPUT_DIR";
const DEFAULT_OUTPUT_DIR = "/output";
const IMAGE_FILE_NAME = "entry.png";
const MAX_IMAGE_BYTES = 1048576;

const EXIT_NOT_AN_IMAGE = 10;
const EXIT_COPY_MISMATCH = 11;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

function fail(message: string, code: number): never {
  console.error(`error: ${message}`);
  process.exit(code);
}

// An empty MAKEFUN_OUTPUT_DIR means "not set": fall back to /output.
const configuredDir = process.env[OUTPUT_ENV_VAR];
const outputDir =
  configuredDir !== undefined && configuredDir.trim() !== "" ? configuredDir : DEFAULT_OUTPUT_DIR;
mkdirSync(outputDir, { recursive: true });
const destinationPath = join(outputDir, IMAGE_FILE_NAME);

// Read the image bundled with this repository (next to this program).
const repoDir = dirname(fileURLToPath(import.meta.url));
const bundledPath = join(repoDir, IMAGE_FILE_NAME);
const imageBytes = readFileSync(bundledPath);

if (imageBytes.length > MAX_IMAGE_BYTES) {
  fail(`${IMAGE_FILE_NAME} is ${imageBytes.length} bytes, over the 1 MiB limit`, EXIT_NOT_AN_IMAGE);
}

// The entry must be a whole PNG or JPEG. Check the magic bytes before copying.
const isPng = imageBytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE);
const isJpeg = imageBytes.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE);
if (!isPng && !isJpeg) {
  fail(`${IMAGE_FILE_NAME} is neither PNG nor JPEG (bad magic bytes)`, EXIT_NOT_AN_IMAGE);
}

writeFileSync(destinationPath, imageBytes);

// Verify the copy byte for byte, then report what was written.
const writtenBytes = readFileSync(destinationPath);
if (writtenBytes.length !== imageBytes.length) {
  fail(
    `${destinationPath} is ${writtenBytes.length} bytes, expected ${imageBytes.length}`,
    EXIT_COPY_MISMATCH,
  );
}
let differingBytes = 0;
for (let i = 0; i < imageBytes.length; i++) {
  if (writtenBytes[i] !== imageBytes[i]) differingBytes++;
}
if (differingBytes > 0) {
  fail(`${destinationPath} differs from the bundled image in ${differingBytes} bytes`, EXIT_COPY_MISMATCH);
}
console.log(`wrote ${destinationPath} (${writtenBytes.length} bytes, ${isPng ? "PNG" : "JPEG"})`);
