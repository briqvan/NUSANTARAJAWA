export interface EquipmentDrop {
  id: string
  name: string
  icon: string
  image: string
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic'
  defBonus: number
  magicDefBonus: number
  hpBonus: number
  mpBonus: number
  atkBonus: number
  magicAtkBonus: number
  desc: string
}

export const RARITY_COLORS: Record<EquipmentDrop['rarity'], string> = {
  'Common': '#9ca3af',
  'Uncommon': '#22c55e',
  'Rare': '#3b82f6',
  'Epic': '#a855f7',
}

type BaseItem = Omit<EquipmentDrop, 'defBonus' | 'magicDefBonus' | 'hpBonus' | 'mpBonus' | 'atkBonus' | 'magicAtkBonus'>

// Baju (12)
export const EQUIPMENT_TABLE: BaseItem[] = [
  { id: 'baju-latihan', name: 'Baju Latihan', icon: '👕', image: '/equipment/baju-latihan.png', rarity: 'Common', desc: 'Baju latihan sederhana untuk pemula.' },
  { id: 'jubah-lusuh', name: 'Jubah Lusuh', icon: '🥼', image: '/equipment/jubah-lusuh.png', rarity: 'Common', desc: 'Jubah tua yang sudah usang.' },
  { id: 'baju-petualang', name: 'Baju Petualang', icon: '🧥', image: '/equipment/baju-petualang.png', rarity: 'Uncommon', desc: 'Baju tangguh untuk petualang.' },
  { id: 'rompi-robek', name: 'Rompi Robek', icon: '🦺', image: '/equipment/rompi-robek.png', rarity: 'Uncommon', desc: 'Rompi kulit yang sudah robek.' },
  { id: 'baju-berkerudung', name: 'Baju Berkerudung', icon: '🧕', image: '/equipment/baju-berkerudung.png', rarity: 'Uncommon', desc: 'Baju dengan kerudung penyamar.' },
  { id: 'tunik-tampal', name: 'Tunik Tampal', icon: '👘', image: '/equipment/tunik-tampal.png', rarity: 'Uncommon', desc: 'Tunik yang ditambal berkali-kali.' },
  { id: 'jubah-sabit', name: 'Jubah Sabit', icon: '🌑', image: '/equipment/jubah-sabit.png', rarity: 'Rare', desc: 'Jubah penyihir simbol sabit bulan.' },
  { id: 'baju-raksasa', name: 'Baju Raksasa', icon: '🦍', image: '/equipment/baju-raksasa.png', rarity: 'Rare', desc: 'Baju tebal dari kulit raksasa.' },
  { id: 'baju-bergerigi', name: 'Baju Bergerigi', icon: '⚙️', image: '/equipment/baju-bergerigi.png', rarity: 'Rare', desc: 'Baju dengan gigi logam pertahanan.' },
  { id: 'baju-rimba', name: 'Baju Rimba', icon: '🌿', image: '/equipment/baju-rimba.png', rarity: 'Epic', desc: 'Baju penjelajah hutan legendaris.' },
  { id: 'baju-pendek', name: 'Baju Pendek', icon: '🎽', image: '/equipment/baju-pendek.png', rarity: 'Epic', desc: 'Baju pendek ringan tapi mematikan.' },
  { id: 'baju-purba', name: 'Baju Purba', icon: '📜', image: '/equipment/baju-purba.png', rarity: 'Epic', desc: 'Baju peninggalan peradaban kuno.' },
]

// Celana (12)
export const CELANA_TABLE: BaseItem[] = [
  { id: 'celana-latihan', name: 'Celana Latihan', icon: '👖', image: '/equipment/celana-latihan.png', rarity: 'Common', desc: 'Celana latihan sederhana.' },
  { id: 'celana-lusuh', name: 'Celana Lusuh', icon: '👖', image: '/equipment/celana-lusuh.png', rarity: 'Common', desc: 'Celana tua yang sudah usang.' },
  { id: 'celana-petualang', name: 'Celana Petualang', icon: '👖', image: '/equipment/celana-petualang.png', rarity: 'Uncommon', desc: 'Celana cargo tangguh.' },
  { id: 'celana-sobek', name: 'Celana Sobek', icon: '👖', image: '/equipment/celana-sobek.png', rarity: 'Uncommon', desc: 'Celana jeans dengan robekan.' },
  { id: 'celana-berkedudung', name: 'Celana Berkedudung', icon: '👖', image: '/equipment/celana-berkedudung.png', rarity: 'Uncommon', desc: 'Celana longgar tradisional.' },
  { id: 'celana-tampal', name: 'Celana Tampal', icon: '👖', image: '/equipment/celana-tampal.png', rarity: 'Uncommon', desc: 'Celana ditambal berkali-kali.' },
  { id: 'celana-sabit', name: 'Celana Sabit', icon: '👖', image: '/equipment/celana-sabit.png', rarity: 'Rare', desc: 'Celana penyihir sabit bulan.' },
  { id: 'celana-raksasa', name: 'Celana Raksasa', icon: '👖', image: '/equipment/celana-raksasa.png', rarity: 'Rare', desc: 'Celana tebal kulit raksasa.' },
  { id: 'celana-bergerigi', name: 'Celana Bergerigi', icon: '👖', image: '/equipment/celana-bergerigi.png', rarity: 'Rare', desc: 'Celana gigi logam.' },
  { id: 'celana-rimba', name: 'Celana Rimba', icon: '👖', image: '/equipment/celana-rimba.png', rarity: 'Epic', desc: 'Celana penjelajah hutan legendaris.' },
  { id: 'celana-pendek', name: 'Celana Pendek', icon: '👖', image: '/equipment/celana-pendek.png', rarity: 'Epic', desc: 'Celana pendek ringan mematikan.' },
  { id: 'celana-purba', name: 'Celana Purba', icon: '👖', image: '/equipment/celana-purba.png', rarity: 'Epic', desc: 'Celana peninggalan kuno.' },
]

