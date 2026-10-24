"""
Crop 36 shield images from 3 source images (12 each, 3x4 grid).

Image 1 (wood shields, 2752x1536 → analyze at 1200x669):
  v-seps at 300, 600, 900 (analysis); scale to original: 688, 1376, 2064
  h-seps at 240, 441 (analysis); scale to original: 549, 1011
  
Image 2 (stone shields, 1028x582):
  v-seps at 263, 516, 770; h-seps at 210, 389

Image 3 (iron shields, 1070x577):
  v-seps at 285, 535, 785; h-seps at 220, 388

Approach for each cell:
1. Crop with small inset to skip separator borders
2. Remove bottom ~18% (text label band)
3. Auto-crop light/white border around the shield illustration
"""
from PIL import Image
import numpy as np
import os

OUT_DIR = '/home/z/my-project/public/equipment'
os.makedirs(OUT_DIR, exist_ok=True)


def autocrop_light(cell, threshold=235):
    """Auto-crop near-white/light border."""
    arr = np.array(cell.convert('RGB'))
    brightness = arr.mean(axis=2)
    mask = brightness < threshold
    if not mask.any():
        return cell
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    pad = 4
    rmin = max(0, rmin - pad)
    cmin = max(0, cmin - pad)
    rmax = min(arr.shape[0], rmax + pad)
    cmax = min(arr.shape[1], cmax + pad)
    return cell.crop((cmin, rmin, cmax, rmax))


def process_image(src_path, x_seps, y_seps, fname_prefix, name_prefix, label_pct=0.18):
    """Crop 12 cells from a 3x4 grid image."""
    img = Image.open(src_path)
    W, H = img.size
    x_edges = [0] + x_seps + [W]
    y_edges = [0] + y_seps + [H]
    inset = 4  # skip separator borders
    
    for r in range(3):
        for c in range(4):
            idx = r * 4 + c + 1  # 1-indexed
            x1 = x_edges[c] + inset
            x2 = x_edges[c + 1] - inset
            y1 = y_edges[r] + inset
            y2 = y_edges[r + 1] - inset
            cell = img.crop((x1, y1, x2, y2))
            
            # Remove bottom label band
            cw, ch = cell.size
            label_h = int(ch * label_pct)
            cell_no_label = cell.crop((0, 0, cw, ch - label_h))
            
            # Auto-crop light border
            cropped = autocrop_light(cell_no_label, threshold=235)
            
            fname = f'{fname_prefix}-{idx:02d}.png'
            out_path = os.path.join(OUT_DIR, fname)
            cropped.save(out_path)
            print(f'{fname} ({name_prefix} {idx:02d}): cell={cell.size} → cropped={cropped.size}')


# Image 1: Wood Shields — separators detected at full resolution 2752x1536
print('=== Wood Shields (PERISAI KAYU) — original 2752x1536 ===')
# v-seps at 693, 1376, 2062 (multiple dark bands, use middle)
# h-seps at 545, 1020 (multiple dark bands, use middle of each cluster)
process_image(
    '/home/z/my-project/upload/pasted_image_1792293913743.jpg',
    x_seps=[693, 1376, 2062],
    y_seps=[545, 1020],
    fname_prefix='perisai-kayu',
    name_prefix='Perisai Kayu',
    label_pct=0.18,
)

# Image 2: Stone Shields — 1028x582
print('\n=== Stone Shields (PERISAI BATU) — 1028x582 ===')
# v-seps at 263, 516, 770; h-seps at 210, 391
process_image(
    '/home/z/my-project/upload/pasted_image_1792293931141.jpg',
    x_seps=[263, 516, 770],
    y_seps=[210, 391],
    fname_prefix='perisai-batu',
    name_prefix='Perisai Batu',
    label_pct=0.18,
)

# Image 3: Iron Shields — 1070x577
print('\n=== Iron Shields — 1070x577 ===')
# v-seps at 285, 535, 785 (clear single dark bands)
# h-seps at 220, 388
process_image(
    '/home/z/my-project/upload/pasted_image_1792293942006.jpg',
    x_seps=[285, 535, 785],
    y_seps=[220, 388],
    fname_prefix='perisai-besi',
    name_prefix='Iron Shield',
    label_pct=0.18,
)

print('\nDone. 36 shield files saved to', OUT_DIR)
