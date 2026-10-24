"""Crop 3 kebun sub-items from 1x3 grid (1024x411)."""
from PIL import Image
import numpy as np
import os

SRC = '/home/z/my-project/upload/pasted_image_1792387687119.jpg'
OUT_DIR = '/home/z/my-project/public/facilities/kebun'
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SRC)
W, H = img.size

x_edges = [0, 312, 680, 1024]
inset = 4

KEBUNS = [
    ('biasa.png', 'Kebun Biasa'),
    ('bagus.png', 'Kebun Bagus'),
    ('mewah.png', 'Kebun Mewah'),
]


def autocrop_dark(cell, threshold=60):
    arr = np.array(cell.convert('RGB'))
    brightness = arr.mean(axis=2)
    mask = brightness > threshold
    if not mask.any():
        return cell
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    pad = 3
    rmin = max(0, rmin - pad); cmin = max(0, cmin - pad)
    rmax = min(arr.shape[0], rmax + pad); cmax = min(arr.shape[1], cmax + pad)
    return cell.crop((cmin, rmin, cmax, rmax))


for i, (fname, name) in enumerate(KEBUNS):
    x1 = x_edges[i] + inset
    x2 = x_edges[i + 1] - inset
    y1 = inset
    y2 = H - inset
    cell = img.crop((x1, y1, x2, y2))
    cw, ch = cell.size
    # Remove bottom 15% (text label band)
    label_h = int(ch * 0.15)
    cell_no_label = cell.crop((0, 0, cw, ch - label_h))
    cropped = autocrop_dark(cell_no_label, threshold=60)
    out_path = os.path.join(OUT_DIR, fname)
    cropped.save(out_path)
    print(f'{fname} ({name}): cell={cell.size} → cropped={cropped.size}')

print('\nDone.')