// Fruits (24)
export const FRUIT_TABLE: BaseItem[] = [
  { id: 'fruit-apel', name: 'Apel', icon: '🍎', image: '/equipment/fruit-apel.png', rarity: 'Common', desc: 'Apel merah segar. Pulihkan HP.' },
  { id: 'fruit-mangga', name: 'Mangga', icon: '🥭', image: '/equipment/fruit-mangga.png', rarity: 'Common', desc: 'Mangga manis tropis.' },
  { id: 'fruit-jeruk', name: 'Jeruk', icon: '🍊', image: '/equipment/fruit-jeruk.png', rarity: 'Common', desc: 'Jeruk segar kaya vitamin.' },
  { id: 'fruit-semangka', name: 'Semangka', icon: '🍉', image: '/equipment/fruit-semangka.png', rarity: 'Common', desc: 'Semangka segar menyegarkan.' },
  { id: 'fruit-nanas', name: 'Nanas', icon: '🍍', image: '/equipment/fruit-nanas.png', rarity: 'Uncommon', desc: 'Nanas tropis menyegarkan.' },
  { id: 'fruit-pisang', name: 'Pisang', icon: '🍌', image: '/equipment/fruit-pisang.png', rarity: 'Uncommon', desc: 'Pisang energi instan.' },
  { id: 'fruit-salak', name: 'Salak', icon: '🟤', image: '/equipment/fruit-salak.png', rarity: 'Uncommon', desc: 'Salak kulit ular dari Jawa.' },
  { id: 'fruit-duku', name: 'Duku', icon: '🟡', image: '/equipment/fruit-duku.png', rarity: 'Uncommon', desc: 'Duku manis hutan tropis.' },
  { id: 'fruit-rambutan', name: 'Rambutan', icon: '🔴', image: '/equipment/fruit-rambutan.png', rarity: 'Uncommon', desc: 'Rambutan berbulu merah.' },
  { id: 'fruit-anggur', name: 'Anggur', icon: '🍇', image: '/equipment/fruit-anggur.png', rarity: 'Uncommon', desc: 'Anggur sihir kebun kuno.' },
  { id: 'fruit-pepaya', name: 'Pepaya', icon: '🟠', image: '/equipment/fruit-pepaya.png', rarity: 'Uncommon', desc: 'Pepaya emas menyehatkan.' },
  { id: 'fruit-melon', name: 'Melon', icon: '🍈', image: '/equipment/fruit-melon.png', rarity: 'Uncommon', desc: 'Melon hijau menyegarkan.' },
  { id: 'fruit-markisa', name: 'Markisa', icon: '🟣', image: '/equipment/fruit-markisa.png', rarity: 'Rare', desc: 'Markisa eksotis penuh sihir.' },
  { id: 'fruit-buah-naga', name: 'Buah Naga', icon: '🐉', image: '/equipment/fruit-buah-naga.png', rarity: 'Rare', desc: 'Buah naga berkekuatan naga.' },
  { id: 'fruit-kelengkeng', name: 'Kelengkeng', icon: '🟤', image: '/equipment/fruit-kelengkeng.png', rarity: 'Rare', desc: 'Kelengkeng kering peninggalan dewa.' },
  { id: 'fruit-matoa', name: 'Matoa', icon: '🟢', image: '/equipment/fruit-matoa.png', rarity: 'Rare', desc: 'Matoa dari Papua penuh energi.' },
  { id: 'fruit-apel-hijau', name: 'Apel Hijau', icon: '🍏', image: '/equipment/fruit-apel-hijau.png', rarity: 'Rare', desc: 'Apel hijau sihir penyembuh.' },
  { id: 'fruit-tomat', name: 'Tomat', icon: '🍅', image: '/equipment/fruit-tomat.png', rarity: 'Rare', desc: 'Tomat merah anti-sihir.' },
  { id: 'fruit-wortel', name: 'Wortel', icon: '🥕', image: '/equipment/fruit-wortel.png', rarity: 'Rare', desc: 'Wortel peningkat penglihatan.' },
  { id: 'fruit-pir', name: 'Pir', icon: '🍐', image: '/equipment/fruit-pir.png', rarity: 'Rare', desc: 'Pir segar penenang jiwa.' },
  { id: 'fruit-kernetu', name: 'Kernetu', icon: '🟫', image: '/equipment/fruit-kernetu.png', rarity: 'Epic', desc: 'Kernetu langka sihir kuno.' },
  { id: 'fruit-alpukat', name: 'Alpukat', icon: '🥑', image: '/equipment/fruit-alpukat.png', rarity: 'Epic', desc: 'Alpukat sakti peningkat vitalitas.' },
  { id: 'fruit-manggis', name: 'Manggis', icon: '🟣', image: '/equipment/fruit-manggis.png', rarity: 'Epic', desc: 'Manggis ungu ratu buah.' },
  { id: 'fruit-terong', name: 'Terong', icon: '🍆', image: '/equipment/fruit-terong.png', rarity: 'Epic', desc: 'Terong ungu sihir gelap.' },
]

