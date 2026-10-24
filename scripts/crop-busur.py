"""
Crop 24 bow equipment images from 2 source images (12 each, 3x4 grid).

Image 1 (wood bows, 890x502): separators at x=224,447,670; y=167,333
Image 2 (iron bows, 892x507): separators at x=222,445,668; y=172,339

Each cell contains a bow + arrows + label band at bottom.
Approach:
1. Crop each cell with small inset to skip separator borders
2. Remove bottom ~15% (text label band) — keep most of the bow art
3. Auto-crop near-white/light border around the bow illustration
"""
from PIL import Image
import numpy as np
import os

SRC_WOOD = '/home/z/my-project/upload/pasted_image_1792293578655.jpg'
SRC_IRON = '/home/z/my-project/upload/pasted_image_1792293611935.jpg'
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


def process_image(src_path, x_seps, y_seps, name_prefix, fname_prefix):
    """Crop 12 cells from a 3x4 grid image."""
    img = Image.open(src_path)
    W, H = img.size
    x_edges = [0] + x_seps + [W]
    y_edges = [0] + y_seps + [H]
    inset = 3  # skip separator borders
    
    results = []
    for r in range(3):
        for c in range(4):
            idx = r * 4 + c + 1  # 1-indexed
            x1 = x_edges[c] + inset
            x2 = x_edges[c + 1] - inset
            y1 = y_edges[r] + inset
            y2 = y_edges[r + 1] - inset
            cell = img.crop((x1, y1, x2, y2))
            
            # Remove bottom 14% (text label band)
            cw, ch = cell.size
            label_h = int(ch * 0.14)
            cell_no_label = cell.crop((0, 0, cw, ch - label_h))
            
            # Auto-crop light border
            cropped = autocrop_light(cell_no_label, threshold=235)
            
            fname = f'{fname_prefix}-{idx:02d}.png'
            out_path = os.path.join(OUT_DIR, fname)
            cropped.save(out_path)
            results.append((idx, name_prefix, fname, cropped.size))
            print(f'{fname} ({name_prefix} {idx:02d}): cell={cell.size} → cropped={cropped.size}')
    return results


print('=== Wood Bows (BUSUR KAYU) ===')
wood = process_image(SRC_WOOD, [224, 447, 670], [167, 333], 'Busur Kayu', 'busur-kayu')

print('\n=== Iron Bows (BUSUR BESI) ===')
iron = process_image(SRC_IRON, [222, 445, 668], [172, 339], 'Busur Besi', 'busur-besi')

print(f'\nDone. {len(wood) + len(iron)} files saved to {OUT_DIR}')
