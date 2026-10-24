"""
Identify which cell is the title card (text-heavy, mostly black background)
vs the 7 monster cards (more colorful, more varied).
"""
from PIL import Image
import numpy as np
import os

cells_info = [
    ('r0_c0', '/tmp/monster-cells/cell_r0_c0.png'),
    ('r0_c1', '/tmp/monster-cells/cell_r0_c1.png'),
    ('r0_c2', '/tmp/monster-cells/cell_r0_c2.png'),
    ('r0_c3', '/tmp/monster-cells/cell_r0_c3.png'),
    ('r1_c0', '/tmp/monster-cells/cell_r1_c0.png'),
    ('r1_c1', '/tmp/monster-cells/cell_r1_c1.png'),
    ('r1_c2', '/tmp/monster-cells/cell_r1_c2.png'),
    ('r1_c3', '/tmp/monster-cells/cell_r1_c3.png'),
]

print('Cell analysis (looking for title card vs monster cards):')
print(f'{"Cell":8} {"%black":>10} {"%bright":>10} {"hue_mode":>10} {"top_color_pct":>15}')
for name, path in cells_info:
    img = Image.open(path).convert('RGB')
    arr = np.array(img)
    # % of near-black pixels (text card would have high %)
    black_pct = (arr.mean(axis=2) < 30).mean() * 100
    # % of bright pixels (monster art has bright highlights)
    bright_pct = (arr.mean(axis=2) > 180).mean() * 100
    # Hue analysis
    hsv = img.convert('HSV')
    hsv_arr = np.array(hsv)
    # Get hue of saturated pixels only
    sat = hsv_arr[:, :, 1]
    val = hsv_arr[:, :, 2]
    mask = (sat > 50) & (val > 50)
    if mask.sum() > 100:
        hues = hsv_arr[:, :, 0][mask]
        hue_mode = np.bincount(hues).argmax()
    else:
        hue_mode = -1
    # Top color percentage (title cards often have a dominant flat color)
    # Quantize colors
    quantized = (arr // 32 * 32).reshape(-1, 3)
    colors, counts = np.unique(quantized, axis=0, return_counts=True)
    top_color_pct = counts.max() / len(quantized) * 100
    print(f'{name:8} {black_pct:>10.1f} {bright_pct:>10.1f} {hue_mode:>10} {top_color_pct:>15.1f}')