// Helper to generate weapon tables (same pattern for all weapon types)
function makeWeaponTable(prefix: string, icon: string, label: string): BaseItem[] {
  const tiers = [
    { suffix: 'latihan', rarity: 'Common' as const },
    { suffix: 'berduri', rarity: 'Common' as const },
    { suffix: 'bulat', rarity: 'Uncommon' as const },
    { suffix: 'penatap', rarity: 'Uncommon' as const },
    { suffix: 'spiral', rarity: 'Uncommon' as const },
    { suffix: 'ukir', rarity: 'Uncommon' as const },
    { suffix: 'sabit', rarity: 'Rare' as const },
    { suffix: 'raksasa', rarity: 'Rare' as const },
    { suffix: 'bergerigi', rarity: 'Rare' as const },
    { suffix: 'tanduk', rarity: 'Epic' as const },
    { suffix: 'pendek', rarity: 'Epic' as const },
    { suffix: 'purba', rarity: 'Epic' as const },
  ]
  return tiers.map(t => ({
    id: `${prefix}-${t.suffix}`,
    name: `${label} ${t.suffix.charAt(0).toUpperCase() + t.suffix.slice(1)}`,
    icon,
    image: `/equipment/${prefix}-${t.suffix}.png`,
    rarity: t.rarity,
    desc: `${label} ${t.suffix}. Senjata ${t.rarity.toLowerCase()}.`,
  }))
}

// Weapons — custom definitions to match actual cropped file names
// Claw (kayu) — standard tier names match
export const CLAW_TABLE = makeWeaponTable('claw', '🤚', 'Claw')

// Gada (kayu) — has "flanged" instead of "ukir"
export const GADA_TABLE: BaseItem[] = [
  { id: 'gada-latihan', name: 'Gada Latihan', icon: '🔨', image: '/equipment/gada-latihan.png', rarity: 'Common', desc: 'Gada kayu untuk latihan.' },
  { id: 'gada-berduri', name: 'Gada Berduri', icon: '🔨', image: '/equipment/gada-berduri.png', rarity: 'Common', desc: 'Gada berduri besi.' },
  { id: 'gada-bulat', name: 'Gada Bulat', icon: '🔨', image: '/equipment/gada-bulat.png', rarity: 'Uncommon', desc: 'Gada berkepala bulat.' },
  { id: 'gada-penatap', name: 'Gada Penatap', icon: '🔨', image: '/equipment/gada-penatap.png', rarity: 'Uncommon', desc: 'Gada berkepala segi enam.' },
  { id: 'gada-spiral', name: 'Gada Spiral', icon: '🔨', image: '/equipment/gada-spiral.png', rarity: 'Uncommon', desc: 'Gada berpilin unik.' },
  { id: 'gada-flanged', name: 'Gada Flanged', icon: '🔨', image: '/equipment/gada-flanged.png', rarity: 'Uncommon', desc: 'Gada dengan flange tajam.' },
  { id: 'gada-sabit', name: 'Gada Sabit', icon: '🔨', image: '/equipment/gada-sabit.png', rarity: 'Rare', desc: 'Gada berbentuk sabit.' },
  { id: 'gada-raksasa', name: 'Gada Raksasa', icon: '🔨', image: '/equipment/gada-raksasa.png', rarity: 'Rare', desc: 'Gada raksasa dari batu.' },
  { id: 'gada-bergerigi', name: 'Gada Bergerigi', icon: '🔨', image: '/equipment/gada-bergerigi.png', rarity: 'Rare', desc: 'Gada dengan gigi gergaji.' },
  { id: 'gada-tanduk', name: 'Gada Tanduk', icon: '🔨', image: '/equipment/gada-tanduk.png', rarity: 'Epic', desc: 'Gada dari tanduk kerbau sakti.' },
  { id: 'gada-pendek', name: 'Gada Pendek', icon: '🔨', image: '/equipment/gada-pendek.png', rarity: 'Epic', desc: 'Gada pendek satu tangan.' },
  { id: 'gada-purba', name: 'Gada Purba', icon: '🔨', image: '/equipment/gada-purba.png', rarity: 'Epic', desc: 'Gada batu kuno peninggalan raksasa.' },
]

