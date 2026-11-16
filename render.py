"""Render the round 4 image from the original Git-tracked PNG, offline.
Usage: python3 render.py [source.png]. Requires Pillow and numpy.
PNG is lossless; reduce channel precision only if optimized encoding exceeds cap.
"""
import hashlib
import io
import subprocess
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

# Pin the original blob so repeated runs never compound the treatment.
ORIGINAL_BLOB = subprocess.check_output(
    ['git', 'rev-list', '--max-parents=0', 'HEAD'], text=True).strip()
source = (Path(sys.argv[1]).read_bytes() if len(sys.argv) > 1 else
          subprocess.check_output(['git', 'show', ORIGINAL_BLOB + ':entry.png']))
before = hashlib.sha256(Path('entry.png').read_bytes()).hexdigest()
im = Image.open(io.BytesIO(source)).convert('RGB')
# Preserve the topmost flames while bringing the crane closer to the viewer.
im = im.crop((115, 0, 1000, 625)).resize((1000, 706), Image.Resampling.LANCZOS)
im = ImageEnhance.Color(im).enhance(1.19)
im = ImageEnhance.Contrast(im).enhance(1.12)
a = np.asarray(im).astype(np.float32) / 255
h, w = a.shape[:2]
y, x = np.mgrid[:h, :w]
# Local warm light, concentrated at the paper-to-fire transformation.
glow = np.exp(-(((x-w*.58)/(w*.28))**2 + ((y-h*.53)/(h*.36))**2)*2)
a += glow[..., None] * np.array([.045, .016, .002])
# Quiet the periphery without crushing the focal subject.
r = ((x-w*.56)/(w*.73))**2 + ((y-h*.43)/(h*.85))**2
a *= (1 - .16*np.clip(r, 0, 1))[..., None]
im = Image.fromarray(np.uint8(np.clip(a,0,1)*255))
im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=115, threshold=4))
layer = Image.new('RGBA', im.size)
d = ImageDraw.Draw(layer)
rng = np.random.default_rng(401)
# Sparse peripheral sparks: keep every mark away from the crane's body.
for i in range(43):
    px, py = rng.uniform(25,w-25), rng.uniform(30,h-35)
    if 240 < px < 820 and 110 < py < 485:
        continue
    dx, dy = px-w*.55, py-h*.65
    length = rng.uniform(3,13)
    norm = max(1, np.hypot(dx,dy))
    end = (px+dx/norm*length, py+dy/norm*length)
    d.line([(px,py),end], fill=(255,153,48,int(rng.integers(70,155))), width=1)
    if i%3 == 0:
        d.ellipse((px-1,py-1,px+1,py+1),fill=(255,220,137,180))
soft = layer.filter(ImageFilter.GaussianBlur(3))
im = Image.alpha_composite(im.convert('RGBA'),soft)
im = Image.alpha_composite(im,layer).convert('RGB')
for bits in [8,7,6,5]:
    candidate = im if bits == 8 else Image.fromarray((np.asarray(im) >> (8-bits)) << (8-bits))
    out = io.BytesIO()
    candidate.save(out,format='PNG',optimize=True,compress_level=9)
    if len(out.getvalue()) <= 1048576:
        Path('entry.png').write_bytes(out.getvalue())
        break
else:
    raise RuntimeError('Unable to meet byte limit')
with Image.open('entry.png') as check:
    check.verify()
with Image.open('entry.png') as check:
    assert max(check.size) <= 1024
    print('PNG',check.size,check.mode,'bytes',Path('entry.png').stat().st_size)
after = hashlib.sha256(Path('entry.png').read_bytes()).hexdigest()
assert before != after, 'Render must differ from input entry'
print('before',before,'\nafter ',after)
