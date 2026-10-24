"""
Crop 12 'monster sedang' images from the 3x4 grid (907x510).

Grid layout (from brightness analysis):
- Vertical separators at x≈232, 455, 697 (with right edge at 907)
- Horizontal separators at y≈174, 341 (with bottom edge at 510)
- Top/left borders at y=0-10, x=0-11

Cells:
  r0 (y 11-173): c0 (x 12-230), c1 (235-453), c2 (458-677), c3 (698-900)
  r1 (y 177-340): same columns
  r2 (y 344-510): same columns

Approach:
1. Crop each cell with small inset to skip separator borders
2. Remove bottom ~18% (text label band)
3. Auto-crop white/light border around illustration
"""
from PIL import Image
import numpy as np
import os

SRC = '/home/z/my-project/upload/pasted_image_1792292965836.jpg'
OUT_DIR = '/home/z/my-project/public/monsters'
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SRC)
W, H = img.size  # 907 x 510

x_edges = [0, 232, 455, 697, 907]
y_edges = [0, 174, 341, 510]
inset = 4  # skip separator borders

# (row, col, output_filename, monster_name, level)
MONSTERS = [
    (0, 0, 'macan-kumbah.png', 'Macan Kumbah', 18),
    (0, 1, 'serigala-putih.png', 'Serigala Salju', 15),
    (0, 2, 'kepiting-raksasa.png', 'Kepiting Raksasa', 22),
    (0, 3, 'lebah-beracun-besar.png', 'Lebah Beracun Besar', 20),
    (1, 0, 'banteng.png', 'Banteng Liar', 25),
    (1, 1, 'rusa-tanduk-12.png', 'Rusa Tanduk 12', 17),
    (1, 2, 'gorila.png', 'Gorila pemarah', 28),
    (1, 3, 'anjing-herder.png', 'Anjing Herder', 19),
    (2, 0, 'anjing-shepherd.png', 'Anjing Shepherd Petir', 24),
    (2, 1, 'buaya-putih.png', 'Buaya Putih', 27),
    (2, 2, 'gajah-putih.png', 'Gajah Putih', 30),
    (2, 3, 'gagak-mata-merah.png', 'Gagak Mata Merah', 16),
]


def autocrop_white(cell, threshold=235):
    """Auto-crop near-white border."""
    arr = np.array(cell.convert('RGB'))
    brightness = arr.mean(axis=2)
    mask = brightness < threshold
    if not mask.any():
        return cell
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    pad = 3
    rmin = max(0, rmin - pad)
    cmin = max(0, cmin - pad)
    rmax = min(arr.shape[0], rmax + pad)
    cmax = min(arr.shape[1], cmax + pad)
    return cell.crop((cmin, rmin, cmax, rmax))


for r, c, fname, name, level in MONSTERS:
    x1 = x_edges[c] + inset
    x2 = x_edges[c + 1] - inset
    y1 = y_edges[r] + inset
    y2 = y_edges[r + 1] - inset
    cell = img.crop((x1, y1, x2, y2))

    # Remove bottom 18% (text label band)
    cw, ch = cell.size
    label_h = int(ch * 0.18)
    cell_no_label = cell.crop((0, 0, cw, ch - label_h))

    cropped = autocrop_white(cell_no_label, threshold=235)
    out_path = os.path.join(OUT_DIR, fname)
    cropped.save(out_path)
    print(f'{fname} ({name}, Lv.{level}): cell={cell.size} → cropped={cropped.size}')

print('\nDone. Files saved to', OUT_DIR)
