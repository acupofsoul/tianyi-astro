/**
 * createBarChart：SVG 条形图，支持对数刻度。
 * 数据跨度大时用对数刻度；容器宽度变化时重绘（ResizeObserver），
 * 进入视口时柱体自底部生长（CSS 过渡，尊重 prefers-reduced-motion）。
 */
import type { BarDatum, VizHandle } from './types'
import {
  createEl,
  formatValue,
  makeHandle,
  onceVisible,
  paletteColor,
  paddedRange,
  scalePosition,
  superscript,
  watchNarrow
} from './core'

const SVG_NS = 'http://www.w3.org/2000/svg'

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string | number>
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag)
  if (attrs) {
    for (const key of Object.keys(attrs)) el.setAttribute(key, String(attrs[key]))
  }
  return el
}

export function createBarChart(
  container: HTMLElement,
  data: BarDatum[],
  opts?: { title?: string; log?: boolean }
): VizHandle {
  const log = opts?.log ?? false
  const title = opts?.title ?? '数据对比'
  const root = createEl('div', 'viz viz-bar-chart')
  root.setAttribute('role', 'group')
  root.setAttribute('aria-label', `${title}（${log ? '对数刻度' : '线性刻度'}）`)

  const head = createEl('div', 'viz-head')
  head.appendChild(createEl('span', 'viz-title', title))
  const units = new Set(data.map((d) => d.unit ?? '').filter((u) => u.length > 0))
  const subText = units.size === 1 ? `单位：${[...units][0]} · ${log ? '对数刻度' : '线性刻度'}` : log ? '对数刻度' : '线性刻度'
  head.appendChild(createEl('span', 'viz-sub', subText))
  root.appendChild(head)

  const plot = createEl('div', 'viz-chart-plot')
  root.appendChild(plot)

  if (data.length === 0) {
    plot.appendChild(createEl('p', 'viz-empty', '暂无数据'))
    container.appendChild(root)
    return makeHandle(root, [])
  }

  let entered = false
  let raf = 0

  const render = (): void => {
    const measured = plot.clientWidth || container.clientWidth || 640
    const width = Math.max(240, Math.round(measured))
    const narrow = width < 460
    const height = narrow ? 220 : 260
    const rotate = narrow || data.length > 7
    const padLeft = 54
    const padRight = 12
    const padTop = 26
    const padBottom = rotate ? 66 : 30
    const innerW = Math.max(40, width - padLeft - padRight)
    const innerH = Math.max(60, height - padTop - padBottom)
    const baseline = padTop + innerH

    const values = data.map((d) => d.value)
    const [lo, hi] = paddedRange(values, log)

    while (plot.firstChild) plot.removeChild(plot.firstChild)
    const svg = svgEl('svg', {
      class: 'viz-chart-svg',
      viewBox: `0 0 ${width} ${height}`,
      width: '100%',
      height,
      role: 'group',
      'aria-label': title
    })

    // 网格与刻度
    const ticks = niceTicks(lo, hi, log)
    const grid = svgEl('g', { class: 'viz-chart-grid' })
    for (const tick of ticks) {
      const y = padTop + innerH * (1 - scalePosition(tick, lo, hi, log))
      grid.appendChild(svgEl('line', { class: 'viz-chart-gridline', x1: padLeft, x2: width - padRight, y1: y, y2: y }))
      const label = svgEl('text', { class: 'viz-chart-axis', x: padLeft - 8, y: y + 3.5, 'text-anchor': 'end' })
      label.textContent = tickLabel(tick)
      grid.appendChild(label)
    }
    svg.appendChild(grid)

    // 柱体
    const cols = svgEl('g', { class: 'viz-chart-cols' })
    const slot = innerW / data.length
    const barW = Math.min(40, Math.max(6, slot * 0.6))
    const showValues = slot >= 34

    data.forEach((datum, index) => {
      const cx = padLeft + slot * (index + 0.5)
      const y = padTop + innerH * (1 - scalePosition(datum.value, lo, hi, log))
      const barH = Math.max(1, baseline - y)
      const color = datum.color ?? paletteColor(index)

      const col = svgEl('g', {
        class: 'viz-chart-col',
        tabindex: 0,
        role: 'img',
        'aria-label': `${datum.label}：${formatValue(datum.value, datum.unit)}`
      })
      const tip = svgEl('title')
      tip.textContent = `${datum.label}：${formatValue(datum.value, datum.unit)}`
      col.appendChild(tip)

      const rect = svgEl('rect', {
        class: 'viz-chart-rect',
        x: cx - barW / 2,
        y,
        width: barW,
        height: barH,
        rx: 1.5
      })
      rect.style.setProperty('--viz-c', color)
      col.appendChild(rect)

      if (showValues) {
        const val = svgEl('text', { class: 'viz-chart-val', x: cx, y: y - 7, 'text-anchor': 'middle' })
        val.textContent = formatValue(datum.value, datum.unit)
        col.appendChild(val)
      }

      const labelText = datum.label.length > 6 ? `${datum.label.slice(0, 5)}…` : datum.label
      if (rotate) {
        const lab = svgEl('text', {
          class: 'viz-chart-lab',
          x: cx,
          y: baseline + 14,
          'text-anchor': 'end',
          transform: `rotate(-38 ${cx} ${baseline + 14})`
        })
        lab.textContent = labelText
        col.appendChild(lab)
      } else {
        const lab = svgEl('text', {
          class: 'viz-chart-lab',
          x: cx,
          y: baseline + 16,
          'text-anchor': 'middle'
        })
        lab.textContent = labelText
        col.appendChild(lab)
      }

      cols.appendChild(col)
    })
    svg.appendChild(cols)

    const axis = svgEl('line', { class: 'viz-chart-axisline', x1: padLeft, x2: width - padRight, y1: baseline, y2: baseline })
    svg.appendChild(axis)

    plot.appendChild(svg)
    if (entered) root.classList.add('is-in')
  }

  const scheduleRender = (): void => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      render()
    })
  }

  const cleanups: Array<() => void> = []
  render()

  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(scheduleRender)
    observer.observe(plot)
    cleanups.push(() => observer.disconnect())
  } else {
    const onResize = (): void => scheduleRender()
    window.addEventListener('resize', onResize)
    cleanups.push(() => window.removeEventListener('resize', onResize))
  }

  cleanups.push(
    onceVisible(root, () => {
      entered = true
      root.classList.add('is-in')
    })
  )
  cleanups.push(() => {
    if (raf) cancelAnimationFrame(raf)
  })
  cleanups.push(watchNarrow(root))

  container.appendChild(root)
  return makeHandle(root, cleanups)
}

