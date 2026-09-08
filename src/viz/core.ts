/**
 * 数据可视化层内部工具：数值格式化、刻度映射、DOM/生命周期辅助。
 * 仅供 src/viz/* 使用；对外契约见 ./types.ts。
 */
import type { VizHandle } from './types'

/* ---------------------------------------------------------------- 数值格式化 */

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻'
}

/** 把整数指数转成上标字符，例如 30 -> ³⁰。 */
export function superscript(n: number): string {
  return String(n)
    .split('')
    .map((c) => SUPERSCRIPT[c] ?? c)
    .join('')
}

/** 科学计数法：1.99×10³⁰（天文数据跨度大，必须用科学计数法）。 */
export function formatSci(value: number, digits = 2): string {
  if (!Number.isFinite(value) || value === 0) return '0'
  const exp = Math.floor(Math.log10(Math.abs(value)))
  let mant = value / Math.pow(10, exp)
  let e = exp
  if (Math.abs(Number(mant.toFixed(digits))) >= 10) {
    mant /= 10
    e += 1
  }
  if (Math.abs(mant) < 1) {
    mant *= 10
    e -= 1
  }
  return `${mant.toFixed(digits)}×10${superscript(e)}`
}

/** 自动选择可读形式：小数值用千分位，跨数量级用科学计数法。 */
export function formatNumber(value: number, digits?: number): string {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs !== 0 && (abs >= 1e6 || abs < 1e-3)) return formatSci(value, digits ?? 2)
  const d = digits ?? (abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 1 ? 2 : 3)
  return value.toLocaleString('zh-CN', { maximumFractionDigits: d, minimumFractionDigits: 0 })
}

const TIGHT_UNITS = new Set(['%', '°', '′', '″', '倍', 'Rs'])

/** 数值 + 单位，按单位类型决定是否加空格。 */
export function formatValue(value: number, unit?: string, digits?: number): string {
  const num = formatNumber(value, digits)
  if (!unit) return num
  return TIGHT_UNITS.has(unit) ? `${num}${unit}` : `${num} ${unit}`
}

/** 倍率：11.2× / 0.273× / 1/34 / 3.00×10⁻⁶。 */
export function formatMultiple(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) return '—'
  if (ratio >= 1e4) return `${formatSci(ratio, 2)}×`
  if (ratio >= 100) return `${Math.round(ratio).toLocaleString('zh-CN')}×`
  if (ratio >= 10) return `${trimZero(ratio.toFixed(1))}×`
  if (ratio >= 0.01) return `${trimZero(ratio.toFixed(2))}×`
  if (ratio >= 1e-4) return `1/${Math.round(1 / ratio).toLocaleString('zh-CN')}`
  return formatSci(ratio, 2)
}

function trimZero(text: string): string {
  return text.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
}

/* ------------------------------------------------------------------ 刻度映射 */

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}

/** 把数值映射到 0~1 的位置；对数模式下要求 value/lo/hi 为正。 */
export function scalePosition(value: number, lo: number, hi: number, log: boolean): number {
  if (log) {
    const safe = (x: number) => Math.log10(Math.max(x, 1e-30))
    const span = safe(hi) - safe(lo)
    if (!Number.isFinite(span) || Math.abs(span) < 1e-9) return 1
    return clamp((safe(value) - safe(lo)) / span, 0, 1)
  }
  const span = hi - lo
  if (!Number.isFinite(span) || Math.abs(span) < 1e-12) return 1
  return clamp((value - lo) / span, 0, 1)
}

/** 给一组数值留出两端余量，避免柱子贴边；对数模式返回正值区间。 */
export function paddedRange(values: number[], log: boolean): [number, number] {
  const vals = values.filter((v) => Number.isFinite(v) && (!log || v > 0))
  if (vals.length === 0) return [0, 1]
  let min = vals[0]
  let max = vals[0]
  for (const v of vals) {
    if (v < min) min = v
    if (v > max) max = v
  }
  if (log) {
    const lo = min / 2.4
    const hi = max * 2.4
    if (lo > 0 && hi > lo) return [lo, hi]
    return [Math.max(min / 10, 1e-30), Math.max(max * 10, 1e-29)]
  }
  const lo = Math.min(0, min)
  const hi = max > lo ? lo + (max - lo) * 1.06 : lo + 1
  return [lo, hi]
}

