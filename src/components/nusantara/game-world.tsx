'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  LogOut, MapPin, Sparkles, ScrollText, X, Compass, Skull, Navigation, Bug, Fish, Bird, Save,
  Sword, Shield, Heart, Zap, Star, Coins, Backpack, CircleDot, Trash2, Shirt, Store,
  MessageCircle, Send, AtSign, Gift, TreePine, Anvil, Footprints, Gem, Loader2,
  GraduationCap, BookOpen, Lock, CheckCircle2, Hammer, Flame, Home,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import type { CharacterData } from './character-creation'
import { AKADEMI_CITIES, type SkillProgress, isSkillUnlocked, isSkillMastered } from './akademi-data'
import { MONSTERS, BOSS_MONSTERS, MEDIUM_MONSTERS } from './monster-data'
import {
  type EquipmentDrop, RARITY_COLORS, rollEquipmentDrop, detectSlot, type EquipSlot,
  SLOT_LABELS, MERCHANT_CATEGORIES, getBuyPrice, getSellPrice,
  ALL_TABLES, EQUIPMENT_TABLE, CELANA_TABLE, FRUIT_TABLE, CLAW_TABLE, GADA_TABLE,
  KAPAK_TABLE, KNUCKLE_TABLE, CLAW_BATU_TABLE, GADA_BATU_TABLE, KAPAK_BATU_TABLE,
  KNUCKLE_BATU_TABLE, KALUNG_TABLE, CINCIN_TABLE, TOPI_TABLE,
  rollEquipmentBonuses,
} from './equipment-data'

interface GameWorldProps {
  user: { id: string; name: string; email: string; provider: string }
  character: CharacterData
  onLogout: () => void
  onDeleteCharacter: () => void
}

const CLASS_LABELS: Record<CharacterData['classCode'], string> = {
  ksatria: 'Ksatria', pendekar: 'Pendekar', dukun: 'Dukun', pemanah: 'Pemanah',
}

interface ClassStats { STR: number; VIT: number; AGI: number; INT: number; LUCK: number }

const STAT_LABELS: { code: keyof ClassStats; label: string; full: string; color: string; desc: string }[] = [
  { code: 'STR', label: 'STR', full: 'Kekuatan', color: '#ef4444', desc: 'ATK fisik' },
  { code: 'VIT', label: 'VIT', full: 'Vitalitas', color: '#22c55e', desc: 'HP & DEF' },
  { code: 'AGI', label: 'AGI', full: 'Kelincahan', color: '#f0a500', desc: 'Kecepatan & lari' },
  { code: 'INT', label: 'INT', full: 'Kecerdasan', color: '#3b82f6', desc: 'MP & magic' },
  { code: 'LUCK', label: 'LUCK', full: 'Keberuntungan', color: '#a855f7', desc: 'Drop rate & crit' },
]

const INVENTORY_CAPACITY = 15

type DangerLevel = 'Aman' | 'Waspada' | 'Berbahaya' | 'Maut'
const DANGER_COLORS: Record<DangerLevel, string> = {
  'Aman': '#22c55e', 'Waspada': '#f0a500', 'Berbahaya': '#ef4444', 'Maut': '#a855f7',
}

// Existing map markers (cities, skulls, creatures) — kept from current file
type MapMarkerType = 'city' | 'skull' | 'boss' | 'monster' | 'medium'
interface MapMarker {
  id: string; type: MapMarkerType; name: string; region?: string
  description: string; danger: DangerLevel; x: number; y: number
  icon?: string
  monster?: { level: number; hp: number; attack: number; defense: number; expReward: number; goldReward: number; image?: string }
}

// Import existing markers from current file — we'll merge with MONSTERS
// For brevity, I'll reference them inline
const CITY_MARKERS: MapMarker[] = [
  { id: 'serang', type: 'city', name: 'Serang', region: 'Banten', description: 'Pelabuhan barat gerbang Sunda.', danger: 'Waspada', x: 10, y: 34 },
  { id: 'tangerang', type: 'city', name: 'Tangerang', region: 'Banten', description: 'Kota dagang pinggiran hutan jati.', danger: 'Waspada', x: 15, y: 29 },
  { id: 'jakarta', type: 'city', name: 'Jakarta', region: 'DKI Jakarta', description: 'Kota pelabuhan Sunda Kelapa.', danger: 'Berbahaya', x: 20, y: 32 },
  { id: 'bekasi', type: 'city', name: 'Bekasi', region: 'Jawa Barat', description: 'Daerah persawahan dan rawa.', danger: 'Aman', x: 23, y: 38 },
  { id: 'bandung', type: 'city', name: 'Bandung', region: 'Jawa Barat', description: 'Lembah pegunungan, pusat beladiri silat.', danger: 'Aman', x: 27, y: 45 },
  { id: 'semarang', type: 'city', name: 'Semarang', region: 'Jawa Tengah', description: 'Pelabuhan utara yang sibuk.', danger: 'Waspada', x: 49, y: 41 },
  { id: 'yogyakarta', type: 'city', name: 'Yogyakarta', region: 'D.I. Yogyakarta', description: 'Keraton pusat kebudayaan Jawa.', danger: 'Aman', x: 53, y: 61 },
  { id: 'solo', type: 'city', name: 'Surakarta (Solo)', region: 'Jawa Tengah', description: 'Kota seniman dan batik.', danger: 'Aman', x: 58, y: 57 },
  { id: 'surabaya', type: 'city', name: 'Surabaya', region: 'Jawa Timur', description: 'Kota pelabuhan timur yang garang.', danger: 'Berbahaya', x: 76, y: 48 },
  { id: 'malang', type: 'city', name: 'Malang', region: 'Jawa Timur', description: 'Pegunungan sejuk dengan kuil tersembunyi.', danger: 'Maut', x: 74, y: 62 },
]

const SKULL_MARKERS: MapMarker[] = [
  { id: 'skull-jakarta', type: 'skull', name: 'Monster Tengkorak', region: 'Kuburan Jakarta', description: 'Tengkorak purba yang diselimuti api ungu, memegang pedang bengkok. Berdiri di atas tumpukan tulang belulang di dataran kematian utara Jakarta.', danger: 'Maut', x: 33, y: 24, monster: { level: 60, hp: 4800, attack: 950, defense: 380, expReward: 1100, goldReward: 500, image: '/monsters/tengkorak.png' } },
  { id: 'skull-laut-1', type: 'skull', name: 'Ular Kobra Kepala 2', region: 'Perairan Terkutuk', description: 'Cobra raksasa berkepala dua dengan tudung mengembang. Bisanya mencemari perairan utara Jawa Tengah, melumpuhkan mangsa dalam hitungan detik.', danger: 'Maut', x: 54, y: 23, monster: { level: 60, hp: 4500, attack: 1200, defense: 320, expReward: 1050, goldReward: 550, image: '/monsters/kobra-kepala-2.png' } },
  { id: 'skull-laut-2', type: 'skull', name: 'Monster Kepala 2', region: 'Kuburan Laut Timur', description: 'Monster berser dua kepala — serigala dan singa — yang muncul dari kuburan laut timur. Setiap kepala dapat menggigit secara bergantian.', danger: 'Maut', x: 75, y: 22, monster: { level: 63, hp: 5500, attack: 1150, defense: 420, expReward: 1250, goldReward: 650, image: '/monsters/monster-kepala-2.png' } },
  { id: 'skull-banten', type: 'skull', name: 'Pendekar Santet', region: 'Tanah Santet Banten', description: 'Penyihir berjubah hitam yang menguasai ilmu santet. Voodoo-voodoo melayang di sekelilingnya, siap menanam kutukan pada siapa pun yang mendekati hutan gelap Banten.', danger: 'Berbahaya', x: 13, y: 47, monster: { level: 60, hp: 4200, attack: 1400, defense: 280, expReward: 1150, goldReward: 800, image: '/monsters/pendekar-santet.png' } },
  { id: 'skull-jawa-barat', type: 'skull', name: 'Siluman Setengah Kerbau', region: 'Hutan Kutukan', description: 'Iblis berkepala kerbau dengan tubuh manusia, mengayunkan kapak perang di tengah hutan kutukan selatan Bandung. Latar belakangnya menyala api merah.', danger: 'Berbahaya', x: 24, y: 46, monster: { level: 60, hp: 5200, attack: 1250, defense: 350, expReward: 1200, goldReward: 600, image: '/monsters/siluman-kerbau.png' } },
  { id: 'skull-jawa-tengah', type: 'skull', name: 'Buto Ijo Raksasa', region: 'Padang Pasir Mati', description: 'Buto Ijo raksasa seukuran bukit, mengayunkan gada berduri di padang pasir mati tengah Jawa. Kulit hijaunya tebal seperti baja, rentan hanya pada sihir tingkat tinggi.', danger: 'Berbahaya', x: 42, y: 51, monster: { level: 62, hp: 6500, attack: 1000, defense: 550, expReward: 1350, goldReward: 700, image: '/monsters/buto-ijo.png' } },
  { id: 'skull-jawa-timur', type: 'skull', name: 'Naga Emas', region: 'Kawah Setan', description: 'Naga emas legendaris yang bersarang di kawah setan Jawa Timur. Tubuhnya diselimuti kilat dan petir, setiap napasnya memuntahkan api emas yang membakar langit.', danger: 'Maut', x: 72, y: 48, monster: { level: 65, hp: 7200, attack: 1300, defense: 500, expReward: 1700, goldReward: 1000, image: '/monsters/naga-emas.png' } },
]

// Merge all markers — boss monsters replace old creature markers
const MARKERS: MapMarker[] = [...CITY_MARKERS, ...SKULL_MARKERS, ...BOSS_MONSTERS.map(m => ({ ...m, type: 'boss' as MapMarkerType })), ...MEDIUM_MONSTERS.map(m => ({ ...m, type: 'medium' as MapMarkerType })), ...MONSTERS.map(m => ({ ...m, type: 'monster' as MapMarkerType }))]

