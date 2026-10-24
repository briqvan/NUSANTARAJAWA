// ===== Akademi (Berguru) system — 7 cities, 4 skills each =====

export interface AkademiSkill {
  id: string
  name: string
  description: string
  mpCost: number
  // Progress: 0-100%, each use adds 0.3%
  baseProgress: number
  // Effect description for when mastered
  masteryBonus?: string
}

export interface AkademiCity {
  id: string
  name: string
  fullName: string
  description: string
  image: string
  skills: AkademiSkill[]
}

export const AKADEMI_CITIES: AkademiCity[] = [
  {
    id: 'jakarta', name: 'Jakarta', fullName: 'Akademi Ilmu Sihir Serangan',
    description: 'Akademi sihir serangan tempat para magikus mempelajari kehancuran api.',
    image: '/cities/jakarta.png',
    skills: [
      { id: 'fire-bolt', name: 'Fire Bolt', description: 'Menembakkan bolt api ke musuh. Damage sedang.', mpCost: 15, baseProgress: 0, masteryBonus: 'Membuka Fire Rain' },
      { id: 'fire-rain', name: 'Fire Rain', description: 'Hujan api menimpa musuh. Damage kuat.', mpCost: 30, baseProgress: 0, masteryBonus: 'Membuka Magma' },
      { id: 'magma', name: 'Magma', description: 'Aliran magma menghanguskan musuh. Damage sangat kuat.', mpCost: 50, baseProgress: 0, masteryBonus: 'Membuka Meteor' },
      { id: 'meteor', name: 'Meteor', description: 'Meteor jatuh menghancurkan musuh. Damage ekstrem.', mpCost: 80, baseProgress: 0, masteryBonus: 'Bonus tambahan damage 20%' },
    ],
  },
  {
    id: 'surabaya', name: 'Surabaya', fullName: 'Akademi Pedang',
    description: 'Akademi pedang tempat para pendekar menempa teknik mematikan.',
    image: '/cities/surabaya.png',
    skills: [
      { id: 'slash', name: 'Slash', description: 'Tebasan cepat ke musuh. Damage sedang.', mpCost: 10, baseProgress: 0, masteryBonus: 'Membuka Trust Damage' },
      { id: 'trust-damage', name: 'Trust Damage', description: 'Tusukan keras menembus armor. Damage kuat.', mpCost: 20, baseProgress: 0, masteryBonus: 'Membuka Triple Slash' },
      { id: 'triple-slash', name: 'Triple Slash', description: 'Tiga tebasan beruntun. Damage sangat kuat.', mpCost: 35, baseProgress: 0, masteryBonus: 'Membuka Blade Dancer' },
      { id: 'blade-dancer', name: 'Blade Dancer', description: 'Tarian pedang mematikan. Damage ekstrem.', mpCost: 60, baseProgress: 0, masteryBonus: 'Bonus tambahan damage 20%' },
    ],
  },
  {
    id: 'bandung', name: 'Bandung', fullName: 'Akademi Sihir Healing',
    description: 'Akademi penyembuhan tempat para dukun mempelajari seni memulihkan.',
    image: '/cities/bandung.png',
    skills: [
      { id: 'single-heal', name: 'Single Heal', description: 'Pulihkan HP satu target. Bisa heal diri atau teman grup.', mpCost: 15, baseProgress: 0, masteryBonus: 'Membuka All Heal' },
      { id: 'all-heal', name: 'All Heal', description: 'Pulihkan HP semua anggota grup. Heal kuat.', mpCost: 30, baseProgress: 0, masteryBonus: 'Membuka Purity' },
      { id: 'purity', name: 'Purity', description: 'Heal kuat + menetralisir semua efek negatif anggota grup.', mpCost: 45, baseProgress: 0, masteryBonus: 'Membuka God Blessing' },
      { id: 'god-blessing', name: 'God Blessing', description: 'Heal ekstrem + DEF +10% sementara + bersihkan debuff semua anggota grup.', mpCost: 70, baseProgress: 0, masteryBonus: 'Bonus tambahan heal 20%' },
    ],
  },
  {
    id: 'depok', name: 'Depok', fullName: 'Akademi Kutukan',
    description: 'Akademi kutukan tempat para tukang sihir gelap mempelajari ilmu terkutuk.',
    image: '/cities/depok.png',
    skills: [
      { id: 'stun', name: 'Stun', description: 'Stun musuh selama 1 turn. Musuh tidak bisa bertindak.', mpCost: 15, baseProgress: 0, masteryBonus: 'Membuka Double Stun' },
      { id: 'double-stun', name: 'Double Stun', description: 'Stun musuh selama 2 turn.', mpCost: 25, baseProgress: 0, masteryBonus: 'Membuka Life Drain' },
      { id: 'life-drain', name: 'Life Drain', description: 'Kurangi HP musuh 5% setiap ronde.', mpCost: 35, baseProgress: 0, masteryBonus: 'Membuka Life Steal' },
      { id: 'life-steal', name: 'Life Steal', description: 'Kurangi HP musuh 5% setiap ronde + heal HP semua pemain 5%.', mpCost: 55, baseProgress: 0, masteryBonus: 'Bonus tambahan damage 10%' },
    ],
  },
  {
    id: 'semarang', name: 'Semarang', fullName: 'Akademi Pemanah',
    description: 'Akademi pemanah, hanya untuk pengguna senjata busur.',
    image: '/cities/semarang.png',
    skills: [
      { id: 'double-strafe', name: 'Double Strafe', description: 'Serang musuh 2x dalam satu sesi. Hanya untuk senjata busur.', mpCost: 15, baseProgress: 0, masteryBonus: 'Membuka Triple Shoot' },
      { id: 'triple-shoot', name: 'Triple Shoot', description: 'Serang musuh 3x dalam satu sesi. Damage lebih kuat.', mpCost: 25, baseProgress: 0, masteryBonus: 'Membuka Arrow Bullet' },
      { id: 'arrow-bullet', name: 'Arrow Bullet', description: '3x attack + 10% tambahan damage per attack.', mpCost: 40, baseProgress: 0, masteryBonus: 'Membuka Arrow Shower' },
      { id: 'arrow-shower', name: 'Arrow Shower', description: '6x attack terhadap musuh dalam satu sesi.', mpCost: 65, baseProgress: 0, masteryBonus: 'Bonus tambahan damage 10%' },
    ],
  },
  {
    id: 'malang', name: 'Malang', fullName: 'Akademi Pedagang',
    description: 'Akademi perdagangan, seni meraih keuntungan maksimal.',
    image: '/cities/malang.png',
    skills: [
      { id: 'discount', name: 'Discount', description: 'Semua barang di pasar turun harga 15%.', mpCost: 0, baseProgress: 0, masteryBonus: 'Membuka Fee' },
      { id: 'fee', name: 'Fee', description: 'Semua barang yang dijual ke pedagang harga naik 15%.', mpCost: 0, baseProgress: 0, masteryBonus: 'Membuka Black Market' },
      { id: 'black-market', name: 'Black Market', description: 'Bisa menjual semua barang, termasuk yang tidak bisa dijual.', mpCost: 0, baseProgress: 0, masteryBonus: 'Membuka Business Master' },
      { id: 'business-master', name: 'Business Master', description: 'Tambahan kapasitas kantong +10. Semua jual naik 15%, semua beli turun 15%.', mpCost: 0, baseProgress: 0, masteryBonus: 'Bonus: jual +15% & beli -15%' },
    ],
  },
  {
    id: 'bogor', name: 'Bogor', fullName: 'Akademi Obat-obatan',
    description: 'Akademi alkimia, seni meracik potion dari bahan alam.',
    image: '/cities/bogor.png',
    skills: [
      { id: 'potion-maker', name: 'Potion Maker', description: 'Buat potion HP dari gabungan item consumable. 7 resep awal.', mpCost: 10, baseProgress: 0, masteryBonus: 'Membuka Avicena' },
      { id: 'avicena', name: 'Avicena', description: 'Buat potion buff status dari gabungan consumable. 7 resep buff.', mpCost: 15, baseProgress: 0, masteryBonus: 'Membuka Drop Master' },
      { id: 'drop-master', name: 'Drop Master', description: 'Drop consumable naik 15%. Buat potion HP + buff (5 resep masing).', mpCost: 20, baseProgress: 0, masteryBonus: 'Membuka Neurology' },
      { id: 'neurology', name: 'Neurology', description: 'Buat pil recover HP+MP+anti debuff 3 turn dari 4 bahan consumable.', mpCost: 30, baseProgress: 0, masteryBonus: 'Bonus tambahan damage 10%' },
    ],
  },
  {
    id: 'jogja', name: 'Jogja', fullName: 'Akademi Penempa',
    description: 'Akademi penempaan, seni mengubah material menjadi kekuatan.',
    image: '/cities/jogja.png',
    skills: [
      { id: 'fire-smith', name: 'Fire Smith', description: 'Naikkan keberhasilan upgrade tempa sebesar 5%.', mpCost: 0, baseProgress: 0, masteryBonus: 'Membuka Break Item' },
      { id: 'break-item', name: 'Break Item', description: 'Pecah item menjadi material tempa (kayu, besi, emas, permata).', mpCost: 15, baseProgress: 0, masteryBonus: 'Membuka Join Equip' },
      { id: 'join-equip', name: 'Join Equip', description: 'Satukan 2 item sama jadi lebih kuat (mis: +2 + +3 = +5).', mpCost: 25, baseProgress: 0, masteryBonus: 'Membuka Steady Hand' },
      { id: 'steady-hand', name: 'Steady Hand', description: 'Beli material diskon 30%. Drop material naik 15%.', mpCost: 0, baseProgress: 0, masteryBonus: 'Bonus tambahan damage 10%' },
    ],
  },
]

// Skill progress state: { skillId: progress(0-100) }
export type SkillProgress = Record<string, number>

// Check if a skill is unlocked (previous skill at 100%)
export function isSkillUnlocked(city: AkademiCity, skillIndex: number, progress: SkillProgress): boolean {
  if (skillIndex === 0) return true
  const prevSkill = city.skills[skillIndex - 1]
  return (progress[prevSkill.id] ?? 0) >= 100
}

// Check if a skill is mastered (at 100%)
export function isSkillMastered(skillId: string, progress: SkillProgress): boolean {
  return (progress[skillId] ?? 0) >= 100
}
