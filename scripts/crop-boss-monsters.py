#!/usr/bin/env python3
"""Crop 7 boss monster cards from the album image."""
import os
from PIL import Image

UPLOAD_DIR = "/home/z/my-project/upload"
OUTPUT_DIR = "/home/z/my-project/public/monsters"
os.makedirs(OUTPUT_DIR, exist_ok=True)

src = os.path.join(UPLOAD_DIR, "pasted_image_1792285688576.jpg")
if not os.path.exists(src):
    print(f"MISSING: {src}")
    exit(1)

img = Image.open(src)
w, h = img.size
print(f"Processing {os.path.basename(src)}: {w}x{h}")

# 7 cards in a 2-row layout: 4 top, 3 bottom + logo
# Top row: 4 cards
# Bottom row: 3 cards + logo
# Approximate: title takes ~10%, cards fill the rest

names = [
    "elang-raksasa",    # top-left
    "naga-merah",       # top-2
    "naga-air-biru",    # top-3
    "hiu-ganas",        # top-right
    "kalajengking-merah", # bottom-left
    "lipan-raksasa",    # bottom-2
    "kura-kura-raksasa", # bottom-3
]

# Layout: 4 columns x 2 rows (last cell is logo)
COLS = 4
ROWS = 2
title_h = int(h * 0.05)  # less title space
grid_h = h - title_h
cell_w = w // COLS
cell_h = grid_h // ROWS
pad = 6

for idx, name in enumerate(names):
    row = idx // COLS
    col = idx % COLS
    left = col * cell_w + pad
    upper = title_h + row * cell_h + pad
    right = (col + 1) * cell_w - pad
    lower = (row + 1) * cell_h + title_h - pad

    card = img.crop((left, upper, right, lower))
    target_w = 400
    target_h = int(card.size[1] * target_w / card.size[0])
    card = card.resize((target_w, target_h), Image.LANCZOS)
    out_path = os.path.join(OUTPUT_DIR, f"boss-{name}.png")
    card.save(out_path, "PNG")
    print(f"  Saved boss-{name}.png ({card.size[0]}x{card.size[1]})")

print("\n=== Done. Cropped 7 boss monster images. ===")
