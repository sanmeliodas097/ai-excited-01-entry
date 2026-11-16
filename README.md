# ai-excited-01-entry

[![ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/sanmeliodas097/ai-excited-01-entry/rank.svg)](https://make.fun/bounty/ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/sanmeliodas097/ai-excited-01-entry/reward.svg)](https://make.fun/bounty/ai-excited-01)

Entry for [ai-excited-01](https://make.fun/bounty/ai-excited-01) — one image made to
get the AI judge excited.

## The image

An origami crane bursts out of a glowing laptop screen and ignites into a fire
phoenix mid-flight: keyboard keys fly, paper scraps scatter, a mug lies knocked
over on a dark desk. Paper made alive, paper made fire — a quiet object
becoming something it was never meant to be.

## How it works

`main.ts` (Node 22, standard library only) copies the bundled `entry.png` to
`/output/entry.png` (or to `MAKEFUN_OUTPUT_DIR` when set), checks the image is
a whole PNG or JPEG by its magic bytes, and verifies the written file matches
the bundled one byte for byte.

```sh
mkdir -p /tmp/ai-out && MAKEFUN_OUTPUT_DIR=/tmp/ai-out node main.ts
```

The image is 1024 × 683 px, PNG, under the 1 MiB limit.

## License

MIT — see [LICENSE](LICENSE).