/** 生成 4~6 条可读的刻度值。 */
function niceTicks(lo: number, hi: number, log: boolean): number[] {
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return [lo]
  if (log) {
    const start = Math.floor(Math.log10(Math.max(lo, 1e-30)))
    const end = Math.ceil(Math.log10(Math.max(hi, 1e-30)))
    const span = end - start
    const step = Math.max(1, Math.ceil(span / 5))
    const ticks: number[] = []
    for (let e = start; e <= end; e += step) ticks.push(Math.pow(10, e))
    if (ticks.length < 2) ticks.push(Math.pow(10, end))
    return ticks
  }
  const span = hi - lo
  const rawStep = span / 4
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const norm = rawStep / mag
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag
  const first = Math.ceil(lo / step) * step
  const ticks: number[] = []
  for (let v = first; v <= hi + step * 0.001 && ticks.length < 8; v += step) ticks.push(v)
  return ticks.length > 0 ? ticks : [lo, hi]
}

function tickLabel(value: number): string {
  const abs = Math.abs(value)
  if (abs !== 0 && (abs >= 1e5 || abs < 1e-2)) {
    const exp = Math.round(Math.log10(abs))
    const mant = value / Math.pow(10, exp)
    return `${Number(mant.toFixed(1))}×10${superscript(exp)}`
  }
  return value.toLocaleString('zh-CN', { maximumFractionDigits: abs >= 100 ? 0 : abs >= 1 ? 1 : 2 })
}
