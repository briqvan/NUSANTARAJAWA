"""
Crop 6 material icons from 2x3 grid (887x501).

Image layout (from grid analysis):
- Vertical separators: x=295, 591 (center of dark bands)
- Horizontal separator: y=249 (center of dark band)
- Outer borders: x=0-29, x=621-887 wait that's not right
  Actually: x=0-29 left border, x=621-887 is the right cell area minus right border

Let me re-derive:
  Col 0: x=29 to 265 (between left border and first separator)
  Col 1: x=325 to 561 (between first and second separators)
  Col 2: x=621 to 857 (between second separator and right border, with right border at 857+)

  Row 0: y=10 to 223 (between top border and h-sep)
  Row 1: y=257 to 488 (between h-sep and bottom border)

Materials mapping:
  (0,0) = KAYU      (wood)
  (0,1) = BESI      (iron)
  (0,2) = KULIT     (leather)
  (1,0) = EMAS      (gold)         NEW
  (1,1) = BATU METEOR (meteor)     NEW
  (1,2) = PERMATA   (gem)

Approach:
1. Crop each cell with small inset to skip separator borders
2. Remove bottom ~15% (text label band)
3. Auto-crop dark border around the icon
"""
from PIL import Image
import numpy as np
import os

SRC = '/home/z/my-project/upload/pasted_image_1792294904527.jpg'
OUT_DIR = '/home/z/my-project/public/materials'
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SRC)
W, H = img.size  # 887 x 501

# Grid edges
x_edges = [0, 295, 591, 887]
y_edges = [0, 249, 501]
inset = 4  # skip separator borders

# (row, col, filename, name)
MATERIALS = [
    (0, 0, 'kayu.png', 'Kayu'),
    (0, 1, 'besi.png', 'Besi'),
    (0, 2, 'kulit.png', 'Kulit'),
    (1, 0, 'emas.png', 'Emas'),
    (1, 1, 'batu-meteor.png', 'Batu Meteor'),
    (1, 2, 'permata.png', 'Permata'),
]


def autocrop_dark(cell, threshold=80):
    """Auto-crop dark/near-black border around the icon.
    Materials are on dark background — find content (brighter pixels)."""
    arr = np.array(cell.convert('RGB'))
    brightness = arr.mean(axis=2)
    # Material icons have bright pixels (gold, gems, etc.) — find bbox of brighter content
    mask = brightness > threshold
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


for r, c, fname, name in MATERIALS:
    x1 = x_edges[c] + inset
    x2 = x_edges[c + 1] - inset
    y1 = y_edges[r] + inset
    y2 = y_edges[r + 1] - inset
    cell = img.crop((x1, y1, x2, y2))
    
    # Remove bottom 15% (text label band)
    cw, ch = cell.size
    label_h = int(ch * 0.15)
    cell_no_label = cell.crop((0, 0, cw, ch - label_h))
    
    # Auto-crop dark border
    cropped = autocrop_dark(cell_no_label, threshold=80)
    
    out_path = os.path.join(OUT_DIR, fname)
    cropped.save(out_path)
    print(f'{fname} ({name}): cell={cell.size} → cropped={cropped.size}')

print('\nDone. 6 material files saved to', OUT_DIR)
