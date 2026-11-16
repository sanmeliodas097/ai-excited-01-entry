// Copy the bundled image to the competition output and verify the exact bytes.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PNG_MAGIC = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const IMAGE_NAME = 'entry.png';
const root = dirname(fileURLToPath(import.meta.url));
let input: Buffer;
try { input = readFileSync(join(root, IMAGE_NAME)); }
catch { console.error('missing input file'); process.exit(2); }
if (input.subarray(0, PNG_MAGIC.length).compare(PNG_MAGIC) !== 0) {
  console.error('bad PNG magic'); process.exit(3);
}
const configuredOutput = process.env.MAKEFUN_OUTPUT_DIR?.trim();
const outputDir = configuredOutput || '/output';
try { mkdirSync(outputDir, { recursive: true }); }
catch { console.error('output directory creation failure'); process.exit(4); }
const output = join(outputDir, IMAGE_NAME);
try { writeFileSync(output, input); }
catch { console.error('write failure'); process.exit(5); }
let written: Buffer;
try { written = readFileSync(output); }
catch { console.error('verification mismatch: output could not be read'); process.exit(6); }
if (!written.equals(input)) {
  console.error(`verification mismatch: input ${input.length} bytes, output ${written.length} bytes`);
  process.exit(6);
}
console.log(`image verified: ${input.length} bytes in, ${written.length} bytes out`);
