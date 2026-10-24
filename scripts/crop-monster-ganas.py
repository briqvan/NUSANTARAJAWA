"""
Crop 7 monsters from MONSTER GANAS grid image.
Skip r1c3 (title card). Approach:
1. Take each cell (with inset to skip outer white border)
2. Remove bottom 20% (text label band) - fixed crop
3. Auto-crop white/light border around the remaining illustration
4. Save with descriptive filename
"""
from PIL import Image
import numpy as np
import os

SRC = '/home/z/my-project/upload/pasted_image_1792291293695.jpg'
OUT_DIR = '/home/z/my-project/public/monsters'
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SRC)
W, H = img.size

# Cell grid (with inset to skip outer borders)
x_edges = [0, 225, 448, 672, 887]
y_edges = [0, 250, 501]
inset = 6

MONSTER_MAP = [
    (0, 0, 'tengkorak.png'),
    (0, 1, 'buto-ijo.png'),
    (0, 2, 'siluman-kerbau.png'),
    (0, 3, 'monster-kepala-2.png'),
    (1, 0, 'pendekar-santet.png'),
    (1, 1, 'naga-emas.png'),
    (1, 2, 'kobra-kepala-2.png'),
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
    # Small padding
    pad = 3
    rmin = max(0, rmin - pad)
    cmin = max(0, cmin - pad)
    rmax = min(arr.shape[0], rmax + pad)
    cmax = min(arr.shape[1], cmax + pad)
    return cell.crop((cmin, rmin, cmax, rmax))


# Process each monster
for r, c, fname in MONSTER_MAP:
    x1 = x_edges[c] + inset
    x2 = x_edges[c + 1] - inset
    y1 = y_edges[r] + inset
    y2 = y_edges[r + 1] - inset
    cell = img.crop((x1, y1, x2, y2))

    # Step 1: Remove bottom 20% (text label band) - fixed crop
    cw, ch = cell.size
    label_h = int(ch * 0.20)
    cell_no_label = cell.crop((0, 0, cw, ch - label_h))

    # Step 2: Auto-crop white border
    cropped = autocrop_white(cell_no_label, threshold=235)

    out_path = os.path.join(OUT_DIR, fname)
    cropped.save(out_path)
    print(f'{fname}: cell={cell.size} → no_label={cell_no_label.size} → cropped={cropped.size}')

print('\nDone. Files saved to', OUT_DIR)
