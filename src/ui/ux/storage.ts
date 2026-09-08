/**
 * 工作流 D 私有存储层：偏好记忆 + 最近查看。
 * 只读写 localStorage 的固定键 tianyi:prefs / tianyi:recent；
 * 隐私模式或配额不足时静默降级，不影响页面功能。
 */

export type BrowseSort = 'order' | 'name' | 'category'

export interface Prefs {
  /** 目录页排序方式 */
  browseSort: BrowseSort
  /** 目录页上次使用的分类 */
  browseCat: string
  /** 天文史中已折叠的年代名称 */
  timelineCollapsed: string[]
}

export interface RecentItem {
  id: string
  /** 查看时间戳（毫秒） */
  at: number
}

const PREFS_KEY = 'tianyi:prefs'
const RECENT_KEY = 'tianyi:recent'
const RECENT_LIMIT = 6

const DEFAULT_PREFS: Prefs = {
  browseSort: 'order',
  browseCat: '全部',
  timelineCollapsed: []
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isBrowseSort(value: unknown): value is BrowseSort {
  return value === 'order' || value === 'name' || value === 'category'
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function readRaw(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function writeRaw(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 忽略：隐私模式 / 存储配额不足
  }
}

export function readPrefs(): Prefs {
  const raw = readRaw(PREFS_KEY)
  if (!isObject(raw)) return { ...DEFAULT_PREFS, timelineCollapsed: [] }
  return {
    browseSort: isBrowseSort(raw.browseSort) ? raw.browseSort : DEFAULT_PREFS.browseSort,
    browseCat: typeof raw.browseCat === 'string' && raw.browseCat ? raw.browseCat : DEFAULT_PREFS.browseCat,
    timelineCollapsed: asStringArray(raw.timelineCollapsed)
  }
}

export function updatePrefs(patch: Partial<Prefs>): Prefs {
  const next: Prefs = { ...readPrefs(), ...patch }
  writeRaw(PREFS_KEY, next)
  return next
}

export function readRecent(): RecentItem[] {
  const raw = readRaw(RECENT_KEY)
  if (!Array.isArray(raw)) return []
  const items: RecentItem[] = []
  for (const entry of raw) {
    if (!isObject(entry)) continue
    if (typeof entry.id !== 'string' || !entry.id) continue
    if (typeof entry.at !== 'number' || !Number.isFinite(entry.at)) continue
    items.push({ id: entry.id, at: entry.at })
  }
  return items.slice(0, RECENT_LIMIT)
}

export function pushRecent(id: string): void {
  if (!id) return
  const next = [{ id, at: Date.now() }, ...readRecent().filter((item) => item.id !== id)].slice(0, RECENT_LIMIT)
  writeRaw(RECENT_KEY, next)
}

export function clearRecent(): void {
  writeRaw(RECENT_KEY, [])
}

/** 把时间戳格式化成中文相对时间；超过 7 天显示日期。 */
export function formatRelativeTime(at: number): string {
  const diff = Date.now() - at
  if (!Number.isFinite(diff) || diff < 0) return '刚刚'
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`
  const date = new Date(at)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const dayOfMonth = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${dayOfMonth}`
}
