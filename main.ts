import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = dirname(fileURLToPath(import.meta.url));
const destinationDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const imageBytes = readFileSync(join(projectDir, 'entry.png'));
const destination = join(destinationDir, 'entry.png');

mkdirSync(destinationDir, { recursive: true });
writeFileSync(destination, imageBytes);
