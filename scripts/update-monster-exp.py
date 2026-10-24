"""Update monster EXP values in monster-data.ts and game-world.tsx"""
import re

# New EXP values
new_exp_monster_data = {
    'mon-ulat': 40, 'mon-katak': 55, 'mon-cobra': 70, 'mon-sarang-lebah': 60,
    'mon-anak-beruang': 95, 'mon-kucing-gila': 55, 'mon-kambing': 75, 'mon-lintah': 40,
    'mon-belut-listrik': 90, 'mon-tupai': 35, 'mon-kumbang-tanduk': 110,
    'mon-kumbang-tahi': 70, 'mon-kelinci': 55, 'mon-ular': 70, 'mon-ayam': 90,
    'mon-tikus': 30, 'mon-babi': 105, 'mon-anjing-galak': 90, 'mon-landak': 75,
    'mon-trenggiling': 90, 'mon-monyet': 105, 'mon-lebah': 70, 'mon-kelelawar': 85,
    'mon-kalajengking': 110,
    'med-macan-kumbah': 410, 'med-serigala-putih': 340, 'med-kepiting-raksasa': 580,
    'med-lebah-beracun': 490, 'med-banteng': 730, 'med-rusa-tanduk-12': 380,
    'med-gorila': 880, 'med-anjing-herder': 430, 'med-anjing-shepherd': 670,
    'med-buaya-putih': 820, 'med-gajah-putih': 1020, 'med-gagak-mata-merah': 320,
    'boss-elang-raksasa': 600, 'boss-naga-merah': 950, 'boss-naga-air-biru': 850,
    'boss-hiu-ganas': 650, 'boss-kalajengking-merah': 800, 'boss-lipan-raksasa': 700,
    'boss-kura-kura-raksasa': 900,
}

# Update monster-data.ts
with open('src/components/nusantara/monster-data.ts', 'r') as f:
    content = f.read()

for mon_id, new_val in new_exp_monster_data.items():
    # Pattern: id: 'mon-xxx', ... expReward: OLD,
    escaped_id = re.escape(mon_id)
    pattern = r"(id:\s*'" + escaped_id + r"'[^}]*?expReward:\s*)\d+"
    content = re.sub(pattern, r"\g<1>" + str(new_val), content, flags=re.DOTALL)

with open('src/components/nusantara/monster-data.ts', 'w') as f:
    f.write(content)

print("monster-data.ts updated")
exp_values = re.findall(r'expReward:\s*(\d+)', content)
print(f"  {len(exp_values)} expReward values: {exp_values}")

# Update skull markers in game-world.tsx (tengkorak monsters)
# These are in SKULL_MARKERS array in game-world.tsx
new_exp_skulls = {
    'skull-jakarta': 1100,      # Monster Tengkorak (was 1800)
    'skull-laut-1': 1050,       # Ular Kobra Kepala 2 (was 1700)
    'skull-laut-2': 1250,       # Monster Kepala 2 (was 2100)
    'skull-banten': 1150,       # Pendekar Santet (was 1900)
    'skull-jawa-barat': 1200,   # Siluman Setengah Kerbau (was 2000)
    'skull-jawa-tengah': 1350,  # Buto Ijo Raksasa (was 2200)
    'skull-jawa-timur': 1700,   # Naga Emas (was 2800)
}

with open('src/components/nusantara/game-world.tsx', 'r') as f:
    gw_content = f.read()

for skull_id, new_val in new_exp_skulls.items():
    escaped_id = re.escape(skull_id)
    pattern = r"(id:\s*'" + escaped_id + r"'[^}]*?expReward:\s*)\d+"
    gw_content = re.sub(pattern, r"\g<1>" + str(new_val), gw_content, flags=re.DOTALL)

with open('src/components/nusantara/game-world.tsx', 'w') as f:
    f.write(gw_content)

print("\ngame-world.tsx skull markers updated")
skull_exp = re.findall(r"skull-[^']*'[^}]*?expReward:\s*(\d+)", gw_content, re.DOTALL)
print(f"  Skull EXP values: {skull_exp}")

print("\nDone! All monster EXP values updated.")