// Kapak (kayu) — completely different file names from standard tiers
export const KAPAK_TABLE: BaseItem[] = [
  { id: 'kapak-perintis', name: 'Kapak Perintis', icon: '🪓', image: '/equipment/kapak-perintis.png', rarity: 'Common', desc: 'Kapak pembuka jalan di hutan.' },
  { id: 'kapak-ganda', name: 'Kapak Ganda', icon: '🪓', image: '/equipment/kapak-ganda.png', rarity: 'Common', desc: 'Kapak bermata dua.' },
  { id: 'kapak-raksasa', name: 'Kapak Raksasa', icon: '🪓', image: '/equipment/kapak-raksasa.png', rarity: 'Uncommon', desc: 'Kapak besar berat.' },
  { id: 'kapak-lantak', name: 'Kapak Lantak', icon: '🪓', image: '/equipment/kapak-lantak.png', rarity: 'Uncommon', desc: 'Kapak penghancur.' },
  { id: 'kapak-paruh', name: 'Kapak Paruh', icon: '🪓', image: '/equipment/kapak-paruh.png', rarity: 'Uncommon', desc: 'Kapak berbentuk paruh burung.' },
  { id: 'kapak-ukir', name: 'Kapak Ukir', icon: '🪓', image: '/equipment/kapak-ukir.png', rarity: 'Uncommon', desc: 'Kapak berukir sihir kuno.' },
  { id: 'kapak-sabit', name: 'Kapak Sabit', icon: '🪓', image: '/equipment/kapak-sabit.png', rarity: 'Rare', desc: 'Kapak berbentuk sabit bulan.' },
  { id: 'kapak-daun', name: 'Kapak Daun', icon: '🪓', image: '/equipment/kapak-daun.png', rarity: 'Rare', desc: 'Kapak berbentuk daun.' },
  { id: 'kapak-bergerigi', name: 'Kapak Bergerigi', icon: '🪓', image: '/equipment/kapak-bergerigi.png', rarity: 'Rare', desc: 'Kapak bergigi gergaji.' },
  { id: 'kapak-tanduk', name: 'Kapak Tanduk', icon: '🪓', image: '/equipment/kapak-tanduk.png', rarity: 'Epic', desc: 'Kapak dari tanduk rusa sakti.' },
  { id: 'kapak-ringan', name: 'Kapak Ringan', icon: '🪓', image: '/equipment/kapak-ringan.png', rarity: 'Epic', desc: 'Kapak ringan super cepat.' },
  { id: 'kapak-purba', name: 'Kapak Purba', icon: '🪓', image: '/equipment/kapak-purba.png', rarity: 'Epic', desc: 'Kapak batu kuno peninggalan raksasa.' },
]
export const KNUCKLE_TABLE = makeWeaponTable('knuckle', '👊', 'Knuckle')
export const CLAW_BATU_TABLE = makeWeaponTable('claw-batu', '🪨', 'Claw Batu')
export const GADA_BATU_TABLE = makeWeaponTable('gada-batu', '🪨', 'Gada Batu')
export const KAPAK_BATU_TABLE = makeWeaponTable('kapak-batu', '🪓', 'Kapak Batu')
export const KNUCKLE_BATU_TABLE = makeWeaponTable('knuckle-batu', '👊', 'Knuckle Batu')

// Bows — 24 items (12 wood + 12 iron), all use bow art from cropped images
// Busur Kayu (12) — wooden bows ranging Common → Epic
export const BUSUR_KAYU_TABLE: BaseItem[] = [
  { id: 'busur-kayu-01', name: 'Busur Kayu Hijau', icon: '🏹', image: '/equipment/busur-kayu-01.png', rarity: 'Common', desc: 'Busur kayu berdaun hijau, ramah untuk pemula.' },
  { id: 'busur-kayu-02', name: 'Busur Akar', icon: '🏹', image: '/equipment/busur-kayu-02.png', rarity: 'Common', desc: 'Busur dari akar pilihan yang melilit kuat.' },
  { id: 'busur-kayu-03', name: 'Busur Jingga', icon: '🏹', image: '/equipment/busur-kayu-03.png', rarity: 'Uncommon', desc: 'Busur kayu berukir dengan sihir jingga bercahaya.' },
  { id: 'busur-kayu-04', name: 'Busur Bambu', icon: '🏹', image: '/equipment/busur-kayu-04.png', rarity: 'Uncommon', desc: 'Busur bambu dua lapis lentur dan ringan.' },
  { id: 'busur-kayu-05', name: 'Busur Peri Biru', icon: '🏹', image: '/equipment/busur-kayu-05.png', rarity: 'Uncommon', desc: 'Busur peri bercahaya biru dari hutan sakti.' },
  { id: 'busur-kayu-06', name: 'Busur Gelap', icon: '🏹', image: '/equipment/busur-kayu-06.png', rarity: 'Rare', desc: 'Busur kayu hitam sihir gelap, mematikan.' },
  { id: 'busur-kayu-07', name: 'Busur Dahan', icon: '🏹', image: '/equipment/busur-kayu-07.png', rarity: 'Rare', desc: 'Busur dari dahan pohon kuno yang masih hidup.' },
  { id: 'busur-kayu-08', name: 'Busur Duri', icon: '🏹', image: '/equipment/busur-kayu-08.png', rarity: 'Rare', desc: 'Busur berduri tajam dari tanduk binatang buas.' },
  { id: 'busur-kayu-09', name: 'Busur Kulit', icon: '🏹', image: '/equipment/busur-kayu-09.png', rarity: 'Rare', desc: 'Busur kayu berbalut kulit binatang tangguh.' },
  { id: 'busur-kayu-10', name: 'Busur Bulu', icon: '🏹', image: '/equipment/busur-kayu-10.png', rarity: 'Epic', desc: 'Busur berbulu putih peninggalan pemburu legendaris.' },
  { id: 'busur-kayu-11', name: 'Busur Sulur', icon: '🏹', image: '/equipment/busur-kayu-11.png', rarity: 'Epic', desc: 'Busur dilingkar sulur sihir yang bergerak sendiri.' },
  { id: 'busur-kayu-12', name: 'Busur Emas', icon: '🏹', image: '/equipment/busur-kayu-12.png', rarity: 'Epic', desc: 'Busur kayu emas berukir mewah, bersinar dalam gelap.' },
]

