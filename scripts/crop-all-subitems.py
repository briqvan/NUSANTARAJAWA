"""Re-crop all 4 sub-item sets that were lost: dapur (6), kasur (6), gym (4), kamar mandi (6)."""
from PIL import Image
import numpy as np
import os

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

def crop_grid(src, x_seps, y_seps, items, out_dir, label_pct=0.15, threshold=60, inset=4):
    os.makedirs(out_dir, exist_ok=True)
    img = Image.open(src)
    W, H = img.size
    x_edges = [0] + x_seps + [W]
    y_edges = [0] + y_seps + [H]
    for r, c, fname, name in items:
        x1 = x_edges[c] + inset; x2 = x_edges[c + 1] - inset
        y1 = y_edges[r] + inset; y2 = y_edges[r + 1] - inset
        cell = img.crop((x1, y1, x2, y2))
        cw, ch = cell.size
        lh = int(ch * label_pct)
        cell_nl = cell.crop((0, 0, cw, ch - lh))
        cropped = autocrop_dark(cell_nl, threshold)
        cropped.save(os.path.join(out_dir, fname))
        print(f'  {fname} ({name}): {cell.size} → {cropped.size}')

# 1. Dapur: 3x2 grid (1024x572), v-seps at 344, 679; h-sep at 287
print('=== Dapur (6 items) ===')
crop_grid('upload/pasted_image_1792323093888.jpg', [344, 679], [287], [
    (0, 0, 'kain-lusuh.png', 'Dapur Kain Lusuh'),
    (0, 1, 'kayu.png', 'Dapur Kayu'),
    (0, 2, 'seng.png', 'Dapur Seng'),
    (1, 0, 'batako.png', 'Dapur Batako'),
    (1, 1, 'plester.png', 'Dapur Plester'),
    (1, 2, 'mewah.png', 'Dapur Mewah'),
], 'public/facilities/dapur')

# 2. Kasur: 3x2 grid (892x508), v-seps at 300, 590; h-sep at 253
print('\n=== Kasur (6 items) ===')
crop_grid('upload/pasted_image_1792327438349.jpg', [300, 590], [253], [
    (0, 0, 'kain-lusuh.png', 'Kasur Kain Lusuh'),
    (0, 1, 'kayu.png', 'Kasur Kayu'),
    (0, 2, 'kapuk.png', 'Kasur Kapuk'),
    (1, 0, 'busa.png', 'Kasur Busa'),
    (1, 1, 'kulit-singa.png', 'Kasur Kulit Singa'),
    (1, 2, 'mewah.png', 'Kasur Mewah'),
], 'public/facilities/kasur')

# 3. Gym: 2x2 grid (927x527), v-sep at 460; h-sep at 250
print('\n=== Gym (4 items) ===')
crop_grid('upload/pasted_image_1792328553321.jpg', [460], [250], [
    (0, 0, 'kayu.png', 'Set Alat Gym Kayu'),
    (0, 1, 'batu.png', 'Set Alat Gym Batu'),
    (1, 0, 'besi.png', 'Set Alat Gym Besi'),
    (1, 1, 'mewah.png', 'Set Alat Gym Mewah'),
], 'public/facilities/gym')

# 4. Kamar Mandi: 3x2 grid (873x487), v-seps at 293, 584; h-sep at 243
print('\n=== Kamar Mandi (6 items) ===')
crop_grid('upload/pasted_image_1792328566797.jpg', [293, 584], [243], [
    (0, 0, 'kain-lusuh.png', 'Kamar Mandi Kain Lusuh'),
    (0, 1, 'kayu.png', 'Kamar Mandi Kayu'),
    (0, 2, 'seng.png', 'Kamar Mandi Seng'),
    (1, 0, 'semi-permanen.png', 'Kamar Mandi Semi Permanen'),
    (1, 1, 'batako.png', 'Kamar Mandi Batako'),
    (1, 2, 'mewah.png', 'Kamar Mandi Mewah'),
], 'public/facilities/kamar-mandi')

print('\nDone! All 22 images cropped.')
