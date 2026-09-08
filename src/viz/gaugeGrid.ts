/**
 * createGaugeGrid：数值仪表网格。
 * 每个仪表显示当前值、参照刻度（通常是地球）与说明；进入视口时数值滚动动画，
 * 尊重 prefers-reduced-motion。
 */
import type { GaugeSpec, VizHandle } from './types'
import {
  animateNumber,
  createEl,
  formatNumber,
  formatValue,
  gaugeRange,
  makeHandle,
  onceVisible,
  prefersReducedMotion,
  scalePosition,
  watchNarrow
} from './core'

export function createGaugeGrid(container: HTMLElement, specs: GaugeSpec[]): VizHandle {
  const root = createEl('div', 'viz viz-gauge-grid')
  root.setAttribute('role', 'group')
  root.setAttribute('aria-label', '数值仪表')

  if (specs.length === 0) {
    root.appendChild(createEl('p', 'viz-empty', '暂无数据'))
    container.appendChild(root)
    return makeHandle(root, [])
  }

  const cleanups: Array<() => void> = []
  const players: Array<() => void> = []
  const reduce = prefersReducedMotion()

  specs.forEach((spec) => {
    const log = spec.log ?? false
    const [lo, hi] = gaugeRange(spec.value, spec.ref, spec.min, spec.max, log)
    const targetPct = scalePosition(spec.value, lo, hi, log) * 100
    const refPct =
      typeof spec.ref === 'number' && Number.isFinite(spec.ref)
        ? scalePosition(spec.ref, lo, hi, log) * 100
        : null

    const card = createEl('div', 'viz-gauge')
    card.setAttribute('role', 'img')
    const ariaParts = [`${spec.label}：${formatValue(spec.value, spec.unit, spec.digits)}`]
    if (refPct !== null && typeof spec.ref === 'number') {
      ariaParts.push(`参照 ${spec.refLabel ?? '参照值'} ${formatValue(spec.ref, spec.unit, spec.digits)}`)
    }
    if (spec.note) ariaParts.push(spec.note)
    card.setAttribute('aria-label', ariaParts.join('，'))

    card.appendChild(createEl('span', 'viz-gauge-label', spec.label))

    const readout = createEl('span', 'viz-gauge-readout')
    const num = createEl('span', 'viz-gauge-num', formatNumber(spec.value, spec.digits))
    const unit = createEl('span', 'viz-gauge-unit', spec.unit)
    readout.appendChild(num)
    readout.appendChild(unit)
    card.appendChild(readout)

    const track = createEl('div', 'viz-gauge-track')
    const fill = createEl('span', 'viz-gauge-fill')
    fill.style.setProperty('--w', reduce ? `${targetPct.toFixed(2)}%` : '0%')
    num.textContent = reduce ? formatNumber(spec.value, spec.digits) : formatNumber(0, spec.digits)
    track.appendChild(fill)
    if (refPct !== null) {
      const mark = createEl('span', 'viz-gauge-mark')
      mark.style.setProperty('--p', `${refPct.toFixed(2)}%`)
      track.appendChild(mark)
      const markLabel = createEl('span', 'viz-gauge-marklabel', spec.refLabel ?? '参照')
      markLabel.style.setProperty('--p', `${refPct.toFixed(2)}%`)
      track.appendChild(markLabel)
    }
    card.appendChild(track)

    if (spec.note) card.appendChild(createEl('span', 'viz-gauge-note', spec.note))

    root.appendChild(card)

    players.push(() => {
      const cancelNum = animateNumber(0, 1, 760, (p) => {
        num.textContent = formatNumber(spec.value * p, spec.digits)
        fill.style.setProperty('--w', `${(targetPct * p).toFixed(2)}%`)
      })
      cleanups.push(cancelNum)
    })
  })

  cleanups.push(
    onceVisible(root, () => {
      for (const play of players) play()
    })
  )

  cleanups.push(watchNarrow(root))
  container.appendChild(root)
  return makeHandle(root, cleanups)
}