// Busur Besi (12) — iron/metal bows, generally stronger than wood
export const BUSUR_BESI_TABLE: BaseItem[] = [
  { id: 'busur-besi-01', name: 'Busur Perak', icon: '🏹', image: '/equipment/busur-besi-01.png', rarity: 'Common', desc: 'Busur perak mengilap, akurat dan ringan.' },
  { id: 'busur-besi-02', name: 'Busur Kulit Besi', icon: '🏹', image: '/equipment/busur-besi-02.png', rarity: 'Common', desc: 'Busur besi berbalut kulit hitam.' },
  { id: 'busur-besi-03', name: 'Busur Si Jingga', icon: '🏹', image: '/equipment/busur-besi-03.png', rarity: 'Uncommon', desc: 'Busur besi dengan ukiran sihir jingga menyala.' },
  { id: 'busur-besi-04', name: 'Busur Zirah', icon: '🏹', image: '/equipment/busur-besi-04.png', rarity: 'Uncommon', desc: 'Busur besi gaya zirah untuk perang.' },
  { id: 'busur-besi-05', name: 'Busur Es Biru', icon: '🏹', image: '/equipment/busur-besi-05.png', rarity: 'Uncommon', desc: 'Busur besi berhias sayap biru sejuk membekukan.' },
  { id: 'busur-besi-06', name: 'Busur Setan Merah', icon: '🏹', image: '/equipment/busur-besi-06.png', rarity: 'Rare', desc: 'Busur besi kemerahan dengan sihir iblis.' },
  { id: 'busur-besi-07', name: 'Busur Besi Hijau', icon: '🏹', image: '/equipment/busur-besi-07.png', rarity: 'Rare', desc: 'Busur besi berukir dahan hijau melilit.' },
  { id: 'busur-besi-08', name: 'Busur Tanduk Gelap', icon: '🏹', image: '/equipment/busur-besi-08.png', rarity: 'Rare', desc: 'Busur besi gelap berduri tanduk setan.' },
  { id: 'busur-besi-09', name: 'Busur Primitif', icon: '🏹', image: '/equipment/busur-besi-09.png', rarity: 'Rare', desc: 'Busur besi kasar gaya kuno, sangat kuat.' },
  { id: 'busur-besi-10', name: 'Busur Putih', icon: '🏹', image: '/equipment/busur-besi-10.png', rarity: 'Epic', desc: 'Busur putih bangsawan berbulu mahkota.' },
  { id: 'busur-besi-11', name: 'Busur Berduri Hitam', icon: '🏹', image: '/equipment/busur-besi-11.png', rarity: 'Epic', desc: 'Busur besi hitam berduri sulur beracun.' },
  { id: 'busur-besi-12', name: 'Busur Sakti Emas', icon: '🏹', image: '/equipment/busur-besi-12.png', rarity: 'Epic', desc: 'Busur emas hijau bercahaya legendaris.' },
]

// Perisai Kayu (12) — wooden shields, equip in left hand (perisai slot)
export const PERISAI_KAYU_TABLE: BaseItem[] = [
  { id: 'perisai-kayu-01', name: 'Perisai Bulat Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-01.png', rarity: 'Common', desc: 'Perisai bulat kayu ringan untuk pemula.' },
  { id: 'perisai-kayu-02', name: 'Perisai Menara Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-02.png', rarity: 'Common', desc: 'Perisai menara kayu tinggi menutupi tubuh.' },
  { id: 'perisai-kayu-03', name: 'Perisai Layang Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-03.png', rarity: 'Uncommon', desc: 'Perisai layang kayu lentur, bagus untuk berkuda.' },
  { id: 'perisai-kayu-04', name: 'Perisai Target Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-04.png', rarity: 'Uncommon', desc: 'Perisai target kayu latihan para pemanah.' },
  { id: 'perisai-kayu-05', name: 'Perisai Oval Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-05.png', rarity: 'Uncommon', desc: 'Perisai oval kayu pelindung tubuh lengkap.' },
  { id: 'perisai-kayu-06', name: 'Perisai Segitiga Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-06.png', rarity: 'Uncommon', desc: 'Perisai segitiga kayu gaya kuno.' },
  { id: 'perisai-kayu-07', name: 'Perisai Daun Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-07.png', rarity: 'Rare', desc: 'Perisai berbentuk daun sakti dari hutan legendaris.' },
  { id: 'perisai-kayu-08', name: 'Perisai Bergerigi Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-08.png', rarity: 'Rare', desc: 'Perisai kayu bergerigi tajam melukai penyerang.' },
  { id: 'perisai-kayu-09', name: 'Perisai Pintu Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-09.png', rarity: 'Rare', desc: 'Perisai pintu kayu tebal, pertahanan kokoh.' },
  { id: 'perisai-kayu-10', name: 'Perisai Salib Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-10.png', rarity: 'Rare', desc: 'Perisai kayu bermotif salib peninggalan ksatria kuno.' },
  { id: 'perisai-kayu-11', name: 'Perisai Tanduk Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-11.png', rarity: 'Epic', desc: 'Perisai kayu berhias tanduk rusa sakti.' },
  { id: 'perisai-kayu-12', name: 'Perisai Purba Kayu', icon: '🛡️', image: '/equipment/perisai-kayu-12.png', rarity: 'Epic', desc: 'Perisai kayu purba peninggalan peradaban hilang.' },
]

