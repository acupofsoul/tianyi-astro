/**
 * 每个展项的量化指标（工作流 A 实现，替换 Phase 0 占位）。
 * 数据来源：NASA Planetary Fact Sheet、IAU 名义值、EHT / Gaia / Hubble 公开结果等
 * 公认天文常数（太阳质量 1.989×10³⁰ kg、地球平均直径 12,742 km、1 AU = 1.496×10⁸ km、
 * 1 光年 = 9.4607×10¹² km、太阳史瓦西半径 ≈ 2.953 km/太阳质量）。
 * 除明确标注的精确值外均为近似值，用 ≈ / ~ 标注；温度统一用开尔文（K），
 * 摄氏值写在 note 里。消费方必须处理 getMetrics() 返回 undefined 的情况。
 */
import type { ScaleItem, GaugeSpec, CompareRow } from '../viz/types'

export interface EntryMetrics {
  /** 参照天体名，例如 "地球" / "太阳" */
  refName: string
  scales: ScaleItem[]
  gauges: GaugeSpec[]
  compare: CompareRow[]
}

const entries: Record<string, EntryMetrics> = {
  /* ------------------------------------------------------------ 太阳系 */
  'solar-system': {
    refName: '地球',
    scales: [
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度（平均直径）', color: '#5fd6ff' },
      { id: 'sun-diameter', label: '太阳直径', value: 1392700, unit: 'km', note: '≈ 109 个地球直径', color: '#ffc76b' },
      { id: 'earth-orbit', label: '地球轨道半径', value: 1.496e8, unit: 'km', note: '= 1 AU（日地平均距离）', color: '#6ff0b8' },
      { id: 'neptune-orbit', label: '海王星轨道半径', value: 4.5e9, unit: 'km', note: '≈ 30.1 AU', color: '#9a8cff' }
    ],
    gauges: [
      { label: '太阳质量占比', value: 99.86, unit: '%', min: 0, max: 100, digits: 2, note: '其余 0.14% 为行星、卫星与小天体' },
      { label: '行星数量', value: 8, unit: '颗', min: 0, max: 10, digits: 0, note: '另有 5 颗矮行星' },
      { label: '最远行星轨道半径', value: 4.5e9, unit: 'km', log: true, ref: 1.496e8, refLabel: '地球 1 AU', note: '≈ 30.1 AU' },
      { label: '奥尔特云外缘', value: 9.46e12, unit: 'km', log: true, ref: 1.496e8, refLabel: '地球轨道', note: '≈ 1 光年 ≈ 6.3 万 AU' },
      { label: '太阳系年龄', value: 4.6e9, unit: '年', log: true, digits: 1, note: '≈ 46 亿年（陨石定年）' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 1392700, ref: 12742, log: true, better: 'high', note: '太阳 ≈ 109 个地球直径' },
      { label: '质量', unit: 'kg', value: 1.989e30, ref: 5.972e24, log: true, better: 'high', note: '太阳 ≈ 33.3 万倍地球质量' },
      { label: '海王星轨道半径', unit: 'km', value: 4.5e9, ref: 1.496e8, log: true, note: '≈ 30.1 倍地球轨道半径' },
      { label: '奥尔特云外缘', unit: 'km', value: 9.46e12, ref: 1.496e8, log: true, note: '≈ 6.3 万倍地球轨道半径' }
    ]
  },

  /* ---------------------------------------------------------------- 太阳 */
  sun: {
    refName: '地球',
    scales: [
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'sun-diameter', label: '太阳直径', value: 1392700, unit: 'km', note: '≈ 109 个地球直径', color: '#ffc76b' },
      { id: 'earth-orbit', label: '日地距离', value: 1.496e8, unit: 'km', note: '= 1 AU', color: '#6ff0b8' },
      { id: 'light-year', label: '1 光年', value: 9.46e12, unit: 'km', note: '光走一年的距离', color: '#7e93a8' }
    ],
    gauges: [
      { label: '直径', value: 1392700, unit: 'km', log: true, ref: 12742, refLabel: '地球', digits: 0, note: '≈ 109 个地球直径' },
      { label: '质量', value: 1.989e30, unit: 'kg', log: true, ref: 5.972e24, refLabel: '地球', digits: 2, note: '≈ 33.3 万倍地球质量' },
      { label: '表面温度', value: 5778, unit: 'K', ref: 288, refLabel: '地球', digits: 0, note: '≈ 5,505 ℃' },
      { label: '平均密度', value: 1.408, unit: 'g/cm³', ref: 5.514, refLabel: '地球', digits: 3, note: '约为地球的 0.26 倍' },
      { label: '自转周期（赤道）', value: 25.4, unit: '天', ref: 0.997, refLabel: '地球', digits: 1, note: '赤道处约 25.4 天' },
      { label: '年龄', value: 4.6e9, unit: '年', log: true, digits: 1, note: '≈ 46 亿年' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 1392700, ref: 12742, log: true, better: 'high', note: '≈ 109 倍地球直径' },
      { label: '质量', unit: 'kg', value: 1.989e30, ref: 5.972e24, log: true, better: 'high', note: '≈ 33.3 万倍地球质量' },
      { label: '表面重力', unit: 'm/s²', value: 274, ref: 9.807, log: true, better: 'high', note: '≈ 27.9 倍地球表面重力' },
      { label: '逃逸速度', unit: 'km/s', value: 617.7, ref: 11.19, log: true, better: 'high', note: '≈ 55.2 倍地球逃逸速度' },
      { label: '平均温度', unit: 'K', value: 5778, ref: 288, log: true, note: '≈ 20.1 倍（开尔文）' },
      { label: '平均密度', unit: 'g/cm³', value: 1.408, ref: 5.514, log: true, better: 'high', note: '≈ 0.26 倍地球密度' }
    ]
  },

  /* ---------------------------------------------------------------- 水星 */
  mercury: {
    refName: '地球',
    scales: [
      { id: 'moon-diameter', label: '月球直径', value: 3474, unit: 'km', note: '比水星略小', color: '#c9ccd4' },
      { id: 'mercury-diameter', label: '水星直径', value: 4879, unit: 'km', note: '≈ 0.383 个地球直径', color: '#b5a99a' },
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'mercury-orbit', label: '水星轨道半径', value: 5.79e7, unit: 'km', note: '≈ 0.387 AU', color: '#9a8cff' }
    ],
    gauges: [
      { label: '直径', value: 4879, unit: 'km', ref: 12742, refLabel: '地球', digits: 0, note: '≈ 0.383 个地球直径' },
      { label: '质量', value: 3.301e23, unit: 'kg', log: true, ref: 5.972e24, refLabel: '地球', digits: 2, note: '≈ 0.055 倍地球质量' },
      { label: '表面重力', value: 3.7, unit: 'm/s²', ref: 9.807, refLabel: '地球', digits: 2, note: '≈ 0.38 倍' },
      { label: '平均温度', value: 440, unit: 'K', ref: 288, refLabel: '地球', digits: 0, note: '≈ 167 ℃，昼夜 −173~427 ℃' },
      { label: '公转周期', value: 88.0, unit: '天', ref: 365.25, refLabel: '地球', digits: 1, note: '≈ 0.241 个地球年' },
      { label: '自转周期', value: 58.6, unit: '天', ref: 0.997, refLabel: '地球', digits: 1, note: '自转 2 圈 = 公转 3 圈（3:2 共振）' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 4879, ref: 12742, log: true, note: '≈ 0.383 倍地球直径' },
      { label: '质量', unit: 'kg', value: 3.301e23, ref: 5.972e24, log: true, note: '≈ 0.0553 倍地球质量' },
      { label: '表面重力', unit: 'm/s²', value: 3.7, ref: 9.807, log: true, note: '≈ 0.377 倍' },
      { label: '逃逸速度', unit: 'km/s', value: 4.25, ref: 11.19, log: true, note: '≈ 0.380 倍' },
      { label: '公转周期', unit: '天', value: 88.0, ref: 365.25, log: true, note: '≈ 0.241 倍地球公转周期' },
      { label: '轨道半径', unit: 'km', value: 5.79e7, ref: 1.496e8, log: true, note: '≈ 0.387 AU' }
    ]
  },

  /* ---------------------------------------------------------------- 金星 */
  venus: {
    refName: '地球',
    scales: [
      { id: 'mercury-diameter', label: '水星直径', value: 4879, unit: 'km', note: '≈ 0.383 个地球直径', color: '#b5a99a' },
      { id: 'venus-diameter', label: '金星直径', value: 12104, unit: 'km', note: '≈ 0.95 个地球直径', color: '#e8c87e' },
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'venus-orbit', label: '金星轨道半径', value: 1.082e8, unit: 'km', note: '≈ 0.723 AU', color: '#9a8cff' }
    ],
    gauges: [
      { label: '直径', value: 12104, unit: 'km', ref: 12742, refLabel: '地球', digits: 0, note: '≈ 0.95 个地球直径' },
      { label: '质量', value: 4.867e24, unit: 'kg', log: true, ref: 5.972e24, refLabel: '地球', digits: 2, note: '≈ 0.815 倍地球质量' },
      { label: '表面重力', value: 8.87, unit: 'm/s²', ref: 9.807, refLabel: '地球', digits: 2, note: '≈ 0.90 倍' },
      { label: '表面温度', value: 737, unit: 'K', ref: 288, refLabel: '地球', digits: 0, note: '≈ 464 ℃，太阳系最热行星' },
      { label: '大气压', value: 93219, unit: 'hPa', log: true, ref: 1013.25, refLabel: '地球海平面', digits: 0, note: '≈ 92 倍地球海平面气压' },
      { label: '公转周期', value: 224.7, unit: '天', ref: 365.25, refLabel: '地球', digits: 1, note: '自转 243 天，比公转更长' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 12104, ref: 12742, log: true, note: '≈ 0.95 倍地球直径' },
      { label: '质量', unit: 'kg', value: 4.867e24, ref: 5.972e24, log: true, note: '≈ 0.815 倍地球质量' },
      { label: '表面重力', unit: 'm/s²', value: 8.87, ref: 9.807, log: true, note: '≈ 0.904 倍' },
      { label: '表面温度', unit: 'K', value: 737, ref: 288, log: true, note: '≈ 2.56 倍（开尔文），温室效应所致' },
      { label: '大气压', unit: 'hPa', value: 93219, ref: 1013.25, log: true, note: '≈ 92 倍地球海平面气压' },
      { label: '自转周期', unit: '天', value: 243.0, ref: 0.997, log: true, note: '≈ 244 倍，且为逆行自转' }
    ]
  },

  /* ---------------------------------------------------------------- 地球 */
  earth: {
    refName: '太阳',
    scales: [
      { id: 'moon-diameter', label: '月球直径', value: 3474, unit: 'km', note: '≈ 0.273 个地球直径', color: '#c9ccd4' },
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度（平均直径）', color: '#5fd6ff' },
      { id: 'earth-orbit', label: '日地距离', value: 1.496e8, unit: 'km', note: '= 1 AU', color: '#6ff0b8' },
      { id: 'light-year', label: '1 光年', value: 9.46e12, unit: 'km', note: '光走一年的距离', color: '#7e93a8' }
    ],
    gauges: [
      { label: '直径', value: 12742, unit: 'km', digits: 0, note: '约为太阳直径的 1/109' },
      { label: '质量', value: 5.972e24, unit: 'kg', log: true, digits: 2, note: '约为太阳质量的 3.0×10⁻⁶' },
      { label: '表面重力', value: 9.807, unit: 'm/s²', digits: 3, note: '≈ 0.036 倍太阳表面重力' },
      { label: '平均温度', value: 288, unit: 'K', digits: 0, note: '≈ 15 ℃' },
      { label: '公转周期', value: 365.25, unit: '天', digits: 2, note: '= 1 恒星年' },
      { label: '自转周期', value: 23.934, unit: '小时', digits: 3, note: '≈ 23 小时 56 分（恒星日）' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 12742, ref: 1392700, log: true, note: '≈ 0.00915 倍太阳直径' },
      { label: '质量', unit: 'kg', value: 5.972e24, ref: 1.989e30, log: true, note: '≈ 3.00×10⁻⁶ 倍太阳质量' },
      { label: '表面重力', unit: 'm/s²', value: 9.807, ref: 274, log: true, note: '≈ 0.0358 倍' },
      { label: '逃逸速度', unit: 'km/s', value: 11.19, ref: 617.7, log: true, note: '≈ 0.0181 倍' },
      { label: '平均温度', unit: 'K', value: 288, ref: 5778, log: true, note: '≈ 0.0498 倍（开尔文）' },
      { label: '平均密度', unit: 'g/cm³', value: 5.514, ref: 1.408, log: true, better: 'high', note: '≈ 3.92 倍太阳平均密度' }
    ]
  },

  /* ---------------------------------------------------------------- 月球 */
  moon: {
    refName: '地球',
    scales: [
      { id: 'moon-diameter', label: '月球直径', value: 3474, unit: 'km', note: '≈ 0.273 个地球直径', color: '#c9ccd4' },
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'moon-distance', label: '地月平均距离', value: 3.844e5, unit: 'km', note: '≈ 30 个地球直径', color: '#6ff0b8' },
      { id: 'earth-orbit', label: '日地距离', value: 1.496e8, unit: 'km', note: '= 1 AU', color: '#9a8cff' }
    ],
    gauges: [
      { label: '直径', value: 3474, unit: 'km', ref: 12742, refLabel: '地球', digits: 0, note: '≈ 0.273 个地球直径' },
      { label: '质量', value: 7.342e22, unit: 'kg', log: true, ref: 5.972e24, refLabel: '地球', digits: 2, note: '≈ 0.0123 倍地球质量' },
      { label: '表面重力', value: 1.62, unit: 'm/s²', ref: 9.807, refLabel: '地球', digits: 2, note: '≈ 0.165 倍' },
      { label: '平均温度', value: 250, unit: 'K', ref: 288, refLabel: '地球', digits: 0, note: '≈ −23 ℃，昼夜 −173~127 ℃' },
      { label: '公转周期', value: 27.32, unit: '天', ref: 365.25, refLabel: '地球', digits: 2, note: '= 自转周期（潮汐锁定）' },
      { label: '地月距离', value: 3.844e5, unit: 'km', log: true, digits: 0, note: '≈ 30 个地球直径' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 3474, ref: 12742, log: true, note: '≈ 0.273 倍地球直径' },
      { label: '质量', unit: 'kg', value: 7.342e22, ref: 5.972e24, log: true, note: '≈ 0.0123 倍地球质量' },
      { label: '表面重力', unit: 'm/s²', value: 1.62, ref: 9.807, log: true, note: '≈ 0.165 倍' },
      { label: '逃逸速度', unit: 'km/s', value: 2.38, ref: 11.19, log: true, note: '≈ 0.213 倍' },
      { label: '平均温度', unit: 'K', value: 250, ref: 288, log: true, note: '≈ 0.868 倍（开尔文）' },
      { label: '公转周期', unit: '天', value: 27.32, ref: 365.25, log: true, note: '≈ 0.0748 倍地球公转周期' }
    ]
  },

  /* ---------------------------------------------------------------- 火星 */
  mars: {
    refName: '地球',
    scales: [
      { id: 'moon-diameter', label: '月球直径', value: 3474, unit: 'km', note: '约为火星的一半', color: '#c9ccd4' },
      { id: 'mars-diameter', label: '火星直径', value: 6779, unit: 'km', note: '≈ 0.532 个地球直径', color: '#c1553b' },
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'mars-orbit', label: '火星轨道半径', value: 2.279e8, unit: 'km', note: '≈ 1.524 AU', color: '#9a8cff' }
    ],
    gauges: [
      { label: '直径', value: 6779, unit: 'km', ref: 12742, refLabel: '地球', digits: 0, note: '≈ 0.532 个地球直径' },
      { label: '质量', value: 6.417e23, unit: 'kg', log: true, ref: 5.972e24, refLabel: '地球', digits: 2, note: '≈ 0.107 倍地球质量' },
      { label: '表面重力', value: 3.721, unit: 'm/s²', ref: 9.807, refLabel: '地球', digits: 3, note: '≈ 0.379 倍' },
      { label: '平均温度', value: 210, unit: 'K', ref: 288, refLabel: '地球', digits: 0, note: '≈ −63 ℃' },
      { label: '公转周期', value: 687, unit: '天', ref: 365.25, refLabel: '地球', digits: 0, note: '≈ 1.88 个地球年' },
      { label: '自转周期', value: 24.62, unit: '小时', ref: 23.934, refLabel: '地球', digits: 2, note: '≈ 1.03 倍，与地球最接近' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 6779, ref: 12742, log: true, note: '≈ 0.532 倍地球直径' },
      { label: '质量', unit: 'kg', value: 6.417e23, ref: 5.972e24, log: true, note: '≈ 0.107 倍地球质量' },
      { label: '表面重力', unit: 'm/s²', value: 3.721, ref: 9.807, log: true, note: '≈ 0.379 倍' },
      { label: '逃逸速度', unit: 'km/s', value: 5.03, ref: 11.19, log: true, note: '≈ 0.450 倍' },
      { label: '平均温度', unit: 'K', value: 210, ref: 288, log: true, note: '≈ 0.729 倍（开尔文）' },
      { label: '轨道半径', unit: 'km', value: 2.279e8, ref: 1.496e8, log: true, note: '≈ 1.52 AU' }
    ]
  },

  /* ---------------------------------------------------------------- 木星 */
  jupiter: {
    refName: '地球',
    scales: [
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'jupiter-diameter', label: '木星直径', value: 139820, unit: 'km', note: '≈ 10.97 个地球直径', color: '#e0a458' },
      { id: 'sun-diameter', label: '太阳直径', value: 1392700, unit: 'km', note: '≈ 9.96 个木星直径', color: '#ffc76b' },
      { id: 'jupiter-orbit', label: '木星轨道半径', value: 7.785e8, unit: 'km', note: '≈ 5.20 AU', color: '#9a8cff' }
    ],
    gauges: [
      { label: '直径', value: 139820, unit: 'km', ref: 12742, refLabel: '地球', digits: 0, note: '≈ 10.97 个地球直径' },
      { label: '质量', value: 1.898e27, unit: 'kg', log: true, ref: 5.972e24, refLabel: '地球', digits: 2, note: '≈ 317.8 倍地球质量' },
      { label: '表面重力', value: 24.79, unit: 'm/s²', ref: 9.807, refLabel: '地球', digits: 2, note: '≈ 2.53 倍' },
      { label: '平均温度', value: 165, unit: 'K', ref: 288, refLabel: '地球', digits: 0, note: '≈ −108 ℃（云顶）' },
      { label: '公转周期', value: 11.862, unit: '年', ref: 1, refLabel: '地球', digits: 3, note: '≈ 11.86 个地球年' },
      { label: '自转周期', value: 9.925, unit: '小时', ref: 23.934, refLabel: '地球', digits: 3, note: '太阳系行星中最快' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 139820, ref: 12742, log: true, better: 'high', note: '≈ 10.97 倍地球直径' },
      { label: '质量', unit: 'kg', value: 1.898e27, ref: 5.972e24, log: true, better: 'high', note: '≈ 317.8 倍地球质量' },
      { label: '表面重力', unit: 'm/s²', value: 24.79, ref: 9.807, log: true, better: 'high', note: '≈ 2.53 倍' },
      { label: '逃逸速度', unit: 'km/s', value: 59.5, ref: 11.19, log: true, better: 'high', note: '≈ 5.32 倍' },
      { label: '平均温度', unit: 'K', value: 165, ref: 288, log: true, note: '≈ 0.573 倍（开尔文）' },
      { label: '轨道半径', unit: 'km', value: 7.785e8, ref: 1.496e8, log: true, note: '≈ 5.20 AU' }
    ]
  },

  /* ---------------------------------------------------------------- 土星 */
  saturn: {
    refName: '地球',
    scales: [
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'saturn-diameter', label: '土星直径', value: 116460, unit: 'km', note: '≈ 9.14 个地球直径', color: '#e8d5a8' },
      { id: 'saturn-ring', label: '土星主环外径', value: 2.73e5, unit: 'km', note: '≈ 2.3 个土星直径', color: '#d4b57a' },
      { id: 'saturn-orbit', label: '土星轨道半径', value: 1.434e9, unit: 'km', note: '≈ 9.59 AU', color: '#9a8cff' }
    ],
    gauges: [
      { label: '直径', value: 116460, unit: 'km', ref: 12742, refLabel: '地球', digits: 0, note: '≈ 9.14 个地球直径' },
      { label: '质量', value: 5.683e26, unit: 'kg', log: true, ref: 5.972e24, refLabel: '地球', digits: 2, note: '≈ 95.2 倍地球质量' },
      { label: '平均密度', value: 0.687, unit: 'g/cm³', ref: 5.514, refLabel: '地球', digits: 3, note: '小于水（1 g/cm³）' },
      { label: '平均温度', value: 134, unit: 'K', ref: 288, refLabel: '地球', digits: 0, note: '≈ −139 ℃（云顶）' },
      { label: '公转周期', value: 29.46, unit: '年', ref: 1, refLabel: '地球', digits: 2, note: '≈ 29.5 个地球年' },
      { label: '自转周期', value: 10.66, unit: '小时', ref: 23.934, refLabel: '地球', digits: 2, note: '赤道处约 10.7 小时' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 116460, ref: 12742, log: true, better: 'high', note: '≈ 9.14 倍地球直径' },
      { label: '质量', unit: 'kg', value: 5.683e26, ref: 5.972e24, log: true, better: 'high', note: '≈ 95.2 倍地球质量' },
      { label: '平均密度', unit: 'g/cm³', value: 0.687, ref: 5.514, log: true, better: 'high', note: '≈ 0.125 倍，唯一比水轻的行星' },
      { label: '平均温度', unit: 'K', value: 134, ref: 288, log: true, note: '≈ 0.465 倍（开尔文）' },
      { label: '轨道半径', unit: 'km', value: 1.434e9, ref: 1.496e8, log: true, note: '≈ 9.59 AU' },
      { label: '逃逸速度', unit: 'km/s', value: 35.5, ref: 11.19, log: true, better: 'high', note: '≈ 3.17 倍' }
    ]
  },

  /* -------------------------------------------------------------- 天王星 */
  uranus: {
    refName: '地球',
    scales: [
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'uranus-diameter', label: '天王星直径', value: 50724, unit: 'km', note: '≈ 3.98 个地球直径', color: '#9ad9e8' },
      { id: 'jupiter-diameter', label: '木星直径', value: 139820, unit: 'km', note: '≈ 2.76 个天王星直径', color: '#e0a458' },
      { id: 'uranus-orbit', label: '天王星轨道半径', value: 2.871e9, unit: 'km', note: '≈ 19.2 AU', color: '#9a8cff' }
    ],
    gauges: [
      { label: '直径', value: 50724, unit: 'km', ref: 12742, refLabel: '地球', digits: 0, note: '≈ 3.98 个地球直径' },
      { label: '质量', value: 8.681e25, unit: 'kg', log: true, ref: 5.972e24, refLabel: '地球', digits: 2, note: '≈ 14.5 倍地球质量' },
      { label: '表面重力', value: 8.69, unit: 'm/s²', ref: 9.807, refLabel: '地球', digits: 2, note: '≈ 0.886 倍' },
      { label: '平均温度', value: 76, unit: 'K', ref: 288, refLabel: '地球', digits: 0, note: '≈ −197 ℃，太阳系最低云顶温度' },
      { label: '公转周期', value: 84.01, unit: '年', ref: 1, refLabel: '地球', digits: 2, note: '≈ 84 个地球年' },
      { label: '自转轴倾角', value: 97.77, unit: '°', min: 0, max: 180, digits: 2, note: '几乎"躺着"自转，极区各有约 42 年极昼/极夜' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 50724, ref: 12742, log: true, better: 'high', note: '≈ 3.98 倍地球直径' },
      { label: '质量', unit: 'kg', value: 8.681e25, ref: 5.972e24, log: true, better: 'high', note: '≈ 14.5 倍地球质量' },
      { label: '平均密度', unit: 'g/cm³', value: 1.271, ref: 5.514, log: true, better: 'high', note: '≈ 0.231 倍地球密度' },
      { label: '平均温度', unit: 'K', value: 76, ref: 288, log: true, note: '≈ 0.264 倍（开尔文）' },
      { label: '轨道半径', unit: 'km', value: 2.871e9, ref: 1.496e8, log: true, note: '≈ 19.2 AU' },
      { label: '自转轴倾角', unit: '°', value: 97.77, ref: 23.44, log: false, note: '≈ 4.17 倍地球轴倾角' }
    ]
  },

  /* -------------------------------------------------------------- 海王星 */
  neptune: {
    refName: '地球',
    scales: [
      { id: 'moon-diameter', label: '月球直径', value: 3474, unit: 'km', note: '约为海王星的 1/14', color: '#c9ccd4' },
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'neptune-diameter', label: '海王星直径', value: 49244, unit: 'km', note: '≈ 3.86 个地球直径', color: '#4f7fd6' },
      { id: 'neptune-orbit', label: '海王星轨道半径', value: 4.495e9, unit: 'km', note: '≈ 30.0 AU', color: '#9a8cff' }
    ],
    gauges: [
      { label: '直径', value: 49244, unit: 'km', ref: 12742, refLabel: '地球', digits: 0, note: '≈ 3.86 个地球直径' },
      { label: '质量', value: 1.024e26, unit: 'kg', log: true, ref: 5.972e24, refLabel: '地球', digits: 2, note: '≈ 17.1 倍地球质量' },
      { label: '表面重力', value: 11.15, unit: 'm/s²', ref: 9.807, refLabel: '地球', digits: 2, note: '≈ 1.14 倍' },
      { label: '平均温度', value: 72, unit: 'K', ref: 288, refLabel: '地球', digits: 0, note: '≈ −201 ℃' },
      { label: '公转周期', value: 164.8, unit: '年', ref: 1, refLabel: '地球', digits: 1, note: '≈ 165 个地球年' },
      { label: '最高风速', value: 2100, unit: 'km/h', digits: 0, note: '太阳系最强风，≈ 583 m/s' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 49244, ref: 12742, log: true, better: 'high', note: '≈ 3.86 倍地球直径' },
      { label: '质量', unit: 'kg', value: 1.024e26, ref: 5.972e24, log: true, better: 'high', note: '≈ 17.1 倍地球质量' },
      { label: '平均密度', unit: 'g/cm³', value: 1.638, ref: 5.514, log: true, better: 'high', note: '≈ 0.297 倍地球密度' },
      { label: '平均温度', unit: 'K', value: 72, ref: 288, log: true, note: '≈ 0.25 倍（开尔文）' },
      { label: '轨道半径', unit: 'km', value: 4.495e9, ref: 1.496e8, log: true, note: '≈ 30.0 AU' },
      { label: '逃逸速度', unit: 'km/s', value: 23.5, ref: 11.19, log: true, better: 'high', note: '≈ 2.10 倍' }
    ]
  },

  /* ---------------------------------------------------------------- 冥王星 */
  pluto: {
    refName: '地球',
    scales: [
      { id: 'pluto-diameter', label: '冥王星直径', value: 2377, unit: 'km', note: '比月球还小', color: '#d8cfc0' },
      { id: 'moon-diameter', label: '月球直径', value: 3474, unit: 'km', note: '≈ 1.46 个冥王星直径', color: '#c9ccd4' },
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'pluto-orbit', label: '冥王星轨道半长轴', value: 5.906e9, unit: 'km', note: '≈ 39.5 AU', color: '#9a8cff' }
    ],
    gauges: [
      { label: '直径', value: 2377, unit: 'km', ref: 12742, refLabel: '地球', digits: 0, note: '≈ 0.187 个地球直径' },
      { label: '质量', value: 1.303e22, unit: 'kg', log: true, ref: 5.972e24, refLabel: '地球', digits: 2, note: '≈ 0.00218 倍地球质量' },
      { label: '表面重力', value: 0.62, unit: 'm/s²', ref: 9.807, refLabel: '地球', digits: 2, note: '≈ 0.063 倍' },
      { label: '平均温度', value: 44, unit: 'K', ref: 288, refLabel: '地球', digits: 0, note: '≈ −229 ℃' },
      { label: '公转周期', value: 247.9, unit: '年', ref: 1, refLabel: '地球', digits: 1, note: '≈ 248 个地球年' },
      { label: '自转周期', value: 6.387, unit: '天', ref: 0.997, refLabel: '地球', digits: 3, note: '与卡戎潮汐锁定' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 2377, ref: 12742, log: true, note: '≈ 0.187 倍地球直径' },
      { label: '质量', unit: 'kg', value: 1.303e22, ref: 5.972e24, log: true, note: '≈ 0.00218 倍地球质量' },
      { label: '表面重力', unit: 'm/s²', value: 0.62, ref: 9.807, log: true, note: '≈ 0.063 倍' },
      { label: '平均温度', unit: 'K', value: 44, ref: 288, log: true, note: '≈ 0.153 倍（开尔文）' },
      { label: '轨道半长轴', unit: 'km', value: 5.906e9, ref: 1.496e8, log: true, note: '≈ 39.5 AU' },
      { label: '自转周期', unit: '天', value: 6.387, ref: 0.997, log: true, note: '≈ 6.41 倍地球自转周期' }
    ]
  },

  /* ---------------------------------------------------------------- 黑洞 */
  blackhole: {
    refName: '太阳',
    scales: [
      { id: 'earth-rs', label: '地球史瓦西半径', value: 8.87e-6, unit: 'km', note: '≈ 8.9 毫米', color: '#5fd6ff' },
      { id: 'sun-rs', label: '太阳史瓦西半径', value: 2.953, unit: 'km', note: '≈ 2.95 千米', color: '#ffc76b' },
      { id: 'sgr-rs', label: '人马座 A* 史瓦西半径', value: 1.27e7, unit: 'km', note: '≈ 18.3 倍太阳半径', color: '#9a8cff' },
      { id: 'm87-rs', label: 'M87* 史瓦西半径', value: 1.92e10, unit: 'km', note: '≈ 128 AU，超过地球轨道半径', color: '#b06bff' }
    ],
    gauges: [
      { label: 'M87* 质量', value: 6.5e9, unit: '倍太阳质量', log: true, ref: 1, refLabel: '太阳', digits: 1, note: '2019 年 EHT 发布首张黑洞照片' },
      { label: '人马座 A* 质量', value: 4.3e6, unit: '倍太阳质量', log: true, ref: 1, refLabel: '太阳', digits: 1, note: '银河系中心超大质量黑洞' },
      { label: 'M87* 史瓦西半径', value: 1.92e10, unit: 'km', log: true, ref: 1.496e8, refLabel: '地球轨道半径', digits: 2, note: '≈ 128 AU' },
      { label: 'M87* 距离', value: 5.2e20, unit: 'km', log: true, ref: 1.496e8, refLabel: '1 AU', digits: 2, note: '≈ 5,500 万光年' },
      { label: '吸积盘内缘（ISCO）', value: 3, unit: 'Rs', min: 0, max: 6, digits: 1, note: '非自转（史瓦西）黑洞 ISCO = 3 Rs' },
      { label: '光子环', value: 2.6, unit: 'Rs', min: 0, max: 6, digits: 1, note: '光线绕黑洞弯曲形成，约 2.6 Rs' }
    ],
    compare: [
      { label: 'M87* 质量', unit: '倍太阳质量', value: 6.5e9, ref: 1, log: true, better: 'high', note: '≈ 65 亿倍太阳质量' },
      { label: 'M87* 史瓦西半径', unit: 'km', value: 1.92e10, ref: 6.957e5, log: true, better: 'high', note: '≈ 2.76 万倍太阳半径' },
      { label: '太阳的史瓦西半径', unit: 'km', value: 2.953, ref: 6.957e5, log: true, note: '太阳若坍缩成黑洞，视界仅 ≈ 4.2×10⁻⁶ 倍太阳半径' },
      { label: 'M87* 距离', unit: 'km', value: 5.2e20, ref: 1.496e8, log: true, note: '≈ 3.5×10¹² 倍日地距离' },
      { label: '人马座 A* 质量', unit: '倍太阳质量', value: 4.3e6, ref: 1, log: true, better: 'high', note: '≈ 430 万倍太阳质量' }
    ]
  },

  /* ------------------------------------------------------------ 哈雷彗星 */
  halley: {
    refName: '地球',
    scales: [
      { id: 'halley-nucleus', label: '哈雷彗核（长轴）', value: 15, unit: 'km', note: '约 15×8×8 km 的不规则冰岩体', color: '#8fd3ff' },
      { id: 'moon-diameter', label: '月球直径', value: 3474, unit: 'km', note: '≈ 232 个彗核', color: '#c9ccd4' },
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '≈ 849 个彗核', color: '#5fd6ff' },
      { id: 'halley-aphelion', label: '远日点距离', value: 5.25e9, unit: 'km', note: '≈ 35.1 AU', color: '#9a8cff' }
    ],
    gauges: [
      { label: '彗核长轴', value: 15, unit: 'km', log: true, ref: 12742, refLabel: '地球', digits: 1, note: '约 15×8×8 km，等效平均直径 ~11 km' },
      { label: '公转周期', value: 75.3, unit: '年', ref: 1, refLabel: '地球', digits: 1, note: '上次过近日点 1986 年，下次约 2061 年' },
      { label: '轨道偏心率', value: 0.967, unit: '', min: 0, max: 1, digits: 3, note: '0 为圆轨道，1 为抛物线轨道' },
      { label: '近日点距离', value: 8.77e7, unit: 'km', log: true, ref: 1.496e8, refLabel: '1 AU', digits: 2, note: '≈ 0.586 AU' },
      { label: '远日点距离', value: 5.25e9, unit: 'km', log: true, ref: 1.496e8, refLabel: '1 AU', digits: 2, note: '≈ 35.1 AU' },
      { label: '轨道倾角', value: 162.3, unit: '°', min: 0, max: 180, digits: 1, note: '逆行轨道（相对黄道面）' }
    ],
    compare: [
      { label: '彗核直径', unit: 'km', value: 15, ref: 12742, log: true, note: '≈ 0.00118 倍地球直径' },
      { label: '公转周期', unit: '年', value: 75.3, ref: 1, log: true, note: '≈ 75.3 倍地球公转周期' },
      { label: '近日点距离', unit: 'km', value: 8.77e7, ref: 1.496e8, log: true, note: '≈ 0.586 AU' },
      { label: '远日点距离', unit: 'km', value: 5.25e9, ref: 1.496e8, log: true, note: '≈ 35.1 AU' },
      { label: '轨道偏心率', unit: '', value: 0.967, ref: 0.0167, log: false, note: '≈ 58 倍地球轨道偏心率' }
    ]
  },

  /* ------------------------------------------------------------ 猎户座星云 */
  'orion-nebula': {
    refName: '太阳',
    scales: [
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'light-year', label: '1 光年', value: 9.46e12, unit: 'km', note: '光走一年的距离', color: '#7e93a8' },
      { id: 'nebula-diameter', label: '星云直径', value: 2.27e14, unit: 'km', note: '≈ 24 光年', color: '#ff6b9d' },
      { id: 'nebula-distance', label: '星云距离', value: 1.27e16, unit: 'km', note: '≈ 1,344 光年', color: '#9a8cff' }
    ],
    gauges: [
      { label: '距离', value: 1.27e16, unit: 'km', log: true, digits: 2, note: '≈ 1,344 光年' },
      { label: '直径', value: 2.27e14, unit: 'km', log: true, digits: 2, note: '≈ 24 光年' },
      { label: '质量', value: 2000, unit: '倍太阳质量', log: true, ref: 1, refLabel: '太阳', digits: 0, note: '≈ 2,000 倍太阳质量（气体与尘埃）' },
      { label: '年龄', value: 3e6, unit: '年', log: true, digits: 1, note: '≈ 300 万年，最年轻恒星仅数十万年' },
      { label: '视星等', value: 4.0, unit: '等', min: 0, max: 8, digits: 1, note: '数值越小越亮，肉眼可见' },
      { label: '视直径', value: 65, unit: '角分', digits: 0, note: '约 65×60 角分，比满月略大' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 2.27e14, ref: 1.3927e6, log: true, better: 'high', note: '≈ 1.6×10⁸ 倍太阳直径' },
      { label: '质量', unit: '倍太阳质量', value: 2000, ref: 1, log: true, better: 'high', note: '≈ 2,000 倍太阳质量' },
      { label: '距离', unit: 'km', value: 1.27e16, ref: 1.496e8, log: true, note: '≈ 8.5×10⁷ 倍日地距离' },
      { label: '年龄', unit: '年', value: 3e6, ref: 4.6e9, log: true, note: '≈ 0.00065 倍太阳年龄' }
    ]
  },

  /* -------------------------------------------------------------- 银河系 */
  galaxy: {
    refName: '太阳',
    scales: [
      { id: 'solar-system', label: '太阳系直径', value: 1.2e10, unit: 'km', note: '≈ 80 AU（日球层尺度）', color: '#6ff0b8' },
      { id: 'light-year', label: '1 光年', value: 9.46e12, unit: 'km', note: '光走一年的距离', color: '#7e93a8' },
      { id: 'sun-galactic-distance', label: '太阳距银心', value: 2.46e17, unit: 'km', note: '≈ 2.6 万光年', color: '#5fd6ff' },
      { id: 'galaxy-diameter', label: '银河系直径', value: 9.46e17, unit: 'km', note: '≈ 10 万光年（估计 10~18 万光年）', color: '#8fb3ff' }
    ],
    gauges: [
      { label: '直径', value: 9.46e17, unit: 'km', log: true, digits: 2, note: '≈ 10 万光年（估计 10~18 万光年）' },
      { label: '恒星数量', value: 2e11, unit: '颗', log: true, digits: 1, note: '约 1,000~4,000 亿颗' },
      { label: '太阳距银心', value: 2.46e17, unit: 'km', log: true, digits: 2, note: '≈ 2.6 万光年' },
      { label: '中心黑洞质量', value: 4.3e6, unit: '倍太阳质量', log: true, ref: 1, refLabel: '太阳', digits: 1, note: '人马座 A*' },
      { label: '太阳绕银心周期', value: 2.3e8, unit: '年', log: true, digits: 1, note: '≈ 2.3 亿年，绕行速度 ≈ 230 km/s' },
      { label: '银河系年龄', value: 1.36e10, unit: '年', log: true, digits: 2, note: '≈ 136 亿年' }
    ],
    compare: [
      { label: '直径', unit: 'km', value: 9.46e17, ref: 1.3927e6, log: true, better: 'high', note: '≈ 6.8×10¹¹ 倍太阳直径' },
      { label: '恒星数量', unit: '颗', value: 2e11, ref: 1, log: true, better: 'high', note: '≈ 2×10¹¹ 倍（太阳系只有 1 颗恒星）' },
      { label: '中心黑洞质量', unit: '倍太阳质量', value: 4.3e6, ref: 1, log: true, better: 'high', note: '≈ 430 万倍太阳质量' },
      { label: '太阳绕银心周期', unit: '年', value: 2.3e8, ref: 1, log: true, note: '≈ 2.3 亿倍地球公转周期' },
      { label: '银河系年龄', unit: '年', value: 1.36e10, ref: 4.6e9, log: true, note: '≈ 2.96 倍太阳年龄' }
    ]
  },

  /* -------------------------------------------------------------- 流星雨 */
  'meteor-shower': {
    refName: '地球',
    scales: [
      { id: 'grain', label: '流星体颗粒', value: 1e-5, unit: 'km', note: '约 1 厘米，多为彗星碎屑', color: '#ffd166' },
      { id: 'nucleus', label: '母彗星彗核', value: 26, unit: 'km', note: '斯威夫特-塔特尔彗核约 26 km', color: '#8fd3ff' },
      { id: 'atmosphere', label: '发光高度', value: 100, unit: 'km', note: '典型 80~120 km', color: '#6ff0b8' },
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' }
    ],
    gauges: [
      { label: '峰值流量 ZHR', value: 100, unit: '颗/小时', digits: 0, note: '英仙座流星雨峰值约 100（理想条件）' },
      { label: '流星入大气速度', value: 59, unit: 'km/s', ref: 29.8, refLabel: '地球公转速度', digits: 0, note: '约为地球公转速度的 2 倍' },
      { label: '母彗星轨道周期', value: 133, unit: '年', ref: 1, refLabel: '地球公转', digits: 0, note: '斯威夫特-塔特尔彗星约 133 年' },
      { label: '典型颗粒粒径', value: 1, unit: 'mm', digits: 1, note: '多为毫米级，少数厘米级' },
      { label: '发光高度', value: 100, unit: 'km', digits: 0, note: '约 80~120 km 处烧蚀发光' }
    ],
    compare: [
      { label: '流星速度', unit: 'km/s', value: 59, ref: 29.8, log: true, better: 'high', note: '≈ 1.98 倍地球公转速度' },
      { label: '母彗星轨道周期', unit: '年', value: 133, ref: 1, log: true, note: '≈ 133 倍地球公转周期' },
      { label: '颗粒粒径', unit: 'km', value: 1e-6, ref: 12742, log: true, note: '约为地球直径的 1/1.3×10¹⁰' },
      { label: '发光高度', unit: 'km', value: 100, ref: 12742, log: true, note: '≈ 地球直径的 0.78%' }
    ]
  },

  /* ---------------------------------------------------------------- 日食 */
  'solar-eclipse': {
    refName: '地球',
    scales: [
      { id: 'moon-diameter', label: '月球直径', value: 3474, unit: 'km', note: '≈ 0.273 个地球直径', color: '#c9ccd4' },
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '基准长度', color: '#5fd6ff' },
      { id: 'umbra-length', label: '月球本影长度', value: 3.73e5, unit: 'km', note: '≈ 地月平均距离的 97%', color: '#7a8cff' },
      { id: 'sun-distance', label: '日地距离', value: 1.496e8, unit: 'km', note: '= 1 AU', color: '#ffc76b' }
    ],
    gauges: [
      { label: '全食最长时长', value: 7.5, unit: '分钟', min: 0, max: 8, digits: 1, note: '理论最大值约 7 分 32 秒' },
      { label: '本影带最大宽度', value: 267, unit: 'km', digits: 0, note: '全食带宽度随月地距离变化' },
      { label: '沙罗周期', value: 18.03, unit: '年', digits: 2, note: '≈ 18 年 11 天，日食按此周期重现' },
      { label: '平均每年日食次数', value: 2.4, unit: '次', min: 0, max: 5, digits: 1, note: '每年 2~5 次（含偏食）' },
      { label: '月球平均角直径', value: 0.518, unit: '°', ref: 0.533, refLabel: '太阳角直径', digits: 3, note: '两者接近，才有日全食' }
    ],
    compare: [
      { label: '月球直径', unit: 'km', value: 3474, ref: 12742, log: true, note: '≈ 0.273 倍地球直径' },
      { label: '日地距离', unit: 'km', value: 1.496e8, ref: 3.844e5, log: true, note: '≈ 389 倍地月距离' },
      { label: '月球本影长度', unit: 'km', value: 3.73e5, ref: 12742, log: true, note: '≈ 29.3 倍地球直径' },
      { label: '月球角直径', unit: '°', value: 0.518, ref: 0.533, log: false, note: '≈ 太阳角直径的 0.97 倍' }
    ]
  },

  /* ---------------------------------------------------------------- 极光 */
  aurora: {
    refName: '地球',
    scales: [
      { id: 'green', label: '绿色极光高度', value: 100, unit: 'km', note: '氧原子 557.7 nm 谱线，约 90~150 km', color: '#59e8a8' },
      { id: 'red', label: '红色极光高度', value: 300, unit: 'km', note: '氧原子 630 nm 谱线，约 150~400 km', color: '#ff7a7a' },
      { id: 'earth-radius', label: '地球半径', value: 6371, unit: 'km', note: '基准长度（平均半径）', color: '#5fd6ff' },
      { id: 'earth-diameter', label: '地球直径', value: 12742, unit: 'km', note: '≈ 127 倍绿色极光高度', color: '#7e93a8' }
    ],
    gauges: [
      { label: '绿色极光高度', value: 100, unit: 'km', ref: 6371, refLabel: '地球半径', digits: 0, note: '氧原子发光，最常见的颜色' },
      { label: '红色极光高度', value: 300, unit: 'km', ref: 6371, refLabel: '地球半径', digits: 0, note: '高层稀薄氧原子发光' },
      { label: '蓝紫极光高度', value: 95, unit: 'km', ref: 6371, refLabel: '地球半径', digits: 0, note: '氮分子发光，多见于极光下缘' },
      { label: '常见磁纬', value: 67.5, unit: '°', min: 0, max: 90, digits: 1, note: '极光带多出现在磁纬 65°~70°' },
      { label: '太阳活动周期', value: 11, unit: '年', digits: 1, note: '极光频率随之起伏' }
    ],
    compare: [
      { label: '绿色极光高度', unit: 'km', value: 100, ref: 6371, log: true, note: '≈ 地球半径的 1.6%' },
      { label: '红色极光高度', unit: 'km', value: 300, ref: 6371, log: true, note: '≈ 地球半径的 4.7%' },
      { label: '极光活动高度上限', unit: 'km', value: 400, ref: 6371, log: true, note: '≈ 地球半径的 6.3%（与国际空间站轨道高度相当）' },
      { label: '太阳活动周期', unit: '年', value: 11, ref: 1, log: true, note: '≈ 11 倍地球公转周期' }
    ]
  },

  /* -------------------------------------------------------------- 超新星 */
  supernova: {
    refName: '太阳',
    scales: [
      { id: 'neutron-star', label: '中子星直径', value: 20, unit: 'km', note: '典型核坍缩产物，约 20 km', color: '#7e93a8' },
      { id: 'sun-diameter', label: '太阳直径', value: 1.3927e6, unit: 'km', note: '≈ 109 个地球直径', color: '#ffc76b' },
      { id: 'crab-diameter', label: '蟹状星云直径', value: 1.04e14, unit: 'km', note: '≈ 11 光年，1054 年超新星遗迹', color: '#ff6b6b' },
      { id: 'distance-1987a', label: '1987A 距离', value: 1.59e18, unit: 'km', note: '≈ 16.8 万光年', color: '#9a8cff' }
    ],
    gauges: [
      { label: '峰值光度', value: 1e9, unit: '倍太阳光度', log: true, ref: 1, refLabel: '太阳', digits: 1, note: '可达约 10⁹ 倍太阳光度' },
      { label: '抛射物速度', value: 1e4, unit: 'km/s', log: true, ref: 617.7, refLabel: '太阳逃逸速度', digits: 1, note: '约 0.1 倍光速' },
      { label: '1987A 距离', value: 1.59e18, unit: 'km', log: true, ref: 1.496e8, refLabel: '1 AU', digits: 2, note: '≈ 16.8 万光年' },
      { label: '中子星直径', value: 20, unit: 'km', log: true, ref: 1.3927e6, refLabel: '太阳直径', digits: 1, note: '典型值约 20 km' },
      { label: '蟹状星云直径', value: 1.04e14, unit: 'km', log: true, ref: 1.3927e6, refLabel: '太阳直径', digits: 2, note: '≈ 11 光年' },
      { label: '蟹状星云年龄', value: 970, unit: '年', digits: 0, note: '源自 1054 年记录的超新星' }
    ],
    compare: [
      { label: '峰值光度', unit: '倍太阳光度', value: 1e9, ref: 1, log: true, better: 'high', note: '≈ 10 亿倍太阳光度' },
      { label: '抛射物速度', unit: 'km/s', value: 1e4, ref: 617.7, log: true, better: 'high', note: '≈ 16.2 倍太阳表面逃逸速度' },
      { label: '1987A 距离', unit: 'km', value: 1.59e18, ref: 1.496e8, log: true, note: '≈ 1.06×10¹⁰ 倍日地距离' },
      { label: '中子星直径', unit: 'km', value: 20, ref: 1.3927e6, log: true, note: '≈ 太阳直径的 1.4×10⁻⁵' },
      { label: '蟹状星云直径', unit: 'km', value: 1.04e14, ref: 1.3927e6, log: true, note: '≈ 7.5×10⁷ 倍太阳直径' }
    ]
  }
}

export function getMetrics(id: string): EntryMetrics | undefined {
  return entries[id]
}

/** 已覆盖的展项 id（便于自测覆盖度）。 */
export function listMetricsIds(): string[] {
  return Object.keys(entries)
}
