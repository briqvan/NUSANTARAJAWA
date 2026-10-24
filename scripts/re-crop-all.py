#!/usr/bin/env python3
"""Re-crop ALL monster and equipment images from upload folder."""
import os
from PIL import Image

UPLOAD_DIR = "/home/z/my-project/upload"
OUTPUT_MONSTERS = "/home/z/my-project/public/monsters"
OUTPUT_EQUIPMENT = "/home/z/my-project/public/equipment"
os.makedirs(OUTPUT_MONSTERS, exist_ok=True)
os.makedirs(OUTPUT_EQUIPMENT, exist_ok=True)

ROWS = 3
COLS = 4

# All album definitions: (source_file, output_dir, [names])
albums = [
    # Monsters
    ("pasted_image_1792190967008.jpg", OUTPUT_MONSTERS, [
        "ulat", "katak-beracun", "ular-cobra", "sarang-lebah",
        "anak-beruang", "kucing-gila", "kambing", "lintah",
        "belut-listrik", "tupai", "kumbang-tanduk", "kumbang-tahi",
    ]),
    ("pasted_image_1792191020431.jpg", OUTPUT_MONSTERS, [
        "kelinci", "ular", "ayam", "tikus",
        "babi", "anjing-galak", "landak", "trenggiling",
        "monyet", "lebah", "kelelawar", "kalajengking",
    ]),
    # Baju
    ("pasted_image_1792198996098.jpg", OUTPUT_EQUIPMENT, [
        "baju-latihan", "jubah-lusuh", "baju-petualang", "rompi-robek",
        "baju-berkerudung", "tunik-tampal", "jubah-sabit", "baju-raksasa",
        "baju-bergerigi", "baju-rimba", "baju-pendek", "baju-purba",
    ]),
    # Celana
    ("pasted_image_1792210718487.jpg", OUTPUT_EQUIPMENT, [
        "celana-latihan", "celana-lusuh", "celana-petualang", "celana-sobek",
        "celana-berkedudung", "celana-tampal", "celana-sabit", "celana-raksasa",
        "celana-bergerigi", "celana-rimba", "celana-pendek", "celana-purba",
    ]),
    # Claw (kayu)
    ("pasted_image_1792211588167.jpg", OUTPUT_EQUIPMENT, [
        "claw-latihan", "claw-berduri", "claw-bulat", "claw-penatap",
        "claw-spiral", "claw-ukir", "claw-sabit", "claw-raksasa",
        "claw-bergerigi", "claw-tanduk", "claw-pendek", "claw-purba",
    ]),
    # Gada (kayu)
    ("pasted_image_1792211595105.jpg", OUTPUT_EQUIPMENT, [
        "gada-latihan", "gada-berduri", "gada-bulat", "gada-penatap",
        "gada-spiral", "gada-flanged", "gada-sabit", "gada-raksasa",
        "gada-bergerigi", "gada-tanduk", "gada-pendek", "gada-purba",
    ]),
    # Fruits 1
    ("pasted_image_1792212505579.jpg", OUTPUT_EQUIPMENT, [
        "fruit-apel", "fruit-mangga", "fruit-jeruk", "fruit-semangka",
        "fruit-nanas", "fruit-pisang", "fruit-salak", "fruit-duku",
        "fruit-rambutan", "fruit-anggur", "fruit-pepaya", "fruit-melon",
    ]),
    # Fruits 2
    ("pasted_image_1792212521743.jpg", OUTPUT_EQUIPMENT, [
        "fruit-markisa", "fruit-buah-naga", "fruit-kelengkeng", "fruit-matoa",
        "fruit-apel-hijau", "fruit-tomat", "fruit-wortel", "fruit-pir",
        "fruit-kernetu", "fruit-alpukat", "fruit-manggis", "fruit-terong",
    ]),
    # Kalung
    ("pasted_image_1792219043136.png", OUTPUT_EQUIPMENT, [
        "kalung-latihan", "kalung-berduri", "kalung-bulat", "kalung-penatap",
        "kalung-spiral", "kalung-ukir", "kalung-sabit", "kalung-raksasa",
        "kalung-bergerigi", "kalung-tanduk", "kalung-pendek", "kalung-purba",
    ]),
    # Cincin
    ("pasted_image_1792219257115.jpg", OUTPUT_EQUIPMENT, [
        "cincin-latihan", "cincin-berduri", "cincin-bulat", "cincin-penatap",
        "cincin-spiral", "cincin-ukir", "cincin-sabit", "cincin-raksasa",
        "cincin-bergerigi", "cincin-tanduk", "cincin-pendek", "cincin-purba",
    ]),
    # Topi
    ("pasted_image_1792219275071.jpg", OUTPUT_EQUIPMENT, [
        "topi-latihan", "topi-lusuh", "topi-petualang", "topi-tampal",
        "topi-berkerudung", "topi-sabit", "topi-raksasa", "topi-bergerigi",
        "topi-tanduk", "topi-rimba", "topi-pendek", "topi-purba",
    ]),
    # Kapak (kayu)
    ("pasted_image_1792219942229.jpg", OUTPUT_EQUIPMENT, [
        "kapak-perintis", "kapak-ganda", "kapak-raksasa", "kapak-lantak",
        "kapak-paruh", "kapak-ukir", "kapak-sabit", "kapak-daun",
        "kapak-bergerigi", "kapak-tanduk", "kapak-ringan", "kapak-purba",
    ]),
    # Knuckle (kayu)
    ("pasted_image_1792219971641.jpg", OUTPUT_EQUIPMENT, [
        "knuckle-latihan", "knuckle-berduri", "knuckle-bulat", "knuckle-penatap",
        "knuckle-spiral", "knuckle-ukir", "knuckle-sabit", "knuckle-raksasa",
        "knuckle-bergerigi", "knuckle-tanduk", "knuckle-pendek", "knuckle-purba",
    ]),
    # Claw Batu
    ("pasted_image_1792225560647.jpg", OUTPUT_EQUIPMENT, [
        "claw-batu-latihan", "claw-batu-berduri", "claw-batu-bulat", "claw-batu-penatap",
        "claw-batu-spiral", "claw-batu-ukir", "claw-batu-sabit", "claw-batu-raksasa",
        "claw-batu-bergerigi", "claw-batu-tanduk", "claw-batu-pendek", "claw-batu-purba",
    ]),
    # Gada Batu
    ("pasted_image_1792225569195.jpg", OUTPUT_EQUIPMENT, [
        "gada-batu-latihan", "gada-batu-berduri", "gada-batu-bulat", "gada-batu-penatap",
        "gada-batu-spiral", "gada-batu-ukir", "gada-batu-sabit", "gada-batu-raksasa",
        "gada-batu-bergerigi", "gada-batu-tanduk", "gada-batu-pendek", "gada-batu-purba",
    ]),
    # Kapak Batu
    ("pasted_image_1792226321251.jpg", OUTPUT_EQUIPMENT, [
        "kapak-batu-latihan", "kapak-batu-berduri", "kapak-batu-bulat", "kapak-batu-penatap",
        "kapak-batu-spiral", "kapak-batu-ukir", "kapak-batu-sabit", "kapak-batu-raksasa",
        "kapak-batu-bergerigi", "kapak-batu-tanduk", "kapak-batu-pendek", "kapak-batu-purba",
    ]),
    # Knuckle Batu
    ("pasted_image_1792226329396.jpg", OUTPUT_EQUIPMENT, [
        "knuckle-batu-latihan", "knuckle-batu-berduri", "knuckle-batu-bulat", "knuckle-batu-penatap",
        "knuckle-batu-spiral", "knuckle-batu-ukir", "knuckle-batu-sabit", "knuckle-batu-raksasa",
        "knuckle-batu-bergerigi", "knuckle-batu-tanduk", "knuckle-batu-pendek", "knuckle-batu-purba",
    ]),
]

for src_name, out_dir, names in albums:
    src = os.path.join(UPLOAD_DIR, src_name)
    if not os.path.exists(src):
        print(f"MISSING: {src_name}")
        continue
    img = Image.open(src)
    w, h = img.size
    print(f"Processing {src_name}: {w}x{h} -> {out_dir}")

    title_h = int(h * 0.085)
    grid_h = h - title_h
    cell_w = w // COLS
    cell_h = grid_h // ROWS
    pad = 4

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
        out_path = os.path.join(out_dir, f"{name}.png")
        card.save(out_path, "PNG")

    print(f"  Saved {len(names)} items")

# Also copy map and banner
import shutil
map_src = os.path.join(UPLOAD_DIR, "pasted_image_1792145769577.png")
if os.path.exists(map_src):
    shutil.copy(map_src, "/home/z/my-project/public/peta-nusantara.png")
    print("Copied peta-nusantara.png")

banner_src = os.path.join(UPLOAD_DIR, "pasted_image_1792135607177.png")
if os.path.exists(banner_src):
    shutil.copy(banner_src, "/home/z/my-project/public/banner-default.png")
    print("Copied banner-default.png")

print(f"\n=== Done. Total items: {sum(len(n) for _, _, n in albums)} ===")