export function GameWorld({ user, character, onLogout, onDeleteCharacter }: GameWorldProps) {
  const { toast } = useToast()

  // ===== Core state =====
  const [mapOpen, setMapOpen] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [battleModalOpen, setBattleModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'city' | 'skull' | 'boss' | 'monster' | 'medium'>('all')
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [equipmentOpen, setEquipmentOpen] = useState(false)
  const [merchantOpen, setMerchantOpen] = useState(false)
  const [blacksmithOpen, setBlacksmithOpen] = useState(false)
  const [blacksmithItem, setBlacksmithItem] = useState<number | null>(null)
  const [blacksmithTab, setBlacksmithTab] = useState<'forge' | 'dismantle'>('forge')
  const [dismantleItem, setDismantleItem] = useState<number | null>(null)
  const [forgeAnimation, setForgeAnimation] = useState<'idle' | 'forging' | 'success' | 'fail' | 'destroy'>('idle')
  const [dismantleAnimation, setDismantleAnimation] = useState<'idle' | 'working' | 'done'>('idle')
  const [homeOpen, setHomeOpen] = useState(false)
  const [homeFacilities, setHomeFacilities] = useState({
    dapur: 0,        // Magic regen
    gym: 0,          // ATK + DEF
    inkubasi: 0,     // Pet (under development)
    kamarMandi: 0,   // HP regen
    kasur: 0,        // Energy (under development)
    kebun: 0,        // Fruit planting (under development)
    kolamIkan: 0,    // Fish pond (under development)
    kotak: 0,        // Storage box (extra inventory capacity)
  })
  const [homeFacilityAnimation, setHomeFacilityAnimation] = useState<string | null>(null)
  // Kebun sub-items: 3 sequential tiers (biasa → bagus → mewah) with 3/6/9 planting slots
  const [kebunSubItems, setKebunSubItems] = useState<number[]>([0, 0, 0])
  const [kebunSubOpen, setKebunSubOpen] = useState(false)
  // Kolam Ikan sub-items: 5 sequential tiers with fish breeding slots
  const [kolamSubItems, setKolamSubItems] = useState<number[]>([0, 0, 0, 0, 0])
  const [kolamSubOpen, setKolamSubOpen] = useState(false)
  const [kolamPlanted, setKolamPlanted] = useState<(null | { fishName: string; fishIcon: string; fishImage?: string; qty: number; plantedAt: number })[]>(Array(22).fill(null))
  const [kolamTick, setKolamTick] = useState(0)
  // Inkubasi (Pet) system
  const [inkubasiSubOpen, setInkubasiSubOpen] = useState(false)
  // Pet slots: up to 3 pets stored, 1 equipped
  // Each pet: { name, monsterType, level, exp, hp, hpMax, attack, defense, image, isHatched }
  type PetData = {
    id: string
    name: string
    monsterType: 'monster' | 'medium' | 'boss' | 'skull'
    level: number
    exp: number
    hp: number
    hpMax: number
    attack: number
    defense: number
    image?: string
    isHatched: boolean
  }
  const [petSlots, setPetSlots] = useState<(PetData | null)[]>([null, null, null])
  const [equippedPetIndex, setEquippedPetIndex] = useState<number | null>(null)
  const [petHatchPopup, setPetHatchPopup] = useState<{ petName: string; petType: string } | null>(null)
  // Kotak Penyimpanan (Storage Box) sub-items: 4 tiers
  const [kotakSubItems, setKotakSubItems] = useState<number[]>([0, 0, 0, 0])
  const [kotakSubOpen, setKotakSubOpen] = useState(false)
  // Separate storage box inventory (items stored in the box, NOT in player's main inventory)
  const [kotakStorage, setKotakStorage] = useState<{ name: string; icon: string; qty: number; desc?: string; image?: string; rarity?: EquipmentDrop['rarity']; id?: string; forgeLevel?: number; baseBonuses?: any; isFish?: boolean; isEgg?: boolean; eggLevel?: number; eggMonsterName?: string; tameTarget?: string }[]>([])
  // Gold stored in storage box (vault)
  const [kotakGold, setKotakGold] = useState(0)
  const [kotakGoldInput, setKotakGoldInput] = useState('')
  // Dapur sub-items: 6 sequential upgrades, each with progress 0-100
  const [dapurSubItems, setDapurSubItems] = useState<number[]>([0, 0, 0, 0, 0, 0])
  const [dapurSubOpen, setDapurSubOpen] = useState(false)
  // Kasur sub-items: 6 sequential upgrades
  const [kasurSubItems, setKasurSubItems] = useState<number[]>([0, 0, 0, 0, 0, 0])
  const [kasurSubOpen, setKasurSubOpen] = useState(false)
  // Gym sub-items: 4 sequential upgrades
  const [gymSubItems, setGymSubItems] = useState<number[]>([0, 0, 0, 0])
  const [gymSubOpen, setGymSubOpen] = useState(false)
  // Kamar Mandi sub-items: 6 sequential upgrades
  const [mandiSubItems, setMandiSubItems] = useState<number[]>([0, 0, 0, 0, 0, 0])
  const [mandiSubOpen, setMandiSubOpen] = useState(false)
  // Planting slots: up to 9 slots (3 per tier completed). Each slot holds a planted fruit or null.
  const [kebunPlanted, setKebunPlanted] = useState<(null | { fruitName: string; fruitIcon: string; fruitImage?: string; qty: number; plantedAt: number })[]>(Array(9).fill(null))
  const [kebunDragIndex, setKebunDragIndex] = useState<number | null>(null)
  const [kebunTick, setKebunTick] = useState(0) // forces re-render every 10s for countdown
  // GM panel state
  const [gmOpen, setGmOpen] = useState(false)
  const [gmAuthed, setGmAuthed] = useState(false)
  const [gmPassword, setGmPassword] = useState('')
  const [gmPasswordError, setGmPasswordError] = useState(false)
  const [gmTargetName, setGmTargetName] = useState('')
  const [gmAmount, setGmAmount] = useState('100')
  const [merchantTab, setMerchantTab] = useState<'buy' | 'sell'>('buy')
  const [merchantCategory, setMerchantCategory] = useState<string>('all')
  const [merchantSelectedItem, setMerchantSelectedItem] = useState<EquipmentDrop | null>(null)
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(true)
  // Akademi (Berguru) state
  const [akademiOpen, setAkademiOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null) // city id once chosen
  const [skillProgress, setSkillProgress] = useState<SkillProgress>({})
  const [equippedSkill, setEquippedSkill] = useState<string | null>(null) // skill id currently equipped
  const [skillDetailView, setSkillDetailView] = useState<string | null>(null) // city id for skill detail view
  const [shake, setShake] = useState(false)
  const [monsterHit, setMonsterHit] = useState(false)
  const [droppedEquipment, setDroppedEquipment] = useState<EquipmentDrop | null>(null)
  const [selectedItem, setSelectedItem] = useState<{ name: string; icon: string; qty: number; index: number; desc?: string; image?: string; rarity?: EquipmentDrop['rarity'] } | null>(null)

  // ===== Character stats =====
  const [playerStats, setPlayerStats] = useState<ClassStats>({ STR: 1, VIT: 1, AGI: 1, INT: 1, LUCK: 1 })
  const [statPoints, setStatPoints] = useState(0)
  const [level, setLevel] = useState(1)
  const [totalExp, setTotalExp] = useState(0)

  const cumulativeExpForLevel = (lvl: number) => {
    if (lvl <= 1) return 0
    let sum = 0
    for (let i = 1; i < lvl; i++) sum += Math.floor(100 * i * 1.5)
    return sum
  }
  // Helper: compute the highest level achievable from a given totalExp (capped at 99)
  const computeLevelFromExp = (exp: number) => {
    let lvl = 1
    while (lvl < 99 && cumulativeExpForLevel(lvl + 1) <= exp) lvl++
    return lvl
  }
  const expThisLevelBase = cumulativeExpForLevel(level)
  const expNextLevelBase = cumulativeExpForLevel(level + 1)
  const expIntoCurrentLevel = totalExp - expThisLevelBase
  const expNeededForNext = expNextLevelBase - expThisLevelBase
  const expProgressPct = Math.min(100, (expIntoCurrentLevel / expNeededForNext) * 100)

  const hpMax = playerStats.VIT * 60 + 100 + (level - 1) * 30
  const mpMax = playerStats.INT * 40 + 30 + (level - 1) * 20
  const [hpCurrent, setHpCurrent] = useState(hpMax)
  const [mpCurrent, setMpCurrent] = useState(mpMax)
  const [gold, setGold] = useState(50)
  const [lives, setLives] = useState(3) // Life system — 3 lives
  const [stamina, setStamina] = useState(100) // Stamina 0-100, regen 10% per hour

  // Materials
  const [materials, setMaterials] = useState({ kayu: 0, besi: 0, kulit: 0, permata: 0, emas: 0, batuMeteor: 0 })

  // Inventory — item type with optional forgeLevel & base bonuses for blacksmith upgrades
  type InvItem = {
    name: string; icon: string; qty: number; desc?: string; image?: string; rarity?: EquipmentDrop['rarity']
    id?: string  // base item id (for matching equipment tables)
    forgeLevel?: number  // current forge upgrade (+0 to +15+)
    baseBonuses?: { defBonus: number; magicDefBonus: number; hpBonus: number; mpBonus: number; atkBonus: number; magicAtkBonus: number }
    tameTarget?: string  // for fish: 'monster' | 'medium' | 'boss' | 'skull' — which monster type this fish can tame
    isFish?: boolean
    isEgg?: boolean
    eggLevel?: number
    eggMonsterName?: string
  }
  const [inventoryItems, setInventoryItems] = useState<InvItem[]>([
    { name: 'Keris Pusaka', icon: '⚔', qty: 1, desc: 'Keris berpuisi peninggalan leluhur.' },
    { name: 'Ramuan Penyembuh', icon: '✦', qty: 3, desc: 'Ramuan herba hutan. Pulihkan 150 HP.' },
    { name: 'Daging Panggang', icon: '🍖', qty: 2, desc: 'Daging rusa panggang. Pulihkan 75 HP.' },
    { name: 'Batu Pijar', icon: '◈', qty: 1, desc: 'Batu bercahaya dari gua Malang.' },
    { name: 'Anak Panah Bambu', icon: '➤', qty: 12, desc: 'Amunisi pemanah, 12 batang.' },
  ])
  const inventoryUsed = inventoryItems.length

  // Equipment
  const [equipped, setEquipped] = useState<Record<EquipSlot, { name: string; icon: string; image?: string; rarity?: EquipmentDrop['rarity']; desc?: string } | null>>({
    head: null, body: null, legs: null, rightHand: null, leftHand: null, ring: null, necklace: null,
  })

  // Battle state
  const [battleMonster, setBattleMonster] = useState<MapMarker | null>(null)
  const [monsterHp, setMonsterHp] = useState(0)
  const [monsterHpMax, setMonsterHpMax] = useState(0)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [isBattling, setIsBattling] = useState(false)
  const [defending, setDefending] = useState(false)
  const [battleEnded, setBattleEnded] = useState<null | 'victory' | 'defeat' | 'fled'>(null)
  const [monsterActing, setMonsterActing] = useState(false)
  const [battleLog, setBattleLog] = useState<string[]>([])

  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatTab, setChatTab] = useState<'general' | 'alliance' | 'private'>('general')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [highlightedMessageId, setHighlightedMessageId] = useState<number | null>(null)

  // ===== Cloud Save (progress lintas perangkat) =====
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveLoaded, setSaveLoaded] = useState(false)
  const saveTimerRef = useRef<any>(null)

  const collectSaveData = useCallback(() => ({
    homeFacilities,
    kebunSubItems, kolamSubItems, kolamPlanted, kotakSubItems, kotakStorage, kotakGold,
    dapurSubItems, kasurSubItems, gymSubItems, mandiSubItems, kebunPlanted,
    petSlots, equippedPetIndex,
    skillProgress, equippedSkill, selectedCity,
    playerStats, statPoints, level, totalExp,
    hpCurrent, mpCurrent, gold, lives, stamina,
    materials, inventoryItems, equipped,
  }), [homeFacilities, kebunSubItems, kolamSubItems, kolamPlanted, kotakSubItems, kotakStorage, kotakGold, dapurSubItems, kasurSubItems, gymSubItems, mandiSubItems, kebunPlanted, petSlots, equippedPetIndex, skillProgress, equippedSkill, selectedCity, playerStats, statPoints, level, totalExp, hpCurrent, mpCurrent, gold, lives, stamina, materials, inventoryItems, equipped])

  const hydrateSave = useCallback((data: any) => {
    if (!data || typeof data !== 'object') return
    const s = (k: string, setter: any) => { if (data[k] !== undefined) setter(data[k]) }
    s('homeFacilities', setHomeFacilities)
    s('kebunSubItems', setKebunSubItems)
    s('kolamSubItems', setKolamSubItems)
    s('kolamPlanted', setKolamPlanted)
    s('kotakSubItems', setKotakSubItems)
    s('kotakStorage', setKotakStorage)
    s('kotakGold', setKotakGold)
    s('dapurSubItems', setDapurSubItems)
    s('kasurSubItems', setKasurSubItems)
    s('gymSubItems', setGymSubItems)
    s('mandiSubItems', setMandiSubItems)
    s('kebunPlanted', setKebunPlanted)
    s('petSlots', setPetSlots)
    s('equippedPetIndex', setEquippedPetIndex)
    s('skillProgress', setSkillProgress)
    s('equippedSkill', setEquippedSkill)
    s('selectedCity', setSelectedCity)
    s('playerStats', setPlayerStats)
    s('statPoints', setStatPoints)
    s('level', setLevel)
    s('totalExp', setTotalExp)
    s('hpCurrent', setHpCurrent)
    s('mpCurrent', setMpCurrent)
    s('gold', setGold)
    s('lives', setLives)
    s('stamina', setStamina)
    s('materials', setMaterials)
    s('inventoryItems', setInventoryItems)
    s('equipped', setEquipped)
  }, [])

  const persistSave = useCallback(async () => {
    setSaveStatus('saving')
    const payload = collectSaveData()
    try {
      try { localStorage.setItem(`nusantara.save.${user.id}`, JSON.stringify(payload)) } catch {}
      const res = await fetch('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, data: payload }) })
      const json = await res.json()
      if (json && json.ok) { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000) }
      else { setSaveStatus('error'); setTimeout(() => setSaveStatus('idle'), 3000) }
    } catch {
      setSaveStatus('error'); setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [collectSaveData, user.id])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`/api/save?userId=${encodeURIComponent(user.id)}`, { cache: 'no-store' })
        const json = await res.json()
        if (!cancelled && json && json.ok && json.save && json.save.data) {
          hydrateSave(json.save.data)
          try { setWelcomeDialogOpen(false) } catch {}
          setSaveLoaded(true)
          return
        }
      } catch {}
      try {
        const raw = localStorage.getItem(`nusantara.save.${user.id}`)
        if (raw && !cancelled) {
          const data = JSON.parse(raw)
          hydrateSave(data)
          try { setWelcomeDialogOpen(false) } catch {}
        }
      } catch {}
      if (!cancelled) setSaveLoaded(true)
    }
    load()
    return () => { cancelled = true }
  }, [user.id, hydrateSave])

  useEffect(() => {
    if (!saveLoaded) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => { persistSave() }, 5000)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [collectSaveData, saveLoaded, persistSave])

  const knownMsgIds = useRef<Set<number>>(new Set())
  const chatOpenRef = useRef(false)
  const chatTabRef = useRef<'general' | 'alliance' | 'private'>('general')

  useEffect(() => { chatOpenRef.current = chatOpen }, [chatOpen])
  useEffect(() => { chatTabRef.current = chatTab }, [chatTab])

  const portrait = character.gender === 'male' ? '/char-male.png' : '/char-female.png'
  const classEmblem = character.classCode === 'ksatria' ? '/class-ksatria.png' : character.classCode === 'pendekar' ? '/class-pendekar.png' : character.classCode === 'dukun' ? '/class-dukun.png' : '/class-pemanah.png'

  // ===== Chat polling =====
  useEffect(() => {
    let active = true
    const poll = async () => {
      try {
        const res = await fetch('/api/chat/messages', { cache: 'no-store' })
        const data = await res.json()
        if (!active || !data.ok || !data.messages) return
        setChatMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const toAdd: any[] = []
          for (const m of data.messages) {
            if (existingIds.has(m.id)) continue
            const isOwn = m.sender === character.name
            const isMention = (m.mentionedNames || []).some((n: string) => n.toLowerCase() === character.name.toLowerCase())
            toAdd.push({ id: m.id, sender: m.sender, text: m.text, timestamp: m.timestamp, tab: m.tab, isMention, isOwn, isRead: isOwn || (chatOpenRef.current && chatTabRef.current === m.tab) })
          }
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev
        })
      } catch { /* retry */ }
    }
    poll()
    const interval = setInterval(poll, 2000)
    return () => { active = false; clearInterval(interval) }
  }, [character.name])

  const unreadGeneral = chatMessages.filter(m => m.tab === 'general' && !m.isRead && !m.isOwn).length
  const unreadAlliance = chatMessages.filter(m => m.tab === 'alliance' && !m.isRead && !m.isOwn).length
  const unreadPrivate = chatMessages.filter(m => m.tab === 'private' && !m.isRead && !m.isOwn).length
  const unreadMentions = chatMessages.filter(m => m.isMention && !m.isRead && !m.isOwn).length
  const totalUnread = unreadGeneral + unreadAlliance + unreadPrivate

  const handleSendChat = useCallback(async () => {
    if (!chatInput.trim()) return
    const text = chatInput.trim()
    setChatInput('')
    try {
      await fetch('/api/chat/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sender: character.name, text, tab: chatTab }) })
    } catch { /* ignore */ }
  }, [chatInput, chatTab, character.name])

  const handleSwitchChatTab = useCallback((tab: 'general' | 'alliance' | 'private') => {
    setChatTab(tab)
    setChatMessages(prev => prev.map(m => m.tab === tab ? { ...m, isRead: true } : m))
    setHighlightedMessageId(null)
  }, [])

  const handleJumpToMention = useCallback((msgId: number, tab: 'general' | 'alliance' | 'private') => {
    setChatTab(tab)
    setHighlightedMessageId(msgId)
    setChatMessages(prev => prev.map(m => m.tab === tab ? { ...m, isRead: true } : m))
    window.setTimeout(() => {
      const el = document.getElementById(`chat-msg-${msgId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.setTimeout(() => setHighlightedMessageId(null), 3000)
    }, 100)
  }, [])

  // ===== Welcome dialog =====
  const handleWelcomeClose = () => { setStatPoints(5); setGold(100); setWelcomeDialogOpen(false) }

  // ===== Akademi handlers =====
  const handleSelectCity = (cityId: string) => {
    setSelectedCity(cityId)
    setSkillDetailView(cityId)
  }

  const handleUseSkill = (skillId: string) => {
    // Each use adds 0.3% progress
    setSkillProgress(prev => ({
      ...prev,
      [skillId]: Math.min(100, (prev[skillId] ?? 0) + 0.3),
    }))
  }

  const handleEquipSkill = (skillId: string) => {
    setEquippedSkill(equippedSkill === skillId ? null : skillId)
  }

  // ===== Stat allocation =====
  const handleAllocateStat = (stat: keyof ClassStats) => {
    if (statPoints <= 0) return
    setPlayerStats(s => ({ ...s, [stat]: s[stat] + 1 }))
    setStatPoints(sp => sp - 1)
  }

  // ===== Equip/Unequip =====
  const handleEquipItem = (index: number) => {
    const item = inventoryItems[index]
    if (!item) return
    const slot = detectSlot(item.name)
    if (!slot) return
    const previous = equipped[slot]
    setEquipped(e => ({ ...e, [slot]: { name: item.name, icon: item.icon, image: item.image, rarity: item.rarity, desc: item.desc, forgeLevel: item.forgeLevel, baseBonuses: item.baseBonuses, id: item.id } }))
    setInventoryItems(items => {
      const updated = items.map((it, i) => i === index ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0)
      if (previous) return [...updated, { name: previous.name, icon: previous.icon, qty: 1, desc: previous.desc, image: previous.image, rarity: previous.rarity, id: (previous as any).id, forgeLevel: (previous as any).forgeLevel, baseBonuses: (previous as any).baseBonuses }]
      return updated
    })
    setSelectedItem(null)
    setInventoryOpen(false)
  }

  const handleUnequip = (slot: EquipSlot) => {
    const item = equipped[slot] as any
    if (!item || inventoryItems.length >= INVENTORY_CAPACITY) return
    setInventoryItems(items => [...items, { name: item.name, icon: item.icon, qty: 1, desc: item.desc, image: item.image, rarity: item.rarity, id: item.id, forgeLevel: item.forgeLevel, baseBonuses: item.baseBonuses }])
    setEquipped(e => ({ ...e, [slot]: null }))
  }

  // ===== Item use =====
  const handleUseItem = (index: number) => {
    const item = inventoryItems[index]
    if (!item) return
    let hpHealed = 0, mpHealed = 0
    if (item.image && item.image.includes('fruit-')) {
      const hpMatch = item.desc?.match(/HP \+(\d+)/); const mpMatch = item.desc?.match(/MP \+(\d+)/)
      if (hpMatch) hpHealed = parseInt(hpMatch[1])
      if (mpMatch) mpHealed = parseInt(mpMatch[1])
    } else if (item.name === 'Ramuan Penyembuh') hpHealed = 150
    else if (item.name === 'Daging Panggang') hpHealed = 75
    if (hpHealed > 0) setHpCurrent(hp => Math.min(hpMax, hp + hpHealed))
    if (mpHealed > 0) setMpCurrent(mp => Math.min(mpMax, mp + mpHealed))
    setInventoryItems(items => items.map((it, i) => i === index ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0))
    setSelectedItem(null)
  }

  const handleDiscardItem = (index: number) => { setInventoryItems(items => items.filter((_, i) => i !== index)); setSelectedItem(null) }

  // ===== Battle =====
  const triggerShake = () => { setShake(true); window.setTimeout(() => setShake(false), 500) }
  const triggerMonsterHit = () => { setMonsterHit(true); window.setTimeout(() => setMonsterHit(false), 600) }

  const startBattle = (m: MapMarker) => {
    if (!m.monster) return
    // Check stamina — 5 per battle
    if (stamina < 5) {
      toast({ variant: 'destructive', title: 'Stamina Tidak Cukup', description: `Butuh 5 stamina untuk bertarung. Stamina saat ini: ${Math.floor(stamina)}%. Regen 10%/jam.` })
      return
    }
    setStamina(s => Math.max(0, s - 5))
    setBattleMonster(m); setMonsterHp(m.monster.hp); setMonsterHpMax(m.monster.hp)
    setIsPlayerTurn(true); setIsBattling(true); setDefending(false); setBattleEnded(null); setMonsterActing(false)
    setBattleLog(['⚔️ Pertempuran dimulai!', `${m.name} (Lv.${m.monster.level}) muncul dengan ${m.monster.hp} HP.`, '— Giliranmu —'])
  }

  const endBattle = (result: 'victory' | 'defeat' | 'fled', logTail: string[]) => {
    setIsBattling(false); setBattleEnded(result); setBattleLog(prev => [...prev, ...logTail])
    resetPetHp()
  }

  const handleAttack = () => {
    if (!isPlayerTurn || !isBattling || !battleMonster?.monster) return
    const mon = battleMonster.monster
    const playerAttack = playerStats.STR * 10 + level * 10
    const damageToMonster = Math.max(1, playerAttack - mon.defense)
    triggerMonsterHit()
    const newMonsterHp = monsterHp - damageToMonster
    setMonsterHp(newMonsterHp)
    setBattleLog(prev => [...prev, `🗡️ Kamu menyerang ${battleMonster.name} (-${damageToMonster} HP).`])
    if (newMonsterHp <= 0) {
      const expGain = mon.expReward, goldGain = mon.goldReward
      const newExp = totalExp + expGain, newGold = gold + goldGain
      setTotalExp(newExp); setGold(newGold)
      const logTail = [`🏆 Kamu mengalahkan ${battleMonster.name}!`, `+${expGain} EXP, +${goldGain} emas`]
      const nextLevelBase = cumulativeExpForLevel(level + 1)
      if (newExp >= nextLevelBase) {
        const newLevel = level + 1
        setLevel(newLevel); setStatPoints(sp => sp + 5)
        setHpCurrent(playerStats.VIT * 60 + 100 + (newLevel - 1) * 30)
        setMpCurrent(playerStats.INT * 40 + 30 + (newLevel - 1) * 20)
        logTail.push(`⭐ LEVEL UP! Lv.${newLevel}!`, `🎁 +5 poin atribut tersedia.`)
      }
      // Add EXP to equipped pet
      addPetExp(expGain)
      // Equipment drop
      const luckBonus = playerStats.LUCK * 0.03
      const drop = (Math.random() < 0.6 + luckBonus) ? rollEquipmentDrop() : null
      if (drop) {
        logTail.push(`🎁 DROP! ${drop.name} [${drop.rarity}]`)
        if (inventoryItems.length < INVENTORY_CAPACITY) {
          setInventoryItems(items => [...items, { name: drop.name, icon: drop.icon, qty: 1, desc: `${drop.desc} [${drop.rarity}] · DEF +${drop.defBonus}, M.DEF +${drop.magicDefBonus}, HP +${drop.hpBonus}, MP +${drop.mpBonus}, ATK +${drop.atkBonus}, M.ATK +${drop.magicAtkBonus}`, image: drop.image, rarity: drop.rarity, id: (drop as any).id, forgeLevel: 0, baseBonuses: { defBonus: drop.defBonus, magicDefBonus: drop.magicDefBonus, hpBonus: drop.hpBonus, mpBonus: drop.mpBonus, atkBonus: drop.atkBonus, magicAtkBonus: drop.magicAtkBonus } }])
          setMapOpen(false)
          setBattleModalOpen(false)
          window.setTimeout(() => setDroppedEquipment(drop), 200)
        } else { logTail.push(`⚠️ Kantong penuh! ${drop.name} dibuang.`) }
      }
      // Material drop
      const matRoll = Math.random()
      const matGains = { kayu: 0, besi: 0, kulit: 0, emas: 0, batuMeteor: 0 }
      if (matRoll < 0.35) matGains.kayu = Math.floor(Math.random() * 3) + 1
      else if (matRoll < 0.55) matGains.besi = Math.floor(Math.random() * 2) + 1
      else if (matRoll < 0.72) matGains.kulit = Math.floor(Math.random() * 2) + 1
      else if (matRoll < 0.82) { matGains.kayu = Math.floor(Math.random() * 2) + 1; matGains.besi = Math.floor(Math.random() * 2) + 1 }
      else if (matRoll < 0.95) matGains.emas = Math.floor(Math.random() * 3) + 1
      else matGains.batuMeteor = 1 // very rare meteor
      const totalMat = matGains.kayu + matGains.besi + matGains.kulit + matGains.emas + matGains.batuMeteor
      if (totalMat > 0) {
        const parts: string[] = []
        if (matGains.kayu > 0) parts.push(`${matGains.kayu} Kayu`)
        if (matGains.besi > 0) parts.push(`${matGains.besi} Besi`)
        if (matGains.kulit > 0) parts.push(`${matGains.kulit} Kulit`)
        if (matGains.emas > 0) parts.push(`${matGains.emas} Emas`)
        if (matGains.batuMeteor > 0) parts.push(`${matGains.batuMeteor} Batu Meteor`)
        logTail.push(`📦 Material: ${parts.join(', ')}`)
        setMaterials(m => ({ ...m, kayu: m.kayu + matGains.kayu, besi: m.besi + matGains.besi, kulit: m.kulit + matGains.kulit, emas: m.emas + matGains.emas, batuMeteor: m.batuMeteor + matGains.batuMeteor }))
      }
      // Fish drop (based on monster type)
      const tameType = getMonsterTameType(battleMonster)
      if (tameType) {
        const eligibleFish = FISH_ITEMS.filter(f => f.tameTarget === tameType)
        const fishDropRoll = Math.random()
        // Each fish has its own drop rate; check if any drops
        for (const fish of eligibleFish) {
          if (fishDropRoll < fish.dropRate) {
            if (inventoryItems.length < INVENTORY_CAPACITY) {
              const fishItem = { name: fish.name, icon: '🐟', qty: 1, image: fish.image, desc: `Ikan untuk menjinakkan ${tameType === 'monster' ? 'monster kecil' : tameType === 'medium' ? 'monster sedang' : tameType === 'boss' ? 'monster raksasa' : 'monster tengkorak'}.`, isFish: true, tameTarget: fish.tameTarget, id: fish.id }
              setInventoryItems(items => {
                const existing = items.findIndex(it => it.isFish && it.id === fish.id)
                if (existing >= 0) return items.map((it, i) => i === existing ? { ...it, qty: it.qty + 1 } : it)
                return [...items, fishItem]
              })
              logTail.push(`🐟 DROP! ${fish.name} — ikan penjinak!`)
            }
            break // only drop one fish per battle
          }
        }
      }
      endBattle('victory', logTail)
      return
    }
    setIsPlayerTurn(false); setDefending(false); setMonsterActing(true)
    window.setTimeout(() => monsterTurn(newMonsterHp, false), 900)
  }

  const handleDefend = () => {
    if (!isPlayerTurn || !isBattling) return
    setDefending(true)
    setBattleLog(prev => [...prev, '🛡️ Kamu mengambil posisi bertahan.'])
    setIsPlayerTurn(false); setMonsterActing(true)
    window.setTimeout(() => monsterTurn(monsterHp, true), 900)
  }

  const handleBattleItem = () => { if (isPlayerTurn && isBattling) setInventoryOpen(true) }

  const handleFlee = () => {
    if (!isPlayerTurn || !isBattling) return
    const fleeChance = 0.4 + (playerStats.AGI - (battleMonster?.monster?.level || 1)) * 0.05 + playerStats.LUCK * 0.02
    if (Math.random() < Math.max(0.2, Math.min(0.95, fleeChance))) {
      setBattleLog(prev => [...prev, '🏃 Kamu berhasil melarikan diri!'])
      endBattle('fled', [])
    } else {
      setBattleLog(prev => [...prev, '❌ Kamu gagal melarikan diri!'])
      setIsPlayerTurn(false); setDefending(false); setMonsterActing(true)
      window.setTimeout(() => monsterTurn(monsterHp, false), 900)
    }
  }

  const monsterTurn = (currentMonsterHp: number, isDefending: boolean) => {
    if (!battleMonster?.monster || currentMonsterHp <= 0) { setMonsterActing(false); return }
    const mon = battleMonster.monster
    const playerDefense = playerStats.VIT * 5 + level * 5 + (isDefending ? 25 : 0)
    let damageToPlayer = Math.max(1, mon.attack - playerDefense)
    if (isDefending) damageToPlayer = Math.floor(damageToPlayer / 2)
    triggerShake()
    const newPlayerHp = Math.max(0, hpCurrent - damageToPlayer)
    setHpCurrent(newPlayerHp)
    setBattleLog(prev => [...prev, `${isDefending ? '🛡️ (Ditahan) ' : ''}${battleMonster.name} menyerangmu (-${damageToPlayer} HP).`, '— Giliranmu —'])
    setMonsterActing(false)
    if (newPlayerHp <= 0) {
      const goldLost = Math.floor(gold * 0.1)
      setGold(g => Math.max(0, g - goldLost)); setHpCurrent(1)
      setLives(l => Math.max(0, l - 1)) // Lose 1 life on defeat
      endBattle('defeat', [`💀 Kamu dikalahkan oleh ${battleMonster.name}...`, `Dibangkitkan dengan 1 HP. Kehilangan ${goldLost} emas. Life berkurang 1.`])
      return
    }
    // Pet auto-attack (if equipped and alive)
    if (equippedPet && equippedPet.hp > 0 && currentMonsterHp > 0) {
      const petDamage = Math.max(1, equippedPet.attack - (battleMonster?.monster?.defense || 0))
      const newMonsterHpAfterPet = Math.max(0, currentMonsterHp - petDamage)
      setMonsterHp(newMonsterHpAfterPet)
      setBattleLog(prev => [...prev, `🐾 ${equippedPet.name} menyerang balik! (-${petDamage} HP ke ${battleMonster?.name}).`])
      // Check if pet killed monster
      if (newMonsterHpAfterPet <= 0) {
        const expGain = battleMonster?.monster?.expReward || 0
        const goldGain = battleMonster?.monster?.goldReward || 0
        const newExp = totalExp + expGain
        const newGold = gold + goldGain
        setTotalExp(newExp); setGold(newGold)
        addPetExp(expGain)
        const logTail = [`🏆 ${battleMonster?.name} dikalahkan oleh ${equippedPet.name}!`, `+${expGain} EXP, +${goldGain} emas`]
        if (level < 99) {
          const nextLevelBase = cumulativeExpForLevel(level + 1)
          if (newExp >= nextLevelBase) {
            const newLevel = Math.min(99, computeLevelFromExp(newExp))
            const levelsGained = newLevel - level
            if (levelsGained > 0) {
              setLevel(newLevel); setStatPoints(sp => sp + levelsGained * 5)
              setHpCurrent(playerStats.VIT * 60 + 100 + (newLevel - 1) * 30)
              setMpCurrent(playerStats.INT * 40 + 30 + (newLevel - 1) * 20)
              logTail.push(`⭐ LEVEL UP! Lv.${newLevel}!`, `🎁 +${levelsGained * 5} poin atribut tersedia.`)
            }
          }
        }
        resetPetHp()
        endBattle('victory', logTail)
        return
      }
    }
    setIsPlayerTurn(true)
  }

  const handleBattleUseItem = (index: number) => {
    const item = inventoryItems[index]
    if (!item || !isBattling) return
    let hpHealed = 0, mpHealed = 0
    if (item.image && item.image.includes('fruit-')) {
      const hpMatch = item.desc?.match(/HP \+(\d+)/); const mpMatch = item.desc?.match(/MP \+(\d+)/)
      if (hpMatch) hpHealed = parseInt(hpMatch[1])
      if (mpMatch) mpHealed = parseInt(mpMatch[1])
    } else if (item.name === 'Ramuan Penyembuh') hpHealed = 150
    else if (item.name === 'Daging Panggang') hpHealed = 75
    if (hpHealed > 0) setHpCurrent(hp => Math.min(hpMax, hp + hpHealed))
    if (mpHealed > 0) setMpCurrent(mp => Math.min(mpMax, mp + mpHealed))
    const parts: string[] = []
    if (hpHealed > 0) parts.push(`+${hpHealed} HP`)
    if (mpHealed > 0) parts.push(`+${mpHealed} MP`)
    setBattleLog(prev => [...prev, `✦ Kamu menggunakan ${item.name} (${parts.join(', ')}).`])
    setInventoryItems(items => items.map((it, i) => i === index ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0))
    setSelectedItem(null); setInventoryOpen(false)
    setIsPlayerTurn(false); setDefending(false); setMonsterActing(true)
    window.setTimeout(() => monsterTurn(monsterHp, false), 900)
  }

  // ===== Merchant =====
  const handleBuyItem = (item: EquipmentDrop) => {
    const price = getBuyPrice(item.rarity)
    if (gold < price || inventoryItems.length >= INVENTORY_CAPACITY) return
    setGold(g => g - price)
    setInventoryItems(items => [...items, { name: item.name, icon: item.icon, qty: 1, desc: `${item.desc} [${item.rarity}] · DEF +${item.defBonus}, M.DEF +${item.magicDefBonus}, HP +${item.hpBonus}, MP +${item.mpBonus}, ATK +${item.atkBonus}, M.ATK +${item.magicAtkBonus}`, image: item.image, rarity: item.rarity, id: item.id, forgeLevel: 0, baseBonuses: { defBonus: item.defBonus, magicDefBonus: item.magicDefBonus, hpBonus: item.hpBonus, mpBonus: item.mpBonus, atkBonus: item.atkBonus, magicAtkBonus: item.magicAtkBonus } }])
    setMerchantSelectedItem(null)
  }

  const handleSellItem = (index: number) => {
    const item = inventoryItems[index]
    if (!item) return
    const price = item.rarity ? getSellPrice(item.rarity) : 20
    setGold(g => g + price)
    setInventoryItems(items => items.filter((_, i) => i !== index))
    setSelectedItem(null)
  }

  const ALL_SHOP_ITEMS = ALL_TABLES.map(base => {
    const isFruit = base.id.startsWith('fruit-')
    const isWeapon = base.id.startsWith('claw-') || base.id.startsWith('gada-') || base.id.startsWith('kapak-') || base.id.startsWith('knuckle-')
    const isAccessory = base.id.startsWith('kalung-') || base.id.startsWith('cincin-') || base.id.startsWith('topi-')
    const bonuses = rollEquipmentBonuses(base.rarity, isWeapon, isFruit, isAccessory)
    return { ...base, ...bonuses }
  })

  const getFilteredShopItems = () => {
    if (merchantCategory === 'all') return ALL_SHOP_ITEMS
    if (merchantCategory === 'buah') return ALL_SHOP_ITEMS.filter(i => i.id.startsWith('fruit-'))
    return ALL_SHOP_ITEMS.filter(i => i.id.startsWith(merchantCategory + '-') || (merchantCategory === 'baju' && (i.id.startsWith('baju-') || i.id.startsWith('jubah-') || i.id.startsWith('rompi-') || i.id.startsWith('tunik-'))))
  }

  // ===== Blacksmith (Forge) logic =====
  // Forge cost table — scales with current forge level + rarity
  const FORGE_CONFIG = {
    rarityMult: { 'Common': 1, 'Uncommon': 1.5, 'Rare': 2.5, 'Epic': 4 } as Record<EquipmentDrop['rarity'], number>,
    // success rate per forge level (0-19)
    successRate: (level: number) => {
      // +0→+1: 95%, +1→+2: 90%, +2→+3: 85%, ... drops 5% per level
      // +10 onwards: 30% and falling, plus destroy chance
      if (level >= 15) return 5
      if (level >= 10) return Math.max(15, 35 - (level - 10) * 4)
      return Math.max(15, 95 - level * 8)
    },
    // destruction chance — only above +10
    destroyChance: (level: number) => {
      if (level < 10) return 0
      return Math.min(60, (level - 10) * 8) // +11: 8%, +12: 16%, ..., +17: 48%, cap 60%
    },
    // gold cost — base + (level * mult * rarityMult)
    goldCost: (level: number, rarity: EquipmentDrop['rarity']) => {
      const base = 50
      const mult = FORGE_CONFIG.rarityMult[rarity]
      return Math.floor((base + level * 30) * mult * (1 + level * 0.15))
    },
    // materials needed: kayu, besi, kulit, emas, batuMeteor
    materialCost: (level: number, rarity: EquipmentDrop['rarity']) => {
      const mult = FORGE_CONFIG.rarityMult[rarity]
      const m = { kayu: 0, besi: 0, kulit: 0, emas: 0, batuMeteor: 0 }
      // Low levels (0-3): mostly kayu + kulit
      // Mid levels (4-7): add besi
      // High levels (8-10): add emas
      // Epic levels (11+): add batuMeteor
      m.kayu = Math.floor((1 + level * 0.5) * mult)
      m.kulit = Math.floor((1 + level * 0.4) * mult)
      if (level >= 3) m.besi = Math.floor((1 + (level - 3) * 0.6) * mult)
      if (level >= 7) m.emas = Math.floor((1 + (level - 7) * 0.5) * mult)
      if (level >= 10) m.batuMeteor = 1 + Math.floor((level - 10) * 0.5)
      return m
    },
    // stat bonus per forge level: each level adds 8% of base stat
    statPerLevel: 0.08,
  }

  const getItemForgeBonuses = (item: InvItem) => {
    if (!item.baseBonuses) return null
    const lvl = item.forgeLevel || 0
    if (lvl === 0) return item.baseBonuses
    const boost = 1 + lvl * FORGE_CONFIG.statPerLevel
    return {
      defBonus: Math.floor(item.baseBonuses.defBonus * boost),
      magicDefBonus: Math.floor(item.baseBonuses.magicDefBonus * boost),
      hpBonus: Math.floor(item.baseBonuses.hpBonus * boost),
      mpBonus: Math.floor(item.baseBonuses.mpBonus * boost),
      atkBonus: Math.floor(item.baseBonuses.atkBonus * boost),
      magicAtkBonus: Math.floor(item.baseBonuses.magicAtkBonus * boost),
    }
  }

  const handleForge = (index: number) => {
    const item = inventoryItems[index]
    if (!item || !item.baseBonuses || forgeAnimation === 'forging') return
    const lvl = item.forgeLevel || 0
    if (lvl >= 20) return // hard cap
    const rarity = item.rarity || 'Common'
    const goldCost = FORGE_CONFIG.goldCost(lvl, rarity)
    const matCost = FORGE_CONFIG.materialCost(lvl, rarity)
    // Check resources
    if (gold < goldCost) { toast({ variant: 'destructive', title: 'Emas tidak cukup', description: `Butuh ${goldCost} emas untuk menempa.` }); return }
    if (materials.kayu < matCost.kayu || materials.besi < matCost.besi || materials.kulit < matCost.kulit || materials.emas < matCost.emas || materials.batuMeteor < matCost.batuMeteor) {
      toast({ variant: 'destructive', title: 'Material tidak cukup', description: 'Cek kebutuhan material untuk penempaan ini.' }); return
    }
    // Deduct resources
    setGold(g => g - goldCost)
    setMaterials(m => ({ ...m, kayu: m.kayu - matCost.kayu, besi: m.besi - matCost.besi, kulit: m.kulit - matCost.kulit, emas: m.emas - matCost.emas, batuMeteor: m.batuMeteor - matCost.batuMeteor }))
    setForgeAnimation('forging')
    // Roll result after animation delay
    window.setTimeout(() => {
      const successRoll = Math.random() * 100
      const destroyRoll = Math.random() * 100
      const successThreshold = FORGE_CONFIG.successRate(lvl)
      const destroyThreshold = FORGE_CONFIG.destroyChance(lvl)
      // Destruction roll happens FIRST (only above +10)
      if (lvl >= 10 && destroyRoll < destroyThreshold) {
        // Item destroyed
        setForgeAnimation('destroy')
        setInventoryItems(items => items.filter((_, i) => i !== index))
        setBlacksmithItem(null)
        toast({ variant: 'destructive', title: `💀 ${item.name} HANCUR!`, description: `Penempaan gagal total di +${lvl}. Peralatan hancur berantakan.` })
        window.setTimeout(() => setForgeAnimation('idle'), 2500)
        return
      }
      if (successRoll < successThreshold) {
        // Success
        setForgeAnimation('success')
        setInventoryItems(items => items.map((it, i) => i === index ? { ...it, forgeLevel: (it.forgeLevel || 0) + 1 } : it))
        toast({ variant: 'default', title: `✅ Penempaan Berhasil!`, description: `${item.name} naik ke +${lvl + 1}.` })
      } else {
        // Fail — materials & gold lost
        setForgeAnimation('fail')
        toast({ variant: 'destructive', title: `❌ Penempaan Gagal`, description: `Material & emas hilang. ${item.name} tetap di +${lvl}.` })
      }
      window.setTimeout(() => setForgeAnimation('idle'), 1800)
    }, 1500)
  }

  // ===== Dismantle logic =====
  // Returns the materials that would be gained from dismantling an item.
  // Formula: based on rarity, base stat sum, and forge level.
  // - Rarity multiplier: Common 1x, Uncommon 1.5x, Rare 2.5x, Epic 4x (same as forge cost)
  // - Base stat sum (ATK + M.ATK + DEF + M.DEF + HP/10 + MP/10) determines quantity
  // - Forge level adds bonus materials (especially Batu Meteor at +10+)
  // - Always returns at least 1 of some material
  const getDismantleReturn = (item: InvItem) => {
    if (!item.baseBonuses) return null
    const rarity = item.rarity || 'Common'
    const mult = FORGE_CONFIG.rarityMult[rarity]
    const lvl = item.forgeLevel || 0
    const b = item.baseBonuses
    const statSum = b.atkBonus + b.magicAtkBonus + b.defBonus + b.magicDefBonus + Math.floor(b.hpBonus / 10) + Math.floor(b.mpBonus / 10)
    // Base quantity derived from stat sum (1 mat per ~5 stat points)
    const baseQty = Math.max(1, Math.floor(statSum / 5))
    // Apply rarity multiplier, plus 50% bonus per forge level
    const totalQty = Math.floor(baseQty * mult * (1 + lvl * 0.5))

    const result = { kayu: 0, besi: 0, kulit: 0, emas: 0, batuMeteor: 0 }

    // Determine material types based on item id prefix
    const id = item.id || ''
    // Wood-based items (bows wood, claws wood, gada wood, kapak wood, knuckle wood, perisai kayu) → mostly kayu + kulit
    // Iron-based items (bows iron, perisai besi) → mostly besi + emas
    // Stone-based items (perisai batu, gada-batu, etc) → mostly besi + batuMeteor
    // Default armor (baju, celana, topi) → kayu + kulit
    if (id.startsWith('busur-besi') || id.startsWith('perisai-besi')) {
      result.besi = Math.floor(totalQty * 0.6)
      result.emas = Math.floor(totalQty * 0.2)
      result.kulit = Math.floor(totalQty * 0.2)
    } else if (id.includes('-batu') || id.startsWith('perisai-batu')) {
      result.besi = Math.floor(totalQty * 0.5)
      result.kayu = Math.floor(totalQty * 0.2)
      result.kulit = Math.floor(totalQty * 0.2)
      result.batuMeteor = Math.floor(totalQty * 0.1)
    } else if (id.startsWith('baju-') || id.startsWith('jubah-') || id.startsWith('rompi-') || id.startsWith('tunik-') || id.startsWith('celana-') || id.startsWith('topi-')) {
      result.kayu = Math.floor(totalQty * 0.4)
      result.kulit = Math.floor(totalQty * 0.5)
      result.besi = Math.floor(totalQty * 0.1)
    } else {
      // Wood weapons & wood shields → kayu + kulit + small besi
      result.kayu = Math.floor(totalQty * 0.5)
      result.kulit = Math.floor(totalQty * 0.3)
      result.besi = Math.floor(totalQty * 0.2)
    }

    // Forge bonus: every +2 forge level adds 1 emas; +10+ adds 1 batu meteor per 2 levels
    if (lvl >= 2) result.emas += Math.floor(lvl / 2)
    if (lvl >= 10) result.batuMeteor += Math.floor((lvl - 8) / 2)

    // Remove zero entries to keep display clean
    return Object.fromEntries(Object.entries(result).filter(([_, v]) => (v as number) > 0)) as { kayu?: number; besi?: number; kulit?: number; emas?: number; batuMeteor?: number }
  }

  const handleDismantle = (index: number) => {
    const item = inventoryItems[index]
    if (!item || !item.baseBonuses || dismantleAnimation === 'working') return
    const returns = getDismantleReturn(item)
    if (!returns) return
    setDismantleAnimation('working')
    window.setTimeout(() => {
      // Add materials
      setMaterials(m => ({
        ...m,
        kayu: m.kayu + (returns.kayu || 0),
        besi: m.besi + (returns.besi || 0),
        kulit: m.kulit + (returns.kulit || 0),
        emas: m.emas + (returns.emas || 0),
        batuMeteor: m.batuMeteor + (returns.batuMeteor || 0),
      }))
      // Remove item from inventory
      setInventoryItems(items => items.filter((_, i) => i !== index))
      setDismantleItem(null)
      setDismantleAnimation('done')
      const parts: string[] = []
      if (returns.kayu) parts.push(`${returns.kayu} Kayu`)
      if (returns.besi) parts.push(`${returns.besi} Besi`)
      if (returns.kulit) parts.push(`${returns.kulit} Kulit`)
      if (returns.emas) parts.push(`${returns.emas} Emas`)
      if (returns.batuMeteor) parts.push(`${returns.batuMeteor} Batu Meteor`)
      toast({ variant: 'default', title: `🔧 Dismantle Selesai`, description: `${item.name} dibongkar. Mendapat: ${parts.join(', ')}.` })
      window.setTimeout(() => setDismantleAnimation('idle'), 1500)
    }, 1500)
  }

  // ===== Home facility logic =====
  // Each facility has a level (0 = locked, 1+ = built/upgraded).
  // Building/upgrading costs gold + materials and gives buffs.
  // Dapur → MP regen, Gym → ATK+DEF, Kamar Mandi → HP regen, Kasur → Energy (TBD),
  // Inkubasi/Kebun/Kolam Ikan → under construction (cosmetic only for now).
  const HOME_FACILITIES = [
    { key: 'dapur', name: 'Dapur', icon: '/facilities/dapur.png', desc: 'Regenerasi Magic', color: '#3b82f6', unlocked: true, buffLabel: (lvl: number) => { if (lvl === 0) return 'Buff: +5 MP/5 menit (aktif setelah dibangun)'; const t = dapurSubItems.filter(p => p >= 100).length; return `+${5 * Math.pow(2, Math.max(0, t - 1))} MP/5 menit (upgrade di dalam untuk x2/tier)` } },
    { key: 'gym', name: 'Alat Gym', icon: '/facilities/gym.png', desc: 'ATK & DEF', color: '#ef4444', unlocked: true, buffLabel: (lvl: number) => { if (lvl === 0) return 'Buff: +3 ATK, +2 DEF (aktif setelah dibangun)'; const t = gymSubItems.filter(p => p >= 100).length; return `+${3 + t} ATK, +${2 + t} DEF (upgrade di dalam untuk +1/tier)` } },
    { key: 'kamarMandi', name: 'Kamar Mandi', icon: '/facilities/kamar-mandi.png', desc: 'Regenerasi HP', color: '#22c55e', unlocked: true, buffLabel: (lvl: number) => { if (lvl === 0) return 'Buff: +8 HP/5 menit (aktif setelah dibangun)'; const t = mandiSubItems.filter(p => p >= 100).length; return `+${8 + t * 2} HP/5 menit (upgrade di dalam untuk +2/tier)` } },
    { key: 'kasur', name: 'Kasur', icon: '/facilities/kasur.png', desc: 'Regenerasi Stamina', color: '#f0a500', unlocked: true, buffLabel: (lvl: number) => { if (lvl === 0) return 'Buff: +10% Stamina/jam (aktif setelah dibangun)'; const t = kasurSubItems.filter(p => p >= 100).length; return `+${10 + t * 2.5}% Stamina/jam (upgrade di dalam untuk +2.5%/tier)` } },
    { key: 'inkubasi', name: 'Inkubasi', icon: '/facilities/inkubasi.png', desc: 'Tempat Pet', color: '#a855f7', unlocked: true, buffLabel: (lvl: number) => lvl === 0 ? 'Bangun inkubasi untuk menetaskan telur monster menjadi pet' : `${petSlots.filter(p => p !== null).length}/3 slot pet terisi${equippedPet ? ` · ${equippedPet.name} equipped` : ''}` },
    { key: 'kebun', name: 'Kebun', icon: '/facilities/kebun.png', desc: 'Menanam Buah', color: '#16a34a', unlocked: true, buffLabel: (lvl: number) => lvl === 0 ? 'Bangun kebun untuk mulai menanam buah (12 jam → 3x panen)' : `${getKebunSlots()} slot tanam tersedia — panen 3x setelah 12 jam` },
    { key: 'kolamIkan', name: 'Kolam Ikan', icon: '/facilities/kolam-ikan.png', desc: 'Mengembangbiakkan Ikan', color: '#06b6d4', unlocked: true, buffLabel: (lvl: number) => lvl === 0 ? 'Bangun kolam untuk memelihara ikan (12 jam → 2-3x panen)' : `${getKolamSlots()} slot ikan tersedia — panen 2-3x setelah 12 jam` },
    { key: 'kotak', name: 'Kotak Penyimpanan', icon: '/facilities/kotak/kayu.png', desc: 'Penyimpanan Extra', color: '#d4a04a', unlocked: true, buffLabel: (lvl: number) => lvl === 0 ? 'Bangun kotak untuk penyimpanan item & emas' : `Kotak: ${kotakStorage.length}/${getKotakBonusSlots()} item · ${kotakGold.toLocaleString()} emas tersimpan` },
  ] as const

  // Fixed build cost per facility (no upgrade levels — build once, upgrade via sub-items)
  const getFacilityBuildCost = (facilityKey: string) => {
    const BUILD_COSTS: Record<string, { gold: number; besi: number; kulit: number; kayu: number }> = {
      dapur:      { gold: 10000, besi: 1000, kulit: 1000, kayu: 0 },
      gym:        { gold: 20000, besi: 1000, kulit: 1000, kayu: 0 },
      kamarMandi: { gold: 10000, besi: 1000, kulit: 1000, kayu: 0 },
      kasur:      { gold: 20000, besi: 1000, kulit: 1000, kayu: 0 },
      inkubasi:   { gold: 30000, besi: 2000, kulit: 2000, kayu: 0 },
      kebun:      { gold: 20000, besi: 1000, kulit: 1000, kayu: 0 },
      kolamIkan:  { gold: 20000, besi: 1000, kulit: 1000, kayu: 0 },
      kotak:      { gold: 10000, besi: 0,    kulit: 0,    kayu: 1000 },
    }
    return BUILD_COSTS[facilityKey] || { gold: 20000, besi: 1000, kulit: 1000, kayu: 0 }
  }

  const handleBuildFacility = (facilityKey: string) => {
    if (homeFacilityAnimation) return
    const currentLvl = (homeFacilities as any)[facilityKey] as number
    if (currentLvl >= 1) return // already built
    const cost = getFacilityBuildCost(facilityKey)
    if (gold < cost.gold) { toast({ variant: 'destructive', title: 'Emas Tidak Cukup', description: `Butuh ${cost.gold.toLocaleString()} emas. Kamu punya ${gold.toLocaleString()}.` }); return }
    if (materials.besi < cost.besi) { toast({ variant: 'destructive', title: 'Besi Tidak Cukup', description: `Butuh ${cost.besi.toLocaleString()} besi. Kamu punya ${materials.besi.toLocaleString()}.` }); return }
    if (materials.kulit < cost.kulit) { toast({ variant: 'destructive', title: 'Kulit Tidak Cukup', description: `Butuh ${cost.kulit.toLocaleString()} kulit. Kamu punya ${materials.kulit.toLocaleString()}.` }); return }
    if (cost.kayu > 0 && materials.kayu < cost.kayu) { toast({ variant: 'destructive', title: 'Kayu Tidak Cukup', description: `Butuh ${cost.kayu.toLocaleString()} kayu. Kamu punya ${materials.kayu.toLocaleString()}.` }); return }
    // Deduct
    setGold(g => g - cost.gold)
    setMaterials(m => ({ ...m, besi: m.besi - cost.besi, kulit: m.kulit - cost.kulit, kayu: m.kayu - (cost.kayu || 0) }))
    setHomeFacilityAnimation(facilityKey)
    window.setTimeout(() => {
      setHomeFacilities(f => ({ ...f, [facilityKey]: 1 }))
      const facility = HOME_FACILITIES.find(f => f.key === facilityKey)
      toast({ variant: 'default', title: `✅ ${facility?.name} Selesai Dibangun!`, description: `${facility?.buffLabel(1)}.` })
      setHomeFacilityAnimation(null)
    }, 1500)
  }

  // ===== Dapur sub-items logic =====
  // 6 sequential kitchen upgrades: kain-lusuh → kayu → seng → batako → plester → mewah
  // Each upgrade: +10% progress, costs 5.000 gold + 250 kayu + 250 besi
  // Each completed tier doubles MP regen buff (base +5 MP/5 menit, x2 per tier)
  const DAPUR_SUB_ITEMS = [
    { key: 'kain-lusuh', name: 'Dapur Kain Lusuh', icon: '/facilities/dapur/kain-lusuh.png', desc: 'Dapur darurat dari kain lusuh' },
    { key: 'kayu',       name: 'Dapur Kayu',       icon: '/facilities/dapur/kayu.png',       desc: 'Dapur sederhana dari kayu' },
    { key: 'seng',       name: 'Dapur Seng',       icon: '/facilities/dapur/seng.png',       desc: 'Dapur dari lembaran seng' },
    { key: 'batako',     name: 'Dapur Batako',     icon: '/facilities/dapur/batako.png',     desc: 'Dapur tembok batako' },
    { key: 'plester',    name: 'Dapur Plester',    icon: '/facilities/dapur/plester.png',    desc: 'Dapur batako plester rapi' },
    { key: 'mewah',      name: 'Dapur Mewah',      icon: '/facilities/dapur/mewah.png',      desc: 'Dapur mewah lengkap modern' },
  ] as const

  const handleUpgradeDapurSub = (index: number) => {
    if (index > 0 && dapurSubItems[index - 1] < 100) {
      toast({ variant: 'destructive', title: 'Belum Terbuka', description: `Selesaikan ${DAPUR_SUB_ITEMS[index - 1].name} terlebih dahulu.` })
      return
    }
    if (dapurSubItems[index] >= 100) return
    const goldCost = 5000, kayuCost = 250, besiCost = 250
    if (gold < goldCost) { toast({ variant: 'destructive', title: 'Emas Tidak Cukup', description: `Butuh ${goldCost} emas.` }); return }
    if (materials.kayu < kayuCost) { toast({ variant: 'destructive', title: 'Kayu Tidak Cukup', description: `Butuh ${kayuCost} kayu.` }); return }
    if (materials.besi < besiCost) { toast({ variant: 'destructive', title: 'Besi Tidak Cukup', description: `Butuh ${besiCost} besi.` }); return }
    setGold(g => g - goldCost)
    setMaterials(m => ({ ...m, kayu: m.kayu - kayuCost, besi: m.besi - besiCost }))
    setDapurSubItems(prev => { const next = [...prev]; next[index] = Math.min(100, next[index] + 10); return next })
    const newProgress = Math.min(100, dapurSubItems[index] + 10)
    if (newProgress >= 100) toast({ variant: 'default', title: `🎉 ${DAPUR_SUB_ITEMS[index].name} Selesai!`, description: `Upgrade dapur ke level berikutnya sekarang tersedia.` })
    else toast({ variant: 'default', title: `+10% Progress`, description: `${DAPUR_SUB_ITEMS[index].name}: ${newProgress}%.` })
  }

  // ===== Kasur sub-items logic =====
  // 6 sequential bed upgrades: kain-lusuh → kayu → kapuk → busa → kulit-singa → mewah
  // Each upgrade: +10% progress, costs 5.000 gold + 250 kayu + 250 kulit
  // Each completed tier adds +2.5% Stamina regen per hour (linear, on top of base 10%/hour)
  const KASUR_SUB_ITEMS = [
    { key: 'kain-lusuh',   name: 'Kasur Kain Lusuh',   icon: '/facilities/kasur/kain-lusuh.png',   desc: 'Kasur darurat dari kain lusuh' },
    { key: 'kayu',         name: 'Kasur Kayu',         icon: '/facilities/kasur/kayu.png',         desc: 'Kasur kayu dengan tali pengikat' },
    { key: 'kapuk',        name: 'Kasur Kapuk',        icon: '/facilities/kasur/kapuk.png',        desc: 'Kasur kapuk dengan seprai motif' },
    { key: 'busa',         name: 'Kasur Busa',         icon: '/facilities/kasur/busa.png',         desc: 'Kasur busa modern dengan bantal' },
    { key: 'kulit-singa',  name: 'Kasur Kulit Singa',  icon: '/facilities/kasur/kulit-singa.png',  desc: 'Kasur berbalut kulit singa sakti' },
    { key: 'mewah',        name: 'Kasur Mewah',        icon: '/facilities/kasur/mewah.png',        desc: 'Kasur mewah dengan kanopi emas' },
  ] as const

  const handleUpgradeKasurSub = (index: number) => {
    if (index > 0 && kasurSubItems[index - 1] < 100) {
      toast({ variant: 'destructive', title: 'Belum Terbuka', description: `Selesaikan ${KASUR_SUB_ITEMS[index - 1].name} terlebih dahulu.` })
      return
    }
    if (kasurSubItems[index] >= 100) return
    const goldCost = 5000, kayuCost = 250, kulitCost = 250
    if (gold < goldCost) { toast({ variant: 'destructive', title: 'Emas Tidak Cukup', description: `Butuh ${goldCost} emas.` }); return }
    if (materials.kayu < kayuCost) { toast({ variant: 'destructive', title: 'Kayu Tidak Cukup', description: `Butuh ${kayuCost} kayu.` }); return }
    if (materials.kulit < kulitCost) { toast({ variant: 'destructive', title: 'Kulit Tidak Cukup', description: `Butuh ${kulitCost} kulit.` }); return }
    setGold(g => g - goldCost)
    setMaterials(m => ({ ...m, kayu: m.kayu - kayuCost, kulit: m.kulit - kulitCost }))
    setKasurSubItems(prev => { const next = [...prev]; next[index] = Math.min(100, next[index] + 10); return next })
    const newProgress = Math.min(100, kasurSubItems[index] + 10)
    if (newProgress >= 100) toast({ variant: 'default', title: `🎉 ${KASUR_SUB_ITEMS[index].name} Selesai!`, description: `Stamina regen +${(index + 1) * 2.5}%/jam. Total regen: ${10 + (index + 1) * 2.5}%/jam.` })
    else toast({ variant: 'default', title: `+10% Progress`, description: `${KASUR_SUB_ITEMS[index].name}: ${newProgress}%.` })
  }

  // ===== Gym sub-items logic =====
  // 4 sequential gym upgrades: kayu → batu → besi → mewah
  // Each upgrade: +10% progress, costs 5.000 gold + 250 besi + 250 kulit
  // Each completed tier adds +1 ATK / +1 DEF (linear, on top of base +3 ATK +2 DEF)
  const GYM_SUB_ITEMS = [
    { key: 'kayu',  name: 'Set Alat Gym Kayu',  icon: '/facilities/gym/kayu.png',  desc: 'Alat gym dari kayu sederhana' },
    { key: 'batu',  name: 'Set Alat Gym Batu',  icon: '/facilities/gym/batu.png',  desc: 'Alat gym dari batu alam' },
    { key: 'besi',  name: 'Set Alat Gym Besi',  icon: '/facilities/gym/besi.png',  desc: 'Alat gym dari besi kokoh' },
    { key: 'mewah', name: 'Set Alat Gym Mewah', icon: '/facilities/gym/mewah.png', desc: 'Alat gym mewah lengkap modern' },
  ] as const

  const handleUpgradeGymSub = (index: number) => {
    if (index > 0 && gymSubItems[index - 1] < 100) {
      toast({ variant: 'destructive', title: 'Belum Terbuka', description: `Selesaikan ${GYM_SUB_ITEMS[index - 1].name} terlebih dahulu.` })
      return
    }
    if (gymSubItems[index] >= 100) return
    const goldCost = 5000, besiCost = 250, kulitCost = 250
    if (gold < goldCost) { toast({ variant: 'destructive', title: 'Emas Tidak Cukup', description: `Butuh ${goldCost} emas.` }); return }
    if (materials.besi < besiCost) { toast({ variant: 'destructive', title: 'Besi Tidak Cukup', description: `Butuh ${besiCost} besi.` }); return }
    if (materials.kulit < kulitCost) { toast({ variant: 'destructive', title: 'Kulit Tidak Cukup', description: `Butuh ${kulitCost} kulit.` }); return }
    setGold(g => g - goldCost)
    setMaterials(m => ({ ...m, besi: m.besi - besiCost, kulit: m.kulit - kulitCost }))
    setGymSubItems(prev => { const next = [...prev]; next[index] = Math.min(100, next[index] + 10); return next })
    const newProgress = Math.min(100, gymSubItems[index] + 10)
    if (newProgress >= 100) toast({ variant: 'default', title: `🎉 ${GYM_SUB_ITEMS[index].name} Selesai!`, description: `ATK/DEF bonus +1. Total: +${3 + (index + 1)} ATK, +${2 + (index + 1)} DEF.` })
    else toast({ variant: 'default', title: `+10% Progress`, description: `${GYM_SUB_ITEMS[index].name}: ${newProgress}%.` })
  }

  // ===== Kamar Mandi sub-items logic =====
  // 6 sequential bathroom upgrades: kain-lusuh → kayu → seng → semi-permanen → batako → mewah
  // Each upgrade: +10% progress, costs 5.000 gold + 250 kayu + 250 kulit
  // Each completed tier adds +2 HP/5 menit (linear, on top of base +8 HP/5 menit)
  const MANDI_SUB_ITEMS = [
    { key: 'kain-lusuh',     name: 'Kamar Mandi Kain Lusuh',     icon: '/facilities/kamar-mandi/kain-lusuh.png',     desc: 'Kamar mandi dari kain lusuh' },
    { key: 'kayu',           name: 'Kamar Mandi Kayu',           icon: '/facilities/kamar-mandi/kayu.png',           desc: 'Kamar mandi dari papan kayu' },
    { key: 'seng',           name: 'Kamar Mandi Seng',           icon: '/facilities/kamar-mandi/seng.png',           desc: 'Kamar mandi dari lembaran seng' },
    { key: 'semi-permanen',  name: 'Kamar Mandi Semi Permanen',  icon: '/facilities/kamar-mandi/semi-permanen.png',  desc: 'Kamar mandi semi permanen' },
    { key: 'batako',         name: 'Kamar Mandi Batako',         icon: '/facilities/kamar-mandi/batako.png',         desc: 'Kamar mandi dari batako' },
    { key: 'mewah',          name: 'Kamar Mandi Mewah',          icon: '/facilities/kamar-mandi/mewah.png',          desc: 'Kamar mandi mewah lengkap' },
  ] as const

  const handleUpgradeMandiSub = (index: number) => {
    if (index > 0 && mandiSubItems[index - 1] < 100) {
      toast({ variant: 'destructive', title: 'Belum Terbuka', description: `Selesaikan ${MANDI_SUB_ITEMS[index - 1].name} terlebih dahulu.` })
      return
    }
    if (mandiSubItems[index] >= 100) return
    const goldCost = 5000, kayuCost = 250, kulitCost = 250
    if (gold < goldCost) { toast({ variant: 'destructive', title: 'Emas Tidak Cukup', description: `Butuh ${goldCost} emas.` }); return }
    if (materials.kayu < kayuCost) { toast({ variant: 'destructive', title: 'Kayu Tidak Cukup', description: `Butuh ${kayuCost} kayu.` }); return }
    if (materials.kulit < kulitCost) { toast({ variant: 'destructive', title: 'Kulit Tidak Cukup', description: `Butuh ${kulitCost} kulit.` }); return }
    setGold(g => g - goldCost)
    setMaterials(m => ({ ...m, kayu: m.kayu - kayuCost, kulit: m.kulit - kulitCost }))
    setMandiSubItems(prev => { const next = [...prev]; next[index] = Math.min(100, next[index] + 10); return next })
    const newProgress = Math.min(100, mandiSubItems[index] + 10)
    if (newProgress >= 100) toast({ variant: 'default', title: `🎉 ${MANDI_SUB_ITEMS[index].name} Selesai!`, description: `HP regen +2/5 menit. Total: +${8 + (index + 1) * 2} HP/5 menit.` })
    else toast({ variant: 'default', title: `+10% Progress`, description: `${MANDI_SUB_ITEMS[index].name}: ${newProgress}%.` })
  }

  // ===== Kolam Ikan (Fish Pond) sub-items logic =====
  // 5 sequential tiers with different slot counts and harvest multipliers
  // Tier 1: 3 slots, 2x harvest; Tier 2: 3 slots, 3x; Tier 3: 6 slots, 3x; Tier 4: 5 slots, 3x; Tier 5: 5 slots, 3x
  const KOLAM_SUB_ITEMS = [
    { key: 'tanah',       name: 'Kolam Tanah',         icon: '/facilities/kolam-ikan/tanah.png',       desc: 'Kolam dari tanah dengan 3 slot ikan', slots: 3, multiplier: 2 },
    { key: 'bata',        name: 'Kolam Bata',          icon: '/facilities/kolam-ikan/bata.png',        desc: 'Kolam dari bata dengan 3 slot ikan', slots: 3, multiplier: 3 },
    { key: 'bata-hiasan', name: 'Kolam Bata + Hiasan', icon: '/facilities/kolam-ikan/bata-hiasan.png', desc: 'Kolam bata berhiasan dengan 6 slot ikan', slots: 6, multiplier: 3 },
    { key: 'kaca',        name: 'Kolam Kaca',          icon: '/facilities/kolam-ikan/kaca.png',        desc: 'Kolam kaca modern dengan 5 slot ikan', slots: 5, multiplier: 3 },
    { key: 'mewah',       name: 'Kolam Mewah',         icon: '/facilities/kolam-ikan/mewah.png',       desc: 'Kolam mewah dengan 5 slot ikan', slots: 5, multiplier: 3 },
  ] as const

  // Tick loop for kolam countdown (reuse kebun tick or separate)
  useEffect(() => {
    const interval = window.setInterval(() => setKolamTick(t => t + 1), 10000)
    return () => window.clearInterval(interval)
  }, [])

  // Get total available slots based on completed tiers
  const getKolamSlots = () => {
    let total = 0
    for (let i = 0; i < KOLAM_SUB_ITEMS.length; i++) {
      if (kolamSubItems[i] >= 100) total += KOLAM_SUB_ITEMS[i].slots
    }
    return total
  }

  // Get harvest multiplier for a given slot index (based on which tier it belongs to)
  const getKolamSlotMultiplier = (slotIndex: number) => {
    let cumulative = 0
    for (let i = 0; i < KOLAM_SUB_ITEMS.length; i++) {
      if (kolamSubItems[i] >= 100) {
        cumulative += KOLAM_SUB_ITEMS[i].slots
        if (slotIndex < cumulative) return KOLAM_SUB_ITEMS[i].multiplier
      }
    }
    return 2 // default
  }

  const handleUpgradeKolamSub = (index: number) => {
    if (index > 0 && kolamSubItems[index - 1] < 100) {
      toast({ variant: 'destructive', title: 'Belum Terbuka', description: `Selesaikan ${KOLAM_SUB_ITEMS[index - 1].name} terlebih dahulu.` })
      return
    }
    if (kolamSubItems[index] >= 100) return
    const goldCost = 5000, kayuCost = 250, kulitCost = 250
    if (gold < goldCost) { toast({ variant: 'destructive', title: 'Emas Tidak Cukup', description: `Butuh ${goldCost} emas.` }); return }
    if (materials.kayu < kayuCost) { toast({ variant: 'destructive', title: 'Kayu Tidak Cukup', description: `Butuh ${kayuCost} kayu.` }); return }
    if (materials.kulit < kulitCost) { toast({ variant: 'destructive', title: 'Kulit Tidak Cukup', description: `Butuh ${kulitCost} kulit.` }); return }
    setGold(g => g - goldCost)
    setMaterials(m => ({ ...m, kayu: m.kayu - kayuCost, kulit: m.kulit - kulitCost }))
    setKolamSubItems(prev => { const next = [...prev]; next[index] = Math.min(100, next[index] + 10); return next })
    const newProgress = Math.min(100, kolamSubItems[index] + 10)
    if (newProgress >= 100) toast({ variant: 'default', title: `🎉 ${KOLAM_SUB_ITEMS[index].name} Selesai!`, description: `${KOLAM_SUB_ITEMS[index].slots} slot ikan kini tersedia (panen ${KOLAM_SUB_ITEMS[index].multiplier}x).` })
    else toast({ variant: 'default', title: `+10% Progress`, description: `${KOLAM_SUB_ITEMS[index].name}: ${newProgress}%.` })
  }

  const handleKolamPlant = (slotIndex: number, fishItemIndex: number) => {
    const item = inventoryItems[fishItemIndex]
    if (!item || !item.isFish) {
      toast({ variant: 'destructive', title: 'Bukan Ikan', description: 'Hanya item ikan yang bisa dipelihara di kolam.' })
      return
    }
    if (slotIndex >= getKolamSlots()) {
      toast({ variant: 'destructive', title: 'Slot Terkunci', description: 'Selesaikan tier kolam berikutnya untuk membuka slot ini.' })
      return
    }
    if (kolamPlanted[slotIndex]) {
      toast({ variant: 'destructive', title: 'Slot Terisi', description: 'Slot ini sudah ada ikan. Panen dulu.' })
      return
    }
    setKolamPlanted(prev => {
      const next = [...prev]
      next[slotIndex] = { fishName: item.name, fishIcon: item.icon, fishImage: item.image, qty: 1, plantedAt: Date.now() }
      return next
    })
    setInventoryItems(items => items.map((it, i) => i === fishItemIndex ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0))
    const mult = getKolamSlotMultiplier(slotIndex)
    toast({ variant: 'default', title: '🐟 Dipelihara!', description: `${item.name} dimasukkan ke kolam slot ${slotIndex + 1}. Panen dalam 12 jam untuk hasil ${mult}x.` })
  }

  const handleKolamHarvest = (slotIndex: number) => {
    const planted = kolamPlanted[slotIndex]
    if (!planted) return
    const COOLDOWN = 12 * 60 * 60 * 1000
    const elapsed = Date.now() - planted.plantedAt
    if (elapsed < COOLDOWN) {
      toast({ variant: 'destructive', title: 'Belum Siap', description: 'Ikan belum siap dipanen. Tunggu hingga cooldown selesai.' })
      return
    }
    const multiplier = getKolamSlotMultiplier(slotIndex)
    const harvestQty = planted.qty * multiplier
    setInventoryItems(items => {
      const existingIdx = items.findIndex(it => it.isFish && it.name === planted.fishName)
      if (existingIdx >= 0) {
        return items.map((it, i) => i === existingIdx ? { ...it, qty: it.qty + harvestQty } : it)
      }
      return [...items, { name: planted.fishName, icon: planted.fishIcon, qty: harvestQty, image: planted.fishImage, desc: 'Hasil panen kolam ikan.', isFish: true, tameTarget: (items.find(it => it.name === planted.fishName)?.tameTarget) || 'monster' }]
    })
    setKolamPlanted(prev => {
      const next = [...prev]
      next[slotIndex] = null
      return next
    })
    toast({ variant: 'default', title: '🌾 Panen Berhasil!', description: `${harvestQty} ${planted.fishName} dipanen dari slot ${slotIndex + 1}! (${multiplier}x)` })
  }

  const getKolamSlotTimeRemaining = (slotIndex: number) => {
    const planted = kolamPlanted[slotIndex]
    if (!planted) return null
    const COOLDOWN = 12 * 60 * 60 * 1000
    const elapsed = Date.now() - planted.plantedAt
    const remaining = COOLDOWN - elapsed
    if (remaining <= 0) return null
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
    return { hours, minutes, pct: Math.min(100, (elapsed / COOLDOWN) * 100) }
  }

  // ===== Kebun (Garden) sub-items logic =====
  // 3 sequential tiers: biasa (3 slots) → bagus (6 slots) → mewah (9 slots)
  // Each upgrade: +10% progress, costs 5.000 gold + 250 kayu + 250 kulit
  // When a tier is complete, its slots become available for planting
  // Planting: drag fruit from inventory → drop in slot → 12h cooldown → harvest 3x qty
  const KEBUN_SUB_ITEMS = [
    { key: 'biasa', name: 'Kebun Biasa', icon: '/facilities/kebun/biasa.png', desc: 'Kebun sederhana dengan 3 slot tanam', slots: 3 },
    { key: 'bagus', name: 'Kebun Bagus', icon: '/facilities/kebun/bagus.png', desc: 'Kebun bagus dengan 6 slot tanam', slots: 6 },
    { key: 'mewah', name: 'Kebun Mewah', icon: '/facilities/kebun/mewah.png', desc: 'Kebun mewah dengan 9 slot tanam', slots: 9 },
  ] as const

  // Tick loop for countdown refresh (every 10 seconds)
  useEffect(() => {
    const interval = window.setInterval(() => setKebunTick(t => t + 1), 10000)
    return () => window.clearInterval(interval)
  }, [])

  // Get number of available slots based on completed tiers
  const getKebunSlots = () => {
    const completed = kebunSubItems.filter(p => p >= 100).length
    if (completed === 0) return 0
    return KEBUN_SUB_ITEMS[completed - 1].slots
  }

  const handleUpgradeKebunSub = (index: number) => {
    if (index > 0 && kebunSubItems[index - 1] < 100) {
      toast({ variant: 'destructive', title: 'Belum Terbuka', description: `Selesaikan ${KEBUN_SUB_ITEMS[index - 1].name} terlebih dahulu.` })
      return
    }
    if (kebunSubItems[index] >= 100) return
    const goldCost = 5000
    const kayuCost = 250
    const kulitCost = 250
    if (gold < goldCost) { toast({ variant: 'destructive', title: 'Emas Tidak Cukup', description: `Butuh ${goldCost} emas.` }); return }
    if (materials.kayu < kayuCost) { toast({ variant: 'destructive', title: 'Kayu Tidak Cukup', description: `Butuh ${kayuCost} kayu.` }); return }
    if (materials.kulit < kulitCost) { toast({ variant: 'destructive', title: 'Kulit Tidak Cukup', description: `Butuh ${kulitCost} kulit.` }); return }
    setGold(g => g - goldCost)
    setMaterials(m => ({ ...m, kayu: m.kayu - kayuCost, kulit: m.kulit - kulitCost }))
    setKebunSubItems(prev => {
      const next = [...prev]
      next[index] = Math.min(100, next[index] + 10)
      return next
    })
    const newProgress = Math.min(100, kebunSubItems[index] + 10)
    if (newProgress >= 100) {
      toast({ variant: 'default', title: `🎉 ${KEBUN_SUB_ITEMS[index].name} Selesai!`, description: `${KEBUN_SUB_ITEMS[index].slots} slot tanam kini tersedia.` })
    } else {
      toast({ variant: 'default', title: `+10% Progress`, description: `${KEBUN_SUB_ITEMS[index].name}: ${newProgress}%.` })
    }
  }

  // Plant a fruit in a slot (called on drop)
  const handlePlantFruit = (slotIndex: number, fruitItemIndex: number) => {
    const item = inventoryItems[fruitItemIndex]
    if (!item || !item.name || !item.icon) return
    // Only allow fruit items (check if image starts with 'fruit-' or name matches fruit patterns)
    const isFruit = (item.image && item.image.includes('fruit-')) || ['Apel', 'Mangga', 'Jeruk', 'Semangka', 'Nanas', 'Pisang', 'Salak', 'Duku', 'Rambutan', 'Anggur', 'Pepaya', 'Melon', 'Markisa', 'Buah Naga', 'Kelengkeng', 'Matoa', 'Apel Hijau', 'Tomat', 'Wortel', 'Pir', 'Kernetu', 'Alpukat', 'Manggis', 'Terong'].includes(item.name)
    if (!isFruit) {
      toast({ variant: 'destructive', title: 'Bukan Buah', description: 'Hanya item buah yang bisa ditanam di kebun.' })
      return
    }
    if (slotIndex >= getKebunSlots()) {
      toast({ variant: 'destructive', title: 'Slot Terkunci', description: 'Selesaikan tier kebun berikutnya untuk membuka slot ini.' })
      return
    }
    if (kebunPlanted[slotIndex]) {
      toast({ variant: 'destructive', title: 'Slot Terisi', description: 'Slot ini sudah ada tanaman. Panen dulu.' })
      return
    }
    // Plant: consume 1 from inventory, add to slot
    setKebunPlanted(prev => {
      const next = [...prev]
      next[slotIndex] = { fruitName: item.name, fruitIcon: item.icon, fruitImage: item.image, qty: 1, plantedAt: Date.now() }
      return next
    })
    setInventoryItems(items => items.map((it, i) => i === fruitItemIndex ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0))
    toast({ variant: 'default', title: '🌱 Ditanam!', description: `${item.name} ditanam di slot ${slotIndex + 1}. Panen dalam 12 jam untuk hasil 3x.` })
  }

  // Harvest a ready slot
  const handleHarvestFruit = (slotIndex: number) => {
    const planted = kebunPlanted[slotIndex]
    if (!planted) return
    const COOLDOWN = 12 * 60 * 60 * 1000 // 12 hours
    const elapsed = Date.now() - planted.plantedAt
    if (elapsed < COOLDOWN) {
      toast({ variant: 'destructive', title: 'Belum Siap', description: 'Buah belum siap dipanen. Tunggu hingga cooldown selesai.' })
      return
    }
    // Harvest: add 3x qty to inventory, clear slot
    const harvestQty = planted.qty * 3
    setInventoryItems(items => {
      // Try to stack with existing item
      const existingIdx = items.findIndex(it => it.name === planted.fruitName && it.image === planted.fruitImage)
      if (existingIdx >= 0) {
        return items.map((it, i) => i === existingIdx ? { ...it, qty: it.qty + harvestQty } : it)
      }
      return [...items, { name: planted.fruitName, icon: planted.fruitIcon, qty: harvestQty, image: planted.fruitImage, desc: 'Hasil panen kebun.' }]
    })
    setKebunPlanted(prev => {
      const next = [...prev]
      next[slotIndex] = null
      return next
    })
    toast({ variant: 'default', title: '🌾 Panen Berhasil!', description: `${harvestQty} ${planted.fruitName} dipanen dari slot ${slotIndex + 1}!` })
  }

  // Get remaining cooldown time for a slot
  const getKebunSlotTimeRemaining = (slotIndex: number) => {
    const planted = kebunPlanted[slotIndex]
    if (!planted) return null
    const COOLDOWN = 12 * 60 * 60 * 1000
    const elapsed = Date.now() - planted.plantedAt
    const remaining = COOLDOWN - elapsed
    if (remaining <= 0) return null // ready
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
    return { hours, minutes, pct: Math.min(100, (elapsed / COOLDOWN) * 100) }
  }

  // ===== Stamina regen loop (10% per hour) =====
  useEffect(() => {
    const interval = window.setInterval(() => {
      setStamina(s => Math.min(100, s + 0.028)) // ~0.028% per 10s = ~10%/hour
    }, 10000)
    return () => window.clearInterval(interval)
  }, [])

  // ===== GM panel logic =====
  const GM_PASSWORD = '19891989'
  const handleGmAuth = () => {
    if (gmPassword === GM_PASSWORD) {
      setGmAuthed(true)
      setGmPasswordError(false)
      setGmPassword('')
      toast({ variant: 'default', title: '🔓 Akses Diberikan', description: 'Selamat datang, Game Master!' })
    } else {
      setGmPasswordError(true)
      setLives(l => Math.max(0, l - 1))
      toast({ variant: 'destructive', title: '💀 Wilayah Terlarang!', description: 'Password salah. Life berkurang 1.' })
      setTimeout(() => setGmPasswordError(false), 2500)
    }
  }
  const handleGmClose = () => {
    setGmOpen(false)
    setGmAuthed(false)
    setGmPassword('')
    setGmPasswordError(false)
    setGmTargetName('')
    setGmAmount('100')
  }
  const handleGmGrant = (resource: 'gold' | 'exp' | 'kayu' | 'besi' | 'kulit' | 'emas' | 'batuMeteor' | 'permata' | 'stamina') => {
    const amount = parseInt(gmAmount) || 0
    if (amount <= 0) { toast({ variant: 'destructive', title: 'Jumlah Tidak Valid', description: 'Masukkan angka positif.' }); return }
    const targetName = gmTargetName.trim() || character.name
    if (targetName === character.name) {
      if (resource === 'gold') setGold(g => g + amount)
      else if (resource === 'stamina') {
        const newStamina = Math.max(0, Math.min(100, amount))
        setStamina(newStamina)
        toast({ variant: 'default', title: `✅ Stamina = ${newStamina}%`, description: `Diberikan ke ${targetName}.` })
        return
      }
      else if (resource === 'exp') {
        const newExp = totalExp + amount
        const newLevel = Math.min(99, computeLevelFromExp(newExp))
        const levelsGained = newLevel - level
        setTotalExp(newExp)
        if (levelsGained > 0) {
          setLevel(newLevel)
          setStatPoints(sp => sp + levelsGained * 5)
          setHpCurrent(playerStats.VIT * 60 + 100 + (newLevel - 1) * 30)
          setMpCurrent(playerStats.INT * 40 + 30 + (newLevel - 1) * 20)
          if (newLevel >= 99) {
            toast({ variant: 'default', title: `✅ +${amount.toLocaleString()} EXP`, description: `Level MAX 99 tercapai! +${levelsGained * 5} poin atribut. Diberikan ke ${targetName}.` })
          } else {
            toast({ variant: 'default', title: `✅ +${amount.toLocaleString()} EXP`, description: `Level naik dari ${level} → ${newLevel}! +${levelsGained * 5} poin atribut. Diberikan ke ${targetName}.` })
          }
          return
        }
        if (level >= 99) {
          toast({ variant: 'default', title: `✅ +${amount.toLocaleString()} EXP`, description: `Sudah level MAX 99. EXP tidak lagi menaikkan level. Diberikan ke ${targetName}.` })
          return
        }
      }
      else if (resource === 'kayu') setMaterials(m => ({ ...m, kayu: m.kayu + amount }))
      else if (resource === 'besi') setMaterials(m => ({ ...m, besi: m.besi + amount }))
      else if (resource === 'kulit') setMaterials(m => ({ ...m, kulit: m.kulit + amount }))
      else if (resource === 'emas') setMaterials(m => ({ ...m, emas: m.emas + amount }))
      else if (resource === 'batuMeteor') setMaterials(m => ({ ...m, batuMeteor: m.batuMeteor + amount }))
      else if (resource === 'permata') setMaterials(m => ({ ...m, permata: m.permata + amount }))
      toast({ variant: 'default', title: `✅ +${amount.toLocaleString()} ${resource}`, description: `Diberikan ke ${targetName}.` })
    } else {
      toast({ variant: 'default', title: `📤 Perintah GM Terkirim`, description: `+${amount.toLocaleString()} ${resource} → ${targetName} (character tidak ditemukan di sesi ini).` })
    }
  }

  // ===== Fish taming system =====
  // 12 fish in 4 columns (3 per column). Each column tames a specific monster type.
  // Col 1 (monster kecil): Koi, Mas, Gurame — 5% drop from 'monster' type
  // Col 2 (monster sedang): Koki, Guppy, Loushan — 4% drop from 'medium' type
  // Col 3 (monster raksasa): Badut, Arwana, Lele — 3% drop from 'boss' type
  // Col 4 (monster tengkorak): Cupang, Tuna, Terbang — 2% drop from 'skull' type
  const FISH_ITEMS = [
    { id: 'ikan-koi',     name: 'Ikan Koi',     image: '/fish/ikan-koi.png',     tameTarget: 'monster', dropRate: 0.05 },
    { id: 'ikan-mas',     name: 'Ikan Mas',     image: '/fish/ikan-mas.png',     tameTarget: 'monster', dropRate: 0.05 },
    { id: 'ikan-gurame',  name: 'Ikan Gurame',  image: '/fish/ikan-gurame.png',  tameTarget: 'monster', dropRate: 0.05 },
    { id: 'ikan-koki',    name: 'Ikan Koki',    image: '/fish/ikan-koki.png',    tameTarget: 'medium',  dropRate: 0.04 },
    { id: 'ikan-guppy',   name: 'Ikan Guppy',   image: '/fish/ikan-guppy.png',   tameTarget: 'medium',  dropRate: 0.04 },
    { id: 'ikan-loushan', name: 'Ikan Loushan', image: '/fish/ikan-loushan.png', tameTarget: 'medium',  dropRate: 0.04 },
    { id: 'ikan-badut',   name: 'Ikan Badut',   image: '/fish/ikan-badut.png',   tameTarget: 'boss',    dropRate: 0.03 },
    { id: 'ikan-arwana',  name: 'Ikan Arwana',  image: '/fish/ikan-arwana.png',  tameTarget: 'boss',    dropRate: 0.03 },
    { id: 'ikan-lele',    name: 'Ikan Lele',    image: '/fish/ikan-lele.png',    tameTarget: 'boss',    dropRate: 0.03 },
    { id: 'ikan-cupang',  name: 'Ikan Cupang',  image: '/fish/ikan-cupang.png',  tameTarget: 'skull',   dropRate: 0.02 },
    { id: 'ikan-tuna',    name: 'Ikan Tuna',    image: '/fish/ikan-tuna.png',    tameTarget: 'skull',   dropRate: 0.02 },
    { id: 'ikan-terbang', name: 'Ikan Terbang', image: '/fish/ikan-terbang.png', tameTarget: 'skull',   dropRate: 0.02 },
  ] as const

  const [tameSuccessPopup, setTameSuccessPopup] = useState<{ monsterName: string; eggName: string } | null>(null)

  // Get the monster type for taming purposes
  const getMonsterTameType = (marker: MapMarker | null): string | null => {
    if (!marker) return null
    if (marker.type === 'monster') return 'monster'
    if (marker.type === 'medium') return 'medium'
    if (marker.type === 'boss') return 'boss'
    if (marker.type === 'skull') return 'skull'
    return null
  }

  // Check if player has a fish that can tame the current monster type
  const getTameableFishIndex = (): number => {
    const tameType = getMonsterTameType(battleMonster)
    if (!tameType) return -1
    return inventoryItems.findIndex(it => it.isFish && it.tameTarget === tameType && it.qty > 0)
  }

  // Handle taming a monster
  const handleTameMonster = () => {
    if (!isBattling || !battleMonster) return
    const fishIdx = getTameableFishIndex()
    if (fishIdx < 0) return
    // Check HP < 25%
    if (monsterHp > monsterHpMax * 0.25) {
      toast({ variant: 'destructive', title: 'Belakang Bisa Dijinakkan', description: `HP musuh harus dibawah 25% untuk dijinakkan. HP saat ini: ${Math.floor((monsterHp / monsterHpMax) * 100)}%.` })
      return
    }
    const fishItem = inventoryItems[fishIdx]
    // Consume the fish
    setInventoryItems(items => items.map((it, i) => i === fishIdx ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0))
    // Create egg item
    const eggName = `Telur ${battleMonster.name}`
    setInventoryItems(items => {
      const existing = items.findIndex(it => it.isEgg && it.eggMonsterName === battleMonster.name)
      if (existing >= 0) {
        return items.map((it, i) => i === existing ? { ...it, qty: it.qty + 1 } : it)
      }
      return [...items, { name: eggName, icon: '🥚', qty: 1, image: '/fish/telur-pet.png', desc: `Telur ${battleMonster.name} Level 1. Tetaskan di Inkubasi (Rumah).`, isEgg: true, eggLevel: 1, eggMonsterName: battleMonster.name }]
    })
    // End battle with taming success
    endBattle('victory', [`🥚 Kamu berhasil menjinakkan ${battleMonster.name}!`, `${battleMonster.name} berubah menjadi telur dan masuk ke tas.`])
    setTameSuccessPopup({ monsterName: battleMonster.name, eggName })
  }

  // ===== Kotak Penyimpanan (Storage Box) sub-items logic =====
  // 4 sequential tiers: bambu (15 slots) → kayu (20) → metal (25) → peti-besar (30)
  // Each tier provides ADDITIONAL inventory capacity on top of base INVENTORY_CAPACITY (15)
  // Build cost: 10,000 gold + 1,000 kayu
  // Upgrade cost: 5,000 gold + 250 kayu + 250 kulit per +10%
  // Bonus is the MAX of completed tiers (not cumulative)
  const KOTAK_SUB_ITEMS = [
    { key: 'bambu',      name: 'Kotak Bambu',   icon: '/facilities/kotak/bambu.png',      desc: 'Kotak penyimpanan dari bambu (+15 slot)',  slots: 15 },
    { key: 'kayu',       name: 'Kotak Kayu',    icon: '/facilities/kotak/kayu.png',       desc: 'Kotak penyimpanan dari kayu (+20 slot)',  slots: 20 },
    { key: 'metal',      name: 'Kotak Metal',   icon: '/facilities/kotak/metal.png',      desc: 'Kotak penyimpanan dari metal (+25 slot)', slots: 25 },
    { key: 'peti-besar', name: 'Peti Besar',    icon: '/facilities/kotak/peti-besar.png', desc: 'Peti penyimpanan besar (+30 slot)',       slots: 30 },
  ] as const

  // Get storage box capacity from highest completed tier
  const getKotakBonusSlots = () => {
    let maxSlots = 0
    for (let i = 0; i < KOTAK_SUB_ITEMS.length; i++) {
      if (kotakSubItems[i] >= 100) maxSlots = KOTAK_SUB_ITEMS[i].slots
    }
    return maxSlots
  }

  // Transfer item from player inventory to storage box
  const handleStoreItem = (invIndex: number) => {
    if (kotakStorage.length >= getKotakBonusSlots()) {
      toast({ variant: 'destructive', title: 'Kotak Penuh', description: `Kapasitas kotak: ${kotakStorage.length}/${getKotakBonusSlots()}.` })
      return
    }
    const item = inventoryItems[invIndex]
    if (!item) return
    setKotakStorage(prev => {
      // Try to stack
      const existing = prev.findIndex(it => it.name === item.name && it.image === item.image && (it.id || '') === (item.id || ''))
      if (existing >= 0) {
        return prev.map((it, i) => i === existing ? { ...it, qty: it.qty + 1 } : it)
      }
      return [...prev, { ...item, qty: 1 }]
    })
    setInventoryItems(items => items.map((it, i) => i === invIndex ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0))
  }

  // Transfer item from storage box back to player inventory
  const handleRetrieveItem = (storageIndex: number) => {
    const item = kotakStorage[storageIndex]
    if (!item) return
    if (inventoryItems.length >= INVENTORY_CAPACITY) {
      toast({ variant: 'destructive', title: 'Tas Penuh', description: `Kapasitas tas: ${inventoryItems.length}/${INVENTORY_CAPACITY}.` })
      return
    }
    setInventoryItems(items => {
      const existing = items.findIndex(it => it.name === item.name && it.image === item.image && (it.id || '') === (item.id || ''))
      if (existing >= 0) {
        return items.map((it, i) => i === existing ? { ...it, qty: it.qty + 1 } : it)
      }
      return [...items, { ...item, qty: 1 }]
    })
    setKotakStorage(prev => {
      const updated = prev.map((it, i) => i === storageIndex ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0)
      return updated
    })
  }

  // Store gold in storage box
  const handleStoreGold = () => {
    const amount = parseInt(kotakGoldInput) || 0
    if (amount <= 0) { toast({ variant: 'destructive', title: 'Jumlah Tidak Valid' }); return }
    if (gold < amount) { toast({ variant: 'destructive', title: 'Emas Tidak Cukup', description: `Kamu punya ${gold.toLocaleString()} emas.` }); return }
    setGold(g => g - amount)
    setKotakGold(g => g + amount)
    setKotakGoldInput('')
    toast({ variant: 'default', title: '💰 Emas Disimpan', description: `${amount.toLocaleString()} emas disimpan ke kotak. Total di kotak: ${(kotakGold + amount).toLocaleString()}.` })
  }

  // Withdraw gold from storage box
  const handleWithdrawGold = () => {
    const amount = parseInt(kotakGoldInput) || 0
    if (amount <= 0) { toast({ variant: 'destructive', title: 'Jumlah Tidak Valid' }); return }
    if (kotakGold < amount) { toast({ variant: 'destructive', title: 'Emas di Kotak Tidak Cukup', description: `Emas di kotak: ${kotakGold.toLocaleString()}.` }); return }
    setKotakGold(g => g - amount)
    setGold(g => g + amount)
    setKotakGoldInput('')
    toast({ variant: 'default', title: '💰 Emas Diambil', description: `${amount.toLocaleString()} emas diambil dari kotak. Sisa di kotak: ${(kotakGold - amount).toLocaleString()}.` })
  }

  const handleUpgradeKotakSub = (index: number) => {
    if (index > 0 && kotakSubItems[index - 1] < 100) {
      toast({ variant: 'destructive', title: 'Belum Terbuka', description: `Selesaikan ${KOTAK_SUB_ITEMS[index - 1].name} terlebih dahulu.` })
      return
    }
    if (kotakSubItems[index] >= 100) return
    const goldCost = 5000, kayuCost = 250, kulitCost = 250
    if (gold < goldCost) { toast({ variant: 'destructive', title: 'Emas Tidak Cukup', description: `Butuh ${goldCost} emas.` }); return }
    if (materials.kayu < kayuCost) { toast({ variant: 'destructive', title: 'Kayu Tidak Cukup', description: `Butuh ${kayuCost} kayu.` }); return }
    if (materials.kulit < kulitCost) { toast({ variant: 'destructive', title: 'Kulit Tidak Cukup', description: `Butuh ${kulitCost} kulit.` }); return }
    setGold(g => g - goldCost)
    setMaterials(m => ({ ...m, kayu: m.kayu - kayuCost, kulit: m.kulit - kulitCost }))
    setKotakSubItems(prev => { const next = [...prev]; next[index] = Math.min(100, next[index] + 10); return next })
    const newProgress = Math.min(100, kotakSubItems[index] + 10)
    if (newProgress >= 100) toast({ variant: 'default', title: `🎉 ${KOTAK_SUB_ITEMS[index].name} Selesai!`, description: `Kapasitas tas bertambah menjadi ${INVENTORY_CAPACITY + KOTAK_SUB_ITEMS[index].slots} slot!` })
    else toast({ variant: 'default', title: `+10% Progress`, description: `${KOTAK_SUB_ITEMS[index].name}: ${newProgress}%.` })
  }

  // ===== Inkubasi (Pet) system =====
  // Pets are hatched from eggs (obtained via fish taming)
  // Egg color/glow based on monster type: kecil=green, sedang=yellow, tengkorak=purple, raksasa=red
  // 3 pet slots, 1 can be equipped for auto-battle
  // Pet gets same EXP as player during battle
  // Pet auto-attacks after player's turn
  // Pet HP resets to full after battle ends

  const PET_TYPE_COLORS: Record<string, string> = {
    'monster': '#22c55e',  // green
    'medium': '#f0a500',   // yellow
    'skull': '#a855f7',    // purple
    'boss': '#ef4444',     // red
  }

  const PET_TYPE_LABELS: Record<string, string> = {
    'monster': 'Kecil',
    'medium': 'Sedang',
    'skull': 'Tengkorak',
    'boss': 'Raksasa',
  }

  // Compute pet base stats from type and level
  const getPetBaseStats = (monsterType: string, level: number) => {
    const typeMult = { 'monster': 1, 'medium': 2, 'skull': 4, 'boss': 3 }
    const mult = typeMult[monsterType as keyof typeof typeMult] || 1
    return {
      hpMax: Math.floor((100 + level * 30) * mult),
      attack: Math.floor((20 + level * 8) * mult),
      defense: Math.floor((10 + level * 4) * mult),
    }
  }

  // Compute pet level from exp (same formula as player, capped at 99)
  const computePetLevelFromExp = (exp: number) => {
    let lvl = 1
    while (lvl < 99 && cumulativeExpForLevel(lvl + 1) <= exp) lvl++
    return lvl
  }

  // Hatch an egg into a pet
  const handleHatchEgg = (eggItemIndex: number) => {
    const egg = inventoryItems[eggItemIndex]
    if (!egg || !egg.isEgg) return
    // Find empty pet slot
    const emptySlot = petSlots.findIndex(s => s === null)
    if (emptySlot < 0) {
      toast({ variant: 'destructive', title: 'Slot Penuh', description: 'Semua 3 slot pet sudah terisi. Lepaskan pet lain dulu.' })
      return
    }
    // Determine monster type from egg — we need to find the original monster's type
    // The egg was created from a tamed monster, but we don't store the type directly.
    // We can infer from the monster name by checking all markers.
    let monsterType: 'monster' | 'medium' | 'boss' | 'skull' = 'monster'
    for (const m of MARKERS) {
      if (m.name === egg.eggMonsterName && m.monster) {
        monsterType = m.type === 'monster' ? 'monster' : m.type === 'medium' ? 'medium' : m.type === 'boss' ? 'boss' : 'skull'
        break
      }
    }
    // Find the monster's image
    const monsterMarker = MARKERS.find(m => m.name === egg.eggMonsterName)
    const petImage = monsterMarker?.monster?.image

    // Create pet
    const baseStats = getPetBaseStats(monsterType, 1)
    const newPet: PetData = {
      id: `pet-${Date.now()}`,
      name: egg.eggMonsterName || 'Unknown Pet',
      monsterType,
      level: 1,
      exp: 0,
      hp: baseStats.hpMax,
      hpMax: baseStats.hpMax,
      attack: baseStats.attack,
      defense: baseStats.defense,
      image: petImage,
      isHatched: true,
    }
    // Add to pet slot
    setPetSlots(prev => {
      const next = [...prev]
      next[emptySlot] = newPet
      return next
    })
    // Remove egg from inventory
    setInventoryItems(items => items.map((it, i) => i === eggItemIndex ? { ...it, qty: it.qty - 1 } : it).filter(it => it.qty > 0))
    // Show hatch popup
    setPetHatchPopup({ petName: newPet.name, petType: PET_TYPE_LABELS[monsterType] })
  }

  // Equip a pet (only one at a time)
  const handleEquipPet = (slotIndex: number) => {
    if (!petSlots[slotIndex]) return
    setEquippedPetIndex(equippedPetIndex === slotIndex ? null : slotIndex)
  }

  // Release a pet (remove from slot)
  const handleReleasePet = (slotIndex: number) => {
    if (!petSlots[slotIndex]) return
    if (equippedPetIndex === slotIndex) setEquippedPetIndex(null)
    setPetSlots(prev => {
      const next = [...prev]
      next[slotIndex] = null
      return next
    })
    toast({ variant: 'default', title: '👋 Pet Dilepaskan', description: `${petSlots[slotIndex]?.name} telah dilepaskan kembali ke alam liar.` })
  }

  // Get currently equipped pet (or null)
  const equippedPet = equippedPetIndex !== null ? petSlots[equippedPetIndex] : null

  // Add pet EXP after battle victory (same amount as player)
  const addPetExp = (expGain: number) => {
    if (equippedPetIndex === null) return
    setPetSlots(prev => {
      const next = [...prev]
      const pet = next[equippedPetIndex]
      if (!pet) return prev
      const newExp = pet.exp + expGain
      const newLevel = computePetLevelFromExp(newExp)
      const levelsGained = newLevel - pet.level
      if (levelsGained > 0) {
        const baseStats = getPetBaseStats(pet.monsterType, newLevel)
        next[equippedPetIndex] = {
          ...pet,
          level: newLevel,
          exp: newExp,
          hp: baseStats.hpMax,  // refill HP on level up
          hpMax: baseStats.hpMax,
          attack: baseStats.attack,
          defense: baseStats.defense,
        }
      } else {
        next[equippedPetIndex] = { ...pet, exp: newExp }
      }
      return next
    })
  }

  // Reset pet HP after battle
  const resetPetHp = () => {
    if (equippedPetIndex === null) return
    setPetSlots(prev => {
      const next = [...prev]
      const pet = next[equippedPetIndex]
      if (pet) next[equippedPetIndex] = { ...pet, hp: pet.hpMax }
      return next
    })
  }

  // ===== Map marker rendering =====
  const filteredMarkers = MARKERS.filter(m => filter === 'all' || m.type === filter)

  const renderMarkerIcon = (m: MapMarker, isSelected: boolean) => {
    const color = DANGER_COLORS[m.danger]
    if (m.type === 'skull') return <span className="flex items-center justify-center rounded-full border-2 border-white/80" style={{ width: isSelected ? '24px' : '18px', height: isSelected ? '24px' : '18px', backgroundColor: color }}><Skull className="h-2.5 w-2.5 text-white" /></span>
    if (m.type === 'boss') return <span className="flex items-center justify-center rounded-full border-2 border-white/90" style={{ width: isSelected ? '28px' : '22px', height: isSelected ? '28px' : '22px', backgroundColor: color, boxShadow: isSelected ? `0 0 0 4px ${color}50, 0 0 20px ${color}` : `0 0 0 2px ${color}40` }}><Skull className="h-3.5 w-3.5 text-white" /></span>
    if (m.type === 'medium') return <span className="flex items-center justify-center rounded-full border-2 border-white/90" style={{ width: isSelected ? '26px' : '20px', height: isSelected ? '26px' : '20px', backgroundColor: '#f0a500', boxShadow: isSelected ? `0 0 0 4px #f0a50050, 0 0 18px #f0a500` : `0 0 0 2px #f0a50040` }}><Sword className={isSelected ? 'h-3.5 w-3.5 text-white' : 'h-3 w-3 text-white'} /></span>
    if (m.type === 'monster') return <span className="flex items-center justify-center rounded-full border-2 border-white/90" style={{ width: isSelected ? '24px' : '16px', height: isSelected ? '24px' : '16px', backgroundColor: color, boxShadow: isSelected ? `0 0 0 4px ${color}50, 0 0 18px ${color}` : `0 0 0 2px ${color}40` }}><Sword className="h-2.5 w-2.5 text-white" /></span>
    return <span className="flex items-center justify-center rounded-full border-2 border-white/80" style={{ width: isSelected ? '22px' : '12px', height: isSelected ? '22px' : '12px', backgroundColor: color }} />
  }

  // ===== Render =====
  return (
    <div className={`w-full max-w-2xl nus-fade-up ${shake ? 'nus-shake' : ''}`}>
      <div className="nus-card-frame rounded-2xl p-6 sm:p-8">
        <div className="relative">
          <span className="nus-corner tl" /><span className="nus-corner tr" /><span className="nus-corner bl" /><span className="nus-corner br" />

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="nus-title text-3xl sm:text-4xl font-bold text-[#f0f0f0] drop-shadow-[0_2px_14px_rgba(240,165,0,0.25)]">Dunia Nusantara</h2>
            <div className="mt-1.5 flex items-center justify-center gap-2">
              <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#c5a059]" />
              <p className="nus-serif text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#c5a059]">Gerbang Tanah Jawa</p>
              <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#c5a059]" />
            </div>
          </div>

          {/* Character card */}
          <div className="rounded-xl border border-[#3a4259] bg-[#1f2533] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative h-32 w-32 sm:h-36 sm:w-36 flex-shrink-0 mx-auto sm:mx-0 overflow-hidden rounded-lg border-2 border-[#c5a059]">
                <img src={portrait} alt={character.name} className="h-full w-full object-cover" />
                <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full border-2 border-[#c5a059] bg-[#1f2533] overflow-hidden"><img src={classEmblem} alt={CLASS_LABELS[character.classCode]} className="h-full w-full object-cover" /></div>
                <div className="absolute top-1 left-1 rounded-md bg-[#f0a500] px-1.5 py-0.5 text-[10px] font-bold text-[#1a1207] shadow-md">Lv. {level}</div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059]">Pendekar</p>
                <h3 className="nus-title text-2xl font-bold text-[#f0f0f0]">{character.name}</h3>
                <p className="text-sm text-[#a0a6b8] mt-0.5">{CLASS_LABELS[character.classCode]} · {character.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                <div className="mt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  <span className="rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-2.5 py-0.5 text-[10px] text-[#c5a059]">Petualang Baru</span>
                  <span className="rounded-full border border-[#3e475e] bg-[#2d3548] px-2.5 py-0.5 text-[10px] text-[#a0a6b8]">via {user.provider === 'email' ? 'Email' : user.provider === 'google' ? 'Google' : 'Tamu'}</span>
                </div>
                {/* Chat + GM icons — above VIT bar (right column of stats grid) */}
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => { setChatOpen(true); setChatMessages(prev => prev.map(m => m.tab === chatTab ? { ...m, isRead: true } : m)) }} className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#1f2533]/90 border border-[#c5a059]/60 text-[#c5a059] hover:bg-[#2d3548] hover:border-[#f0a500] transition-colors cursor-pointer" title="Pesan/Chat" aria-label="Buka chat">
                    <MessageCircle className="h-4 w-4" />
                    {totalUnread > 0 && <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[9px] font-bold text-white animate-pulse">{totalUnread}</span>}
                  </button>
                  <button type="button" onClick={() => setGmOpen(true)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] border border-[#a855f7]/60 text-white hover:scale-110 transition-transform cursor-pointer shadow-[0_0_8px_rgba(168,85,247,0.5)]" title="GM Panel" aria-label="Buka panel GM">
                    <span className="text-[10px] font-bold">GM</span>
                  </button>
                </div>

                {/* Stats grid — STR | VIT / AGI | INT / LUCK | Life */}
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {STAT_LABELS.map(s => (
                    <div key={s.code} className="flex items-center gap-1.5 rounded-md border border-[#3a4259] bg-[#0f1320] px-2 py-1" title={s.desc}>
                      <span className="text-[10px] font-bold tracking-wider" style={{ color: s.color }}>{s.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (playerStats[s.code] / 50) * 100)}%`, backgroundColor: s.color }} /></div>
                      <span className="text-[11px] font-bold text-[#f0f0f0]">{playerStats[s.code]}</span>
                    </div>
                  ))}
                  {/* Life cell — to the right of LUCK, below INT */}
                  <div className="flex items-center gap-1.5 rounded-md border border-[#ef4444]/40 bg-[#0f1320] px-2 py-1" title="Life — berkurang 1 setiap kali kalah bertarung">
                    <span className="text-[10px] font-bold tracking-wider text-[#ef4444]">Life</span>
                    <div className="flex-1 flex items-center justify-center gap-0.5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skull key={i} className={`h-3 w-3 ${i < lives ? 'text-[#ef4444]' : 'text-[#3a4259] opacity-40'}`} />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-[#f0f0f0]">{lives}/3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HP / MP / EXP / Stamina bars */}
            <div className="mt-4 space-y-2">
              <div><div className="flex items-center justify-between text-[10px] mb-0.5"><span className="flex items-center gap-1 text-[#ef4444] font-semibold"><Heart className="h-3 w-3 fill-current" /> HP</span><span className="text-[#a0a6b8]">{hpCurrent} / {hpMax}</span></div><div className="h-3 rounded-full bg-[#0f1320] border border-[#3a4259] overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(hpCurrent / hpMax) * 100}%`, background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #f87171 100%)' }} /></div></div>
              <div><div className="flex items-center justify-between text-[10px] mb-0.5"><span className="flex items-center gap-1 text-[#3b82f6] font-semibold"><Zap className="h-3 w-3 fill-current" /> Magic</span><span className="text-[#a0a6b8]">{mpCurrent} / {mpMax}</span></div><div className="h-3 rounded-full bg-[#0f1320] border border-[#3a4259] overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(mpCurrent / mpMax) * 100}%`, background: 'linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)' }} /></div></div>
              <div><div className="flex items-center justify-between text-[10px] mb-0.5"><span className="flex items-center gap-1 text-[#f0a500] font-semibold"><Star className="h-3 w-3 fill-current" /> EXP</span><span className="text-[#a0a6b8]">{expIntoCurrentLevel} / {expNeededForNext} <span className="text-[#6b7280]">(total: {totalExp})</span></span></div><div className="h-2.5 rounded-full bg-[#0f1320] border border-[#3a4259] overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${expProgressPct}%`, background: 'linear-gradient(90deg, #c5a059 0%, #f0a500 50%, #fcd34d 100%)' }} /></div></div>
              {/* Stamina bar */}
              <div><div className="flex items-center justify-between text-[10px] mb-0.5"><span className="flex items-center gap-1 text-[#22c55e] font-semibold"><Flame className="h-3 w-3" /> Stamina</span><span className="text-[#a0a6b8]">{Math.floor(stamina)} / 100 <span className="text-[#6b7280]">(-5/battle · regen 10%/jam)</span></span></div><div className="h-2.5 rounded-full bg-[#0f1320] border border-[#3a4259] overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${stamina}%`, background: stamina < 20 ? 'linear-gradient(90deg, #b45309, #f59e0b)' : 'linear-gradient(90deg, #15803d, #22c55e, #4ade80)' }} /></div></div>
            </div>

            {/* Gold + Materials + Inventory buttons */}
            <div className="mt-4 pt-4 border-t border-[#3a4259]">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 rounded-lg border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-2">
                  <Coins className="h-5 w-5 text-[#f0a500]" />
                  <div><p className="text-[10px] uppercase tracking-wider text-[#c5a059]">Emas</p><p className="text-sm font-bold text-[#f0f0f0] nus-serif">{gold} <span className="text-[10px] text-[#a0a6b8]">keping</span></p></div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setEquipmentOpen(true)} className="flex items-center gap-2 rounded-lg border border-[#3e475e] bg-[#2d3548] hover:bg-[#3a4259] hover:border-[#c5a059] px-3 py-2 transition-colors cursor-pointer" title="Peralatan Karakter"><Shirt className="h-5 w-5 text-[#c5a059]" /></button>
                  <button type="button" onClick={() => setMerchantOpen(true)} className="flex items-center gap-2 rounded-lg border border-[#3e475e] bg-[#2d3548] hover:bg-[#3a4259] hover:border-[#c5a059] px-3 py-2 transition-colors cursor-pointer" title="Pedagang"><Store className="h-5 w-5 text-[#c5a059]" /></button>
                  <button type="button" onClick={() => setInventoryOpen(true)} className="flex items-center gap-2 rounded-lg border border-[#3e475e] bg-[#2d3548] hover:bg-[#3a4259] hover:border-[#c5a059] px-3 py-2 transition-colors cursor-pointer" title={`Kantong Peralatan — ${inventoryUsed}/${INVENTORY_CAPACITY} item`}><Backpack className="h-5 w-5 text-[#c5a059]" /><span className="text-xs font-bold text-[#f0f0f0] nus-serif">{inventoryUsed}/{INVENTORY_CAPACITY}</span></button>
                </div>
              </div>
              {/* Mini inventory */}
              <div className="mt-3 grid grid-cols-15 gap-1" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
                {Array.from({ length: INVENTORY_CAPACITY }).map((_, i) => {
                  const item = inventoryItems[i]
                  const rarityColor = item?.rarity ? RARITY_COLORS[item.rarity] : '#c5a059'
                  const forgeLvl = (item?.forgeLevel as number) || 0
                  const hasForgeGlow = forgeLvl >= 10
                  return <button key={i} type="button" onClick={() => item && setSelectedItem({ ...item, index: i })} disabled={!item} className={`relative aspect-square rounded border overflow-hidden flex items-center justify-center text-base transition-all ${item ? item.image ? `bg-[#0f1320] hover:scale-110 cursor-pointer ${hasForgeGlow ? 'nus-forge-glow' : ''}` : 'border-[#c5a059]/50 bg-[#2d3548] text-[#f0a500] hover:border-[#f0a500] hover:bg-[#3a4259] hover:scale-110 cursor-pointer' : 'border-[#3a4259] bg-[#0f1320] text-[#3a4259] cursor-default'}`} style={item?.image ? { borderColor: hasForgeGlow ? '#f0a500' : rarityColor, borderWidth: '2px' } : undefined} title={item ? `${item.name}${forgeLvl > 0 ? ` +${forgeLvl}` : ''} ×${item.qty}` : 'Slot kosong'} aria-label={item ? `Item: ${item.name}` : 'Slot kosong'}>{item ? item.image ? <><img src={item.image} alt={item.name} className="w-full h-full object-cover" draggable={false} />{item.qty > 1 && <span className="absolute top-0 right-0 text-[8px] font-bold text-white bg-black/80 rounded-bl px-0.5 leading-tight">×{item.qty}</span>}</> : <span className="leading-none">{item.icon}</span> : <CircleDot className="h-2.5 w-2.5" />}{forgeLvl > 0 && <span className={`absolute bottom-0 left-0 text-[8px] font-bold rounded-tr px-0.5 leading-tight ${hasForgeGlow ? 'bg-[#f0a500] text-[#1a1207] nus-forge-glow-text' : 'bg-[#f0a500]/90 text-[#1a1207]'}`}>+{forgeLvl}</span>}</button>
                })}
              </div>
              <p className="mt-1.5 text-center text-[10px] text-[#6b7280]">Klik ikon item untuk lihat detail & opsi</p>
            </div>
          </div>

          {/* Materials bar */}
          <div className="mt-5 rounded-xl border border-[#3a4259] bg-[#1f2533]/60 p-3">
            <div className="flex items-center gap-2 mb-2"><Gem className="h-4 w-4 text-[#c5a059]" /><h4 className="nus-serif text-xs font-semibold text-[#c5a059] uppercase tracking-wider">Material Tempa</h4></div>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-lg border border-[#22c55e]/40 bg-[#0f1320] px-2 py-2">
                <img src="/materials/kayu.png" alt="Kayu" className="h-9 w-9 object-contain" draggable={false} />
                <p className="text-[9px] uppercase tracking-wider text-[#22c55e]">Kayu</p>
                <p className="text-sm font-bold text-[#f0f0f0] nus-serif leading-none">{materials.kayu}</p>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-[#3e475e] bg-[#0f1320] px-2 py-2">
                <img src="/materials/besi.png" alt="Besi" className="h-9 w-9 object-contain" draggable={false} />
                <p className="text-[9px] uppercase tracking-wider text-[#9ca3af]">Besi</p>
                <p className="text-sm font-bold text-[#f0f0f0] nus-serif leading-none">{materials.besi}</p>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-[#d4a04a]/40 bg-[#0f1320] px-2 py-2">
                <img src="/materials/kulit.png" alt="Kulit" className="h-9 w-9 object-contain" draggable={false} />
                <p className="text-[9px] uppercase tracking-wider text-[#d4a04a]">Kulit</p>
                <p className="text-sm font-bold text-[#f0f0f0] nus-serif leading-none">{materials.kulit}</p>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-[#f0a500]/50 bg-[#f0a500]/5 px-2 py-2">
                <img src="/materials/emas.png" alt="Emas" className="h-9 w-9 object-contain" draggable={false} />
                <p className="text-[9px] uppercase tracking-wider text-[#f0a500]">Emas</p>
                <p className="text-sm font-bold text-[#f0f0f0] nus-serif leading-none">{materials.emas}</p>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-[#a855f7]/50 bg-[#a855f7]/5 px-2 py-2">
                <img src="/materials/batu-meteor.png" alt="Batu Meteor" className="h-9 w-9 object-contain" draggable={false} />
                <p className="text-[9px] uppercase tracking-wider text-[#a855f7]">Batu Meteor</p>
                <p className="text-sm font-bold text-[#f0f0f0] nus-serif leading-none">{materials.batuMeteor}</p>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-[#ec4899]/50 bg-[#ec4899]/5 px-2 py-2">
                <img src="/materials/permata.png" alt="Permata" className="h-9 w-9 object-contain" draggable={false} />
                <p className="text-[9px] uppercase tracking-wider text-[#ec4899]">Permata</p>
                <p className="text-sm font-bold text-[#f0f0f0] nus-serif leading-none">{materials.permata}</p>
              </div>
              <button type="button" onClick={() => { setBlacksmithOpen(true); setBlacksmithItem(null); setForgeAnimation('idle') }} className="flex flex-col items-center justify-center gap-1 rounded-lg border border-[#ef4444]/60 bg-gradient-to-b from-[#ef4444]/15 to-[#f0a500]/10 px-2 py-2 hover:from-[#ef4444]/25 hover:to-[#f0a500]/20 hover:border-[#f0a500] transition-all cursor-pointer" title="Bengkel Tukang Tempa">
                <Hammer className="h-9 w-9 text-[#f0a500]" />
                <p className="text-[9px] uppercase tracking-wider text-[#f0a500] font-bold">Blacksmith</p>
                <p className="text-[9px] text-[#a0a6b8] leading-none">Tempa Equipment</p>
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[#6b7280] text-center">Kayu, Besi & Kulit untuk upgrade · Emas untuk tempa senjata · Batu Meteor untuk tempa Epic · Permata = mata uang premium · <span className="text-[#f0a500]">Klik Blacksmith untuk menempa peralatan</span></p>
          </div>

          {/* Story intro */}
          <div className="mt-5 rounded-xl border border-[#3a4259] bg-[#1f2533]/60 p-4">
            <div className="flex items-center gap-2 mb-2"><ScrollText className="h-4 w-4 text-[#c5a059]" /><h4 className="nus-serif text-sm font-semibold text-[#f0f0f0]">Awal Perjalanan</h4></div>
            <p className="text-sm leading-relaxed text-[#a0a6b8]"><span className="nus-serif text-[#f0f0f0]">{character.name}</span>, seorang <span className="text-[#c5a059]">{CLASS_LABELS[character.classCode]}</span> yang baru melangkah ke tanah Nusantara. Pilih langkahmu — setiap jalan menyimpan rahasia dan takdirnya sendiri.</p>
          </div>

          {/* World actions */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button type="button" onClick={() => setMapOpen(true)} className="nus-btn-ghost h-20 rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#c5a059]"><MapPin className="h-5 w-5 text-[#c5a059]" /><span className="text-xs font-semibold">Jelajah Peta</span><span className="text-[9px] text-[#c5a059]">Buka Peta Nusantara</span></button>
            <button type="button" onClick={() => level >= 10 ? setAkademiOpen(true) : toast({ variant: 'destructive', title: 'Level belum cukup', description: 'Berguru tersedia mulai Level 10.' })} disabled={level < 10} className={`h-20 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-colors ${level >= 10 ? 'nus-btn-primary cursor-pointer' : 'nus-btn-ghost cursor-not-allowed opacity-60'}`}><GraduationCap className="h-5 w-5 text-[#c5a059]" /><span className="text-xs font-semibold">Berguru</span><span className="text-[9px] ${level >= 10 ? 'text-[#1a1207]' : 'text-[#6b7280]'}">{level >= 10 ? 'Pilih Akademi' : `Butuh Lv.10 (saat ini Lv.${level})`}</span></button>
            <button type="button" onClick={() => setHomeOpen(true)} className="nus-btn-ghost h-20 rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#c5a059]"><Home className="h-5 w-5 text-[#c5a059]" /><span className="text-xs font-semibold">Rumahmu</span><span className="text-[9px] text-[#c5a059]">Istirahat & Upgrade</span></button>
          </div>

          {/* Cloud Save status + manual save */}
          <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-[#3a4259] bg-[#1f2533]/60 px-3 py-2">
            <span className="text-[11px] text-[#a0a6b8]">
              {saveStatus === 'saving' && 'Menyimpan progress…'}
              {saveStatus === 'saved' && '✓ Progress tersimpan ke cloud'}
              {saveStatus === 'error' && '⚠ Gagal menyimpan (coba lagi)'}
              {saveStatus === 'idle' && (saveLoaded ? 'Auto-save aktif · progress tersimpan otomatis' : 'Memuat progress…')}
            </span>
            <button type="button" onClick={persistSave} disabled={saveStatus === 'saving'} className="nus-btn-primary h-8 px-3 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
              <Save className="h-3.5 w-3.5" /> Simpan Progress
            </button>
          </div>

          {/* Footer actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <button type="button" onClick={onDeleteCharacter} className="nus-btn-ghost border-[#3e475e] h-10 px-4 rounded-md text-xs font-medium inline-flex items-center justify-center gap-1.5 sm:flex-1">Buat Karakter Baru</button>
            <button type="button" onClick={onLogout} className="nus-btn-ghost border-[#3e475e] h-10 px-4 rounded-md text-xs font-medium inline-flex items-center justify-center gap-1.5 sm:flex-1"><LogOut className="h-3.5 w-3.5" /> Keluar dari Nusantara</button>
          </div>
        </div>
      </div>

      {/* ===== Map Dialog ===== */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-7xl w-[97vw] p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Compass className="h-5 w-5 text-[#f0a500]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Peta Nusantara</DialogTitle></div>
              <button type="button" onClick={() => setMapOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup peta"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Klik <span className="text-[#22c55e]">monster kecil</span> (hijau), <span className="text-[#f0a500]">monster sedang</span> (kuning), <span className="text-[#a855f7]">tengkorak</span> (ungu), atau <span className="text-[#ef4444]">raksasa</span> (merah) untuk bertarung. Klik <span className="text-[#22c55e]">kota</span> untuk info.</DialogDescription>
          </DialogHeader>
          {/* Filter tabs */}
          <div className="px-6 py-2 border-b border-[#3a4259] flex items-center gap-1.5 flex-wrap flex-shrink-0">
            {([
              { key: 'all', label: 'Semua', count: MARKERS.length },
              { key: 'monster', label: 'Monster Kecil', count: MARKERS.filter(m => m.type === 'monster').length },
              { key: 'medium', label: 'Monster Sedang', count: MARKERS.filter(m => m.type === 'medium').length },
              { key: 'city', label: 'Kota', count: MARKERS.filter(m => m.type === 'city').length },
              { key: 'skull', label: 'Monster Tengkorak', count: MARKERS.filter(m => m.type === 'skull').length },
              { key: 'boss', label: 'Monster Raksasa', count: MARKERS.filter(m => m.type === 'boss').length },
            ] as const).map(f => (
              <button key={f.key} type="button" onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${filter === f.key ? 'bg-[#f0a500] text-[#1a1207]' : 'bg-[#2d3548] text-[#a0a6b8] hover:text-[#f0f0f0]'}`}>{f.label} ({f.count})</button>
            ))}
          </div>
          {/* Map + Info panel */}
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="relative bg-[#0f1320] overflow-auto nus-scroll" style={{ maxHeight: '40vh', minHeight: '200px' }}>
              <div className="relative inline-block min-w-full">
                <img src="/peta-nusantara.png" alt="Peta Nusantara" className="block w-full h-auto" draggable={false} />
                {filteredMarkers.map(m => {
                  const isSelected = selectedMarker?.id === m.id
                  return <button key={m.id} type="button" onClick={() => { setSelectedMarker(m); if ((m.type === 'monster' || m.type === 'medium' || m.type === 'skull' || m.type === 'boss') && m.monster) { setBattleLog([]); setBattleEnded(null); setIsBattling(false); setBattleMonster(null); setBattleModalOpen(true) } }} className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none" style={{ left: `${m.x}%`, top: `${m.y}%` }} title={`${m.name}${m.region ? ` (${m.region})` : ''}`} aria-label={`${m.type === 'city' ? 'Kota' : m.type === 'skull' ? 'Monster Tengkorak' : m.type === 'boss' ? 'Monster Raksasa' : m.type === 'medium' ? 'Monster Sedang' : m.type === 'monster' ? 'Monster Kecil' : 'Monster'}: ${m.name}`}>{renderMarkerIcon(m, isSelected)}<span className={`absolute left-1/2 -translate-x-1/2 -bottom-5 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-semibold transition-opacity duration-200 pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ backgroundColor: 'rgba(15, 19, 32, 0.92)', color: m.type === 'medium' ? '#f0a500' : DANGER_COLORS[m.danger], border: `1px solid ${m.type === 'medium' ? '#f0a50060' : `${DANGER_COLORS[m.danger]}60`}` }}>{m.name}</span></button>
                })}
              </div>
            </div>
            <div className="border-t border-[#3a4259] bg-[#1f2533] p-4 overflow-y-auto nus-scroll flex-1 min-h-0" style={{ maxHeight: '45vh' }}>
              {!selectedMarker ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left py-4">
                  <div className="flex items-center gap-3"><Compass className="h-8 w-8 text-[#3a4259] flex-shrink-0" /><div><p className="nus-serif text-sm text-[#a0a6b8]">Pilih penanda di peta</p><p className="text-[11px] text-[#6b7280] mt-0.5">Klik monster sedang/kecil/tengkorak/raksasa untuk bertarung, kota untuk info</p></div></div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center sm:justify-start">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5"><p className="text-[10px] uppercase tracking-wider text-[#6b7280] w-full sm:w-auto">Tingkat Bahaya:</p>{(['Aman', 'Waspada', 'Berbahaya', 'Maut'] as const).map(d => <div key={d} className="flex items-center gap-1.5 text-xs"><span className="h-3 w-3 rounded-full border border-white/60" style={{ backgroundColor: DANGER_COLORS[d] }} /><span className="text-[#a0a6b8]">{d}</span></div>)}</div>
                    <div className="hidden sm:block w-px h-6 bg-[#3a4259]" />
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5"><p className="text-[10px] uppercase tracking-wider text-[#6b7280] w-full sm:w-auto">Jenis:</p><div className="flex items-center gap-1.5 text-xs"><Sword className="h-3.5 w-3.5 text-[#22c55e]" /><span className="text-[#22c55e]">Monster Kecil</span></div><div className="flex items-center gap-1.5 text-xs"><Sword className="h-3.5 w-3.5 text-[#f0a500]" /><span className="text-[#f0a500]">Monster Sedang</span></div><div className="flex items-center gap-1.5 text-xs"><MapPin className="h-3.5 w-3.5 text-[#22c55e]" /><span className="text-[#a0a6b8]">Kota</span></div><div className="flex items-center gap-1.5 text-xs"><Skull className="h-3.5 w-3.5 text-[#a855f7]" /><span className="text-[#a855f7]">Monster Tengkorak</span></div><div className="flex items-center gap-1.5 text-xs"><Skull className="h-3.5 w-3.5 text-[#ef4444]" /><span className="text-[#ef4444]">Monster Raksasa</span></div></div>
                  </div>
                </div>
              ) : selectedMarker.type === 'monster' || selectedMarker.type === 'medium' || selectedMarker.type === 'skull' || selectedMarker.type === 'boss' ? (
                /* Monster/Medium/Skull/Boss marker — battle happens in separate window */
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6 text-center sm:text-left">
                  <div className="flex items-center gap-3">{selectedMarker.type === 'skull' ? <Skull className="h-8 w-8 text-[#a855f7] flex-shrink-0" /> : selectedMarker.type === 'boss' ? <Skull className="h-8 w-8 text-[#ef4444] flex-shrink-0" /> : selectedMarker.type === 'medium' ? <Sword className="h-8 w-8 text-[#f0a500] flex-shrink-0" /> : <Sword className="h-8 w-8 text-[#22c55e] flex-shrink-0" />}<div><p className="nus-serif text-sm text-[#f0f0f0] font-semibold">{selectedMarker.name}</p><p className="text-[11px] text-[#a0a6b8] mt-0.5">{selectedMarker.region ? `${selectedMarker.region} · ` : ''}Bahaya: {selectedMarker.danger}{selectedMarker.monster && ` · Lv.${selectedMarker.monster.level}`}</p></div></div>
                  <button type="button" onClick={() => { setBattleLog([]); setBattleEnded(null); setIsBattling(false); setBattleMonster(null); setBattleModalOpen(true) }} className="nus-btn-primary h-10 px-5 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"><Sword className="h-4 w-4" /> Buka Jendela Pertempuran</button>
                </div>
              ) : (
                /* City marker — info card */
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#22c55e]" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059]">Kota{selectedMarker.region ? ` · ${selectedMarker.region}` : ''}</span>
                    </div>
                    <h3 className="nus-title text-xl font-bold text-[#f0f0f0]">{selectedMarker.name}</h3>
                    <div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" style={{ color: DANGER_COLORS[selectedMarker.danger] }} /><span className="text-xs font-semibold uppercase tracking-wide" style={{ color: DANGER_COLORS[selectedMarker.danger] }}>Bahaya: {selectedMarker.danger}</span></div>
                    <p className="text-xs leading-relaxed text-[#a0a6b8]">{selectedMarker.description}</p>
                  </div>
                  <div className="pt-3 border-t border-[#3a4259]">
                    <button type="button" disabled className="nus-btn-ghost w-full h-9 rounded-md text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60"><Navigation className="h-3.5 w-3.5" /> Pergi ke {selectedMarker.name}</button>
                    <p className="text-center text-[10px] text-[#6b7280] mt-1.5">Sistem perjalanan segera hadir</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Battle Dialog (separate window for monster encounters) ===== */}
      <Dialog open={battleModalOpen} onOpenChange={setBattleModalOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-4xl w-[95vw] p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sword className="h-5 w-5 text-[#22c55e]" />
                <DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Pertempuran</DialogTitle>
                {selectedMarker && <span className="text-[11px] uppercase tracking-[0.2em] text-[#c5a059] ml-1">· {selectedMarker.name}{selectedMarker.region ? ` (${selectedMarker.region})` : ''}</span>}
              </div>
              <button type="button" onClick={() => setBattleModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup pertempuran"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Pertarungan bergantian: 1 aksi kamu, lalu 1 aksi musuh. Tutup untuk kembali ke peta.</DialogDescription>
          </DialogHeader>
          {/* Battle body */}
          <div className="flex-1 overflow-y-auto nus-scroll p-5">
            {selectedMarker && (selectedMarker.type === 'monster' || selectedMarker.type === 'medium' || selectedMarker.type === 'skull' || selectedMarker.type === 'boss') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: monster info + stats + player stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    {selectedMarker.type === 'skull' ? <Skull className="h-3.5 w-3.5 text-[#a855f7]" /> : selectedMarker.type === 'boss' ? <Skull className="h-3.5 w-3.5 text-[#ef4444]" /> : selectedMarker.type === 'medium' ? <Sword className="h-3.5 w-3.5 text-[#f0a500]" /> : <Sword className="h-3.5 w-3.5 text-[#22c55e]" />}
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059]">{selectedMarker.type === 'skull' ? 'Monster Tengkorak' : selectedMarker.type === 'boss' ? 'Monster Raksasa' : selectedMarker.type === 'medium' ? 'Monster Sedang' : 'Monster Kecil'}{selectedMarker.region ? ` · ${selectedMarker.region}` : ''}</span>
                  </div>
                  <h3 className="nus-title text-xl font-bold text-[#f0f0f0]">{selectedMarker.name}</h3>
                  <div className="flex items-center gap-2"><Sword className="h-3.5 w-3.5" style={{ color: DANGER_COLORS[selectedMarker.danger] }} /><span className="text-xs font-semibold uppercase tracking-wide" style={{ color: DANGER_COLORS[selectedMarker.danger] }}>Bahaya: {selectedMarker.danger}</span></div>
                  <p className="text-xs leading-relaxed text-[#a0a6b8]">{selectedMarker.description}</p>
                  {/* Monster battle portrait */}
                  {selectedMarker.monster?.image && (
                    <div className="flex flex-col items-center gap-1.5 py-2">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-xl blur-xl opacity-50" style={{ background: `radial-gradient(circle, ${DANGER_COLORS[selectedMarker.danger]} 0%, transparent 70%)` }} />
                        <img src={selectedMarker.monster.image} alt={selectedMarker.name} draggable={false} className={`relative w-44 h-32 object-contain rounded-lg border-2 bg-[#0f1320] ${monsterHit ? 'nus-monster-hit border-[#ef4444]' : monsterActing ? 'nus-monster-bob border-[#f0a500]' : 'nus-monster-bob border-[#c5a059]'}`} style={{ boxShadow: monsterHit ? '0 0 20px rgba(239, 68, 68, 0.6)' : monsterActing ? '0 0 20px rgba(240, 165, 0, 0.7)' : `0 0 16px ${DANGER_COLORS[selectedMarker.danger]}40` }} />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-36"><div className="h-2.5 rounded-full bg-[#0f1320] border border-[#3a4259] overflow-hidden"><div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(0, (monsterHp / Math.max(1, monsterHpMax)) * 100)}%`, background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)' }} /></div></div>
                      </div>
                      <p className="mt-2 text-[10px] uppercase tracking-wider nus-serif" style={{ color: monsterActing ? '#f0a500' : '#c5a059' }}>{monsterHit ? '⚡ Terkena serangan!' : monsterActing ? '🔥 Monster menyerang...' : isBattling ? `❤️ HP: ${Math.max(0, monsterHp)} / ${monsterHpMax}` : '⚔ Siap bertarung'}</p>
                    </div>
                  )}
                  {/* Monster stats */}
                  {selectedMarker.monster && (
                    <div className="rounded-lg border border-[#3a4259] bg-[#0f1320] p-2.5 space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-[#c5a059] font-semibold">Lv. {selectedMarker.monster.level} · Stat Monster</p>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-1"><span className="text-[#a0a6b8]">HP</span><span className="font-bold text-[#ef4444]">{isBattling ? Math.max(0, monsterHp) : selectedMarker.monster.hp}{isBattling && <span className="text-[#6b7280]"> / {monsterHpMax}</span>}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-1"><span className="text-[#a0a6b8]">ATK</span><span className="font-bold text-[#f0a500]">{selectedMarker.monster.attack}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-1"><span className="text-[#a0a6b8]">DEF</span><span className="font-bold text-[#3b82f6]">{selectedMarker.monster.defense}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-1"><span className="text-[#a0a6b8]">EXP</span><span className="font-bold text-[#c5a059]">+{selectedMarker.monster.expReward}</span></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] rounded bg-[#1f2533] px-2 py-1"><span className="text-[#a0a6b8]">Hadiah Emas</span><span className="font-bold text-[#f0a500]">+{selectedMarker.monster.goldReward} keping</span></div>
                    </div>
                  )}
                  {/* Player stats during battle */}
                  <div className="rounded-lg border border-[#22c55e]/40 bg-[#0f1320] p-2.5 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-[#22c55e] font-semibold flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-[#22c55e]" />Lv. {level} · Stat {character.name}</p>
                    <div><div className="flex items-center justify-between text-[10px] mb-0.5"><span className="flex items-center gap-1 text-[#ef4444] font-semibold"><Heart className="h-2.5 w-2.5 fill-current" /> HP</span><span className={`font-bold ${hpCurrent <= hpMax * 0.3 ? 'text-[#ef4444] animate-pulse' : 'text-[#f0f0f0]'}`}>{hpCurrent} / {hpMax}</span></div><div className="h-2 rounded-full bg-[#1f2533] border border-[#3a4259] overflow-hidden"><div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(0, (hpCurrent / hpMax) * 100)}%`, background: hpCurrent <= hpMax * 0.3 ? 'linear-gradient(90deg, #dc2626, #ef4444)' : 'linear-gradient(90deg, #16a34a, #22c55e)' }} /></div></div>
                    <div><div className="flex items-center justify-between text-[10px] mb-0.5"><span className="flex items-center gap-1 text-[#3b82f6] font-semibold"><Zap className="h-2.5 w-2.5 fill-current" /> Magic</span><span className="font-bold text-[#f0f0f0]">{mpCurrent} / {mpMax}</span></div><div className="h-1.5 rounded-full bg-[#1f2533] border border-[#3a4259] overflow-hidden"><div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(0, (mpCurrent / mpMax) * 100)}%`, background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)' }} /></div></div>
                    <div className="grid grid-cols-5 gap-1 text-[10px]">{STAT_LABELS.map(s => <div key={s.code} className="flex flex-col items-center rounded bg-[#1f2533] px-1 py-0.5"><span className="font-bold" style={{ color: s.color }}>{s.label}</span><span className="text-[#f0f0f0] font-bold">{playerStats[s.code]}</span></div>)}</div>
                    {defending && <div className="text-center text-[10px] text-[#3b82f6] font-semibold animate-pulse">🛡️ Posisi Bertahan Aktif</div>}
                  </div>
                  {/* Pet stats during battle */}
                  {equippedPet && (
                    <div className="rounded-lg border border-[#a855f7]/40 bg-[#0f1320] p-2.5 space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-[#a855f7] font-semibold flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-[#a855f7]" />Pet: {equippedPet.name} (Lv.{equippedPet.level})
                      </p>
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="text-[#a855f7]">HP</span>
                          <span className={equippedPet.hp <= 0 ? 'text-[#ef4444] font-bold' : 'text-[#f0f0f0]'}>{equippedPet.hp} / {equippedPet.hpMax}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#1f2533] border border-[#3a4259] overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(0, (equippedPet.hp / equippedPet.hpMax) * 100)}%`, background: equippedPet.hp <= 0 ? '#3a4259' : 'linear-gradient(90deg, #7c3aed, #a855f7)' }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-0.5"><span className="text-[#a0a6b8]">ATK</span><span className="font-bold text-[#f0a500]">{equippedPet.attack}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-0.5"><span className="text-[#a0a6b8]">DEF</span><span className="font-bold text-[#3b82f6]">{equippedPet.defense}</span></div>
                      </div>
                      {equippedPet.hp <= 0 && <p className="text-center text-[10px] text-[#ef4444] font-semibold">💀 Pet KO — tidak bisa menyerang</p>}
                    </div>
                  )}
                </div>
                {/* Right: battle log + actions */}
                <div className="space-y-2 flex flex-col">
                  <div className="rounded-lg border border-[#c5a059]/40 bg-[#0f1320] p-2.5 flex-1 overflow-y-auto nus-scroll min-h-[180px] max-h-[300px]">
                    <p className="text-[10px] uppercase tracking-wider text-[#c5a059] font-semibold mb-1 flex items-center gap-1.5"><span className={`inline-block h-2 w-2 rounded-full ${isBattling ? (isPlayerTurn ? 'bg-[#22c55e] animate-pulse' : 'bg-[#f0a500] animate-pulse') : 'bg-[#3a4259]'}`} /> Log Pertempuran{isBattling && <span className="ml-auto text-[9px] normal-case tracking-normal text-[#a0a6b8]">{isPlayerTurn ? '🎲 Giliranmu' : '🔥 Giliran musuh'}</span>}</p>
                    {battleLog.length > 0 ? <div className="space-y-0.5">{battleLog.map((line, i) => <p key={i} className={`text-[10px] leading-relaxed whitespace-pre-wrap font-sans ${line.includes('🏆') || line.includes('⭐') ? 'text-[#f0a500] font-bold' : line.includes('💀') || line.includes('❌') ? 'text-[#ef4444] font-bold' : line.includes('— Giliran') ? 'text-[#c5a059] font-semibold italic' : line.includes('🗡️') || line.includes('✦') || line.includes('📦') ? 'text-[#22c55e]' : 'text-[#a0a6b8]'}`}>{line}</p>)}</div> : <p className="text-[11px] text-[#6b7280] italic py-2 text-center">Klik tombol di bawah untuk memulai pertarungan dengan {selectedMarker.name}.</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button type="button" onClick={handleAttack} disabled={!isPlayerTurn || !isBattling} className="nus-btn-primary h-9 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"><Sword className="h-3.5 w-3.5" /> Serang</button>
                    <button type="button" onClick={handleDefend} disabled={!isPlayerTurn || !isBattling} className="nus-btn-ghost h-9 rounded-md text-xs font-medium inline-flex items-center justify-center gap-1.5 border-[#3e475e] hover:border-[#3b82f6] hover:text-[#3b82f6] disabled:opacity-40 disabled:cursor-not-allowed"><Shield className="h-3.5 w-3.5" /> Bertahan</button>
                    <button type="button" onClick={handleBattleItem} disabled={!isPlayerTurn || !isBattling} className="nus-btn-ghost h-9 rounded-md text-xs font-medium inline-flex items-center justify-center gap-1.5 border-[#3e475e] hover:border-[#c5a059] hover:text-[#c5a059] disabled:opacity-40 disabled:cursor-not-allowed"><Backpack className="h-3.5 w-3.5" /> Item</button>
                    <button type="button" onClick={handleFlee} disabled={!isPlayerTurn || !isBattling} className="nus-btn-ghost h-9 rounded-md text-xs font-medium inline-flex items-center justify-center gap-1.5 border-[#3e475e] hover:border-[#ef4444] hover:text-[#ef4444] disabled:opacity-40 disabled:cursor-not-allowed"><Navigation className="h-3.5 w-3.5" /> Lari</button>
                    {(() => {
                      const fishIdx = getTameableFishIndex()
                      const canTame = fishIdx >= 0 && isPlayerTurn && isBattling && monsterHp > 0 && monsterHp <= monsterHpMax * 0.25
                      if (fishIdx < 0) return null
                      const fishItem = inventoryItems[fishIdx]
                      return (
                        <button type="button" onClick={handleTameMonster} disabled={!canTame} className={`h-9 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all border-2 ${canTame ? 'border-[#a855f7] bg-[#a855f7]/15 text-[#a855f7] hover:bg-[#a855f7]/25 cursor-pointer animate-pulse' : 'border-[#3a4259] bg-[#0f1320] text-[#6b7280] cursor-not-allowed'}`} title={canTame ? `Jinakkan dengan ${fishItem.name}` : monsterHp > monsterHpMax * 0.25 ? `HP musuh harus < 25% (saat ini ${Math.floor((monsterHp / monsterHpMax) * 100)}%)` : ''}>
                          <Sparkles className="h-3.5 w-3.5" /> Jinakkan {fishItem.name ? <span className="text-[9px] opacity-70">({fishItem.name})</span> : null}
                        </button>
                      )
                    })()}
                  </div>
                  {!isBattling && (
                    <div className="space-y-1.5">
                      {battleEnded === 'victory' || battleEnded === 'fled' ? (
                        <><button type="button" onClick={() => startBattle(selectedMarker)} className="nus-btn-primary w-full h-9 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5"><Sword className="h-3.5 w-3.5" /> Tantang {selectedMarker.name} lagi</button><p className="text-center text-[10px] text-[#22c55e]">{battleEnded === 'victory' ? '🏆 Kamu menang!' : '🏃 Kamu berhasil lari.'}</p></>
                      ) : battleEnded === 'defeat' ? (
                        <><button type="button" onClick={() => { setHpCurrent(hpMax); setMpCurrent(mpMax); setBattleEnded(null); setIsBattling(false); setBattleMonster(null) }} className="nus-btn-primary w-full h-9 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5"><Heart className="h-3.5 w-3.5" /> Pulihkan & Coba lagi</button><p className="text-center text-[10px] text-[#ef4444]">💀 Kamu kalah. Istirahat dulu.</p></>
                      ) : (
                        <><button type="button" onClick={() => startBattle(selectedMarker)} className="nus-btn-primary w-full h-9 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5"><Sword className="h-3.5 w-3.5" /> Mulai Bertarung</button><button type="button" onClick={() => { setHpCurrent(hpMax); setMpCurrent(mpMax); setBattleLog([]); setBattleEnded(null); setIsBattling(false); setBattleMonster(null) }} disabled={hpCurrent >= hpMax} className="nus-btn-ghost w-full h-8 rounded-md text-xs font-medium inline-flex items-center justify-center gap-1.5 border-[#3e475e] disabled:opacity-40"><Heart className="h-3.5 w-3.5" /> Istirahat & Pulihkan HP</button><p className="text-center text-[10px] text-[#6b7280]">Pertarungan bergantian: 1 aksi kamu, lalu 1 aksi musuh.</p></>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Inventory Dialog ===== */}
      <Dialog open={inventoryOpen} onOpenChange={setInventoryOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-lg w-[95vw]">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Backpack className="h-5 w-5 text-[#f0a500]" /><DialogTitle className="nus-title text-xl text-[#f0f0f0]">Kantong Peralatan</DialogTitle></div><button type="button" onClick={() => setInventoryOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup"><X className="h-5 w-5" /></button></div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Kapasitas {inventoryUsed} / {INVENTORY_CAPACITY} item.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-2">
            <div className="flex items-center gap-2"><Coins className="h-4 w-4 text-[#f0a500]" /><span className="text-sm font-bold text-[#f0f0f0]">{gold}</span><span className="text-[10px] text-[#a0a6b8]">keping emas</span></div>
            <div className="flex items-center gap-2"><span className="text-[10px] text-[#a0a6b8]">Kapasitas</span><div className="h-2 w-24 rounded-full bg-[#0f1320] border border-[#3a4259] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(inventoryUsed / INVENTORY_CAPACITY) * 100}%`, background: 'linear-gradient(90deg, #c5a059 0%, #f0a500 100%)' }} /></div><span className="text-[11px] font-bold text-[#f0f0f0]">{inventoryUsed}/{INVENTORY_CAPACITY}</span></div>
          </div>
          <div className="grid grid-cols-5 gap-2 py-2">
            {Array.from({ length: INVENTORY_CAPACITY }).map((_, i) => {
              const item = inventoryItems[i]
              const isSelected = selectedItem?.index === i
              const rarityColor = item?.rarity ? RARITY_COLORS[item.rarity] : '#c5a059'
              const forgeLvl = (item?.forgeLevel as number) || 0
              const hasForgeGlow = forgeLvl >= 10
              return <button key={i} type="button" onClick={() => item && setSelectedItem({ ...item, index: i })} disabled={!item} className={`relative aspect-square rounded-lg border-2 overflow-hidden flex items-center justify-center transition-all ${item ? item.image ? isSelected ? 'bg-[#0f1320] scale-105 shadow-[0_0_0_3px_rgba(240,165,0,0.2)]' : 'bg-[#0f1320] hover:scale-105 cursor-pointer' : isSelected ? 'border-[#f0a500] bg-[#3a4259] scale-105 shadow-[0_0_0_3px_rgba(240,165,0,0.2)]' : 'border-[#c5a059]/60 bg-[#2d3548] hover:border-[#f0a500] hover:bg-[#3a4259] hover:scale-105 cursor-pointer' : 'border-[#3a4259] bg-[#0f1320]/60 cursor-default'} ${item?.image ? 'bg-[#0f1320]' : ''} ${hasForgeGlow ? 'nus-forge-glow' : ''}`} style={item?.image ? { borderColor: isSelected ? '#f0a500' : (hasForgeGlow ? '#f0a500' : rarityColor) } : undefined} title={item ? `${item.name}${forgeLvl > 0 ? ` +${forgeLvl}` : ''} ×${item.qty}` : 'Slot kosong'} aria-label={item ? `Item: ${item.name}` : 'Slot kosong'}>{item ? item.image ? <><img src={item.image} alt={item.name} className="w-full h-full object-contain bg-[#0a0d15]" draggable={false} />{item.qty > 1 && <span className="absolute top-0.5 right-1 text-[11px] font-bold text-white bg-black/80 rounded px-1">×{item.qty}</span>}</> : <><span className="text-3xl leading-none text-[#f0a500]">{item.icon}</span>{item.qty > 1 && <span className="absolute top-0.5 right-1 text-[11px] font-bold text-[#f0a500] bg-[#1a1f2e]/80 rounded px-1">×{item.qty}</span>}</> : <CircleDot className="h-3 w-3 text-[#3a4259]" />}{forgeLvl > 0 && <span className={`absolute bottom-0 left-0 text-[10px] font-bold rounded-tr px-1 leading-tight ${hasForgeGlow ? 'bg-[#f0a500] text-[#1a1207] nus-forge-glow-text' : 'bg-[#f0a500]/90 text-[#1a1207]'}`}>+{forgeLvl}</span>}</button>
            })}
          </div>
          <p className="text-center text-[11px] text-[#6b7280]">Klik ikon item untuk lihat detail & opsi (pakai / buang)</p>
          {/* Item detail */}
          {selectedItem && (
            <div className="mt-3 rounded-lg border border-[#c5a059]/50 bg-[#0f1320] p-3 nus-fade-up">
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0 h-20 w-20 rounded-lg border-2 overflow-hidden bg-[#2d3548] flex items-center justify-center" style={{ borderColor: selectedItem.rarity ? RARITY_COLORS[selectedItem.rarity] : '#c5a059', boxShadow: selectedItem.rarity ? `0 0 12px ${RARITY_COLORS[selectedItem.rarity]}50` : undefined }}>{selectedItem.image ? <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-contain bg-[#0a0d15]" draggable={false} /> : <span className="text-4xl leading-none text-[#f0a500]">{selectedItem.icon}</span>}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2"><h4 className="nus-title text-base font-bold text-[#f0f0f0]">{selectedItem.name}</h4><button type="button" onClick={() => setSelectedItem(null)} className="text-[#6b7280] hover:text-[#f0f0f0] transition-colors" aria-label="Tutup detail"><X className="h-4 w-4" /></button></div>
                  {selectedItem.rarity && <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: RARITY_COLORS[selectedItem.rarity], border: `1px solid ${RARITY_COLORS[selectedItem.rarity]}`, backgroundColor: `${RARITY_COLORS[selectedItem.rarity]}20` }}>{selectedItem.rarity}</span>}
                  <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-1">Jumlah: ×{selectedItem.qty}</p>
                  <p className="text-[11px] leading-relaxed text-[#a0a6b8]">{selectedItem.desc || 'Item tanpa deskripsi.'}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {!isBattling && (() => { const isConsumable = selectedItem.name === 'Ramuan Penyembuh' || selectedItem.name === 'Daging Panggang' || (selectedItem.image && selectedItem.image.includes('fruit-')); if (isConsumable) return null; return <button type="button" onClick={() => handleEquipItem(selectedItem.index)} className="nus-btn-primary flex-1 h-9 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5"><Shirt className="h-3.5 w-3.5" /> Pakai</button> })()}
                {(() => { const isConsumable = selectedItem.name === 'Ramuan Penyembuh' || selectedItem.name === 'Daging Panggang' || (selectedItem.image && selectedItem.image.includes('fruit-')); if (!isConsumable && !isBattling) return null; return <button type="button" onClick={() => isBattling ? handleBattleUseItem(selectedItem.index) : handleUseItem(selectedItem.index)} disabled={isBattling && !isPlayerTurn} className="nus-btn-primary flex-1 h-9 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-40"><Sparkles className="h-3.5 w-3.5" /> Pakai</button> })()}
                <button type="button" onClick={() => handleDiscardItem(selectedItem.index)} className="nus-btn-ghost flex-1 h-9 rounded-md text-xs font-medium inline-flex items-center justify-center gap-1.5 border-[#3e475e] hover:border-[#ef4444] hover:text-[#ef4444]"><Trash2 className="h-3.5 w-3.5" /> Buang</button>
              </div>
            </div>
          )}
          <div className="mt-2 text-center text-[11px] text-[#6b7280] italic">"Harta yang berlebih akan membebani perjalananmu."</div>
        </DialogContent>
      </Dialog>

      {/* ===== Blacksmith (Forge) Modal ===== */}
      <Dialog open={blacksmithOpen} onOpenChange={setBlacksmithOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-5xl w-[97vw] p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Hammer className="h-5 w-5 text-[#f0a500]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Bengkel Tukang Tempa</DialogTitle></div>
              <button type="button" onClick={() => setBlacksmithOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup bengkel"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">{blacksmithTab === 'forge' ? 'Pilih peralatan untuk ditempa. Setiap penempaan +1 meningkatkan stat sebesar 8% dari stat dasar. Di atas +10, ada risiko peralatan hancur.' : 'Bongkar peralatan yang tidak terpakai untuk mendapatkan material tempa. Material yang didapat tergantung jenis, rarity, dan forge level item.'}</DialogDescription>
          </DialogHeader>
          {/* Blacksmith tabs */}
          <div className="px-6 py-2 border-b border-[#3a4259] flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={() => { setBlacksmithTab('forge'); setBlacksmithItem(null); setDismantleItem(null); setForgeAnimation('idle'); setDismantleAnimation('idle') }} className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-bold transition-colors ${blacksmithTab === 'forge' ? 'bg-[#f0a500] text-[#1a1207]' : 'bg-[#2d3548] text-[#a0a6b8] hover:text-[#f0f0f0]'}`}><Hammer className="h-4 w-4" /> Tempa</button>
            <button type="button" onClick={() => { setBlacksmithTab('dismantle'); setBlacksmithItem(null); setDismantleItem(null); setForgeAnimation('idle'); setDismantleAnimation('idle') }} className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-bold transition-colors ${blacksmithTab === 'dismantle' ? 'bg-[#f0a500] text-[#1a1207]' : 'bg-[#2d3548] text-[#a0a6b8] hover:text-[#f0f0f0]'}`}><Trash2 className="h-4 w-4" /> Dismantle</button>
          </div>
          {/* Blacksmith body */}
          <div className="flex-1 overflow-y-auto nus-scroll">
            {/* Blacksmith anime image + animation overlay */}
            <div className="relative h-48 sm:h-64 overflow-hidden bg-gradient-to-b from-[#3a1f0a] to-[#1a1207] border-b border-[#3a4259]">
              <img src="/blacksmith.png" alt="Tukang Tempa" className={`w-full h-full object-cover transition-all ${blacksmithTab === 'forge' ? (forgeAnimation === 'forging' ? 'animate-pulse brightness-150' : forgeAnimation === 'success' ? 'brightness-125 saturate-150' : forgeAnimation === 'fail' ? 'brightness-75 grayscale' : forgeAnimation === 'destroy' ? 'brightness-50 grayscale' : '') : (dismantleAnimation === 'working' ? 'animate-pulse brightness-150 hue-rotate-30' : dismantleAnimation === 'done' ? 'brightness-125 saturate-150' : '')}`} draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent" />
              {/* Animation status overlay */}
              {blacksmithTab === 'forge' && forgeAnimation !== 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`rounded-xl px-6 py-3 backdrop-blur-md border-2 font-bold text-2xl nus-title ${
                    forgeAnimation === 'forging' ? 'bg-[#f0a500]/30 border-[#f0a500] text-[#f0a500] animate-pulse' :
                    forgeAnimation === 'success' ? 'bg-[#22c55e]/30 border-[#22c55e] text-[#22c55e]' :
                    forgeAnimation === 'fail' ? 'bg-[#ef4444]/30 border-[#ef4444] text-[#ef4444]' :
                    forgeAnimation === 'destroy' ? 'bg-[#a855f7]/30 border-[#a855f7] text-[#a855f7] animate-pulse' : ''
                  }`}>
                    {forgeAnimation === 'forging' && <span className="flex items-center gap-2"><Flame className="h-6 w-6 animate-pulse" /> MENEMPA...</span>}
                    {forgeAnimation === 'success' && '✅ BERHASIL!'}
                    {forgeAnimation === 'fail' && '❌ GAGAL'}
                    {forgeAnimation === 'destroy' && '💀 HANCUR!'}
                  </div>
                </div>
              )}
              {blacksmithTab === 'dismantle' && dismantleAnimation !== 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`rounded-xl px-6 py-3 backdrop-blur-md border-2 font-bold text-2xl nus-title ${
                    dismantleAnimation === 'working' ? 'bg-[#9ca3af]/30 border-[#9ca3af] text-[#9ca3af] animate-pulse' : 'bg-[#22c55e]/30 border-[#22c55e] text-[#22c55e]'
                  }`}>
                    {dismantleAnimation === 'working' && <span className="flex items-center gap-2"><Trash2 className="h-6 w-6 animate-pulse" /> MEMBONGKAR...</span>}
                    {dismantleAnimation === 'done' && '✅ DIBONGKAR!'}
                  </div>
                </div>
              )}
              {/* Blacksmith dialogue */}
              <div className="absolute bottom-3 left-4 right-4 rounded-lg bg-[#0f1320]/85 border border-[#c5a059]/40 px-3 py-2 backdrop-blur-sm">
                <p className="nus-serif text-xs text-[#f0f0f0] leading-relaxed">
                  <span className="text-[#f0a500] font-bold">Tukang Tempa:</span> {blacksmithTab === 'forge' ? (forgeAnimation === 'forging' ? 'Ah, panasnya api! Tunggu sebentar...' : forgeAnimation === 'success' ? 'Lihaaat! Peralatanmu makin kuat!' : forgeAnimation === 'fail' ? 'Hmmm, gagal kali ini. Tapi jangan menyerah, pendekar.' : forgeAnimation === 'destroy' ? 'Oh tidak... peralatanmu hancur berantakan. Maafkan aku.' : 'Selamat datang di bengkelku. Aku bisa menempa peralatanmu jadi lebih kuat. Tapi di atas +10, risikonya besar...') : (dismantleAnimation === 'working' ? 'Sedang membongkar... komponennya masih bagus.' : dismantleAnimation === 'done' ? 'Selesai! Material hasil bongkar siap dipakai lagi.' : 'Punya peralatan yang tidak terpakai? Aku bisa membongkarnya jadi material. Hasil tergantung rarity dan tingkat tempa.')}
                </p>
              </div>
            </div>

            {blacksmithTab === 'forge' ? (
              <>
            {/* Forge detail panel — shows when an item is selected */}
            {blacksmithItem !== null && inventoryItems[blacksmithItem] && inventoryItems[blacksmithItem].baseBonuses ? (() => {
              const item = inventoryItems[blacksmithItem]
              const lvl = item.forgeLevel || 0
              const rarity = item.rarity || 'Common'
              const goldCost = FORGE_CONFIG.goldCost(lvl, rarity)
              const matCost = FORGE_CONFIG.materialCost(lvl, rarity)
              const successPct = FORGE_CONFIG.successRate(lvl)
              const destroyPct = FORGE_CONFIG.destroyChance(lvl)
              const currentBonuses = getItemForgeBonuses(item)
              const nextBonuses = getItemForgeBonuses({ ...item, forgeLevel: lvl + 1 })
              const rarityColor = RARITY_COLORS[rarity]
              const canForge = gold >= goldCost && materials.kayu >= matCost.kayu && materials.besi >= matCost.besi && materials.kulit >= matCost.kulit && materials.emas >= matCost.emas && materials.batuMeteor >= matCost.batuMeteor && lvl < 20 && forgeAnimation === 'idle'
              return (
                <div className="p-4 border-b border-[#3a4259] bg-[#1f2533]/60">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left: item info + current/next stats */}
                    <div className="lg:col-span-1 rounded-lg border border-[#3a4259] bg-[#0f1320] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {item.image ? <img src={item.image} alt={item.name} className={`h-14 w-14 object-contain rounded border-2 bg-[#1f2533] ${lvl >= 10 ? 'border-[#f0a500] nus-forge-glow' : 'border-[#c5a059]'}`} /> : <div className={`h-14 w-14 rounded border-2 bg-[#1f2533] flex items-center justify-center text-3xl ${lvl >= 10 ? 'border-[#f0a500] nus-forge-glow' : 'border-[#c5a059]'}`} style={{ color: rarityColor }}>{item.icon}</div>}
                        <div className="flex-1 min-w-0">
                          <p className="nus-title text-sm font-bold text-[#f0f0f0] truncate">{item.name}</p>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: rarityColor }}>{rarity}</p>
                          <p className="text-[11px] text-[#f0a500] font-bold mt-0.5">Forge: <span className={lvl >= 10 ? 'nus-forge-glow-text' : ''}>+{lvl}</span>{lvl >= 20 && ' (MAX)'}</p>
                        </div>
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-1">Stat Peralatan</p>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">ATK</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.atkBonus || 0}{nextBonuses && nextBonuses.atkBonus > (currentBonuses?.atkBonus || 0) && <span className="text-[#22c55e]"> → {nextBonuses.atkBonus}</span>}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">M.ATK</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.magicAtkBonus || 0}{nextBonuses && nextBonuses.magicAtkBonus > (currentBonuses?.magicAtkBonus || 0) && <span className="text-[#22c55e]"> → {nextBonuses.magicAtkBonus}</span>}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">DEF</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.defBonus || 0}{nextBonuses && nextBonuses.defBonus > (currentBonuses?.defBonus || 0) && <span className="text-[#22c55e]"> → {nextBonuses.defBonus}</span>}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">M.DEF</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.magicDefBonus || 0}{nextBonuses && nextBonuses.magicDefBonus > (currentBonuses?.magicDefBonus || 0) && <span className="text-[#22c55e]"> → {nextBonuses.magicDefBonus}</span>}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">HP</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.hpBonus || 0}{nextBonuses && nextBonuses.hpBonus > (currentBonuses?.hpBonus || 0) && <span className="text-[#22c55e]"> → {nextBonuses.hpBonus}</span>}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">MP</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.mpBonus || 0}{nextBonuses && nextBonuses.mpBonus > (currentBonuses?.mpBonus || 0) && <span className="text-[#22c55e]"> → {nextBonuses.mpBonus}</span>}</span></div>
                      </div>
                    </div>
                    {/* Middle: cost + requirements */}
                    <div className="lg:col-span-1 rounded-lg border border-[#3a4259] bg-[#0f1320] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-2">Biaya Penempaan +{lvl} → +{lvl + 1}</p>
                      {/* Gold cost */}
                      <div className={`flex items-center justify-between rounded px-2 py-1 mb-1 ${gold >= goldCost ? 'bg-[#f0a500]/10 border border-[#f0a500]/30' : 'bg-[#ef4444]/10 border border-[#ef4444]/30'}`}>
                        <span className="flex items-center gap-1 text-[11px] text-[#a0a6b8]"><Coins className="h-3.5 w-3.5" /> Emas</span>
                        <span className={`text-[11px] font-bold ${gold >= goldCost ? 'text-[#f0a500]' : 'text-[#ef4444]'}`}>{goldCost} <span className="text-[#6b7280] text-[10px]">(ada: {gold})</span></span>
                      </div>
                      {/* Material costs */}
                      {([
                        { key: 'kayu', label: 'Kayu', icon: '/materials/kayu.png', have: materials.kayu, need: matCost.kayu },
                        { key: 'besi', label: 'Besi', icon: '/materials/besi.png', have: materials.besi, need: matCost.besi },
                        { key: 'kulit', label: 'Kulit', icon: '/materials/kulit.png', have: materials.kulit, need: matCost.kulit },
                        { key: 'emas', label: 'Emas', icon: '/materials/emas.png', have: materials.emas, need: matCost.emas },
                        { key: 'batuMeteor', label: 'Batu Meteor', icon: '/materials/batu-meteor.png', have: materials.batuMeteor, need: matCost.batuMeteor },
                      ] as const).filter(m => m.need > 0).map(m => (
                        <div key={m.key} className={`flex items-center justify-between rounded px-2 py-1 mb-1 ${m.have >= m.need ? 'bg-[#1f2533] border border-[#3a4259]' : 'bg-[#ef4444]/10 border border-[#ef4444]/30'}`}>
                          <span className="flex items-center gap-1.5 text-[11px] text-[#a0a6b8]"><img src={m.icon} alt={m.label} className="h-4 w-4 object-contain" /> {m.label}</span>
                          <span className={`text-[11px] font-bold ${m.have >= m.need ? 'text-[#f0f0f0]' : 'text-[#ef4444]'}`}>{m.need} <span className="text-[#6b7280] text-[10px]">(ada: {m.have})</span></span>
                        </div>
                      ))}
                    </div>
                    {/* Right: success rate + forge button */}
                    <div className="lg:col-span-1 rounded-lg border border-[#3a4259] bg-[#0f1320] p-3 flex flex-col">
                      <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-2">Peluang Penempaan</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-0.5"><span className="text-[#a0a6b8]">Berhasil</span><span className={`font-bold ${successPct >= 60 ? 'text-[#22c55e]' : successPct >= 30 ? 'text-[#f0a500]' : 'text-[#ef4444]'}`}>{successPct}%</span></div>
                          <div className="h-2 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${successPct}%`, background: successPct >= 60 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : successPct >= 30 ? 'linear-gradient(90deg, #c5a059, #f0a500)' : 'linear-gradient(90deg, #dc2626, #ef4444)' }} /></div>
                        </div>
                        {destroyPct > 0 && (
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-0.5"><span className="text-[#a855f7] flex items-center gap-1"><Skull className="h-3 w-3" /> Hancur</span><span className="font-bold text-[#a855f7]">{destroyPct}%</span></div>
                            <div className="h-2 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${destroyPct}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }} /></div>
                            <p className="text-[9px] text-[#a855f7]/70 mt-1">⚠️ Di atas +10, peralatan bisa hancur jika gagal!</p>
                          </div>
                        )}
                      </div>
                      <div className="flex-1" />
                      <button type="button" onClick={() => handleForge(blacksmithItem)} disabled={!canForge} className={`mt-3 w-full h-11 rounded-md text-sm font-bold inline-flex items-center justify-center gap-2 transition-all ${canForge ? 'nus-btn-primary cursor-pointer hover:scale-[1.02]' : 'bg-[#3a4259] text-[#6b7280] cursor-not-allowed'}`}>
                        {forgeAnimation === 'forging' ? <><Loader2 className="h-4 w-4 animate-spin" /> Menempa...</> : <><Hammer className="h-4 w-4" /> {lvl >= 20 ? 'MAX LEVEL' : `Tempa ke +${lvl + 1}`}</>}
                      </button>
                      {lvl >= 10 && lvl < 20 && <p className="mt-1.5 text-[9px] text-center text-[#a855f7] animate-pulse">⚠️ Zona bahaya: risiko hancur aktif</p>}
                    </div>
                  </div>
                </div>
              )
            })() : (
              <div className="p-4 border-b border-[#3a4259] bg-[#1f2533]/60">
                <p className="text-xs text-[#a0a6b8] text-center py-2">↑ Klik peralatan di bawah untuk mulai menempa. Item tanpa stat dasar (seperti ramuan, buah, material) tidak bisa ditempa.</p>
              </div>
            )}

            {/* Inventory grid — forgeable items only */}
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-2 flex items-center gap-1.5"><Backpack className="h-3.5 w-3.5" /> Peralatan di Tas — klik untuk menempa</p>
              {inventoryItems.filter(it => it.baseBonuses).length === 0 ? (
                <div className="text-center py-8">
                  <Backpack className="h-10 w-10 text-[#3a4259] mx-auto mb-2" />
                  <p className="text-sm text-[#6b7280]">Belum ada peralatan yang bisa ditempa.</p>
                  <p className="text-[11px] text-[#6b7280] mt-1">Bunuh monster atau beli dari pedagang untuk mendapatkan peralatan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {inventoryItems.map((item, i) => {
                    if (!item.baseBonuses) return null
                    const lvl = item.forgeLevel || 0
                    const rarityColor = item.rarity ? RARITY_COLORS[item.rarity] : '#c5a059'
                    const isSelected = blacksmithItem === i
                    return (
                      <button key={i} type="button" onClick={() => { setBlacksmithItem(i); setForgeAnimation('idle') }} className={`relative aspect-square rounded border-2 overflow-hidden flex items-center justify-center transition-all ${isSelected ? 'scale-110 ring-2 ring-[#f0a500]' : 'hover:scale-105'} ${lvl >= 10 ? 'nus-forge-glow' : ''}`} style={{ borderColor: isSelected ? '#f0a500' : rarityColor, backgroundColor: '#0f1320' }} title={`${item.name} +${lvl}`}>
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" draggable={false} /> : <span className="text-2xl" style={{ color: rarityColor }}>{item.icon}</span>}
                        {lvl > 0 && <span className={`absolute top-0 right-0 text-[9px] font-bold rounded-bl px-1 leading-tight ${lvl >= 10 ? 'bg-[#f0a500] text-[#1a1207] nus-forge-glow-text' : 'bg-[#f0a500]/90 text-[#1a1207]'}`}>+{lvl}</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
              </>
            ) : (
              <>
            {/* Dismantle detail panel — shows when an item is selected */}
            {dismantleItem !== null && inventoryItems[dismantleItem] && inventoryItems[dismantleItem].baseBonuses ? (() => {
              const item = inventoryItems[dismantleItem]
              const lvl = item.forgeLevel || 0
              const rarity = item.rarity || 'Common'
              const rarityColor = RARITY_COLORS[rarity]
              const returns = getDismantleReturn(item) || {}
              const currentBonuses = getItemForgeBonuses(item)
              const returnEntries = Object.entries(returns) as [string, number][]
              const canDismantle = dismantleAnimation === 'idle'
              return (
                <div className="p-4 border-b border-[#3a4259] bg-[#1f2533]/60">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: item info */}
                    <div className="rounded-lg border border-[#3a4259] bg-[#0f1320] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {item.image ? <img src={item.image} alt={item.name} className={`h-14 w-14 object-contain rounded border-2 bg-[#1f2533] ${lvl >= 10 ? 'border-[#f0a500] nus-forge-glow' : 'border-[#ef4444]'}`} /> : <div className={`h-14 w-14 rounded border-2 bg-[#1f2533] flex items-center justify-center text-3xl ${lvl >= 10 ? 'border-[#f0a500] nus-forge-glow' : 'border-[#ef4444]'}`} style={{ color: rarityColor }}>{item.icon}</div>}
                        <div className="flex-1 min-w-0">
                          <p className="nus-title text-sm font-bold text-[#f0f0f0] truncate">{item.name}</p>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: rarityColor }}>{rarity}</p>
                          <p className="text-[11px] text-[#ef4444] font-bold mt-0.5">⚠️ Akan dihancurkan{lvl > 0 && <span className="text-[#f0a500]"> · +{lvl}</span>}</p>
                        </div>
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-1">Stat Item Saat Ini</p>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">ATK</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.atkBonus || 0}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">M.ATK</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.magicAtkBonus || 0}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">DEF</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.defBonus || 0}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">M.DEF</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.magicDefBonus || 0}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">HP</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.hpBonus || 0}</span></div>
                        <div className="flex items-center justify-between rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">MP</span><span className="font-bold text-[#f0f0f0]">{currentBonuses?.mpBonus || 0}</span></div>
                      </div>
                    </div>
                    {/* Right: material returns + dismantle button */}
                    <div className="rounded-lg border border-[#3a4259] bg-[#0f1320] p-3 flex flex-col">
                      <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-2 flex items-center gap-1.5"><Gift className="h-3.5 w-3.5" /> Material yang Akan Diperoleh</p>
                      <div className="space-y-1">
                        {returnEntries.length === 0 ? (
                          <p className="text-[11px] text-[#6b7280] italic text-center py-2">Tidak ada material yang bisa dipulihkan.</p>
                        ) : returnEntries.map(([key, amount]) => {
                          const labels: Record<string, { label: string; icon: string; color: string }> = {
                            kayu: { label: 'Kayu', icon: '/materials/kayu.png', color: '#22c55e' },
                            besi: { label: 'Besi', icon: '/materials/besi.png', color: '#9ca3af' },
                            kulit: { label: 'Kulit', icon: '/materials/kulit.png', color: '#d4a04a' },
                            emas: { label: 'Emas', icon: '/materials/emas.png', color: '#f0a500' },
                            batuMeteor: { label: 'Batu Meteor', icon: '/materials/batu-meteor.png', color: '#a855f7' },
                          }
                          const info = labels[key] || { label: key, icon: '', color: '#a0a6b8' }
                          return (
                            <div key={key} className="flex items-center justify-between rounded bg-[#1f2533] border border-[#3a4259] px-2 py-1.5">
                              <span className="flex items-center gap-1.5 text-[11px] text-[#a0a6b8]"><img src={info.icon} alt={info.label} className="h-5 w-5 object-contain" /> {info.label}</span>
                              <span className="text-sm font-bold" style={{ color: info.color }}>+{amount}</span>
                            </div>
                          )
                        })}
                      </div>
                      {lvl > 0 && <p className="mt-2 text-[9px] text-[#f0a500] text-center">💎 Bonus dari forge +{lvl}: +{Math.floor(lvl / 2)} Emas{lvl >= 10 && `, +${Math.floor((lvl - 8) / 2)} Batu Meteor`}</p>}
                      <div className="flex-1" />
                      <button type="button" onClick={() => handleDismantle(dismantleItem)} disabled={!canDismantle} className={`mt-3 w-full h-11 rounded-md text-sm font-bold inline-flex items-center justify-center gap-2 transition-all ${canDismantle ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white cursor-pointer hover:scale-[1.02] shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-[#3a4259] text-[#6b7280] cursor-not-allowed'}`}>
                        {dismantleAnimation === 'working' ? <><Loader2 className="h-4 w-4 animate-spin" /> Membongkar...</> : <><Trash2 className="h-4 w-4" /> Bongkar & Ambil Material</>}
                      </button>
                      <p className="mt-1.5 text-[9px] text-center text-[#ef4444]/80">⚠️ Item akan dihancurkan permanen. Tidak bisa dibatalkan.</p>
                    </div>
                  </div>
                </div>
              )
            })() : (
              <div className="p-4 border-b border-[#3a4259] bg-[#1f2533]/60">
                <p className="text-xs text-[#a0a6b8] text-center py-2">↑ Klik peralatan di bawah untuk membongkar jadi material. Item tanpa stat dasar tidak bisa dibongkar.</p>
              </div>
            )}

            {/* Inventory grid — dismantle mode */}
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-2 flex items-center gap-1.5"><Backpack className="h-3.5 w-3.5" /> Peralatan di Tas — klik untuk membongkar</p>
              {inventoryItems.filter(it => it.baseBonuses).length === 0 ? (
                <div className="text-center py-8">
                  <Backpack className="h-10 w-10 text-[#3a4259] mx-auto mb-2" />
                  <p className="text-sm text-[#6b7280]">Belum ada peralatan yang bisa dibongkar.</p>
                  <p className="text-[11px] text-[#6b7280] mt-1">Bunuh monster atau beli dari pedagang untuk mendapatkan peralatan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {inventoryItems.map((item, i) => {
                    if (!item.baseBonuses) return null
                    const lvl = item.forgeLevel || 0
                    const rarityColor = item.rarity ? RARITY_COLORS[item.rarity] : '#c5a059'
                    const isSelected = dismantleItem === i
                    return (
                      <button key={i} type="button" onClick={() => { setDismantleItem(i); setDismantleAnimation('idle') }} className={`relative aspect-square rounded border-2 overflow-hidden flex items-center justify-center transition-all ${isSelected ? 'scale-110 ring-2 ring-[#ef4444]' : 'hover:scale-105'} ${lvl >= 10 ? 'nus-forge-glow' : ''}`} style={{ borderColor: isSelected ? '#ef4444' : rarityColor, backgroundColor: '#0f1320' }} title={`${item.name} +${lvl}`}>
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" draggable={false} /> : <span className="text-2xl" style={{ color: rarityColor }}>{item.icon}</span>}
                        {lvl > 0 && <span className={`absolute top-0 right-0 text-[9px] font-bold rounded-bl px-1 leading-tight ${lvl >= 10 ? 'bg-[#f0a500] text-[#1a1207] nus-forge-glow-text' : 'bg-[#f0a500]/90 text-[#1a1207]'}`}>+{lvl}</span>}
                        {isSelected && <div className="absolute inset-0 bg-[#ef4444]/30 flex items-center justify-center"><Trash2 className="h-6 w-6 text-white" /></div>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Equipment / Character Modal ===== */}
      <Dialog open={equipmentOpen} onOpenChange={setEquipmentOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-4xl w-[95vw] p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Shirt className="h-5 w-5 text-[#f0a500]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Peralatan Karakter</DialogTitle></div><button type="button" onClick={() => setEquipmentOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup"><X className="h-5 w-5" /></button></div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Klik slot equipment untuk melepas, atau buka Kantong untuk memakai item.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col md:flex-row gap-4 p-5 overflow-y-auto nus-scroll flex-1 min-h-0">
            {/* Left: Character portrait with equipment slots */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative" style={{ width: '300px', height: '420px' }}>
                <div className="absolute inset-0 rounded-xl overflow-hidden border-2 border-[#c5a059] bg-[#0f1320]"><img src={portrait} alt={character.name} className="w-full h-full object-cover opacity-90" draggable={false} /><div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 40%, rgba(15, 19, 32, 0.6) 100%)' }} /></div>
                {(Object.keys(SLOT_LABELS) as EquipSlot[]).map(slot => {
                  const cfg = SLOT_LABELS[slot]
                  const item = equipped[slot]
                  const rarityColor = item?.rarity ? RARITY_COLORS[item.rarity] : '#c5a059'
                  return <button key={slot} type="button" onClick={() => item && handleUnequip(slot)} disabled={!item} className={`absolute group rounded-md border-2 overflow-hidden flex items-center justify-center transition-all ${item ? 'cursor-pointer hover:scale-110 hover:z-20' : 'cursor-default'}`} style={{ left: `${cfg.x}%`, top: `${cfg.y}%`, width: `${cfg.w}%`, height: `${cfg.h}%`, borderColor: item ? rarityColor : 'rgba(150, 150, 150, 0.4)', borderStyle: item ? 'solid' : 'dashed', backgroundColor: item ? 'rgba(15, 19, 32, 0.6)' : 'rgba(15, 19, 32, 0.3)', boxShadow: item ? `0 0 8px ${rarityColor}80` : undefined }} title={item ? `${item.name} — klik untuk lepas` : `Slot ${cfg.label} (kosong)`} aria-label={`Slot ${cfg.short}: ${item ? item.name : 'kosong'}`}>{item ? item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain bg-[#0a0d15]" draggable={false} /> : <span className="text-xl leading-none text-[#f0a500]">{item.icon}</span> : <span className="text-[8px] text-[#6b7280] uppercase tracking-wider text-center px-0.5 leading-tight">{cfg.short}</span>}<span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 bg-[#1a1f2e] border border-[#c5a059]/40 text-[#c5a059]">{cfg.short}</span></button>
                })}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] max-w-[300px]">
                {(Object.keys(SLOT_LABELS) as EquipSlot[]).map(slot => {
                  const cfg = SLOT_LABELS[slot]
                  const item = equipped[slot]
                  return <div key={slot} className="flex items-center gap-1 rounded px-1.5 py-0.5 border" style={{ borderColor: item ? RARITY_COLORS[item.rarity!] + '60' : '#3a4259', backgroundColor: item ? RARITY_COLORS[item.rarity!] + '10' : 'transparent' }}><span className="text-[#6b7280] uppercase tracking-wide text-[9px]">{cfg.short}:</span><span className="font-semibold truncate flex-1" style={{ color: item ? RARITY_COLORS[item.rarity!] : '#6b7280' }}>{item ? item.name : '—'}</span></div>
                })}
              </div>
            </div>
            {/* Right: Stats */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="rounded-lg border border-[#3a4259] bg-[#1f2533] p-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-lg border-2 border-[#c5a059] overflow-hidden flex-shrink-0"><img src={portrait} alt={character.name} className="w-full h-full object-cover" draggable={false} /></div>
                  <div className="flex-1 min-w-0"><p className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059]">Pendekar</p><h3 className="nus-title text-xl font-bold text-[#f0f0f0] truncate">{character.name}</h3><p className="text-xs text-[#a0a6b8]">{CLASS_LABELS[character.classCode]} · Lv. {level} · {character.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p></div>
                </div>
              </div>
              <div className="rounded-lg border border-[#3a4259] bg-[#1f2533] p-3 space-y-2">
                <div><div className="flex items-center justify-between text-xs mb-0.5"><span className="flex items-center gap-1 text-[#ef4444] font-semibold"><Heart className="h-3.5 w-3.5 fill-current" /> HP</span><span className="font-bold text-[#f0f0f0]">{hpCurrent} / {hpMax}</span></div><div className="h-3 rounded-full bg-[#0f1320] border border-[#3a4259] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(hpCurrent / hpMax) * 100}%`, background: 'linear-gradient(90deg, #dc2626, #ef4444, #f87171)' }} /></div></div>
                <div><div className="flex items-center justify-between text-xs mb-0.5"><span className="flex items-center gap-1 text-[#3b82f6] font-semibold"><Zap className="h-3.5 w-3.5 fill-current" /> Magic</span><span className="font-bold text-[#f0f0f0]">{mpCurrent} / {mpMax}</span></div><div className="h-3 rounded-full bg-[#0f1320] border border-[#3a4259] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(mpCurrent / mpMax) * 100}%`, background: 'linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa)' }} /></div></div>
                <div><div className="flex items-center justify-between text-xs mb-0.5"><span className="flex items-center gap-1 text-[#f0a500] font-semibold"><Star className="h-3.5 w-3.5 fill-current" /> EXP</span><span className="font-bold text-[#f0f0f0]">{expIntoCurrentLevel} / {expNeededForNext} <span className="text-[#6b7280] text-[10px]">(total: {totalExp})</span></span></div><div className="h-2.5 rounded-full bg-[#0f1320] border border-[#3a4259] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${expProgressPct}%`, background: 'linear-gradient(90deg, #c5a059, #f0a500, #fcd34d)' }} /></div></div>
              </div>
              {/* Stat allocation */}
              <div className="rounded-lg border border-[#3a4259] bg-[#1f2533] p-3">
                <div className="flex items-center justify-between mb-2"><p className="text-[10px] uppercase tracking-wider text-[#c5a059] font-semibold">Atribut Dasar</p>{statPoints > 0 && <span className="rounded-full bg-[#f0a500] px-2 py-0.5 text-[10px] font-bold text-[#1a1207] animate-pulse">{statPoints} poin tersedia</span>}</div>
                <div className="space-y-1.5">
                  {STAT_LABELS.map(s => (
                    <div key={s.code} className="flex items-center gap-2">
                      <div className="flex items-center justify-between flex-1 rounded bg-[#0f1320] px-2 py-1 text-xs"><span className="font-bold" style={{ color: s.color }} title={s.desc}>{s.label}</span><span className="text-[#f0f0f0] font-bold text-sm">{playerStats[s.code]}</span></div>
                      {statPoints > 0 && <button type="button" onClick={() => handleAllocateStat(s.code)} className="flex h-7 w-7 items-center justify-center rounded-md bg-[#f0a500] text-[#1a1207] font-bold text-lg hover:scale-110 transition-transform cursor-pointer flex-shrink-0" title={`Tambah ${s.full} (+1)`}>+</button>}
                    </div>
                  ))}
                </div>
                {statPoints > 0 && <p className="mt-2 text-center text-[10px] text-[#c5a059] italic">Klik tombol + untuk distribusikan poin atribut</p>}
                {statPoints === 0 && level === 1 && <p className="mt-2 text-center text-[10px] text-[#6b7280] italic">Naik level untuk mendapatkan poin atribut (+5 per level)</p>}
              </div>
              <button type="button" onClick={() => { setEquipmentOpen(false); setInventoryOpen(true) }} className="nus-btn-primary w-full h-9 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5"><Backpack className="h-3.5 w-3.5" /> Buka Kantong Peralatan</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Merchant Modal ===== */}
      <Dialog open={merchantOpen} onOpenChange={setMerchantOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-5xl w-[97vw] p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Store className="h-5 w-5 text-[#f0a500]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Pedagang Keliling</DialogTitle></div>
              <div className="flex items-center gap-3"><div className="flex items-center gap-1.5 rounded-lg border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1"><Coins className="h-4 w-4 text-[#f0a500]" /><span className="text-sm font-bold text-[#f0f0f0]">{gold}</span><span className="text-[10px] text-[#a0a6b8]">emas</span></div><button type="button" onClick={() => setMerchantOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup"><X className="h-5 w-5" /></button></div>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Beli equipment untuk perjalananmu, atau jual item yang tidak terpakai.</DialogDescription>
          </DialogHeader>
          <div className="relative h-32 overflow-hidden border-b border-[#3a4259] flex-shrink-0"><img src="/merchant.png" alt="Pedagang" className="w-full h-full object-cover" draggable={false} /><div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent" /><div className="absolute bottom-2 left-4"><p className="nus-serif text-sm text-[#f0a500] italic">"Selamat datang, pendekar! Lihat-lihat barang saya."</p></div></div>
          <div className="px-6 py-2 border-b border-[#3a4259] flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={() => { setMerchantTab('buy'); setMerchantSelectedItem(null) }} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${merchantTab === 'buy' ? 'bg-[#f0a500] text-[#1a1207]' : 'bg-[#2d3548] text-[#a0a6b8]'}`}>🛒 Beli</button>
            <button type="button" onClick={() => { setMerchantTab('sell'); setMerchantSelectedItem(null); setSelectedItem(null) }} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${merchantTab === 'sell' ? 'bg-[#f0a500] text-[#1a1207]' : 'bg-[#2d3548] text-[#a0a6b8]'}`}>💰 Jual ({inventoryItems.length})</button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto nus-scroll p-4">
            {merchantTab === 'buy' ? (
              <>
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  {MERCHANT_CATEGORIES.map(c => <button key={c.key} type="button" onClick={() => setMerchantCategory(c.key)} className={`rounded-md px-3 py-1 text-[11px] font-medium transition-colors ${merchantCategory === c.key ? 'bg-[#f0a500] text-[#1a1207]' : 'bg-[#2d3548] text-[#a0a6b8]'}`}>{c.label}</button>)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {getFilteredShopItems().map(item => {
                    const price = getBuyPrice(item.rarity)
                    const canAfford = gold >= price
                    const rarityColor = RARITY_COLORS[item.rarity]
                    return <button key={item.id} type="button" onClick={() => setMerchantSelectedItem(item)} className="rounded-lg border-2 overflow-hidden bg-[#1f2533] hover:bg-[#2d3548] transition-colors text-left cursor-pointer" style={{ borderColor: rarityColor + '60' }}><div className="relative aspect-[4/3] bg-[#0f1320]"><img src={item.image} alt={item.name} className="w-full h-full object-contain" draggable={false} /><span className="absolute top-1 right-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider" style={{ color: rarityColor, backgroundColor: rarityColor + '30', border: `1px solid ${rarityColor}` }}>{item.rarity}</span></div><div className="p-1.5"><p className="text-[10px] font-bold text-[#f0f0f0] truncate nus-serif">{item.name}</p><div className="flex items-center justify-between mt-0.5"><span className={`text-[10px] font-bold ${canAfford ? 'text-[#f0a500]' : 'text-[#ef4444]'}`}>{price}g</span>{item.atkBonus > 0 && <span className="text-[8px] text-[#ef4444]">ATK+{item.atkBonus}</span>}{item.defBonus > 0 && <span className="text-[8px] text-[#3b82f6]">DEF+{item.defBonus}</span>}</div></div></button>
                  })}
                </div>
                {merchantSelectedItem && (
                  <div className="mt-4 rounded-lg border border-[#c5a059]/50 bg-[#0f1320] p-3 nus-fade-up">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0 h-20 w-20 rounded-lg border-2 overflow-hidden bg-[#2d3548]" style={{ borderColor: RARITY_COLORS[merchantSelectedItem.rarity], boxShadow: `0 0 12px ${RARITY_COLORS[merchantSelectedItem.rarity]}50` }}><img src={merchantSelectedItem.image} alt={merchantSelectedItem.name} className="w-full h-full object-contain bg-[#0a0d15]" draggable={false} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2"><h4 className="nus-title text-base font-bold text-[#f0f0f0]">{merchantSelectedItem.name}</h4><span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: RARITY_COLORS[merchantSelectedItem.rarity], border: `1px solid ${RARITY_COLORS[merchantSelectedItem.rarity]}`, backgroundColor: RARITY_COLORS[merchantSelectedItem.rarity] + '20' }}>{merchantSelectedItem.rarity}</span></div>
                        <p className="text-[11px] leading-relaxed text-[#a0a6b8] mb-2">{merchantSelectedItem.desc}</p>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {merchantSelectedItem.defBonus > 0 && <div className="rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">DEF</span> <span className="font-bold text-[#3b82f6]">+{merchantSelectedItem.defBonus}</span></div>}
                          {merchantSelectedItem.magicDefBonus > 0 && <div className="rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">M.DEF</span> <span className="font-bold text-[#a855f7]">+{merchantSelectedItem.magicDefBonus}</span></div>}
                          {merchantSelectedItem.hpBonus > 0 && <div className="rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">HP</span> <span className="font-bold text-[#22c55e]">+{merchantSelectedItem.hpBonus}</span></div>}
                          {merchantSelectedItem.mpBonus > 0 && <div className="rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">MP</span> <span className="font-bold text-[#3b82f6]">+{merchantSelectedItem.mpBonus}</span></div>}
                          {merchantSelectedItem.atkBonus > 0 && <div className="rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">ATK</span> <span className="font-bold text-[#ef4444]">+{merchantSelectedItem.atkBonus}</span></div>}
                          {merchantSelectedItem.magicAtkBonus > 0 && <div className="rounded bg-[#1f2533] px-1.5 py-0.5"><span className="text-[#a0a6b8]">M.ATK</span> <span className="font-bold text-[#a855f7]">+{merchantSelectedItem.magicAtkBonus}</span></div>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5"><Coins className="h-4 w-4 text-[#f0a500]" /><span className="text-sm font-bold text-[#f0f0f0]">{getBuyPrice(merchantSelectedItem.rarity)}</span><span className="text-[10px] text-[#a0a6b8]">emas</span></div>
                      <button type="button" onClick={() => handleBuyItem(merchantSelectedItem)} disabled={gold < getBuyPrice(merchantSelectedItem.rarity) || inventoryItems.length >= INVENTORY_CAPACITY} className="nus-btn-primary h-9 px-5 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"><Coins className="h-3.5 w-3.5" /> Beli</button>
                    </div>
                    {gold < getBuyPrice(merchantSelectedItem.rarity) && <p className="text-center text-[10px] text-[#ef4444] mt-1">Emas tidak cukup!</p>}
                    {inventoryItems.length >= INVENTORY_CAPACITY && <p className="text-center text-[10px] text-[#ef4444] mt-1">Kantong penuh!</p>}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-[11px] text-[#a0a6b8] mb-3">Klik item untuk menjual. Harga jual = 40% dari harga beli.</p>
                {inventoryItems.length === 0 ? <div className="text-center py-10"><Backpack className="h-10 w-10 text-[#3a4259] mx-auto mb-3" /><p className="text-sm text-[#a0a6b8]">Kantong kosong.</p></div> : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {inventoryItems.map((item, i) => {
                      const sellPrice = item.rarity ? getSellPrice(item.rarity) : 20
                      const rarityColor = item.rarity ? RARITY_COLORS[item.rarity] : '#c5a059'
                      return <button key={i} type="button" onClick={() => handleSellItem(i)} className="rounded-lg border-2 overflow-hidden bg-[#1f2533] hover:bg-[#2d3548] transition-colors text-left cursor-pointer group" style={{ borderColor: rarityColor + '60' }} title={`Jual ${item.name} untuk ${sellPrice} emas`}>
                        <div className="relative aspect-square bg-[#0f1320]">{item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain bg-[#0a0d15]" draggable={false} /> : <div className="w-full h-full flex items-center justify-center text-3xl text-[#f0a500]">{item.icon}</div>}{item.qty > 1 && <span className="absolute top-0.5 right-1 text-[10px] font-bold text-white bg-black/80 rounded px-1">×{item.qty}</span>}<div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><div className="text-center"><Coins className="h-5 w-5 text-[#f0a500] mx-auto mb-1" /><p className="text-xs font-bold text-[#f0a500]">+{sellPrice}g</p><p className="text-[9px] text-[#a0a6b8]">Jual</p></div></div></div>
                        <div className="p-1.5"><p className="text-[10px] font-bold text-[#f0f0f0] truncate">{item.name}</p><p className="text-[10px] font-bold text-[#f0a500]">{sellPrice}g</p></div>
                      </button>
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Chat Modal ===== */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-2xl w-[95vw] p-0 overflow-hidden max-h-[85vh] flex flex-col">
          <DialogHeader className="px-5 pt-4 pb-2 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[#f0a500]" /><DialogTitle className="nus-title text-xl text-[#f0f0f0]">Pesan</DialogTitle></div><button type="button" onClick={() => setChatOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup chat"><X className="h-5 w-5" /></button></div>
          </DialogHeader>
          {unreadMentions > 0 && <div className="px-5 py-1.5 bg-[#a855f7]/15 border-b border-[#a855f7]/30 flex-shrink-0"><p className="text-[11px] text-[#a855f7] font-semibold flex items-center gap-1.5"><AtSign className="h-3.5 w-3.5" />{unreadMentions} mention belum dibaca — {chatMessages.filter(m => m.isMention && !m.isRead && !m.isOwn).map((m, i) => <button key={m.id} type="button" onClick={() => handleJumpToMention(m.id, m.tab)} className="underline hover:text-[#c084fc] transition-colors">dari {m.sender}{i < unreadMentions - 1 ? ', ' : ''}</button>)}</p></div>}
          <div className="px-5 py-2 border-b border-[#3a4259] flex items-center gap-2 flex-shrink-0">
            {[{ key: 'general', label: 'Umum', count: unreadGeneral }, { key: 'alliance', label: 'Aliansi', count: unreadAlliance }, { key: 'private', label: 'Pribadi', count: unreadPrivate }].map(t => (
              <button key={t.key} type="button" onClick={() => handleSwitchChatTab(t.key as 'general' | 'alliance' | 'private')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${chatTab === t.key ? 'bg-[#f0a500] text-[#1a1207]' : 'bg-[#2d3548] text-[#a0a6b8]'}`}>{t.label}{t.count > 0 && <span className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${chatTab === t.key ? 'bg-[#1a1207] text-[#f0a500]' : 'bg-[#ef4444] text-white animate-pulse'}`}>{t.count}</span>}</button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto nus-scroll p-4 space-y-2" style={{ minHeight: '200px', maxHeight: '45vh' }}>
            {chatMessages.filter(m => m.tab === chatTab).length === 0 ? <div className="text-center py-10"><MessageCircle className="h-10 w-10 text-[#3a4259] mx-auto mb-3" /><p className="text-sm text-[#6b7280]">Belum ada pesan.</p></div> : chatMessages.filter(m => m.tab === chatTab).map(m => {
              const isHighlighted = highlightedMessageId === m.id
              return <div key={m.id} id={`chat-msg-${m.id}`} className={`flex gap-2 rounded-lg p-2 transition-all ${isHighlighted ? 'bg-[#a855f7]/20 border border-[#a855f7]/50 animate-pulse' : m.isOwn ? 'bg-[#f0a500]/10 border border-[#f0a500]/20' : m.isMention ? 'bg-[#a855f7]/10 border border-[#a855f7]/20' : 'bg-[#1f2533] border border-[#3a4259]/50'}`}><div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${m.isOwn ? 'bg-[#f0a500] text-[#1a1207]' : 'bg-[#2d3548] text-[#c5a059]'}`}>{m.sender.charAt(0).toUpperCase()}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-0.5"><span className={`text-[11px] font-bold ${m.isOwn ? 'text-[#f0a500]' : 'text-[#c5a059]'}`}>{m.sender}</span>{m.isMention && !m.isOwn && <span className="flex items-center gap-0.5 text-[8px] font-bold text-[#a855f7] bg-[#a855f7]/20 rounded px-1 py-0.5"><AtSign className="h-2.5 w-2.5" /> Mention</span>}<span className="text-[9px] text-[#6b7280] ml-auto">{m.timestamp}</span></div><p className="text-[12px] leading-relaxed text-[#d1d5db] break-words">{m.text.split(/(@\w+)/g).map((part: string, i: number) => part.startsWith('@') ? <span key={i} className="text-[#a855f7] font-semibold bg-[#a855f7]/10 rounded px-0.5 cursor-pointer hover:bg-[#a855f7]/20 transition-colors">{part}</span> : part)}</p></div></div>
            })}
          </div>
          <div className="px-4 py-3 border-t border-[#3a4259] flex-shrink-0">
            <div className="flex items-center gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat() } }} placeholder="Ketik pesan... (gunakan @nama untuk mention)" className="flex-1 nus-input h-9 px-3 text-xs" maxLength={200} />
              <button type="button" onClick={handleSendChat} disabled={!chatInput.trim()} className="nus-btn-primary h-9 px-4 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"><Send className="h-3.5 w-3.5" /> Kirim</button>
            </div>
            <p className="mt-1.5 text-[10px] text-[#6b7280]">💡 Gunakan <span className="text-[#a855f7] font-semibold">@nama</span> untuk mention. Enter untuk kirim.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Equipment Drop Notification ===== */}
      {droppedEquipment && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 p-4" style={{ overflowY: 'auto' }} onClick={() => setDroppedEquipment(null)}>
          <div className="bg-[#1a1f2e] border border-[#3a4259] text-[#f0f0f0] max-w-md w-full rounded-xl shadow-2xl p-5 mt-12 mb-12" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 mb-3"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#f0a500] animate-pulse" /><h2 className="nus-title text-xl text-[#f0f0f0]">Item Didapat!</h2></div><button type="button" onClick={() => setDroppedEquipment(null)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup"><X className="h-5 w-5" /></button></div>
            <p className="text-[#a0a6b8] text-xs mb-3 text-center">🎁 Monster menjatuhkan equipment!</p>
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="relative rounded-lg border-2 overflow-hidden p-1" style={{ borderColor: RARITY_COLORS[droppedEquipment.rarity], boxShadow: `0 0 20px ${RARITY_COLORS[droppedEquipment.rarity]}60` }}><img src={droppedEquipment.image} alt={droppedEquipment.name} className="w-32 h-24 object-contain rounded" draggable={false} /><div className="absolute inset-0 rounded-lg pointer-events-none" style={{ background: `radial-gradient(circle at center, ${RARITY_COLORS[droppedEquipment.rarity]}30 0%, transparent 70%)` }} /></div>
              <h3 className="nus-title text-lg font-bold text-[#f0f0f0] text-center">{droppedEquipment.name}</h3>
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: RARITY_COLORS[droppedEquipment.rarity], border: `1px solid ${RARITY_COLORS[droppedEquipment.rarity]}`, backgroundColor: `${RARITY_COLORS[droppedEquipment.rarity]}20` }}>{droppedEquipment.rarity}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#a0a6b8] text-center mb-3">{droppedEquipment.desc}</p>
            <div className="rounded-lg border border-[#3a4259] bg-[#0f1320] p-2.5 space-y-1.5 mb-3">
              <p className="text-[10px] uppercase tracking-wider text-[#c5a059] font-semibold">Bonus Acak</p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {droppedEquipment.defBonus > 0 && <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-1"><span className="text-[#a0a6b8]">DEF Fisik</span><span className="font-bold text-[#3b82f6]">+{droppedEquipment.defBonus}</span></div>}
                {droppedEquipment.magicDefBonus > 0 && <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-1"><span className="text-[#a0a6b8]">DEF Sihir</span><span className="font-bold text-[#a855f7]">+{droppedEquipment.magicDefBonus}</span></div>}
                {droppedEquipment.hpBonus > 0 && <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-1"><span className="text-[#a0a6b8]">Max HP</span><span className="font-bold text-[#22c55e]">+{droppedEquipment.hpBonus}</span></div>}
                {droppedEquipment.mpBonus > 0 && <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-1"><span className="text-[#a0a6b8]">Max MP</span><span className="font-bold text-[#3b82f6]">+{droppedEquipment.mpBonus}</span></div>}
                {droppedEquipment.atkBonus > 0 && <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-1"><span className="text-[#a0a6b8]">ATK Fisik</span><span className="font-bold text-[#ef4444]">+{droppedEquipment.atkBonus}</span></div>}
                {droppedEquipment.magicAtkBonus > 0 && <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-1"><span className="text-[#a0a6b8]">Magic ATK</span><span className="font-bold text-[#a855f7]">+{droppedEquipment.magicAtkBonus}</span></div>}
              </div>
              <p className="text-[10px] text-[#6b7280] italic text-center pt-1">Item disimpan di Kantong Peralatan.</p>
            </div>
            <button type="button" onClick={() => setDroppedEquipment(null)} className="nus-btn-primary w-full h-9 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Lanjutkan</button>
          </div>
        </div>
      )}

      {/* ===== Akademi (Berguru) Modal ===== */}
      <Dialog open={akademiOpen} onOpenChange={setAkademiOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-4xl w-[95vw] p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#f0a500]" />
                <DialogTitle className="nus-title text-2xl text-[#f0f0f0]">
                  {skillDetailView ? 'Akademi Skill' : 'Berguru'}
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                {skillDetailView && (
                  <button type="button" onClick={() => setSkillDetailView(null)} className="text-[11px] text-[#c5a059] hover:text-[#f0a500] transition-colors mr-2">← Kembali</button>
                )}
                <button type="button" onClick={() => setAkademiOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">
              {skillDetailView ? 'Latih skill dengan menggunakannya. Setiap penggunaan menaikkan progress 0.3%.' : selectedCity ? 'Kamu sudah memilih akademi. Kembali untuk lihat skill.' : 'Pilih satu kota untuk berguru. Setelah memilih, kota lain akan tertutup.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto nus-scroll p-5">
            {!skillDetailView ? (
              /* City selection grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AKADEMI_CITIES.map(city => {
                  const isChosen = selectedCity === city.id
                  const isLocked = selectedCity !== null && selectedCity !== city.id
                  if (isLocked) return null // Hide other cities once one is chosen
                  return (
                    <button key={city.id} type="button" onClick={() => handleSelectCity(city.id)} className={`rounded-xl border-2 overflow-hidden bg-[#1f2533] hover:bg-[#2d3548] transition-colors text-left cursor-pointer ${isChosen ? 'border-[#f0a500] shadow-[0_0_0_3px_rgba(240,165,0,0.2)]' : 'border-[#3a4259] hover:border-[#c5a059]/60'}`}>
                      <div className="relative h-32 overflow-hidden">
                        <img src={city.image} alt={city.name} className="w-full h-full object-cover" draggable={false} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1f2533] via-transparent to-transparent" />
                        {isChosen && <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#f0a500]"><CheckCircle2 className="h-4 w-4 text-[#1a1207]" /></div>}
                      </div>
                      <div className="p-3">
                        <h4 className="nus-title text-base font-bold text-[#f0f0f0]">{city.name}</h4>
                        <p className="text-[11px] text-[#c5a059] font-semibold uppercase tracking-wide mt-0.5">{city.fullName}</p>
                        <p className="text-[11px] text-[#a0a6b8] mt-1 leading-relaxed">{city.description}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-[#6b7280]" />
                          <span className="text-[10px] text-[#6b7280]">{city.skills.length} skill tersedia</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              /* Skill detail view for selected city */
              (() => {
                const city = AKADEMI_CITIES.find(c => c.id === skillDetailView)
                if (!city) return null
                return (
                  <div className="space-y-3">
                    {/* City header */}
                    <div className="rounded-lg border border-[#3a4259] bg-[#1f2533] p-3 flex items-center gap-3">
                      <div className="h-16 w-20 rounded-lg overflow-hidden border border-[#c5a059]/40 flex-shrink-0">
                        <img src={city.image} alt={city.name} className="w-full h-full object-cover" draggable={false} />
                      </div>
                      <div>
                        <h3 className="nus-title text-lg font-bold text-[#f0f0f0]">{city.name}</h3>
                        <p className="text-[11px] text-[#c5a059] font-semibold uppercase tracking-wide">{city.fullName}</p>
                        <p className="text-[11px] text-[#a0a6b8]">{city.description}</p>
                      </div>
                    </div>

                    {/* Skills list */}
                    {city.skills.map((skill, idx) => {
                      const unlocked = isSkillUnlocked(city, idx, skillProgress)
                      const mastered = isSkillMastered(skill.id, skillProgress)
                      const progress = skillProgress[skill.id] ?? 0
                      const isEquipped = equippedSkill === skill.id
                      return (
                        <div key={skill.id} className={`rounded-lg border-2 p-3 transition-all ${!unlocked ? 'border-[#3a4259] bg-[#0f1320]/50 opacity-50' : isEquipped ? 'border-[#f0a500] bg-[#f0a500]/10' : mastered ? 'border-[#22c55e]/40 bg-[#0f1320]' : 'border-[#3a4259] bg-[#0f1320]'}`}>
                          <div className="flex items-start gap-3">
                            {/* Skill number / lock icon */}
                            <div className={`flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold ${!unlocked ? 'bg-[#1f2533] text-[#3a4259]' : mastered ? 'bg-[#22c55e] text-[#1a1207]' : 'bg-[#2d3548] text-[#c5a059]'}`}>
                              {!unlocked ? <Lock className="h-4 w-4" /> : mastered ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                            </div>
                            {/* Skill info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="nus-serif text-sm font-bold text-[#f0f0f0]">{skill.name}</h4>
                                {isEquipped && <span className="rounded-full bg-[#f0a500] px-2 py-0.5 text-[9px] font-bold text-[#1a1207]">DIPASANG</span>}
                                {mastered && <span className="rounded-full bg-[#22c55e] px-2 py-0.5 text-[9px] font-bold text-[#1a1207]">MASTERED</span>}
                              </div>
                              <p className="text-[11px] text-[#a0a6b8] leading-relaxed mt-0.5">{skill.description}</p>
                              {skill.mpCost > 0 && <p className="text-[10px] text-[#3b82f6] mt-0.5">Magic Cost: {skill.mpCost} MP</p>}
                              {skill.masteryBonus && <p className="text-[10px] text-[#c5a059] mt-0.5">Mastery: {skill.masteryBonus}</p>}

                              {/* Progress bar */}
                              {unlocked && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                                    <span className="text-[#6b7280]">Progress</span>
                                    <span className="font-bold text-[#f0f0f0]">{progress.toFixed(1)}%</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-[#1f2533] border border-[#3a4259] overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: mastered ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #c5a059, #f0a500)' }} />
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              {unlocked && (
                                <div className="mt-2 flex gap-2">
                                  <button type="button" onClick={() => handleUseSkill(skill.id)} disabled={mastered} className="nus-btn-ghost h-7 px-3 rounded-md text-[10px] font-medium inline-flex items-center justify-center gap-1 border-[#3e475e] disabled:opacity-40">
                                    <Zap className="h-3 w-3" /> {mastered ? 'Maxed' : 'Latih (+0.3%)'}
                                  </button>
                                  <button type="button" onClick={() => handleEquipSkill(skill.id)} disabled={!mastered && progress < 1} className={`h-7 px-3 rounded-md text-[10px] font-medium inline-flex items-center justify-center gap-1 ${isEquipped ? 'nus-btn-primary' : 'nus-btn-ghost border-[#3e475e]'} disabled:opacity-40 disabled:cursor-not-allowed`}>
                                    {isEquipped ? '✓ Terpasang' : 'Pasang Skill'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Equipped skill indicator */}
                    {equippedSkill && (
                      <div className="rounded-lg border border-[#f0a500]/40 bg-[#f0a500]/10 p-3 text-center">
                        <p className="text-[11px] text-[#f0a500] font-semibold">
                          Skill Aktif: {city.skills.find(s => s.id === equippedSkill)?.name || 'Tidak ada'}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Home (Rumahmu) Modal ===== */}
      <Dialog open={homeOpen} onOpenChange={setHomeOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-4xl w-[97vw] p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Home className="h-5 w-5 text-[#f0a500]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Rumahmu</DialogTitle></div>
              <button type="button" onClick={() => setHomeOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup rumah"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Rumah sederhana di desa Nusantara. Upgrade fasilitas untuk mendapatkan buff pasif bagi karaktermu.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto nus-scroll">
            {/* House image */}
            <div className="relative h-52 sm:h-64 overflow-hidden bg-gradient-to-b from-[#3a2a14] to-[#1a1207] border-b border-[#3a4259]">
              <img src="/house.png" alt="Rumah Desa" className="w-full h-full object-cover" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 rounded-lg bg-[#0f1320]/85 border border-[#c5a059]/40 px-3 py-2 backdrop-blur-sm">
                <p className="nus-serif text-xs text-[#f0f0f0] leading-relaxed">
                  <span className="text-[#f0a500] font-bold">Rumah Sederhana:</span> Tempat istirahat pendekar. Bangun fasilitas di bawah untuk mendapatkan regenerasi HP/MP, bonus ATK/DEF, dan fitur lainnya.
                </p>
              </div>
            </div>

            {/* Total buffs summary */}
            <div className="px-4 pt-3 pb-2 border-b border-[#3a4259] bg-[#1f2533]/60">
              <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-1.5 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Buff Aktif dari Rumah</p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {(() => {
                  const buffs: { label: string; color: string }[] = []
                  if (homeFacilities.dapur > 0) { const t = dapurSubItems.filter(p => p >= 100).length; buffs.push({ label: `+${5 * Math.pow(2, Math.max(0, t - 1))} MP/5 menit`, color: '#3b82f6' }) }
                  if (homeFacilities.gym > 0) { const t = gymSubItems.filter(p => p >= 100).length; buffs.push({ label: `+${3 + t} ATK, +${2 + t} DEF`, color: '#ef4444' }) }
                  if (homeFacilities.kamarMandi > 0) { const t = mandiSubItems.filter(p => p >= 100).length; buffs.push({ label: `+${8 + t * 2} HP/5 menit`, color: '#22c55e' }) }
                  if (homeFacilities.kasur > 0) { const t = kasurSubItems.filter(p => p >= 100).length; buffs.push({ label: `+${10 + t * 2.5}% Stamina/jam`, color: '#f0a500' }) }
                  if (buffs.length === 0) return <span className="text-[#6b7280] italic">Belum ada buff. Bangun fasilitas untuk mulai mendapat bonus.</span>
                  return buffs.map((b, i) => <span key={i} className="rounded-full px-2 py-0.5 text-[10px] font-bold border" style={{ color: b.color, borderColor: `${b.color}60`, backgroundColor: `${b.color}15` }}>{b.label}</span>)
                })()}
              </div>
            </div>

            {/* Facility buttons grid */}
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><Home className="h-3.5 w-3.5" /> Fasilitas Rumah</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {HOME_FACILITIES.map(facility => {
                  const lvl = (homeFacilities as any)[facility.key] as number
                  const cost = getFacilityBuildCost(facility.key)
                  const isBuilt = lvl >= 1
                  const isWorking = homeFacilityAnimation === facility.key
                  const canBuild = !isBuilt && !isWorking && gold >= cost.gold && materials.besi >= cost.besi && materials.kulit >= cost.kulit && materials.kayu >= (cost.kayu || 0)
                  // Facilities that have sub-item dialogs
                  const hasSubDialog = ['dapur', 'kasur', 'gym', 'kamarMandi', 'kebun', 'kolamIkan', 'inkubasi', 'kotak'].includes(facility.key)
                  const openSubDialog = () => {
                    if (facility.key === 'dapur') setDapurSubOpen(true)
                    else if (facility.key === 'kasur') setKasurSubOpen(true)
                    else if (facility.key === 'gym') setGymSubOpen(true)
                    else if (facility.key === 'kamarMandi') setMandiSubOpen(true)
                    else if (facility.key === 'kebun') setKebunSubOpen(true)
                    else if (facility.key === 'kolamIkan') setKolamSubOpen(true)
                    else if (facility.key === 'inkubasi') setInkubasiSubOpen(true)
                    else if (facility.key === 'kotak') setKotakSubOpen(true)
                  }
                  const subButtonLabel = facility.key === 'dapur' ? 'Buka Dapur' : facility.key === 'kasur' ? 'Buka Kasur' : facility.key === 'gym' ? 'Buka Gym' : facility.key === 'kamarMandi' ? 'Buka Kamar Mandi' : facility.key === 'kebun' ? 'Buka Kebun' : facility.key === 'kolamIkan' ? 'Buka Kolam Ikan' : facility.key === 'inkubasi' ? 'Buka Inkubasi' : facility.key === 'kotak' ? 'Buka Kotak' : 'Sudah Dibangun'
                  return (
                    <div key={facility.key} className="rounded-xl border-2 overflow-hidden flex flex-col" style={{ borderColor: isBuilt ? facility.color : '#3a4259', backgroundColor: '#0f1320' }}>
                      {/* Facility image */}
                      <div className="relative aspect-square overflow-hidden bg-[#1f2533]">
                        <img src={facility.icon} alt={facility.name} className={`w-full h-full object-cover transition-all ${!isBuilt ? 'grayscale brightness-75' : ''} ${isWorking ? 'animate-pulse brightness-150' : ''}`} draggable={false} />
                        {!isBuilt && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-bold bg-[#0f1320]/80 px-2 py-1 rounded">Belum Dibangun</span></div>}
                        {isBuilt && <div className="absolute top-1 right-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border flex items-center gap-1" style={{ color: facility.color, borderColor: facility.color, backgroundColor: 'rgba(15,19,32,0.85)' }}><CheckCircle2 className="h-3 w-3" /> Dibangun</div>}
                        {isWorking && <div className="absolute inset-0 flex items-center justify-center bg-[#f0a500]/30 backdrop-blur-sm"><Loader2 className="h-8 w-8 text-[#f0a500] animate-spin" /></div>}
                      </div>
                      {/* Facility info */}
                      <div className="p-2 flex-1 flex flex-col gap-1">
                        <div>
                          <p className="nus-title text-sm font-bold text-[#f0f0f0] truncate">{facility.name}</p>
                          <p className="text-[10px]" style={{ color: facility.color }}>{facility.desc}</p>
                        </div>
                        <p className="text-[10px] text-[#a0a6b8] leading-tight">{facility.buffLabel(lvl)}</p>
                        {/* Build cost + Bangun button (only when not built) */}
                        {!isBuilt ? (
                          <>
                            <div className="text-[9px] text-[#6b7280] space-y-0.5 mt-auto">
                              <p className="flex items-center gap-1"><Coins className="h-2.5 w-2.5 text-[#f0a500]" /> {cost.gold.toLocaleString()} <span className={gold >= cost.gold ? 'text-[#22c55e]' : 'text-[#ef4444]'}>({gold.toLocaleString()})</span></p>
                              <div className="flex flex-wrap gap-1.5">
                                {cost.besi > 0 && <span className={`inline-flex items-center gap-0.5 px-1 rounded ${materials.besi >= cost.besi ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/besi.png" alt="Besi" className="h-3 w-3 object-contain" />{cost.besi.toLocaleString()}</span>}
                                {cost.kulit > 0 && <span className={`inline-flex items-center gap-0.5 px-1 rounded ${materials.kulit >= cost.kulit ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kulit.png" alt="Kulit" className="h-3 w-3 object-contain" />{cost.kulit.toLocaleString()}</span>}
                                {cost.kayu > 0 && <span className={`inline-flex items-center gap-0.5 px-1 rounded ${materials.kayu >= cost.kayu ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kayu.png" alt="Kayu" className="h-3 w-3 object-contain" />{cost.kayu.toLocaleString()}</span>}
                              </div>
                            </div>
                            <button type="button" onClick={() => handleBuildFacility(facility.key)} disabled={!canBuild} className={`mt-1 w-full h-7 rounded-md text-[10px] font-bold inline-flex items-center justify-center gap-1 transition-all ${canBuild ? 'nus-btn-primary cursor-pointer hover:scale-[1.02]' : 'bg-[#3a4259] text-[#6b7280] cursor-not-allowed'}`}>
                              {isWorking ? <><Loader2 className="h-3 w-3 animate-spin" /></> : <>Bangun</>}
                            </button>
                          </>
                        ) : (
                          <div className="mt-auto">
                            {hasSubDialog ? (
                              <button type="button" onClick={openSubDialog} className="w-full h-8 rounded-md text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all hover:scale-[1.02] cursor-pointer" style={{ color: facility.color, borderColor: facility.color, backgroundColor: `${facility.color}15`, border: `1px solid ${facility.color}` }}>
                                <CheckCircle2 className="h-3.5 w-3.5" /> {subButtonLabel}
                              </button>
                            ) : (
                              <div className="w-full text-center text-[10px] font-bold text-[#f0a500] py-1.5 rounded-md bg-[#f0a500]/10 border border-[#f0a500]/30 flex items-center justify-center gap-1"><CheckCircle2 className="h-3 w-3" /> Sudah Dibangun</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-3 text-[10px] text-[#6b7280] text-center">💡 Bangun fasilitas sekali saja. Upgrade bertahap tersedia di dalam masing-masing bangunan (sub-item).</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Dapur (Kitchen) Sub-items Dialog ===== */}
      <Dialog open={dapurSubOpen} onOpenChange={setDapurSubOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-5xl w-[97vw] p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Flame className="h-5 w-5 text-[#3b82f6]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Dapur — Upgrade Bertingkat</DialogTitle></div>
              <button type="button" onClick={() => setDapurSubOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup dapur"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Setiap tahap selesai menggandakan buff MP regen per 5 menit. Mulai dari +5 MP/5 menit, hingga +160 MP/5 menit di tahap 6.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto nus-scroll p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Upgrade Dapur — 6 Tahap Bertingkat (kain-lusuh → mewah)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DAPUR_SUB_ITEMS.map((sub, i) => {
                const progress = dapurSubItems[i]
                const isComplete = progress >= 100
                const isLocked = i > 0 && dapurSubItems[i - 1] < 100
                const isActive = !isLocked && !isComplete
                const canUpgrade = isActive && gold >= 5000 && materials.kayu >= 250 && materials.besi >= 250
                return (
                  <div key={sub.key} className={`rounded-xl border-2 overflow-hidden flex flex-col transition-all ${isLocked ? 'opacity-40 border-[#3a4259]' : isComplete ? 'border-[#22c55e]' : 'border-[#3b82f6]'}`} style={{ backgroundColor: '#0f1320' }}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#1f2533]">
                      <img src={sub.icon} alt={sub.name} className={`w-full h-full object-cover transition-all ${isLocked ? 'grayscale brightness-50' : isComplete ? 'brightness-110' : ''}`} draggable={false} />
                      {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="text-center"><Lock className="h-8 w-8 text-[#6b7280] mx-auto mb-1" /><span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-bold">Terkunci</span></div></div>}
                      {isComplete && <div className="absolute top-1 right-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border border-[#22c55e] text-[#22c55e] bg-[#0f1320]/85 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 100%</div>}
                      <div className="absolute top-1 left-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-[#f0f0f0] bg-[#0f1320]/85 border border-[#c5a059]/40">Tahap {i + 1} · +{5 * Math.pow(2, i)} MP/5 menit</div>
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                      <div>
                        <p className="nus-title text-sm font-bold text-[#f0f0f0] truncate">{sub.name}</p>
                        <p className="text-[10px] text-[#a0a6b8] leading-tight">{sub.desc}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[9px] mb-0.5"><span className="text-[#a0a6b8]">Progress</span><span className={`font-bold ${isComplete ? 'text-[#22c55e]' : isActive ? 'text-[#3b82f6]' : 'text-[#6b7280]'}`}>{progress}%</span></div>
                        <div className="h-2 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: isComplete ? 'linear-gradient(90deg, #3b82f6, #22c55e)' : 'linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa)' }} /></div>
                      </div>
                      {isActive && (
                        <>
                          <div className="text-[9px] text-[#6b7280] flex flex-wrap gap-1.5 mt-1">
                            <span className={`inline-flex items-center gap-0.5 ${gold >= 5000 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><Coins className="h-3 w-3" /> 5.000</span>
                            <span className={`inline-flex items-center gap-0.5 ${materials.kayu >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kayu.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                            <span className={`inline-flex items-center gap-0.5 ${materials.besi >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/besi.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                          </div>
                          <button type="button" onClick={() => handleUpgradeDapurSub(i)} disabled={!canUpgrade} className={`mt-auto w-full h-8 rounded-md text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all ${canUpgrade ? 'nus-btn-primary cursor-pointer hover:scale-[1.02]' : 'bg-[#3a4259] text-[#6b7280] cursor-not-allowed'}`}>
                            <Flame className="h-3 w-3" /> Upgrade +10%
                          </button>
                        </>
                      )}
                      {isComplete && <div className="mt-auto text-center text-[11px] font-bold text-[#22c55e] py-1.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Tahap Selesai · +{5 * Math.pow(2, i)} MP/5 menit</div>}
                      {isLocked && <div className="mt-auto text-center text-[10px] text-[#6b7280] py-1.5 italic">Selesaikan tahap {i} dulu</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Kasur (Bed) Sub-items Dialog ===== */}
      <Dialog open={kasurSubOpen} onOpenChange={setKasurSubOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-5xl w-[97vw] p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Star className="h-5 w-5 text-[#f0a500]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Kasur — Upgrade Bertingkat</DialogTitle></div>
              <button type="button" onClick={() => setKasurSubOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup kasur"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Setiap tahap selesai menambah +2.5% Stamina regen per jam. Mulai dari +10%/jam (base), hingga +25%/jam di tahap 6.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto nus-scroll p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Upgrade Kasur — 6 Tahap Bertingkat (kain-lusuh → mewah)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {KASUR_SUB_ITEMS.map((sub, i) => {
                const progress = kasurSubItems[i]
                const isComplete = progress >= 100
                const isLocked = i > 0 && kasurSubItems[i - 1] < 100
                const isActive = !isLocked && !isComplete
                const canUpgrade = isActive && gold >= 5000 && materials.kayu >= 250 && materials.kulit >= 250
                const totalRegen = 10 + (i + 1) * 2.5
                return (
                  <div key={sub.key} className={`rounded-xl border-2 overflow-hidden flex flex-col transition-all ${isLocked ? 'opacity-40 border-[#3a4259]' : isComplete ? 'border-[#22c55e]' : 'border-[#f0a500]'}`} style={{ backgroundColor: '#0f1320' }}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#1f2533]">
                      <img src={sub.icon} alt={sub.name} className={`w-full h-full object-cover transition-all ${isLocked ? 'grayscale brightness-50' : isComplete ? 'brightness-110' : ''}`} draggable={false} />
                      {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="text-center"><Lock className="h-8 w-8 text-[#6b7280] mx-auto mb-1" /><span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-bold">Terkunci</span></div></div>}
                      {isComplete && <div className="absolute top-1 right-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border border-[#22c55e] text-[#22c55e] bg-[#0f1320]/85 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 100%</div>}
                      <div className="absolute top-1 left-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-[#f0f0f0] bg-[#0f1320]/85 border border-[#c5a059]/40">Tahap {i + 1} · +{totalRegen}% Stamina/jam</div>
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                      <div>
                        <p className="nus-title text-sm font-bold text-[#f0f0f0] truncate">{sub.name}</p>
                        <p className="text-[10px] text-[#a0a6b8] leading-tight">{sub.desc}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[9px] mb-0.5"><span className="text-[#a0a6b8]">Progress</span><span className={`font-bold ${isComplete ? 'text-[#22c55e]' : isActive ? 'text-[#f0a500]' : 'text-[#6b7280]'}`}>{progress}%</span></div>
                        <div className="h-2 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: isComplete ? 'linear-gradient(90deg, #f0a500, #22c55e)' : 'linear-gradient(90deg, #b45309, #f0a500, #fbbf24)' }} /></div>
                      </div>
                      {isActive && (
                        <>
                          <div className="text-[9px] text-[#6b7280] flex flex-wrap gap-1.5 mt-1">
                            <span className={`inline-flex items-center gap-0.5 ${gold >= 5000 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><Coins className="h-3 w-3" /> 5.000</span>
                            <span className={`inline-flex items-center gap-0.5 ${materials.kayu >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kayu.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                            <span className={`inline-flex items-center gap-0.5 ${materials.kulit >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kulit.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                          </div>
                          <button type="button" onClick={() => handleUpgradeKasurSub(i)} disabled={!canUpgrade} className={`mt-auto w-full h-8 rounded-md text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all ${canUpgrade ? 'nus-btn-primary cursor-pointer hover:scale-[1.02]' : 'bg-[#3a4259] text-[#6b7280] cursor-not-allowed'}`}>
                            <Star className="h-3 w-3" /> Upgrade +10%
                          </button>
                        </>
                      )}
                      {isComplete && <div className="mt-auto text-center text-[11px] font-bold text-[#22c55e] py-1.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Tahap Selesai · +{totalRegen}% Stamina/jam</div>}
                      {isLocked && <div className="mt-auto text-center text-[10px] text-[#6b7280] py-1.5 italic">Selesaikan tahap {i} dulu</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Gym Sub-items Dialog ===== */}
      <Dialog open={gymSubOpen} onOpenChange={setGymSubOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-5xl w-[97vw] p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Sword className="h-5 w-5 text-[#ef4444]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Alat Gym — Upgrade Bertingkat</DialogTitle></div>
              <button type="button" onClick={() => setGymSubOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup gym"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Setiap tahap selesai menambah +1 ATK / +1 DEF. Mulai dari +3 ATK +2 DEF (base), hingga +7 ATK +6 DEF di tahap 4.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto nus-scroll p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Upgrade Alat Gym — 4 Tahap Bertingkat (kayu → mewah)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {GYM_SUB_ITEMS.map((sub, i) => {
                const progress = gymSubItems[i]
                const isComplete = progress >= 100
                const isLocked = i > 0 && gymSubItems[i - 1] < 100
                const isActive = !isLocked && !isComplete
                const canUpgrade = isActive && gold >= 5000 && materials.besi >= 250 && materials.kulit >= 250
                const totalAtk = 3 + (i + 1)
                const totalDef = 2 + (i + 1)
                return (
                  <div key={sub.key} className={`rounded-xl border-2 overflow-hidden flex flex-col transition-all ${isLocked ? 'opacity-40 border-[#3a4259]' : isComplete ? 'border-[#22c55e]' : 'border-[#ef4444]'}`} style={{ backgroundColor: '#0f1320' }}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#1f2533]">
                      <img src={sub.icon} alt={sub.name} className={`w-full h-full object-cover transition-all ${isLocked ? 'grayscale brightness-50' : isComplete ? 'brightness-110' : ''}`} draggable={false} />
                      {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="text-center"><Lock className="h-8 w-8 text-[#6b7280] mx-auto mb-1" /><span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-bold">Terkunci</span></div></div>}
                      {isComplete && <div className="absolute top-1 right-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border border-[#22c55e] text-[#22c55e] bg-[#0f1320]/85 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 100%</div>}
                      <div className="absolute top-1 left-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-[#f0f0f0] bg-[#0f1320]/85 border border-[#c5a059]/40">Tahap {i + 1} · +{totalAtk} ATK / +{totalDef} DEF</div>
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                      <div>
                        <p className="nus-title text-sm font-bold text-[#f0f0f0] truncate">{sub.name}</p>
                        <p className="text-[10px] text-[#a0a6b8] leading-tight">{sub.desc}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[9px] mb-0.5"><span className="text-[#a0a6b8]">Progress</span><span className={`font-bold ${isComplete ? 'text-[#22c55e]' : isActive ? 'text-[#ef4444]' : 'text-[#6b7280]'}`}>{progress}%</span></div>
                        <div className="h-2 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: isComplete ? 'linear-gradient(90deg, #ef4444, #22c55e)' : 'linear-gradient(90deg, #991b1b, #ef4444, #f87171)' }} /></div>
                      </div>
                      {isActive && (
                        <>
                          <div className="text-[9px] text-[#6b7280] flex flex-wrap gap-1.5 mt-1">
                            <span className={`inline-flex items-center gap-0.5 ${gold >= 5000 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><Coins className="h-3 w-3" /> 5.000</span>
                            <span className={`inline-flex items-center gap-0.5 ${materials.besi >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/besi.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                            <span className={`inline-flex items-center gap-0.5 ${materials.kulit >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kulit.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                          </div>
                          <button type="button" onClick={() => handleUpgradeGymSub(i)} disabled={!canUpgrade} className={`mt-auto w-full h-8 rounded-md text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all ${canUpgrade ? 'nus-btn-primary cursor-pointer hover:scale-[1.02]' : 'bg-[#3a4259] text-[#6b7280] cursor-not-allowed'}`}>
                            <Sword className="h-3 w-3" /> Upgrade +10%
                          </button>
                        </>
                      )}
                      {isComplete && <div className="mt-auto text-center text-[11px] font-bold text-[#22c55e] py-1.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Tahap Selesai · +{totalAtk} ATK / +{totalDef} DEF</div>}
                      {isLocked && <div className="mt-auto text-center text-[10px] text-[#6b7280] py-1.5 italic">Selesaikan tahap {i} dulu</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Kamar Mandi (Bathroom) Sub-items Dialog ===== */}
      <Dialog open={mandiSubOpen} onOpenChange={setMandiSubOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-5xl w-[97vw] p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Heart className="h-5 w-5 text-[#22c55e]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Kamar Mandi — Upgrade Bertingkat</DialogTitle></div>
              <button type="button" onClick={() => setMandiSubOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup kamar mandi"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Setiap tahap selesai menambah +2 HP/5 menit. Mulai dari +8 HP/5 menit (base), hingga +20 HP/5 menit di tahap 6.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto nus-scroll p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Upgrade Kamar Mandi — 6 Tahap Bertingkat (kain-lusuh → mewah)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MANDI_SUB_ITEMS.map((sub, i) => {
                const progress = mandiSubItems[i]
                const isComplete = progress >= 100
                const isLocked = i > 0 && mandiSubItems[i - 1] < 100
                const isActive = !isLocked && !isComplete
                const canUpgrade = isActive && gold >= 5000 && materials.kayu >= 250 && materials.kulit >= 250
                const totalHp = 8 + (i + 1) * 2
                return (
                  <div key={sub.key} className={`rounded-xl border-2 overflow-hidden flex flex-col transition-all ${isLocked ? 'opacity-40 border-[#3a4259]' : isComplete ? 'border-[#22c55e]' : 'border-[#22c55e]'}`} style={{ backgroundColor: '#0f1320' }}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#1f2533]">
                      <img src={sub.icon} alt={sub.name} className={`w-full h-full object-cover transition-all ${isLocked ? 'grayscale brightness-50' : isComplete ? 'brightness-110' : ''}`} draggable={false} />
                      {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="text-center"><Lock className="h-8 w-8 text-[#6b7280] mx-auto mb-1" /><span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-bold">Terkunci</span></div></div>}
                      {isComplete && <div className="absolute top-1 right-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border border-[#22c55e] text-[#22c55e] bg-[#0f1320]/85 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 100%</div>}
                      <div className="absolute top-1 left-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-[#f0f0f0] bg-[#0f1320]/85 border border-[#c5a059]/40">Tahap {i + 1} · +{totalHp} HP/5 menit</div>
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                      <div>
                        <p className="nus-title text-sm font-bold text-[#f0f0f0] truncate">{sub.name}</p>
                        <p className="text-[10px] text-[#a0a6b8] leading-tight">{sub.desc}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[9px] mb-0.5"><span className="text-[#a0a6b8]">Progress</span><span className={`font-bold ${isComplete ? 'text-[#22c55e]' : isActive ? 'text-[#22c55e]' : 'text-[#6b7280]'}`}>{progress}%</span></div>
                        <div className="h-2 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: isComplete ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #14532d, #22c55e, #86efac)' }} /></div>
                      </div>
                      {isActive && (
                        <>
                          <div className="text-[9px] text-[#6b7280] flex flex-wrap gap-1.5 mt-1">
                            <span className={`inline-flex items-center gap-0.5 ${gold >= 5000 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><Coins className="h-3 w-3" /> 5.000</span>
                            <span className={`inline-flex items-center gap-0.5 ${materials.kayu >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kayu.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                            <span className={`inline-flex items-center gap-0.5 ${materials.kulit >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kulit.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                          </div>
                          <button type="button" onClick={() => handleUpgradeMandiSub(i)} disabled={!canUpgrade} className={`mt-auto w-full h-8 rounded-md text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all ${canUpgrade ? 'nus-btn-primary cursor-pointer hover:scale-[1.02]' : 'bg-[#3a4259] text-[#6b7280] cursor-not-allowed'}`}>
                            <Heart className="h-3 w-3" /> Upgrade +10%
                          </button>
                        </>
                      )}
                      {isComplete && <div className="mt-auto text-center text-[11px] font-bold text-[#22c55e] py-1.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Tahap Selesai · +{totalHp} HP/5 menit</div>}
                      {isLocked && <div className="mt-auto text-center text-[10px] text-[#6b7280] py-1.5 italic">Selesaikan tahap {i} dulu</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Kebun (Garden) Sub-items Dialog ===== */}
      <Dialog open={kebunSubOpen} onOpenChange={setKebunSubOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-4xl w-[97vw] p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><TreePine className="h-5 w-5 text-[#16a34a]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Kebun — Tanam & Panen Buah</DialogTitle></div>
              <button type="button" onClick={() => setKebunSubOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup kebun"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Drag buah dari tas ke slot tanam. Setelah 12 jam, panen untuk dapatkan 3x lipat jumlah buah!</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto nus-scroll">
            {/* Tier upgrade cards (3 tiers) */}
            <div className="p-4 border-b border-[#3a4259]">
              <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Upgrade Kebun — Buka Lebih Banyak Slot</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {KEBUN_SUB_ITEMS.map((sub, i) => {
                  const progress = kebunSubItems[i]
                  const isComplete = progress >= 100
                  const isLocked = i > 0 && kebunSubItems[i - 1] < 100
                  const isActive = !isLocked && !isComplete
                  const canUpgrade = isActive && gold >= 5000 && materials.kayu >= 250 && materials.kulit >= 250
                  return (
                    <div key={sub.key} className={`rounded-xl border-2 overflow-hidden flex flex-col transition-all ${isLocked ? 'opacity-40 border-[#3a4259]' : isComplete ? 'border-[#22c55e]' : 'border-[#16a34a]'}`} style={{ backgroundColor: '#0f1320' }}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#1f2533]">
                        <img src={sub.icon} alt={sub.name} className={`w-full h-full object-cover transition-all ${isLocked ? 'grayscale brightness-50' : isComplete ? 'brightness-110' : ''}`} draggable={false} />
                        {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="text-center"><Lock className="h-8 w-8 text-[#6b7280] mx-auto mb-1" /><span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-bold">Terkunci</span></div></div>}
                        {isComplete && <div className="absolute top-1 right-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border border-[#22c55e] text-[#22c55e] bg-[#0f1320]/85 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 100%</div>}
                        <div className="absolute top-1 left-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-[#f0f0f0] bg-[#0f1320]/85 border border-[#c5a059]/40">Tahap {i + 1} · {sub.slots} slot</div>
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                        <div>
                          <p className="nus-title text-sm font-bold text-[#f0f0f0] truncate">{sub.name}</p>
                          <p className="text-[10px] text-[#a0a6b8] leading-tight">{sub.desc}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[9px] mb-0.5"><span className="text-[#a0a6b8]">Progress</span><span className={`font-bold ${isComplete ? 'text-[#22c55e]' : isActive ? 'text-[#16a34a]' : 'text-[#6b7280]'}`}>{progress}%</span></div>
                          <div className="h-2 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: isComplete ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, #15803d, #16a34a, #4ade80)' }} /></div>
                        </div>
                        {isActive && (
                          <>
                            <div className="text-[9px] text-[#6b7280] flex flex-wrap gap-1.5 mt-1">
                              <span className={`inline-flex items-center gap-0.5 ${gold >= 5000 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><Coins className="h-3 w-3" /> 5.000</span>
                              <span className={`inline-flex items-center gap-0.5 ${materials.kayu >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kayu.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                              <span className={`inline-flex items-center gap-0.5 ${materials.kulit >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kulit.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                            </div>
                            <button type="button" onClick={() => handleUpgradeKebunSub(i)} disabled={!canUpgrade} className={`mt-auto w-full h-8 rounded-md text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all ${canUpgrade ? 'nus-btn-primary cursor-pointer hover:scale-[1.02]' : 'bg-[#3a4259] text-[#6b7280] cursor-not-allowed'}`}>
                              <TreePine className="h-3 w-3" /> Upgrade +10%
                            </button>
                          </>
                        )}
                        {isComplete && <div className="mt-auto text-center text-[11px] font-bold text-[#22c55e] py-1.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {sub.slots} Slot Aktif</div>}
                        {isLocked && <div className="mt-auto text-center text-[10px] text-[#6b7280] py-1.5 italic">Selesaikan tahap {i} dulu</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Planting slots grid */}
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><TreePine className="h-3.5 w-3.5" /> Slot Tanam — Drag Buah ke Slot</p>
              {getKebunSlots() === 0 ? (
                <div className="text-center py-6">
                  <TreePine className="h-10 w-10 text-[#3a4259] mx-auto mb-2" />
                  <p className="text-sm text-[#6b7280]">Belum ada slot tanam. Upgrade tahap pertama untuk membuka 3 slot.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 mb-4">
                  {Array.from({ length: 9 }).map((_, slotIdx) => {
                    const isUnlocked = slotIdx < getKebunSlots()
                    const planted = kebunPlanted[slotIdx]
                    const timeRemaining = planted ? getKebunSlotTimeRemaining(slotIdx) : null
                    const isReady = planted && !timeRemaining
                    return (
                      <div key={slotIdx} className={`relative aspect-square rounded-lg border-2 overflow-hidden flex flex-col items-center justify-center transition-all ${!isUnlocked ? 'border-[#3a4259] bg-[#0f1320] opacity-30' : planted ? isReady ? 'border-[#22c55e] bg-[#22c55e]/10 animate-pulse' : 'border-[#f0a500] bg-[#f0a500]/5' : 'border-dashed border-[#16a34a]/50 bg-[#0f1320] hover:border-[#16a34a] hover:bg-[#16a34a]/5'}`} onDragOver={e => { if (isUnlocked && !planted) e.preventDefault() }} onDrop={e => { e.preventDefault(); const fruitIdx = parseInt(e.dataTransfer.getData('text/plain')); if (!isNaN(fruitIdx)) handlePlantFruit(slotIdx, fruitIdx) }}>
                        {!isUnlocked && <Lock className="h-4 w-4 text-[#3a4259]" />}
                        {isUnlocked && !planted && <div className="text-center"><TreePine className="h-5 w-5 text-[#16a34a]/40 mx-auto" /><span className="text-[8px] text-[#6b7280]">Drop buah</span></div>}
                        {planted && (
                          <>
                            {planted.fruitImage ? <img src={planted.fruitImage} alt={planted.fruitName} className="w-full h-full object-cover absolute inset-0" /> : <span className="text-2xl">{planted.fruitIcon}</span>}
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                              {isReady ? (
                                <button type="button" onClick={() => handleHarvestFruit(slotIdx)} className="bg-[#22c55e] text-white text-[9px] font-bold rounded-md px-2 py-1 hover:scale-110 transition-transform cursor-pointer flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Panen 3x</button>
                              ) : (
                                <div className="text-center"><p className="text-[8px] text-white font-bold">{planted.fruitName}</p>{timeRemaining && <p className="text-[8px] text-[#f0a500]">{timeRemaining.hours}j {timeRemaining.minutes}m</p>}<div className="w-8 h-1 rounded-full bg-[#1f2533] mt-0.5 overflow-hidden"><div className="h-full rounded-full bg-[#f0a500]" style={{ width: `${timeRemaining?.pct || 0}%` }} /></div></div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Fruit inventory (draggable items) */}
              {getKebunSlots() > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-2 flex items-center gap-1.5"><Backpack className="h-3.5 w-3.5" /> Buah di Tas — Drag ke Slot Tanam</p>
                  {inventoryItems.filter(it => (it.image && it.image.includes('fruit-')) || ['Apel', 'Mangga', 'Jeruk', 'Semangka', 'Nanas', 'Pisang', 'Salak', 'Duku', 'Rambutan', 'Anggur', 'Pepaya', 'Melon', 'Markisa', 'Buah Naga', 'Kelengkeng', 'Matoa', 'Apel Hijau', 'Tomat', 'Wortel', 'Pir', 'Kernetu', 'Alpukat', 'Manggis', 'Terong'].includes(it.name)).length === 0 ? (
                    <p className="text-[11px] text-[#6b7280] italic text-center py-3">Belum ada buah di tas. Bunuh monster atau beli dari pedagang untuk mendapatkan buah.</p>
                  ) : (
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5">
                      {inventoryItems.map((item, i) => {
                        const isFruit = (item.image && item.image.includes('fruit-')) || ['Apel', 'Mangga', 'Jeruk', 'Semangka', 'Nanas', 'Pisang', 'Salak', 'Duku', 'Rambutan', 'Anggur', 'Pepaya', 'Melon', 'Markisa', 'Buah Naga', 'Kelengkeng', 'Matoa', 'Apel Hijau', 'Tomat', 'Wortel', 'Pir', 'Kernetu', 'Alpukat', 'Manggis', 'Terong'].includes(item.name)
                        if (!isFruit) return null
                        return (
                          <div key={i} draggable={true} onDragStart={e => e.dataTransfer.setData('text/plain', String(i))} className="relative aspect-square rounded border-2 border-[#22c55e]/40 bg-[#0f1320] overflow-hidden cursor-grab hover:scale-110 transition-transform" title={`${item.name} ×${item.qty} — Drag ke slot tanam`}>
                            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" draggable={false} /> : <span className="text-xl flex items-center justify-center h-full">{item.icon}</span>}
                            {item.qty > 1 && <span className="absolute top-0 right-0 text-[8px] font-bold text-white bg-black/80 rounded-bl px-0.5 leading-tight">×{item.qty}</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <p className="mt-2 text-[10px] text-[#6b7280] text-center">💡 Setiap buah yang ditanam akan menghasilkan 3x lipat setelah 12 jam. Contoh: Tanam 1 Apel → Panen 3 Apel.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== GM Panel Dialog ===== */}
      <Dialog open={gmOpen} onOpenChange={v => { if (!v) handleGmClose() }}>
        <DialogContent className="bg-[#1a1f2e] border-[#a855f7]/50 text-[#f0f0f0] max-w-2xl w-[95vw] p-0 overflow-hidden max-h-[92vh] flex flex-col shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          {!gmAuthed ? (
            <>
              <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white text-[11px] font-bold">GM</span><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Panel Game Master</DialogTitle></div>
                  <button type="button" onClick={handleGmClose} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup"><X className="h-5 w-5" /></button>
                </div>
                <DialogDescription className="text-[#a0a6b8] text-sm">Wilayah terbatas untuk Game Master. Masukkan password untuk melanjutkan.</DialogDescription>
              </DialogHeader>
              <div className="p-6 flex flex-col items-center gap-4">
                {gmPasswordError ? (
                  <div className="text-center py-6 animate-pulse">
                    <Skull className="h-24 w-24 text-[#ef4444] mx-auto mb-3 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]" />
                    <p className="nus-title text-2xl font-bold text-[#ef4444] mb-1">WILAYAH TERLARANG!</p>
                    <p className="text-sm text-[#a0a6b8]">Password salah. Life berkurang 1.</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Lock className="h-16 w-16 text-[#a855f7] mx-auto mb-2" />
                    <p className="text-sm text-[#a0a6b8] mb-4">🔒 Masukkan password GM</p>
                  </div>
                )}
                <input type="password" value={gmPassword} onChange={e => setGmPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleGmAuth() }} placeholder="Password GM..." className="nus-input h-11 px-4 text-sm w-full max-w-xs text-center" autoFocus />
                <button type="button" onClick={handleGmAuth} className="nus-btn-primary h-11 px-8 rounded-md text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer">
                  <Lock className="h-4 w-4" /> Buka Akses
                </button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white text-[11px] font-bold">GM</span><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Panel Game Master</DialogTitle></div>
                  <button type="button" onClick={handleGmClose} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup"><X className="h-5 w-5" /></button>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto nus-scroll">
                <div className="relative h-56 sm:h-64 overflow-hidden bg-gradient-to-b from-[#3a1f4a] to-[#1a1207] border-b border-[#a855f7]/30">
                  <img src="/gm-character.png" alt="Game Master" className="w-full h-full object-cover object-top" draggable={false} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 rounded-lg bg-[#0f1320]/85 border border-[#a855f7]/50 px-3 py-2 backdrop-blur-sm">
                    <p className="nus-title text-base font-bold text-[#a855f7]">✨ Selamat Datang, Game Master!</p>
                    <p className="nus-serif text-xs text-[#f0f0f0] mt-0.5">Pilih resource di bawah untuk diberikan ke karakter target.</p>
                  </div>
                </div>
                <div className="p-4 border-b border-[#3a4259] bg-[#1f2533]/60">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-[#c5a059]">Nama Karakter Target</Label>
                      <Input type="text" value={gmTargetName} onChange={e => setGmTargetName(e.target.value)} placeholder={character.name} className="nus-input mt-1 h-9 text-sm" />
                      <p className="text-[9px] text-[#6b7280] mt-1">Kosongkan untuk gunakan karakter saat ini.</p>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-[#c5a059]">Jumlah</Label>
                      <Input type="number" value={gmAmount} onChange={e => setGmAmount(e.target.value)} min="1" className="nus-input mt-1 h-9 text-sm" />
                      <p className="text-[9px] text-[#6b7280] mt-1">Jumlah resource yang akan ditambahkan.</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><Gift className="h-3.5 w-3.5" /> Berikan Resource</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {([
                      { key: 'gold', label: 'Gold', icon: <Coins className="h-5 w-5 text-[#f0a500]" />, color: '#f0a500' },
                      { key: 'exp', label: 'EXP', icon: <Star className="h-5 w-5 text-[#c5a059]" />, color: '#c5a059' },
                      { key: 'kayu', label: 'Kayu', icon: <img src="/materials/kayu.png" alt="" className="h-5 w-5 object-contain" />, color: '#22c55e' },
                      { key: 'besi', label: 'Besi', icon: <img src="/materials/besi.png" alt="" className="h-5 w-5 object-contain" />, color: '#9ca3af' },
                      { key: 'kulit', label: 'Kulit', icon: <img src="/materials/kulit.png" alt="" className="h-5 w-5 object-contain" />, color: '#d4a04a' },
                      { key: 'emas', label: 'Emas', icon: <img src="/materials/emas.png" alt="" className="h-5 w-5 object-contain" />, color: '#f0a500' },
                      { key: 'batuMeteor', label: 'Batu Meteor', icon: <img src="/materials/batu-meteor.png" alt="" className="h-5 w-5 object-contain" />, color: '#a855f7' },
                      { key: 'permata', label: 'Permata', icon: <img src="/materials/permata.png" alt="" className="h-5 w-5 object-contain" />, color: '#ec4899' },
                      { key: 'stamina', label: 'Set Stamina', icon: <Flame className="h-5 w-5 text-[#22c55e]" />, color: '#22c55e' },
                    ] as const).map(act => (
                      <button key={act.key} type="button" onClick={() => handleGmGrant(act.key as any)} className="flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-3 transition-all hover:scale-105 cursor-pointer" style={{ borderColor: `${act.color}60`, backgroundColor: `${act.color}10` }}>
                        {act.icon}
                        <span className="text-[11px] font-bold" style={{ color: act.color }}>{act.key === 'stamina' ? `= ${gmAmount || '0'}%` : `+${gmAmount || '0'}`}</span>
                        <span className="text-[10px] text-[#a0a6b8]">{act.label}</span>
                        <span className="text-[9px] text-[#6b7280] mt-0.5 inline-flex items-center gap-1 bg-[#f0a500] text-[#1a1207] px-2 py-0.5 rounded font-bold">Send <Send className="h-2.5 w-2.5" /></span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] text-[#6b7280] text-center">💡 Resource langsung diberikan jika nama karakter sesuai dengan sesi saat ini. EXP otomatis menghitung level (maks 99).</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Tame Success Popup ===== */}
      <Dialog open={tameSuccessPopup !== null} onOpenChange={v => { if (!v) setTameSuccessPopup(null) }}>
        <DialogContent className="bg-[#1a1f2e] border-[#a855f7]/50 text-[#f0f0f0] max-w-md w-[95vw] p-0 overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.4)]">
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 h-32 w-32 rounded-full overflow-hidden border-4 border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.6)]">
              <img src="/fish/telur-pet.png" alt="Telur" className="w-full h-full object-cover" draggable={false} />
            </div>
            <h2 className="nus-title text-2xl font-bold text-[#a855f7] mb-2">🎉 Selamat!</h2>
            <p className="nus-serif text-sm text-[#f0f0f0] mb-1">Kamu berhasil menjinakkan</p>
            <p className="nus-title text-lg font-bold text-[#f0a500] mb-3">{tameSuccessPopup?.monsterName}</p>
            <p className="text-xs text-[#a0a6b8] mb-4">{tameSuccessPopup?.eggName} (Level 1) telah masuk ke tas. Tetaskan di Inkubasi (Rumah) nanti!</p>
            <button type="button" onClick={() => setTameSuccessPopup(null)} className="nus-btn-primary h-10 px-6 rounded-md text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer">
              <CheckCircle2 className="h-4 w-4" /> Lanjutkan Petualangan
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Kolam Ikan (Fish Pond) Sub-items Dialog ===== */}
      <Dialog open={kolamSubOpen} onOpenChange={setKolamSubOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-5xl w-[97vw] p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Fish className="h-5 w-5 text-[#06b6d4]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Kolam Ikan — Pemeliharaan &amp; Panen</DialogTitle></div>
              <button type="button" onClick={() => setKolamSubOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup kolam ikan"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Drag ikan dari tas ke slot kolam. Setelah 12 jam, panen untuk dapatkan 2-3x lipat!</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto nus-scroll">
            {/* Tier upgrade cards (5 tiers) */}
            <div className="p-4 border-b border-[#3a4259]">
              <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Upgrade Kolam Ikan — 5 Tahap Bertingkat (tanah → mewah)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {KOLAM_SUB_ITEMS.map((sub, i) => {
                  const progress = kolamSubItems[i]
                  const isComplete = progress >= 100
                  const isLocked = i > 0 && kolamSubItems[i - 1] < 100
                  const isActive = !isLocked && !isComplete
                  const canUpgrade = isActive && gold >= 5000 && materials.kayu >= 250 && materials.kulit >= 250
                  return (
                    <div key={sub.key} className={`rounded-xl border-2 overflow-hidden flex flex-col transition-all ${isLocked ? 'opacity-40 border-[#3a4259]' : isComplete ? 'border-[#22c55e]' : 'border-[#06b6d4]'}`} style={{ backgroundColor: '#0f1320' }}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#1f2533]">
                        <img src={sub.icon} alt={sub.name} className={`w-full h-full object-cover transition-all ${isLocked ? 'grayscale brightness-50' : isComplete ? 'brightness-110' : ''}`} draggable={false} />
                        {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="text-center"><Lock className="h-8 w-8 text-[#6b7280] mx-auto mb-1" /><span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-bold">Terkunci</span></div></div>}
                        {isComplete && <div className="absolute top-1 right-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border border-[#22c55e] text-[#22c55e] bg-[#0f1320]/85 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 100%</div>}
                        <div className="absolute top-1 left-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-[#f0f0f0] bg-[#0f1320]/85 border border-[#c5a059]/40">Tahap {i + 1} · {sub.slots} slot · {sub.multiplier}x</div>
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                        <div>
                          <p className="nus-title text-sm font-bold text-[#f0f0f0] truncate">{sub.name}</p>
                          <p className="text-[10px] text-[#a0a6b8] leading-tight">{sub.desc}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[9px] mb-0.5"><span className="text-[#a0a6b8]">Progress</span><span className={`font-bold ${isComplete ? 'text-[#22c55e]' : isActive ? 'text-[#06b6d4]' : 'text-[#6b7280]'}`}>{progress}%</span></div>
                          <div className="h-2 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: isComplete ? 'linear-gradient(90deg, #06b6d4, #22c55e)' : 'linear-gradient(90deg, #0891b2, #06b6d4, #67e8f9)' }} /></div>
                        </div>
                        {isActive && (
                          <>
                            <div className="text-[9px] text-[#6b7280] flex flex-wrap gap-1.5 mt-1">
                              <span className={`inline-flex items-center gap-0.5 ${gold >= 5000 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><Coins className="h-3 w-3" /> 5.000</span>
                              <span className={`inline-flex items-center gap-0.5 ${materials.kayu >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kayu.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                              <span className={`inline-flex items-center gap-0.5 ${materials.kulit >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kulit.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                            </div>
                            <button type="button" onClick={() => handleUpgradeKolamSub(i)} disabled={!canUpgrade} className={`mt-auto w-full h-8 rounded-md text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all ${canUpgrade ? 'nus-btn-primary cursor-pointer hover:scale-[1.02]' : 'bg-[#3a4259] text-[#6b7280] cursor-not-allowed'}`}>
                              <Fish className="h-3 w-3" /> Upgrade +10%
                            </button>
                          </>
                        )}
                        {isComplete && <div className="mt-auto text-center text-[11px] font-bold text-[#22c55e] py-1.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {sub.slots} Slot · {sub.multiplier}x Aktif</div>}
                        {isLocked && <div className="mt-auto text-center text-[10px] text-[#6b7280] py-1.5 italic">Selesaikan tahap {i} dulu</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Fish breeding slots grid (max 22 slots across all tiers) */}
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><Fish className="h-3.5 w-3.5" /> Slot Kolam — Drag Ikan ke Slot</p>
              {getKolamSlots() === 0 ? (
                <div className="text-center py-6">
                  <Fish className="h-10 w-10 text-[#3a4259] mx-auto mb-2" />
                  <p className="text-sm text-[#6b7280]">Belum ada slot ikan. Upgrade tahap pertama untuk membuka 3 slot (panen 2x).</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-4">
                  {Array.from({ length: 22 }).map((_, slotIdx) => {
                    const isUnlocked = slotIdx < getKolamSlots()
                    const planted = kolamPlanted[slotIdx]
                    const timeRemaining = planted ? getKolamSlotTimeRemaining(slotIdx) : null
                    const isReady = planted && !timeRemaining
                    const multiplier = getKolamSlotMultiplier(slotIdx)
                    return (
                      <div key={slotIdx} className={`relative aspect-square rounded-lg border-2 overflow-hidden flex flex-col items-center justify-center transition-all ${!isUnlocked ? 'border-[#3a4259] bg-[#0f1320] opacity-30' : planted ? isReady ? 'border-[#22c55e] bg-[#22c55e]/10 animate-pulse' : 'border-[#f0a500] bg-[#f0a500]/5' : 'border-dashed border-[#06b6d4]/50 bg-[#0f1320] hover:border-[#06b6d4] hover:bg-[#06b6d4]/5'}`} onDragOver={e => { if (isUnlocked && !planted) e.preventDefault() }} onDrop={e => { e.preventDefault(); const fishIdx = parseInt(e.dataTransfer.getData('text/plain')); if (!isNaN(fishIdx)) handleKolamPlant(slotIdx, fishIdx) }}>
                        {/* Multiplier badge (top-left corner) */}
                        {isUnlocked && <div className="absolute top-0 left-0 text-[8px] font-bold text-[#06b6d4] bg-[#0f1320]/85 border border-[#06b6d4]/40 rounded-br px-1 py-0.5 leading-none z-10">{multiplier}x</div>}
                        {!isUnlocked && <Lock className="h-4 w-4 text-[#3a4259]" />}
                        {isUnlocked && !planted && <div className="text-center"><Fish className="h-5 w-5 text-[#06b6d4]/40 mx-auto" /><span className="text-[8px] text-[#6b7280]">Drop ikan</span></div>}
                        {planted && (
                          <>
                            {planted.fishImage ? <img src={planted.fishImage} alt={planted.fishName} className="w-full h-full object-cover absolute inset-0" /> : <span className="text-2xl">{planted.fishIcon}</span>}
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                              {isReady ? (
                                <button type="button" onClick={() => handleKolamHarvest(slotIdx)} className="bg-[#22c55e] text-white text-[9px] font-bold rounded-md px-2 py-1 hover:scale-110 transition-transform cursor-pointer flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Panen {multiplier}x</button>
                              ) : (
                                <div className="text-center"><p className="text-[8px] text-white font-bold">{planted.fishName}</p>{timeRemaining && <p className="text-[8px] text-[#f0a500]">{timeRemaining.hours}j {timeRemaining.minutes}m</p>}<div className="w-8 h-1 rounded-full bg-[#1f2533] mt-0.5 overflow-hidden"><div className="h-full rounded-full bg-[#f0a500]" style={{ width: `${timeRemaining?.pct || 0}%` }} /></div></div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Fish inventory (draggable items) */}
              {getKolamSlots() > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-2 flex items-center gap-1.5"><Backpack className="h-3.5 w-3.5" /> Ikan di Tas — Drag ke Slot Kolam</p>
                  {inventoryItems.filter(it => it.isFish).length === 0 ? (
                    <p className="text-[11px] text-[#6b7280] italic text-center py-3">Belum ada ikan di tas. Reuni ikan dengan menjinakkan monster air, atau dapatkan dari pedagang.</p>
                  ) : (
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5">
                      {inventoryItems.map((item, i) => {
                        if (!item.isFish) return null
                        return (
                          <div key={i} draggable={true} onDragStart={e => e.dataTransfer.setData('text/plain', String(i))} className="relative aspect-square rounded border-2 border-[#06b6d4]/40 bg-[#0f1320] overflow-hidden cursor-grab hover:scale-110 transition-transform" title={`${item.name} ×${item.qty} — Drag ke slot kolam`}>
                            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" draggable={false} /> : <span className="text-xl flex items-center justify-center h-full">{item.icon}</span>}
                            {item.qty > 1 && <span className="absolute top-0 right-0 text-[8px] font-bold text-white bg-black/80 rounded-bl px-0.5 leading-tight">×{item.qty}</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <p className="mt-2 text-[10px] text-[#6b7280] text-center">💡 Setiap ikan yang dipelihara akan berkembang biak sesuai multiplier slot (2x atau 3x) setelah 12 jam. Contoh: 1 Ikan Koi di slot 2x → 2 Ikan Koi.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Inkubasi (Pet) Sub-items Dialog ===== */}
      <Dialog open={inkubasiSubOpen} onOpenChange={setInkubasiSubOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#a855f7]/50 text-[#f0f0f0] max-w-5xl w-[97vw] p-0 overflow-hidden max-h-[92vh] flex flex-col shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#a855f7]/30 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#a855f7]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Inkubasi — Tempat Pet</DialogTitle></div>
              <button type="button" onClick={() => setInkubasiSubOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup inkubasi"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Tetaskan telur menjadi pet. Equip pet untuk auto-battle (pet mendapat EXP yang sama dengan pemain).</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto nus-scroll">
            {/* Incubation room image */}
            <div className="relative h-40 overflow-hidden border-b border-[#a855f7]/20">
              <img src="/facilities/inkubasi-room.png" alt="Ruang Inkubasi" className="w-full h-full object-cover" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-[#1a1f2e]/40 to-transparent" />
              <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#a855f7] font-semibold"><span className="inline-block h-2 w-2 rounded-full bg-[#a855f7] animate-pulse" /> Ruang Inkubasi Aktif</div>
                <div className="text-[10px] text-[#a0a6b8]">{petSlots.filter(p => p !== null).length}/3 slot terisi{equippedPet ? ` · ${equippedPet.name} equipped` : ' · Tidak ada pet equipped'}</div>
              </div>
            </div>

            {/* Pet slots (3) */}
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Slot Pet — Maksimal 3 Pet, Equip 1 untuk Auto-Battle</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {petSlots.map((pet, idx) => {
                  const isEquipped = equippedPetIndex === idx
                  const typeColor = pet ? PET_TYPE_COLORS[pet.monsterType] : '#a855f7'
                  const typeLabel = pet ? PET_TYPE_LABELS[pet.monsterType] : ''
                  // EXP progress
                  const expBase = pet ? cumulativeExpForLevel(pet.level) : 0
                  const expNext = pet ? cumulativeExpForLevel(pet.level + 1) : 1
                  const expInto = pet ? pet.exp - expBase : 0
                  const expNeeded = pet ? expNext - expBase : 1
                  const expPct = pet ? Math.min(100, (expInto / Math.max(1, expNeeded)) * 100) : 0
                  return (
                    <div key={idx} className={`rounded-xl border-2 overflow-hidden flex flex-col transition-all ${pet ? (isEquipped ? 'border-[#a855f7] shadow-[0_0_18px_rgba(168,85,247,0.5)]' : 'border-[#3a4259]') : 'border-dashed border-[#3a4259]'}`} style={{ backgroundColor: '#0f1320' }}>
                      {/* Slot header */}
                      <div className="px-3 py-1.5 border-b border-[#3a4259] flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-bold">Slot {idx + 1}</span>
                        {isEquipped && <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/50 flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5" /> Equipped</span>}
                      </div>
                      {/* Pet content or empty */}
                      {!pet ? (
                        <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
                          <div className="h-12 w-12 rounded-full border-2 border-dashed border-[#3a4259] flex items-center justify-center mb-2"><Sparkles className="h-5 w-5 text-[#3a4259]" /></div>
                          <p className="text-[11px] text-[#6b7280] italic">Slot kosong</p>
                          <p className="text-[10px] text-[#6b7280] mt-1">Tetaskan telur untuk mengisi</p>
                        </div>
                      ) : (
                        <div className="p-3 flex flex-col gap-2">
                          {/* Pet image + name + type */}
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-14 w-14 rounded-lg overflow-hidden border-2 flex-shrink-0" style={{ borderColor: typeColor, boxShadow: `0 0 10px ${typeColor}50` }}>
                              {pet.image ? <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" draggable={false} /> : <span className="w-full h-full flex items-center justify-center text-2xl">🐾</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="nus-title text-sm font-bold text-[#f0f0f0] truncate">{pet.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="rounded px-1.5 py-0.5 text-[9px] font-bold border" style={{ color: typeColor, borderColor: `${typeColor}80`, backgroundColor: `${typeColor}15` }}>{typeLabel}</span>
                                <span className="text-[10px] font-bold text-[#c5a059]">Lv.{pet.level}</span>
                              </div>
                            </div>
                          </div>
                          {/* HP bar */}
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-0.5"><span className="text-[#ef4444] font-semibold">HP</span><span className="text-[#f0f0f0]">{pet.hp} / {pet.hpMax}</span></div>
                            <div className="h-1.5 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, (pet.hp / pet.hpMax) * 100)}%`, background: 'linear-gradient(90deg, #16a34a, #22c55e)' }} /></div>
                          </div>
                          {/* EXP bar */}
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-0.5"><span className="text-[#f0a500] font-semibold">EXP</span><span className="text-[#a0a6b8]">{expInto} / {expNeeded}</span></div>
                            <div className="h-1.5 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${expPct}%`, background: 'linear-gradient(90deg, #c5a059, #f0a500)' }} /></div>
                          </div>
                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-1 text-[10px]">
                            <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-0.5"><span className="text-[#a0a6b8]">ATK</span><span className="font-bold text-[#f0a500]">{pet.attack}</span></div>
                            <div className="flex items-center justify-between rounded bg-[#1f2533] px-2 py-0.5"><span className="text-[#a0a6b8]">DEF</span><span className="font-bold text-[#3b82f6]">{pet.defense}</span></div>
                          </div>
                          {/* Actions */}
                          <div className="grid grid-cols-2 gap-1.5 mt-1">
                            <button type="button" onClick={() => handleEquipPet(idx)} className={`h-7 rounded-md text-[10px] font-bold inline-flex items-center justify-center gap-1 transition-all cursor-pointer ${isEquipped ? 'bg-[#a855f7] text-white border border-[#a855f7]' : 'border border-[#a855f7]/50 text-[#a855f7] bg-[#a855f7]/10 hover:bg-[#a855f7]/20'}`}>
                              <CheckCircle2 className="h-3 w-3" /> {isEquipped ? 'Lepas Equip' : 'Equip'}
                            </button>
                            <button type="button" onClick={() => handleReleasePet(idx)} className="h-7 rounded-md text-[10px] font-bold inline-flex items-center justify-center gap-1 border border-[#ef4444]/40 text-[#ef4444] bg-[#ef4444]/10 hover:bg-[#ef4444]/20 transition-all cursor-pointer">
                              <Trash2 className="h-3 w-3" /> Lepaskan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Egg inventory */}
            <div className="p-4 border-t border-[#a855f7]/20">
              <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><span className="text-base">🥚</span> Telur di Tas — Klik untuk Menetaskan</p>
              {inventoryItems.filter(it => it.isEgg).length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2 opacity-50">🥚</div>
                  <p className="text-sm text-[#6b7280] italic">Belum ada telur. Jinakkan monster untuk mendapatkan telur.</p>
                  <p className="text-[10px] text-[#6b7280] mt-1">💡 Gunakan ikan untuk menjinakkan monster (HP musuh &lt; 25%) → dapat telur → tetaskan di sini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {inventoryItems.map((item, i) => {
                    if (!item.isEgg) return null
                    return (
                      <div key={i} className="rounded-lg border-2 border-[#a855f7]/40 bg-[#0f1320] p-2 flex flex-col items-center gap-1">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-[#a855f7]/40">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" draggable={false} /> : <span className="w-full h-full flex items-center justify-center text-2xl">🥚</span>}
                        </div>
                        <p className="text-[10px] font-bold text-[#f0f0f0] text-center truncate w-full">{item.eggMonsterName || item.name}</p>
                        {item.qty > 1 && <p className="text-[9px] text-[#a0a6b8]">×{item.qty}</p>}
                        <button type="button" onClick={() => handleHatchEgg(i)} className="w-full h-7 rounded-md text-[10px] font-bold inline-flex items-center justify-center gap-1 bg-[#a855f7] text-white hover:bg-[#7c3aed] transition-all cursor-pointer">
                          <Sparkles className="h-3 w-3" /> Tetaskan
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="px-4 pb-4">
              <div className="rounded-lg border border-[#a855f7]/30 bg-[#a855f7]/5 p-3">
                <p className="text-[11px] text-[#a0a6b8] leading-relaxed">
                  <span className="text-[#a855f7] font-bold">💡 Tentang Pet:</span> Pet menyerang otomatis setelah monster menyerangmu. Pet mendapat EXP yang sama dengan pemain saat monster kalah. Setelah battle, HP pet kembali penuh. Warna telur: <span className="text-[#22c55e]">hijau</span> = kecil, <span className="text-[#f0a500]">kuning</span> = sedang, <span className="text-[#a855f7]">ungu</span> = tengkorak, <span className="text-[#ef4444]">merah</span> = raksasa.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Pet Hatch Popup ===== */}
      <Dialog open={petHatchPopup !== null} onOpenChange={v => { if (!v) setPetHatchPopup(null) }}>
        <DialogContent className="bg-[#1a1f2e] border-[#a855f7]/50 text-[#f0f0f0] max-w-md w-[95vw] p-0 overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.4)]">
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 h-32 w-32 rounded-full overflow-hidden border-4 border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse">
              <img src="/fish/telur-pet.png" alt="Telur menetas" className="w-full h-full object-cover" draggable={false} />
            </div>
            <h2 className="nus-title text-2xl font-bold text-[#a855f7] mb-2">🎉 Telur Menetas!</h2>
            <p className="nus-serif text-sm text-[#f0f0f0] mb-1">Selamat! Telur telah menetas menjadi:</p>
            <p className="nus-title text-lg font-bold text-[#f0a500] mb-1">{petHatchPopup?.petName}</p>
            <p className="text-xs text-[#a0a6b8] mb-4">Jenis: {petHatchPopup?.petType} · Level 1 · Pet telah masuk ke slot Inkubasi.</p>
            <p className="text-[10px] text-[#6b7280] mb-4">Equip pet dari Inkubasi (Rumah) untuk auto-battle. Pet mendapat EXP yang sama dengan pemain!</p>
            <button type="button" onClick={() => setPetHatchPopup(null)} className="nus-btn-primary h-10 px-6 rounded-md text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer">
              <CheckCircle2 className="h-4 w-4" /> Lanjutkan
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Kotak Penyimpanan (Storage Box) Sub-items Dialog ===== */}
      <Dialog open={kotakSubOpen} onOpenChange={setKotakSubOpen}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-5xl w-[97vw] p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-[#3a4259] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Backpack className="h-5 w-5 text-[#d4a04a]" /><DialogTitle className="nus-title text-2xl text-[#f0f0f0]">Kotak Penyimpanan</DialogTitle></div>
              <button type="button" onClick={() => setKotakSubOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#a0a6b8] hover:text-[#f0f0f0] hover:bg-[#3a4259] transition-colors" aria-label="Tutup kotak"><X className="h-5 w-5" /></button>
            </div>
            <DialogDescription className="text-[#a0a6b8] text-sm">Simpan item & emas dengan aman. Upgrade kotak untuk menambah kapasitas penyimpanan (bambu +15 → kayu +20 → metal +25 → peti-besar +30).</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto nus-scroll p-4">
            {/* Gold vault section */}
            <div className="mb-4 rounded-lg border border-[#f0a500]/40 bg-[#f0a500]/5 px-4 py-3">
              <div className="flex items-center gap-2 mb-2"><Coins className="h-4 w-4 text-[#f0a500]" /><span className="text-[11px] uppercase tracking-wider text-[#f0a500] font-bold">Brankas Emas</span></div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-4 text-sm">
                  <div><span className="text-[10px] text-[#a0a6b8]">Di Tas:</span> <span className="font-bold text-[#f0a500]">{gold.toLocaleString()}</span></div>
                  <div><span className="text-[10px] text-[#a0a6b8]">Di Kotak:</span> <span className="font-bold text-[#d4a04a]">{kotakGold.toLocaleString()}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={kotakGoldInput} onChange={e => setKotakGoldInput(e.target.value)} placeholder="Jumlah emas..." className="nus-input h-9 w-32 px-3 text-sm" min="0" />
                  <button type="button" onClick={handleStoreGold} className="h-9 px-3 rounded-md text-xs font-bold bg-[#d4a04a]/20 border border-[#d4a04a] text-[#d4a04a] hover:bg-[#d4a04a]/30 transition-colors cursor-pointer">Simpan</button>
                  <button type="button" onClick={handleWithdrawGold} className="h-9 px-3 rounded-md text-xs font-bold bg-[#f0a500]/20 border border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500]/30 transition-colors cursor-pointer">Ambil</button>
                </div>
              </div>
            </div>

            {/* Tier upgrade cards */}
            <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Upgrade Kotak — 4 Tahap Bertingkat</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {KOTAK_SUB_ITEMS.map((sub, i) => {
                const progress = kotakSubItems[i]
                const isComplete = progress >= 100
                const isLocked = i > 0 && kotakSubItems[i - 1] < 100
                const isActive = !isLocked && !isComplete
                const canUpgrade = isActive && gold >= 5000 && materials.kayu >= 250 && materials.kulit >= 250
                return (
                  <div key={sub.key} className={`rounded-xl border-2 overflow-hidden flex flex-col transition-all ${isLocked ? 'opacity-40 border-[#3a4259]' : isComplete ? 'border-[#22c55e]' : 'border-[#d4a04a]'}`} style={{ backgroundColor: '#0f1320' }}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#1f2533]">
                      <img src={sub.icon} alt={sub.name} className={`w-full h-full object-cover transition-all ${isLocked ? 'grayscale brightness-50' : isComplete ? 'brightness-110' : ''}`} draggable={false} />
                      {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="text-center"><Lock className="h-8 w-8 text-[#6b7280] mx-auto mb-1" /><span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-bold">Terkunci</span></div></div>}
                      {isComplete && <div className="absolute top-1 right-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border border-[#22c55e] text-[#22c55e] bg-[#0f1320]/85 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 100%</div>}
                      <div className="absolute top-1 left-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-[#f0f0f0] bg-[#0f1320]/85 border border-[#d4a04a]/40">Tahap {i + 1} · +{sub.slots} slot</div>
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                      <div>
                        <p className="nus-title text-sm font-bold text-[#f0f0f0] truncate">{sub.name}</p>
                        <p className="text-[10px] text-[#a0a6b8] leading-tight">{sub.desc}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[9px] mb-0.5"><span className="text-[#a0a6b8]">Progress</span><span className={`font-bold ${isComplete ? 'text-[#22c55e]' : isActive ? 'text-[#d4a04a]' : 'text-[#6b7280]'}`}>{progress}%</span></div>
                        <div className="h-2 rounded-full bg-[#1f2533] overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: isComplete ? 'linear-gradient(90deg, #d4a04a, #22c55e)' : 'linear-gradient(90deg, #92400e, #d4a04a, #fbbf24)' }} /></div>
                      </div>
                      {isActive && (
                        <>
                          <div className="text-[9px] text-[#6b7280] flex flex-wrap gap-1.5 mt-1">
                            <span className={`inline-flex items-center gap-0.5 ${gold >= 5000 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><Coins className="h-3 w-3" /> 5.000</span>
                            <span className={`inline-flex items-center gap-0.5 ${materials.kayu >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kayu.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                            <span className={`inline-flex items-center gap-0.5 ${materials.kulit >= 250 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}><img src="/materials/kulit.png" alt="" className="h-3 w-3 object-contain" /> 250</span>
                          </div>
                          <button type="button" onClick={() => handleUpgradeKotakSub(i)} disabled={!canUpgrade} className={`mt-auto w-full h-8 rounded-md text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all ${canUpgrade ? 'nus-btn-primary cursor-pointer hover:scale-[1.02]' : 'bg-[#3a4259] text-[#6b7280] cursor-not-allowed'}`}>
                            <Backpack className="h-3 w-3" /> Upgrade +10%
                          </button>
                        </>
                      )}
                      {isComplete && <div className="mt-auto text-center text-[11px] font-bold text-[#22c55e] py-1.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> +{sub.slots} Slot Aktif</div>}
                      {isLocked && <div className="mt-auto text-center text-[10px] text-[#6b7280] py-1.5 italic">Selesaikan tahap {i} dulu</div>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Separate storage grid at the bottom */}
            {getKotakBonusSlots() > 0 ? (
              <div className="rounded-lg border border-[#d4a04a]/30 bg-[#0f1320]/60 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-[#d4a04a] font-bold flex items-center gap-1.5"><Backpack className="h-3.5 w-3.5" /> Penyimpanan Kotak — {kotakStorage.length}/{getKotakBonusSlots()} slot</p>
                </div>
                {/* Storage slots */}
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 mb-3">
                  {Array.from({ length: getKotakBonusSlots() }).map((_, i) => {
                    const item = kotakStorage[i]
                    const rarityColor = item?.rarity ? RARITY_COLORS[item.rarity] : '#d4a04a'
                    return (
                      <button key={i} type="button" onClick={() => item && handleRetrieveItem(i)} disabled={!item} className={`relative aspect-square rounded border overflow-hidden flex items-center justify-center text-base transition-all ${item ? 'hover:scale-110 cursor-pointer' : 'border-[#3a4259] bg-[#0f1320] cursor-default'}`} style={item?.image ? { borderColor: rarityColor, borderWidth: '2px', backgroundColor: '#0f1320' } : undefined} title={item ? `${item.name} ×${item.qty} — klik untuk ambil` : 'Slot kosong'}>
                        {item ? item.image ? <><img src={item.image} alt={item.name} className="w-full h-full object-cover" draggable={false} />{item.qty > 1 && <span className="absolute top-0 right-0 text-[8px] font-bold text-white bg-black/80 rounded-bl px-0.5 leading-tight">×{item.qty}</span>}</> : <span className="leading-none">{item.icon}</span> : <CircleDot className="h-2.5 w-2.5 text-[#3a4259]" />}
                      </button>
                    )
                  })}
                </div>
                {/* Player inventory — klik item untuk simpan ke kotak */}
                <p className="text-[10px] uppercase tracking-wider text-[#c5a059] mb-2 flex items-center gap-1.5"><Backpack className="h-3 w-3" /> Tas Pemain — klik item untuk simpan ke kotak ({inventoryItems.length}/{INVENTORY_CAPACITY})</p>
                {inventoryItems.length === 0 ? (
                  <p className="text-[11px] text-[#6b7280] italic text-center py-2">Tas kosong.</p>
                ) : (
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                    {inventoryItems.map((item, i) => {
                      const rarityColor = item.rarity ? RARITY_COLORS[item.rarity] : '#c5a059'
                      return (
                        <button key={i} type="button" onClick={() => handleStoreItem(i)} className="relative aspect-square rounded border-2 overflow-hidden flex items-center justify-center text-base transition-all hover:scale-110 cursor-pointer" style={{ borderColor: rarityColor, backgroundColor: '#0f1320' }} title={`${item.name} ×${item.qty} — klik untuk simpan ke kotak`}>
                          {item.image ? <><img src={item.image} alt={item.name} className="w-full h-full object-cover" draggable={false} />{item.qty > 1 && <span className="absolute top-0 right-0 text-[8px] font-bold text-white bg-black/80 rounded-bl px-0.5 leading-tight">×{item.qty}</span>}</> : <span className="leading-none">{item.icon}</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
                <p className="mt-2 text-[10px] text-[#6b7280] text-center">💡 Klik item di tas untuk simpan ke kotak. Klik item di kotak untuk ambil ke tas.</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <Backpack className="h-10 w-10 text-[#3a4259] mx-auto mb-2" />
                <p className="text-sm text-[#6b7280]">Selesaikan tahap 1 (Kotak Bambu) untuk membuka penyimpanan item.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Welcome Gift Dialog ===== */}
      <Dialog open={welcomeDialogOpen} onOpenChange={v => { if (!v) handleWelcomeClose() }}>
        <DialogContent className="bg-[#1a1f2e] border-[#3a4259] text-[#f0f0f0] max-w-lg w-[95vw] p-0 overflow-hidden">
          <div className="relative h-40 overflow-hidden"><img src="/kakek-pemberi.png" alt="Kakek Pemberi Modal" className="w-full h-full object-cover" draggable={false} /><div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent" /></div>
          <div className="p-5 pt-3">
            <DialogHeader><div className="flex items-center gap-2 mb-1"><Gift className="h-5 w-5 text-[#f0a500] animate-pulse" /><DialogTitle className="nus-title text-xl text-[#f0f0f0]">Hadiah dari Kakek</DialogTitle></div></DialogHeader>
            <div className="mt-3 space-y-3">
              <p className="text-sm leading-relaxed text-[#d1d5db]"><span className="nus-serif text-[#c5a059] font-semibold">"Selamat datang, petualang!</span> Kakek akan memberikan modal awal kepadamu. Gunakan baik-baik — belilah senjata dulu sebelum berpetualang."</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-[#f0a500]/40 bg-[#f0a500]/10 p-3 text-center"><div className="flex items-center justify-center gap-1.5 mb-1"><Gift className="h-5 w-5 text-[#f0a500]" /><span className="text-2xl font-bold text-[#f0a500] nus-serif">5</span></div><p className="text-[10px] uppercase tracking-wider text-[#c5a059]">Poin Atribut</p><p className="text-[10px] text-[#a0a6b8] mt-0.5">Distribusikan di Peralatan Karakter</p></div>
                <div className="rounded-lg border border-[#f0a500]/40 bg-[#f0a500]/10 p-3 text-center"><div className="flex items-center justify-center gap-1.5 mb-1"><Coins className="h-5 w-5 text-[#f0a500]" /><span className="text-2xl font-bold text-[#f0a500] nus-serif">100</span></div><p className="text-[10px] uppercase tracking-wider text-[#c5a059]">Keping Emas</p><p className="text-[10px] text-[#a0a6b8] mt-0.5">Beli senjata di Pedagang</p></div>
              </div>
              <div className="rounded-lg border border-[#3a4259] bg-[#0f1320] p-3"><p className="text-[11px] text-[#a0a6b8] leading-relaxed">💡 <span className="text-[#c5a059] font-semibold">Tips:</span> Buka <span className="text-[#f0a500]">Peralatan Karakter</span> (ikon baju) untuk distribusikan 5 poin atribut. Lalu buka <span className="text-[#f0a500]">Pedagang</span> (ikon toko) untuk beli senjata dengan 100 emas.</p></div>
              <button type="button" onClick={handleWelcomeClose} className="nus-btn-primary w-full h-10 rounded-md text-sm font-bold inline-flex items-center justify-center gap-2"><Gift className="h-4 w-4" /> Terima Hadiah & Mulai Petualangan</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
