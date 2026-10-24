import type { DangerLevel } from './game-world'

export interface MonsterStats {
  level: number
  hp: number
  attack: number
  defense: number
  expReward: number
  goldReward: number
  image?: string
}

export interface MonsterMarker {
  id: string
  type: 'monster' | 'medium' | 'boss'
  name: string
  region?: string
  description: string
  danger: DangerLevel
  x: number
  y: number
  monster?: MonsterStats
}

export const MONSTERS: MonsterMarker[] = [
  {
    id: 'mon-ulat', type: 'monster', name: 'Ulat', region: 'Hutan Banten', danger: 'Aman', x: 8, y: 38,
    description: 'Ulat berduri hijau dengan mata merah menyala. Melumpuhkan mangsa dengan bulu beracun.',
    monster: { level: 1, hp: 180, attack: 40, defense: 10, expReward: 40, goldReward: 20, image: '/monsters/ulat.png' },
  },
  {
    id: 'mon-katak', type: 'monster', name: 'Katak Beracun', region: 'Rawa Bekasi', danger: 'Aman', x: 25, y: 40,
    description: 'Katak racun biru-kuning. Sekresi kulitnya melumpuhkan dewasa dalam hitungan detik.',
    monster: { level: 2, hp: 240, attack: 60, defense: 20, expReward: 55, goldReward: 30, image: '/monsters/katak-beracun.png' },
  },
  {
    id: 'mon-cobra', type: 'monster', name: 'Ular Cobra', region: 'Padang Banten', danger: 'Aman', x: 12, y: 52,
    description: 'Cobra ungu raksasa dengan tudung mengembang. Bisanya merusak darah dengan cepat.',
    monster: { level: 3, hp: 300, attack: 80, defense: 20, expReward: 70, goldReward: 40, image: '/monsters/ular-cobra.png' },
  },
  {
    id: 'mon-sarang-lebah', type: 'monster', name: 'Sarang Lebah', region: 'Pohon Jati', danger: 'Aman', x: 18, y: 35,
    description: 'Sarang lebah madu emas yang dijaga puluhan lebah merah bermata. Menyerang berkelompok.',
    monster: { level: 2, hp: 280, attack: 50, defense: 30, expReward: 60, goldReward: 50, image: '/monsters/sarang-lebah.png' },
  },
  {
    id: 'mon-anak-beruang', type: 'monster', name: 'Anak Beruang', region: 'Hutan Bandung', danger: 'Aman', x: 30, y: 50,
    description: 'Beruang muda berpakaian zirah kulit. Cakarnya masih kecil tapi sudah mematikan.',
    monster: { level: 4, hp: 450, attack: 100, defense: 40, expReward: 95, goldReward: 60, image: '/monsters/anak-beruang.png' },
  },
  {
    id: 'mon-kucing-gila', type: 'monster', name: 'Kucing Gila', region: 'Alley Jakarta', danger: 'Aman', x: 22, y: 28,
    description: 'Kucing ungu liar dengan mata berbeda warna. Menggigit tanpa peringatan.',
    monster: { level: 2, hp: 200, attack: 70, defense: 10, expReward: 55, goldReward: 30, image: '/monsters/kucing-gila.png' },
  },
  {
    id: 'mon-kambing', type: 'monster', name: 'Kambing', region: 'Bukit Bandung', danger: 'Aman', x: 33, y: 55,
    description: 'Kambing gunung bertanduk besar melengkung. Menanduk dengan kekuatan penuh.',
    monster: { level: 3, hp: 350, attack: 90, defense: 30, expReward: 75, goldReward: 50, image: '/monsters/kambing.png' },
  },
  {
    id: 'mon-lintah', type: 'monster', name: 'Lintah', region: 'Rawa Bekasi', danger: 'Aman', x: 28, y: 42,
    description: 'Lintah raksasa berwarna gelap dengan mulut pengisap penuh gigi. Menghisap darah.',
    monster: { level: 1, hp: 160, attack: 50, defense: 10, expReward: 40, goldReward: 20, image: '/monsters/lintah.png' },
  },
  {
    id: 'mon-belut-listrik', type: 'monster', name: 'Belut Listrik', region: 'Sungai Semarang', danger: 'Aman', x: 47, y: 35,
    description: 'Belut biru yang mengeluarkan arus listrik. Sengatannya membuat otot kaku.',
    monster: { level: 4, hp: 400, attack: 110, defense: 20, expReward: 90, goldReward: 60, image: '/monsters/belut-listrik.png' },
  },
  {
    id: 'mon-tupai', type: 'monster', name: 'Tupai', region: 'Hutan Solo', danger: 'Aman', x: 60, y: 62,
    description: 'Tupai oranye berikat hijau yang mencuri makanan pengembara. Cepat dan sulit ditangkap.',
    monster: { level: 1, hp: 140, attack: 40, defense: 10, expReward: 35, goldReward: 40, image: '/monsters/tupai.png' },
  },
  {
    id: 'mon-kumbang-tanduk', type: 'monster', name: 'Kumbang Tanduk', region: 'Hutan Yogyakarta', danger: 'Aman', x: 51, y: 65,
    description: 'Kumbang badak hitam-merah sebesar anjing. Tanduknya dapat mengangkat batu.',
    monster: { level: 5, hp: 550, attack: 120, defense: 60, expReward: 110, goldReward: 80, image: '/monsters/kumbang-tanduk.png' },
  },
  {
    id: 'mon-kumbang-tahi', type: 'monster', name: 'Kumbang Tahi', region: 'Padang Surabaya', danger: 'Aman', x: 73, y: 52,
    description: 'Kumbang tahi gelap yang menggelindingkan bola panas. Bau busuknya memusingkan.',
    monster: { level: 3, hp: 320, attack: 70, defense: 50, expReward: 70, goldReward: 40, image: '/monsters/kumbang-tahi.png' },
  },
  {
    id: 'mon-kelinci', type: 'monster', name: 'Kelinci', region: 'Padang Banten', danger: 'Aman', x: 10, y: 44,
    description: 'Kelinci putih bermata merah berbandana merah. Cakarnya tajam dan gigitannya mematikan.',
    monster: { level: 2, hp: 220, attack: 60, defense: 20, expReward: 55, goldReward: 30, image: '/monsters/kelinci.png' },
  },
  {
    id: 'mon-ular', type: 'monster', name: 'Ular', region: 'Semak Tangerang', danger: 'Aman', x: 16, y: 40,
    description: 'Ular hijau-kuning bercahaya dengan taring berbisa. Sering melilit batang pohon.',
    monster: { level: 3, hp: 280, attack: 80, defense: 20, expReward: 70, goldReward: 40, image: '/monsters/ular.png' },
  },
  {
    id: 'mon-ayam', type: 'monster', name: 'Ayam', region: 'Dukuh Bandung', danger: 'Aman', x: 31, y: 48,
    description: 'Ayam jago api dengan bulu merah-oranye menyala. Cakar bercahaya dan paruh mematikan.',
    monster: { level: 4, hp: 380, attack: 110, defense: 30, expReward: 90, goldReward: 60, image: '/monsters/ayam.png' },
  },
  {
    id: 'mon-tikus', type: 'monster', name: 'Tikus', region: 'Selokan Jakarta', danger: 'Aman', x: 24, y: 30,
    description: 'Tikus gelap bermata merah dengan gigi tajam. Muncul dari asap ungu menyerang berkelompok.',
    monster: { level: 1, hp: 150, attack: 50, defense: 10, expReward: 30, goldReward: 20, image: '/monsters/tikus.png' },
  },
  {
    id: 'mon-babi', type: 'monster', name: 'Babi', region: 'Hutan Bandung', danger: 'Aman', x: 35, y: 52,
    description: 'Babi hutan berzirah bahu dengan taring putih besar. Menyeruduk dengan kekuatan liar.',
    monster: { level: 5, hp: 500, attack: 130, defense: 50, expReward: 105, goldReward: 70, image: '/monsters/babi.png' },
  },
  {
    id: 'mon-anjing-galak', type: 'monster', name: 'Anjing Galak', region: 'Lorong Jakarta', danger: 'Aman', x: 21, y: 36,
    description: 'Anjing hitam berantai yang berkeliaran di lorong gelap. Mata merah dan air liur berbisa.',
    monster: { level: 4, hp: 420, attack: 120, defense: 30, expReward: 90, goldReward: 60, image: '/monsters/anjing-galak.png' },
  },
  {
    id: 'mon-landak', type: 'monster', name: 'Landak', region: 'Bukit Semarang', danger: 'Aman', x: 45, y: 38,
    description: 'Landak ungu dengan duri biru-ungu bercahaya listrik. Dapat menembakkan duri.',
    monster: { level: 3, hp: 340, attack: 70, defense: 60, expReward: 75, goldReward: 50, image: '/monsters/landak.png' },
  },
  {
    id: 'mon-trenggiling', type: 'monster', name: 'Trenggiling', region: 'Tanah Solo', danger: 'Aman', x: 56, y: 54,
    description: 'Trenggiling bersisik tebal yang menggali tanah dengan cakar kuat. Sisiknya keras seperti zirah.',
    monster: { level: 4, hp: 480, attack: 90, defense: 70, expReward: 90, goldReward: 70, image: '/monsters/trenggiling.png' },
  },
  {
    id: 'mon-monyet', type: 'monster', name: 'Monyet', region: 'Hutan Yogyakarta', danger: 'Aman', x: 50, y: 58,
    description: 'Monyet prajurit berikat merah dengan tongkat bercahaya. Pandai beladiri.',
    monster: { level: 5, hp: 520, attack: 120, defense: 40, expReward: 105, goldReward: 80, image: '/monsters/monyet.png' },
  },
  {
    id: 'mon-lebah', type: 'monster', name: 'Lebah', region: 'Pohon Surabaya', danger: 'Aman', x: 70, y: 44,
    description: 'Lebah raksasa bermata merah dengan sengat berbisa. Terbang cepat menyerang berkelompok.',
    monster: { level: 3, hp: 300, attack: 90, defense: 20, expReward: 70, goldReward: 60, image: '/monsters/lebah.png' },
  },
  {
    id: 'mon-kelelawar', type: 'monster', name: 'Kelelawar', region: 'Gua Malang', danger: 'Aman', x: 77, y: 58,
    description: 'Kelelawar bermata merah dengan taring tajam. Menyerang dari udara dengan aura biru.',
    monster: { level: 4, hp: 360, attack: 110, defense: 30, expReward: 85, goldReward: 60, image: '/monsters/kelelawar.png' },
  },
  {
    id: 'mon-kalajengking', type: 'monster', name: 'Kalajengking', region: 'Padang Malang', danger: 'Aman', x: 80, y: 65,
    description: 'Kalajengking hitam raksasa dengan ekor bercahaya hijau. Sengatnya menembus zirah tipis.',
    monster: { level: 5, hp: 460, attack: 140, defense: 50, expReward: 110, goldReward: 90, image: '/monsters/kalajengking.png' },
  },
]