/** 仪表刻度区间：优先使用显式 min/max，否则按数值与参照值推算。 */
export function gaugeRange(
  value: number,
  ref: number | undefined,
  min: number | undefined,
  max: number | undefined,
  log: boolean
): [number, number] {
  const hasRef = typeof ref === 'number' && Number.isFinite(ref) && ref !== 0
  if (typeof min === 'number' && typeof max === 'number' && max > min) return [min, max]
  const pool = hasRef ? [value, ref] : [value]
  const [lo, hi] = paddedRange(pool, log)
  return [typeof min === 'number' ? min : lo, typeof max === 'number' ? max : hi]
}

/* ---------------------------------------------------------------- DOM 与生命周期 */

const PALETTE = ['#5fd6ff', '#ffc76b', '#ff7bd5', '#6ff0b8', '#9a8cff', '#7ec8dd']

export function paletteColor(index: number): string {
  return PALETTE[index % PALETTE.length]
}

export function createEl(tag: string, className?: string, text?: string): HTMLElement {
  const el = document.createElement(tag)
  if (className) el.className = className
  if (text !== undefined) el.textContent = text
  return el
}

/** 事件绑定，返回解绑函数。 */
export function on(
  target: EventTarget,
  type: string,
  listener: EventListener,
  options?: AddEventListenerOptions
): () => void {
  target.addEventListener(type, listener, options)
  return () => target.removeEventListener(type, listener, options)
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 组装 VizHandle：dispose 时先执行清理，再移除 DOM，且可重复调用。 */
export function makeHandle(el: HTMLElement, cleanups: Array<() => void>): VizHandle {
  let disposed = false
  return {
    el,
    dispose() {
      if (disposed) return
      disposed = true
      for (const fn of cleanups) {
        try {
          fn()
        } catch {
          /* 清理失败不应阻塞其他清理 */
        }
      }
      cleanups.length = 0
      el.remove()
    }
  }
}

/** 缓出动画；返回取消函数。prefers-reduced-motion 时直接跳到终值。 */
export function animateNumber(
  from: number,
  to: number,
  duration: number,
  frame: (value: number) => void
): () => void {
  if (prefersReducedMotion() || duration <= 0 || !Number.isFinite(from) || !Number.isFinite(to)) {
    frame(to)
    return () => undefined
  }
  let raf = 0
  const start = performance.now()
  const step = (now: number): void => {
    const t = clamp((now - start) / duration, 0, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    frame(from + (to - from) * eased)
    if (t < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}

/** 元素进入视口后执行一次回调；不支持 IntersectionObserver 时立即执行。 */
export function onceVisible(el: Element, callback: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    callback()
    return () => undefined
  }
  let done = false
  let timer = 0
  const fire = (): void => {
    if (done) return
    done = true
    if (timer) window.clearTimeout(timer)
    observer.disconnect()
    callback()
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          fire()
          return
        }
      }
    },
    { threshold: 0.05 }
  )
  observer.observe(el)
  // 兜底：个别受限环境（无头/虚拟时间）可能不派发 IntersectionObserver 回调，
  // 超时后照样播放一次，避免数值永远停在 0。
  timer = window.setTimeout(fire, 2500)
  return () => {
    done = true
    if (timer) window.clearTimeout(timer)
    observer.disconnect()
  }
}

/**
 * 按“自身容器宽度”切换窄屏样式（详情页侧栏只有约 340px 宽，视口媒体查询不适用）。
 * 在 root 上切换 .viz-narrow 类，样式见 viz.css。
 */
export function watchNarrow(root: HTMLElement, threshold = 480): () => void {
  const apply = (width: number): void => {
    root.classList.toggle('viz-narrow', width > 0 && width < threshold)
  }
  apply(root.getBoundingClientRect().width)
  if (typeof ResizeObserver === 'undefined') return () => undefined
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) apply(entry.contentRect.width)
  })
  observer.observe(root)
  return () => observer.disconnect()
}