// Perisai Batu (12) — stone shields, heavier and stronger than wood
export const PERISAI_BATU_TABLE: BaseItem[] = [
  { id: 'perisai-batu-01', name: 'Perisai Bulat Batu', icon: '🛡️', image: '/equipment/perisai-batu-01.png', rarity: 'Common', desc: 'Perisai bulat batu kokoh tahan pukulan.' },
  { id: 'perisai-batu-02', name: 'Perisai Menara Batu', icon: '🛡️', image: '/equipment/perisai-batu-02.png', rarity: 'Common', desc: 'Perisai menara batu tinggi pertahanan maksimal.' },
  { id: 'perisai-batu-03', name: 'Perisai Layang Batu', icon: '🛡️', image: '/equipment/perisai-batu-03.png', rarity: 'Uncommon', desc: 'Perisai layang batu, berat namun tangguh.' },
  { id: 'perisai-batu-04', name: 'Perisai Target Batu', icon: '🛡️', image: '/equipment/perisai-batu-04.png', rarity: 'Uncommon', desc: 'Perisai target batu latihan para veteran.' },
  { id: 'perisai-batu-05', name: 'Perisai Oval Batu', icon: '🛡️', image: '/equipment/perisai-batu-05.png', rarity: 'Uncommon', desc: 'Perisai oval batu pelindung komprehensif.' },
  { id: 'perisai-batu-06', name: 'Perisai Segitiga Batu', icon: '🛡️', image: '/equipment/perisai-batu-06.png', rarity: 'Uncommon', desc: 'Perisai segitiga batu gaya prajurit kuno.' },
  { id: 'perisai-batu-07', name: 'Perisai Daun Batu', icon: '🛡️', image: '/equipment/perisai-batu-07.png', rarity: 'Rare', desc: 'Perisai batu berbentuk daun dengan sihir hijau.' },
  { id: 'perisai-batu-08', name: 'Perisai Bergerigi Batu', icon: '🛡️', image: '/equipment/perisai-batu-08.png', rarity: 'Rare', desc: 'Perisai batu bergerigi tajam menghancurkan senjata.' },
  { id: 'perisai-batu-09', name: 'Perisai Pintu Batu', icon: '🛡️', image: '/equipment/perisai-batu-09.png', rarity: 'Rare', desc: 'Perisai pintu batu raksasa, nyaris tak tergoyahkan.' },
  { id: 'perisai-batu-10', name: 'Perisai Salib Batu', icon: '🛡️', image: '/equipment/perisai-batu-10.png', rarity: 'Rare', desc: 'Perisai batu bermotif salib dari kuil kuno.' },
  { id: 'perisai-batu-11', name: 'Perisai Tanduk Batu', icon: '🛡️', image: '/equipment/perisai-batu-11.png', rarity: 'Epic', desc: 'Perisai batu berhias tanduk batu sakti.' },
  { id: 'perisai-batu-12', name: 'Perisai Purba Batu', icon: '🛡️', image: '/equipment/perisai-batu-12.png', rarity: 'Epic', desc: 'Perisai batu purba peninggalan zaman para raksasa.' },
]

// Perisai Besi (12) — iron shields, premium defense equipment
export const PERISAI_BESI_TABLE: BaseItem[] = [
  { id: 'perisai-besi-01', name: 'Perisai Besi Bulat', icon: '🛡️', image: '/equipment/perisai-besi-01.png', rarity: 'Common', desc: 'Perisai besi bulat dasar para prajurit.' },
  { id: 'perisai-besi-02', name: 'Perisai Besi Berduri', icon: '🛡️', image: '/equipment/perisai-besi-02.png', rarity: 'Common', desc: 'Perisai besi berduri mematikan untuk penyerang.' },
  { id: 'perisai-besi-03', name: 'Perisai Kite Besi', icon: '🛡️', image: '/equipment/perisai-besi-03.png', rarity: 'Uncommon', desc: 'Perisai besi berbentuk layang dengan salib ukir.' },
  { id: 'perisai-besi-04', name: 'Perisai Menara Besi', icon: '🛡️', image: '/equipment/perisai-besi-04.png', rarity: 'Uncommon', desc: 'Perisai menara besi pertahanan benteng.' },
  { id: 'perisai-besi-05', name: 'Perisai Bulan Sabit', icon: '🛡️', image: '/equipment/perisai-besi-05.png', rarity: 'Uncommon', desc: 'Perisai besi berbentuk bulan sabit berpermata.' },
  { id: 'perisai-besi-06', name: 'Perisai Sisik Ular', icon: '🛡️', image: '/equipment/perisai-besi-06.png', rarity: 'Rare', desc: 'Perisai besi bermotif sisik ular sakti.' },
  { id: 'perisai-besi-07', name: 'Perisai Tengkorak Iblis', icon: '🛡️', image: '/equipment/perisai-besi-07.png', rarity: 'Rare', desc: 'Perisai besi berukir tengkorak iblis menakutkan.' },
  { id: 'perisai-besi-08', name: 'Perisai Bayangan', icon: '🛡️', image: '/equipment/perisai-besi-08.png', rarity: 'Rare', desc: 'Perisai besi ungu bercahaya sihir bayangan.' },
  { id: 'perisai-besi-09', name: 'Perisai Ogre', icon: '🛡️', image: '/equipment/perisai-besi-09.png', rarity: 'Rare', desc: 'Perisai besi raksasa peninggalan ogre.' },
  { id: 'perisai-besi-10', name: 'Perisai Kepala Serigala', icon: '🛡️', image: '/equipment/perisai-besi-10.png', rarity: 'Epic', desc: 'Perisai besi berukir kepala serigala legendaris.' },
  { id: 'perisai-besi-11', name: 'Perisai Kristal', icon: '🛡️', image: '/equipment/perisai-besi-11.png', rarity: 'Epic', desc: 'Perisai besi berpermata kristal biru menyala.' },
  { id: 'perisai-besi-12', name: 'Perisai Tulang Wyvern', icon: '🛡️', image: '/equipment/perisai-besi-12.png', rarity: 'Epic', desc: 'Perisai dari tulang belakang wyvern legendaris.' },
]