// ===== Boss Monsters (Monster Raksasa) — Level 50, very strong =====
export const BOSS_MONSTERS: MonsterMarker[] = [
  {
    id: 'boss-elang-raksasa', type: 'boss', name: 'Elang Raksasa', region: 'Langit Banten', danger: 'Maut', x: 9, y: 11,
    description: 'Elang raksasa bermata merah yang mengepakkan sayap selebar 50 meter. Badai tercipta dari kepakan sayapnya.',
    monster: { level: 50, hp: 15000, attack: 800, defense: 300, expReward: 600, goldReward: 2000, image: '/monsters/boss-elang-raksasa.png' },
  },
  {
    id: 'boss-naga-merah', type: 'boss', name: 'Naga Merah', region: 'Laut Jawa', danger: 'Maut', x: 66, y: 19,
    description: 'Naga merah kuno yang menghembuskan api mampu melelehkan zirah baja. Penguasa Laut Jawa.',
    monster: { level: 55, hp: 25000, attack: 1200, defense: 400, expReward: 950, goldReward: 3500, image: '/monsters/boss-naga-merah.png' },
  },
  {
    id: 'boss-naga-air-biru', type: 'boss', name: 'Naga Air Biru', region: 'Samudra Hindia', danger: 'Maut', x: 35, y: 86,
    description: 'Naga air biru raksasa yang menguasai samudra. Pusaran airnya menelan kapal perang dalam sekejap.',
    monster: { level: 53, hp: 22000, attack: 1000, defense: 500, expReward: 850, goldReward: 3000, image: '/monsters/boss-naga-air-biru.png' },
  },
  {
    id: 'boss-hiu-ganas', type: 'boss', name: 'Hiu Ganas', region: 'Samudra Hindia', danger: 'Maut', x: 60, y: 88,
    description: 'Hiu putih raksasa sepanjang 30 meter. Gigi sebesar pedang dan rahang yang dapat menghancurkan kapal.',
    monster: { level: 50, hp: 18000, attack: 950, defense: 350, expReward: 650, goldReward: 2500, image: '/monsters/boss-hiu-ganas.png' },
  },
  {
    id: 'boss-kalajengking-merah', type: 'boss', name: 'Kalajengking Merah', region: 'Padang Malang', danger: 'Maut', x: 89, y: 67,
    description: 'Kalajengking merah raksasa sebesar rumah. Sengat beracunnya mampu mematikan seluruh pasukan.',
    monster: { level: 52, hp: 20000, attack: 1100, defense: 450, expReward: 800, goldReward: 2800, image: '/monsters/boss-kalajengking-merah.png' },
  },
  {
    id: 'boss-lipan-raksasa', type: 'boss', name: 'Lipan Raksasa', region: 'Gua Jawa Tengah', danger: 'Maut', x: 65, y: 50,
    description: 'Lipan raksasa berbisa sepanjang 40 meter. Setiap kakinya memiliki cakar berbisa mematikan.',
    monster: { level: 51, hp: 19000, attack: 900, defense: 400, expReward: 700, goldReward: 2600, image: '/monsters/boss-lipan-raksasa.png' },
  },
  {
    id: 'boss-kura-kura-raksasa', type: 'boss', name: 'Kura-kura Raksasa', region: 'Selat Madura', danger: 'Maut', x: 85, y: 42,
    description: 'Kura-kura raksasa berusia ribuan tahun. Cangkangnya keras seperti batu karang, tak tertembus senjata biasa.',
    monster: { level: 54, hp: 30000, attack: 700, defense: 800, expReward: 900, goldReward: 3200, image: '/monsters/boss-kura-kura-raksasa.png' },
  },
]

