/**
 * createCompareMatrix：目标 vs 参照天体的横向对数对比条。
 * 每行共用一条对数轨道，参照值以刻度线标出，右侧给出 11.2× 这类倍率。
 */
import type { CompareRow, VizHandle } from './types'
import {
  createEl,
  formatMultiple,
  formatValue,
  makeHandle,
  paddedRange,
  scalePosition,
  watchNarrow
} from './core'

export function createCompareMatrix(
  container: HTMLElement,
  rows: CompareRow[],
  opts?: { title?: string; refLabel?: string }
): VizHandle {
  const title = opts?.title ?? '与参照天体的对比'
  const refLabel = opts?.refLabel ?? '参照'
  const root = createEl('div', 'viz viz-compare-matrix')
  root.setAttribute('role', 'group')
  root.setAttribute('aria-label', `${title}（参照：${refLabel}）`)

  const head = createEl('div', 'viz-head')
  head.appendChild(createEl('span', 'viz-title', title))
  const logCount = rows.filter((row) => row.log ?? true).length
  const scaleText = logCount === 0 ? '线性' : logCount === rows.length ? '对数' : '对数/线性混合'
  const legend = createEl('span', 'viz-sub')
  const legendMark = createEl('span', 'viz-legend-mark')
  legend.appendChild(legendMark)
  legend.appendChild(document.createTextNode(` ${refLabel}刻度 · ${scaleText}`))
  head.appendChild(legend)
  root.appendChild(head)

  if (rows.length === 0) {
    root.appendChild(createEl('p', 'viz-empty', '暂无数据'))
    container.appendChild(root)
    return makeHandle(root, [])
  }

  const list = createEl('div', 'viz-rows')

  for (const row of rows) {
    const log = row.log ?? true
    const [lo, hi] = paddedRange([row.value, row.ref], log)
    const valuePct = scalePosition(row.value, lo, hi, log) * 100
    const refPct = scalePosition(row.ref, lo, hi, log) * 100
    const ratio = row.ref === 0 ? Number.NaN : row.value / row.ref
    const ratioText = formatMultiple(ratio)

    const el = createEl('div', 'viz-row viz-row-compare')
    el.tabIndex = 0
    el.setAttribute('role', 'img')
    el.setAttribute(
      'aria-label',
      `${row.label}：${formatValue(row.value, row.unit)}，${refLabel} ${formatValue(row.ref, row.unit)}，倍率 ${ratioText}`
    )
    if (row.better) el.dataset.better = row.better

    const main = createEl('div', 'viz-row-main')
    const name = createEl('span', 'viz-row-name', row.label)
    const track = createEl('div', 'viz-track')
    const bar = createEl('span', 'viz-bar')
    bar.style.setProperty('--w', `${valuePct.toFixed(2)}%`)
    const mark = createEl('span', 'viz-mark')
    mark.style.setProperty('--p', `${refPct.toFixed(2)}%`)
    track.appendChild(bar)
    track.appendChild(mark)

    const ratioEl = createEl('span', 'viz-row-ratio')
    ratioEl.textContent = ratioText
    ratioEl.classList.add(ratioClass(ratio, row.better))

    main.appendChild(name)
    main.appendChild(track)
    main.appendChild(ratioEl)
    el.appendChild(main)

    const noteText = row.note ?? `${formatValue(row.value, row.unit)} vs ${formatValue(row.ref, row.unit)}`
    el.appendChild(createEl('div', 'viz-row-note', noteText))

    list.appendChild(el)
  }

  root.appendChild(list)
  container.appendChild(root)
  return makeHandle(root, [watchNarrow(root)])
}

/** 按 better 语义给倍率着色：high = 越大越"强"，low = 越小越"好"。 */
function ratioClass(ratio: number, better: CompareRow['better']): string {
  if (!Number.isFinite(ratio) || ratio <= 0) return 'is-neutral'
  if (!better) return 'is-neutral'
  if (better === 'high') return ratio >= 1 ? 'is-good' : 'is-low'
  return ratio <= 1 ? 'is-good' : 'is-low'
}