// Accessories (36: kalung + cincin + topi)
export const KALUNG_TABLE = makeWeaponTable('kalung', '📿', 'Kalung')
export const CINCIN_TABLE = makeWeaponTable('cincin', '💍', 'Cincin')
export const TOPI_TABLE: BaseItem[] = [
  { id: 'topi-latihan', name: 'Ikat Kepala Latihan', icon: '🎩', image: '/equipment/topi-latihan.png', rarity: 'Common', desc: 'Ikat kepala kain latihan.' },
  { id: 'topi-lusuh', name: 'Kupluk Lusuh', icon: '🎩', image: '/equipment/topi-lusuh.png', rarity: 'Common', desc: 'Kupluk tua usang.' },
  { id: 'topi-petualang', name: 'Caping Petualang', icon: '🎩', image: '/equipment/topi-petualang.png', rarity: 'Uncommon', desc: 'Caping bambu tahan cuaca.' },
  { id: 'topi-tampal', name: 'Bandana Tampal', icon: '🎩', image: '/equipment/topi-tampal.png', rarity: 'Uncommon', desc: 'Bandana ditambal.' },
  { id: 'topi-berkerudung', name: 'Topi Berkerudung', icon: '🎩', image: '/equipment/topi-berkerudung.png', rarity: 'Uncommon', desc: 'Topi kerudung penyamar.' },
  { id: 'topi-sabit', name: 'Topi Sabit', icon: '🎩', image: '/equipment/topi-sabit.png', rarity: 'Uncommon', desc: 'Topi simbol sabit.' },
  { id: 'topi-raksasa', name: 'Serban Raksasa', icon: '🎩', image: '/equipment/topi-raksasa.png', rarity: 'Rare', desc: 'Serban besar pertahanan tinggi.' },
  { id: 'topi-bergerigi', name: 'Topi Bergerigi', icon: '🎩', image: '/equipment/topi-bergerigi.png', rarity: 'Rare', desc: 'Topi gigi logam.' },
  { id: 'topi-tanduk', name: 'Topi Tanduk', icon: '🎩', image: '/equipment/topi-tanduk.png', rarity: 'Rare', desc: 'Topi tanduk sakti.' },
  { id: 'topi-rimba', name: 'Topi Rimba', icon: '🎩', image: '/equipment/topi-rimba.png', rarity: 'Epic', desc: 'Topi penjelajah hutan.' },
  { id: 'topi-pendek', name: 'Topi Pendek', icon: '🎩', image: '/equipment/topi-pendek.png', rarity: 'Epic', desc: 'Topi pendek ringan cepat.' },
  { id: 'topi-purba', name: 'Tutup Kepala Purba', icon: '🎩', image: '/equipment/topi-purba.png', rarity: 'Epic', desc: 'Tutup kepala peradaban kuno.' },
]

// All tables combined for drop pool and merchant
export const ALL_TABLES = [
  ...EQUIPMENT_TABLE, ...CELANA_TABLE, ...FRUIT_TABLE,
  ...CLAW_TABLE, ...GADA_TABLE, ...KAPAK_TABLE, ...KNUCKLE_TABLE,
  ...CLAW_BATU_TABLE, ...GADA_BATU_TABLE, ...KAPAK_BATU_TABLE, ...KNUCKLE_BATU_TABLE,
  ...BUSUR_KAYU_TABLE, ...BUSUR_BESI_TABLE,
  ...PERISAI_KAYU_TABLE, ...PERISAI_BATU_TABLE, ...PERISAI_BESI_TABLE,
  ...KALUNG_TABLE, ...CINCIN_TABLE, ...TOPI_TABLE,
]

// Generate random bonuses
export function rollEquipmentBonuses(rarity: EquipmentDrop['rarity'], isWeapon: boolean, isFruit = false, isAccessory = false) {
  const ranges: Record<EquipmentDrop['rarity'], [number, number]> = {
    'Common': [1, 5], 'Uncommon': [3, 10], 'Rare': [8, 20], 'Epic': [15, 40],
  }
  const [lo, hi] = ranges[rarity]
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const result = { defBonus: 0, magicDefBonus: 0, hpBonus: 0, mpBonus: 0, atkBonus: 0, magicAtkBonus: 0 }

  if (isFruit) {
    const fruitRanges: Record<EquipmentDrop['rarity'], [number, number]> = {
      'Common': [30, 60], 'Uncommon': [60, 120], 'Rare': [120, 250], 'Epic': [250, 500],
    }
    const [flo, fhi] = fruitRanges[rarity]
    result.hpBonus = rand(flo, fhi)
    result.mpBonus = rand(Math.floor(flo * 0.5), Math.floor(fhi * 0.5))
  } else if (isAccessory) {
    const types = ['def', 'magicDef', 'hp', 'mp', 'atk', 'magicAtk'] as const
    const num = rand(3, 4)
    const chosen = [...types].sort(() => Math.random() - 0.5).slice(0, num)
    for (const b of chosen) {
      const val = rand(lo, hi)
      if (b === 'def') result.defBonus += val
      else if (b === 'magicDef') result.magicDefBonus += val
      else if (b === 'hp') result.hpBonus = val * 3
      else if (b === 'mp') result.mpBonus = val * 2
      else if (b === 'atk') result.atkBonus = val
      else if (b === 'magicAtk') result.magicAtkBonus = val
    }
  } else if (isWeapon) {
    const types = ['atk', 'magicAtk', 'atk', 'magicAtk', 'def', 'magicDef'] as const
    const num = rand(2, 3)
    const chosen = [...types].sort(() => Math.random() - 0.5).slice(0, num)
    for (const b of chosen) {
      const val = rand(lo, hi)
      if (b === 'atk') result.atkBonus += val
      else if (b === 'magicAtk') result.magicAtkBonus += val
      else if (b === 'def') result.defBonus = val
      else if (b === 'magicDef') result.magicDefBonus = val
    }
  } else {
    const types = ['def', 'magicDef', 'hp', 'mp'] as const
    const num = rand(2, 3)
    const chosen = [...types].sort(() => Math.random() - 0.5).slice(0, num)
    for (const b of chosen) {
      const val = rand(lo, hi)
      if (b === 'def') result.defBonus = val
      else if (b === 'magicDef') result.magicDefBonus = val
      else if (b === 'hp') result.hpBonus = val * 5
      else if (b === 'mp') result.mpBonus = val * 3
    }
  }
  return result
}

