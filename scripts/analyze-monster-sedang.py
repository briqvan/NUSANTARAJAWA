"""Analyze the 3x4 grid image (907x510) for monster sedang."""
from PIL import Image
import numpy as np

img = Image.open('/home/z/my-project/upload/pasted_image_1792292965836.jpg')
arr = np.array(img)
H, W = arr.shape[:2]
print(f'Image: {W}x{H}')

# Find horizontal grid lines - looking for darker rows
row_brightness = arr.mean(axis=(1, 2))
print('\n--- Horizontal darker regions (brightness < 50) ---')
in_dark = False; start = 0
for y in range(H):
    b = row_brightness[y]
    if b < 50 and not in_dark: in_dark = True; start = y
    elif b >= 50 and in_dark:
        in_dark = False
        if y - start > 2: print(f'  y={start}-{y} (h={y-start}, mid_b={row_brightness[(start+y)//2]:.1f})')

# Find vertical grid lines
col_brightness = arr.mean(axis=(0, 2))
print('\n--- Vertical darker regions (brightness < 50) ---')
in_dark = False; start = 0
for x in range(W):
    b = col_brightness[x]
    if b < 50 and not in_dark: in_dark = True; start = x
    elif b >= 50 and in_dark:
        in_dark = False
        if x - start > 2: print(f'  x={start}-{x} (w={x-start}, mid_b={col_brightness[(start+x)//2]:.1f})')

print('\nColumn brightness profile (every 15px):')
for x in range(0, W, 15):
    print(f'  x={x}: {col_brightness[x]:.1f}')
