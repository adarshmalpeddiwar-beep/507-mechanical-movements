import json, sys
from PIL import Image, ImageDraw, ImageFont
rows = json.load(open(sys.argv[1]))
W = 420
imgs = []
for r in rows:
    ims = [Image.open(f) for f in r['files']]
    ims = [im.resize((W, int(im.height * W / im.width))) for im in ims]
    imgs.append((r, ims))
H = max([max([im.height for im in ims] or [60]) for _, ims in imgs] or [60])
cols = max([len(ims) for _, ims in imgs] or [1])
sheet = Image.new('RGB', (110 + cols * W, H * len(imgs)), 'white')
d = ImageDraw.Draw(sheet)
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
except Exception:
    F = None
for i, (r, ims) in enumerate(imgs):
    d.text((8, i * H + 8), str(r['n']), fill='black', font=F)
    for j, im in enumerate(ims):
        sheet.paste(im, (110 + j * W, i * H))
    d.line([(0, i * H), (sheet.width, i * H)], fill='#999')
sheet.save(sys.argv[2])