// Roll a random equipment drop
export function rollEquipmentDrop(): EquipmentDrop | null {
  if (Math.random() > 0.6) return null
  const r = Math.random()
  let targetRarity: EquipmentDrop['rarity']
  if (r < 0.5) targetRarity = 'Common'
  else if (r < 0.8) targetRarity = 'Uncommon'
  else if (r < 0.95) targetRarity = 'Rare'
  else targetRarity = 'Epic'

  const candidates = ALL_TABLES.filter(e => e.rarity === targetRarity)
  const base = candidates[Math.floor(Math.random() * candidates.length)]
  if (!base) return null

  const isFruit = base.id.startsWith('fruit-')
  const isWeapon = base.id.startsWith('claw-') || base.id.startsWith('gada-') || base.id.startsWith('kapak-') || base.id.startsWith('knuckle-') || base.id.startsWith('busur-')
  const isAccessory = base.id.startsWith('kalung-') || base.id.startsWith('cincin-') || base.id.startsWith('topi-')
  const bonuses = rollEquipmentBonuses(targetRarity, isWeapon, isFruit, isAccessory)
  return { ...base, ...bonuses }
}

// Detect equipment slot from item name
export type EquipSlot = 'head' | 'body' | 'legs' | 'rightHand' | 'leftHand' | 'ring' | 'necklace'

export function detectSlot(itemName: string): EquipSlot {
  const n = itemName.toLowerCase()
  if (n.includes('baju') || n.includes('jubah') || n.includes('tunik') || n.includes('rompi')) return 'body'
  if (n.includes('celana') || n.includes('kaki')) return 'legs'
  if (n.includes('topi') || n.includes('helm') || n.includes('mahkota') || n.includes('ikat kepala') || n.includes('kupluk') || n.includes('caping') || n.includes('bandana') || n.includes('serban') || n.includes('tutup kepala')) return 'head'
  if (n.includes('perisai') || n.includes('tameng')) return 'leftHand'
  if (n.includes('cincin')) return 'ring'
  if (n.includes('kalung') || n.includes('gantungan')) return 'necklace'
  if (n.includes('claw') || n.includes('gada') || n.includes('kapak') || n.includes('knuckle') || n.includes('busur') || n.includes('keris') || n.includes('pedang') || n.includes('tongkat') || n.includes('panah')) return 'rightHand'
  return 'body'
}

export const SLOT_LABELS: Record<EquipSlot, { label: string; short: string; x: number; y: number; w: number; h: number }> = {
  head:      { label: 'Kepala (Helm/Topi)',      short: 'Kepala',  x: 40, y: 2,  w: 20, h: 16 },
  necklace:  { label: 'Kalung',                  short: 'Kalung',  x: 14, y: 18, w: 20, h: 16 },
  body:      { label: 'Badan (Baju/Zirah)',      short: 'Baju',    x: 40, y: 22, w: 20, h: 16 },
  rightHand: { label: 'Tangan Kanan (Senjata)',  short: 'Senjata', x: 66, y: 28, w: 20, h: 16 },
  leftHand:  { label: 'Tangan Kiri (Perisai)',   short: 'Perisai', x: 14, y: 36, w: 20, h: 16 },
  legs:      { label: 'Kaki (Celana)',           short: 'Celana',  x: 40, y: 44, w: 20, h: 16 },
  ring:      { label: 'Cincin',                  short: 'Cincin',  x: 66, y: 52, w: 20, h: 16 },
}

export const MERCHANT_CATEGORIES = [
  { key: 'all', label: 'Semua' },
  { key: 'baju', label: 'Baju' },
  { key: 'celana', label: 'Celana' },
  { key: 'claw', label: 'Claw' },
  { key: 'gada', label: 'Gada' },
  { key: 'kapak', label: 'Kapak' },
  { key: 'knuckle', label: 'Knuckle' },
  { key: 'claw-batu', label: 'Claw Batu' },
  { key: 'gada-batu', label: 'Gada Batu' },
  { key: 'kapak-batu', label: 'Kapak Batu' },
  { key: 'knuckle-batu', label: 'Knuckle Batu' },
  { key: 'busur-kayu', label: 'Busur Kayu' },
  { key: 'busur-besi', label: 'Busur Besi' },
  { key: 'perisai-kayu', label: 'Perisai Kayu' },
  { key: 'perisai-batu', label: 'Perisai Batu' },
  { key: 'perisai-besi', label: 'Perisai Besi' },
  { key: 'buah', label: 'Buah' },
  { key: 'kalung', label: 'Kalung' },
  { key: 'cincin', label: 'Cincin' },
  { key: 'topi', label: 'Topi' },
] as const

export function getBuyPrice(rarity: EquipmentDrop['rarity']): number {
  const prices: Record<EquipmentDrop['rarity'], number> = {
    'Common': 100, 'Uncommon': 300, 'Rare': 800, 'Epic': 2500,
  }
  return prices[rarity]
}

export function getSellPrice(rarity: EquipmentDrop['rarity']): number {
  return Math.floor(getBuyPrice(rarity) * 0.4)
}
