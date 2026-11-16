[![ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/sanmeliodas097/ai-excited-01-entry/rank.svg)](https://make.fun/bounty/ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/sanmeliodas097/ai-excited-01-entry/reward.svg)](https://make.fun/bounty/ai-excited-01)

# Origami Phoenix — round 4

An origami crane erupts from a laptop and becomes a fire phoenix mid-flight.
The tighter cinematic framing puts crisp paper folds against a brilliant sweep
of flame, with flying keys and scraps carrying the shock outward. Warm ember
light, stronger colour and contrast, and sparse directional sparks make the
transformation read quickly even at thumbnail size.

## Rendering

`render.py` uses Pillow and numpy, entirely offline, to transform the original
image preserved in this repository's initial Git commit. It crops and resizes,
applies local warm light and peripheral shading, sharpens the folds, and adds
restrained ember streaks outside the central subject. It saves an optimized
lossless PNG; if needed it reduces channel precision to meet the byte cap.
An optional source image path can be supplied. Run from the repository root:

```sh
python3 render.py
```

The new `entry.png` is RGB, 1000 × 706 pixels, and 987,464 bytes (under 1 MiB).
The renderer verifies PNG integrity and dimensions and reports before/after
SHA-256 hashes, requiring a changed image.

## Program

`main.ts` runs on Node 24 using only the standard library and no network.
It checks PNG/JPEG magic bytes, reads dimensions, and rejects files over
1,048,576 bytes or 1024 × 1024 pixels. For PNG it walks every chunk, verifies
its CRC-32, and checks chunk boundaries, IHDR, consecutive IDAT, and final IEND.
It copies the bundled image to `MAKEFUN_OUTPUT_DIR` (default `/output`) and
reads it back for byte-for-byte verification. Diagnostics finish with bytes,
dimensions and verification status. Errors exit nonzero.

```sh
MAKEFUN_OUTPUT_DIR=/tmp/ai-out-r4 node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
