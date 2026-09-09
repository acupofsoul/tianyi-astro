/**
 * 真实比例对比页的天体清单（第三轮迭代 · 数字化视角）。
 * 直径取公认近似值（NASA Planetary Fact Sheet / IAU），单位 km。
 * row 0 = 恒星与巨行星，row 1 = 岩石行星、卫星与矮行星。
 */
export interface ScaleLineupBody {
  name: string
  enName: string
  /** 真实直径（km） */
  diameterKm: number
  color: string
  row: 0 | 1
}

export const SCALE_LINEUP: ScaleLineupBody[] = [
  // ---- 恒星与巨行星 ----
  { name: '太阳', enName: 'Sun', diameterKm: 1392700, color: '#ffc46b', row: 0 },
  { name: '木星', enName: 'Jupiter', diameterKm: 139820, color: '#e8b45a', row: 0 },
  { name: '土星', enName: 'Saturn', diameterKm: 116460, color: '#e0c68a', row: 0 },
  { name: '天王星', enName: 'Uranus', diameterKm: 50724, color: '#9ad9e8', row: 0 },
  { name: '海王星', enName: 'Neptune', diameterKm: 49244, color: '#5f8fe0', row: 0 },

  // ---- 岩石行星 / 卫星 / 矮行星 ----
  { name: '地球', enName: 'Earth', diameterKm: 12742, color: '#4a9df8', row: 1 },
  { name: '金星', enName: 'Venus', diameterKm: 12104, color: '#e8d5a0', row: 1 },
  { name: '火星', enName: 'Mars', diameterKm: 6779, color: '#c1502e', row: 1 },
  { name: '水星', enName: 'Mercury', diameterKm: 4879, color: '#b5a99a', row: 1 },
  { name: '土卫六', enName: 'Titan', diameterKm: 5149.5, color: '#e8a84a', row: 1 },
  { name: '木卫二', enName: 'Europa', diameterKm: 3121.6, color: '#a9dcef', row: 1 },
  { name: '月球', enName: 'Moon', diameterKm: 3474.8, color: '#c9ccd4', row: 1 },
  { name: '冥王星', enName: 'Pluto', diameterKm: 2377, color: '#d8b9a0', row: 1 },
  { name: '谷神星', enName: 'Ceres', diameterKm: 940, color: '#8e8878', row: 1 },
  { name: '中子星', enName: 'Neutron star', diameterKm: 20, color: '#dfefff', row: 1 }
]

/** 排序后（大到小）的副本，供列表展示。 */
export function sortedLineup(): ScaleLineupBody[] {
  return SCALE_LINEUP.slice().sort((a, b) => b.diameterKm - a.diameterKm)
}