// ===== Medium Monsters (Monster Sedang) — Level 15-30, intermediate challenge =====
export const MEDIUM_MONSTERS: MonsterMarker[] = [
  {
    id: 'med-macan-kumbah', type: 'medium', name: 'Macan Kumbah', region: 'Hutan Banten', danger: 'Waspada', x: 6, y: 52,
    description: 'Panther hitam misterius dengan mata menyala hijau. Menghilang dalam bayang-bayang hutan dan menyerang tanpa peringatan.',
    monster: { level: 18, hp: 850, attack: 220, defense: 95, expReward: 410, goldReward: 120, image: '/monsters/macan-kumbah.png' },
  },
  {
    id: 'med-serigala-putih', type: 'medium', name: 'Serigala Salju', region: 'Pegunungan Malang', danger: 'Waspada', x: 70, y: 70,
    description: 'Serigala putih legendaris dari puncak gunung. Bulunya bercahaya dalam gelap dan taringnya mampu merobek baja tipis.',
    monster: { level: 15, hp: 720, attack: 195, defense: 85, expReward: 340, goldReward: 100, image: '/monsters/serigala-putih.png' },
  },
  {
    id: 'med-kepiting-raksasa', type: 'medium', name: 'Kepiting Raksasa', region: 'Pantai Selatan', danger: 'Berbahaya', x: 38, y: 78,
    description: 'Kepiting raksasa sebesar kereta. Cangkangnya keras seperti batu karang, capitnya dapat memotong pohon dewasa.',
    monster: { level: 22, hp: 1400, attack: 280, defense: 200, expReward: 580, goldReward: 180, image: '/monsters/kepiting-raksasa.png' },
  },
  {
    id: 'med-lebah-beracun', type: 'medium', name: 'Lebah Beracun Besar', region: 'Hutan Solo', danger: 'Berbahaya', x: 56, y: 56,
    description: 'Ratu lebah beracun seukuran anjing. Sengatnya mengandung racun yang melumpuhkan dalam hitungan menit.',
    monster: { level: 20, hp: 1050, attack: 320, defense: 110, expReward: 490, goldReward: 150, image: '/monsters/lebah-beracun-besar.png' },
  },
  {
    id: 'med-banteng', type: 'medium', name: 'Banteng Liar', region: 'Padang Jawa Timur', danger: 'Berbahaya', x: 68, y: 56,
    description: 'Banteng jantan liar dengan tanduk melengkung tajam. Mengamuk menghancurkan segala yang menghalangi jalannya.',
    monster: { level: 25, hp: 1800, attack: 350, defense: 220, expReward: 730, goldReward: 220, image: '/monsters/banteng.png' },
  },
  {
    id: 'med-rusa-tanduk-12', type: 'medium', name: 'Rusa Tanduk 12', region: 'Hutan Yogyakarta', danger: 'Waspada', x: 49, y: 70,
    description: 'Rusa mistis dengan tanduk bercabang dua belas yang bercahaya. Konon peliharaan dewi hutan, melindungi tanah sucinya.',
    monster: { level: 17, hp: 800, attack: 200, defense: 130, expReward: 380, goldReward: 140, image: '/monsters/rusa-tanduk-12.png' },
  },
  {
    id: 'med-gorila', type: 'medium', name: 'Gorila Pemarah', region: 'Hutan Sumatera', danger: 'Berbahaya', x: 18, y: 70,
    description: 'Gorila raksasa bermata merah yang selalu mengamuk. Pukulan tangannya menghancurkan batu besar.',
    monster: { level: 28, hp: 2400, attack: 420, defense: 280, expReward: 880, goldReward: 280, image: '/monsters/gorila.png' },
  },
  {
    id: 'med-anjing-herder', type: 'medium', name: 'Anjing Herder', region: 'Luar Kota Jakarta', danger: 'Waspada', x: 27, y: 24,
    description: 'Anjing herder peliharaan penjaga yang menjadi liar. Cerdas dan bekerja dalam kelompok untuk mengepung mangsa.',
    monster: { level: 19, hp: 920, attack: 240, defense: 100, expReward: 430, goldReward: 130, image: '/monsters/anjing-herder.png' },
  },
  {
    id: 'med-anjing-shepherd', type: 'medium', name: 'Anjing Shepherd Petir', region: 'Padang Jawa Tengah', danger: 'Berbahaya', x: 45, y: 60,
    description: 'Anjing shepherd berbulu petir yang mampu berlari secepat kilat. Gigitannya membawa setrum listrik.',
    monster: { level: 24, hp: 1500, attack: 360, defense: 180, expReward: 670, goldReward: 200, image: '/monsters/anjing-shepherd.png' },
  },
  {
    id: 'med-buaya-putih', type: 'medium', name: 'Buaya Putih', region: 'Sungai Mahakam', danger: 'Berbahaya', x: 8, y: 78,
    description: 'Buaya putih albino raksasa dari sungai dalam. Konon telah menelan banyak pengembara yang berani menyeberang sungainya.',
    monster: { level: 27, hp: 2100, attack: 400, defense: 260, expReward: 820, goldReward: 260, image: '/monsters/buaya-putih.png' },
  },
  {
    id: 'med-gajah-putih', type: 'medium', name: 'Gajah Putih', region: 'Hutan Sumatera Selatan', danger: 'Maut', x: 14, y: 84,
    description: 'Gajah putih suci yang dipercaya sebagai titisan dewa. Belalainya dapat mencabut pohon dewasa, dan tubuhnya tak tergoyahkan.',
    monster: { level: 30, hp: 3200, attack: 480, defense: 350, expReward: 1020, goldReward: 350, image: '/monsters/gajah-putih.png' },
  },
  {
    id: 'med-gagak-mata-merah', type: 'medium', name: 'Gagak Mata Merah', region: 'Kuburan Jawa Barat', danger: 'Waspada', x: 30, y: 36,
    description: 'Gagak bermata merah yang muncul di tempat-tempat kematian. Konon pembawa roh mati, paruhnya tajam seperti pisau.',
    monster: { level: 16, hp: 680, attack: 210, defense: 80, expReward: 320, goldReward: 110, image: '/monsters/gagak-mata-merah.png' },
  },
]
