/**
 * createScaleCompare：对数尺度条。
 * 用于跨数量级比较（直径 / 距离 / 质量等）。hover 与键盘 focus 都会更新读数条，
 * 参照项（opts.refId）以高亮标记；窄屏自动改为纵向堆叠（样式见 viz.css）。
 */
import type { ScaleCompareOptions, ScaleItem, VizHandle } from './types'
import {
  createEl,
  formatMultiple,
  formatValue,
  makeHandle,
  on,
  paletteColor,
  scalePosition,
  paddedRange,
  watchNarrow
} from './core'

export function createScaleCompare(
  container: HTMLElement,
  items: ScaleItem[],
  opts?: ScaleCompareOptions
): VizHandle {
  const log = opts?.log ?? true
  const root = createEl('div', 'viz viz-scale-compare')
  const caption = opts?.caption ?? '尺度对比'
  root.setAttribute('role', 'group')
  root.setAttribute('aria-label', `${caption}（${log ? '对数刻度' : '线性刻度'}）`)

  const head = createEl('div', 'viz-head')
  head.appendChild(createEl('span', 'viz-title', caption))
  head.appendChild(createEl('span', 'viz-sub', log ? '对数刻度 · 跨数量级' : '线性刻度'))
  root.appendChild(head)

  const readout = createEl('div', 'viz-readout')
  readout.setAttribute('aria-hidden', 'true')
  const readName = createEl('span', 'viz-readout-name', '悬停或聚焦查看倍率')
  const readValue = createEl('span', 'viz-readout-value', '')
  const readRatio = createEl('span', 'viz-readout-ratio', '')
  readout.appendChild(readName)
  readout.appendChild(readValue)
  readout.appendChild(readRatio)
  root.appendChild(readout)

  const list = createEl('div', 'viz-rows')
  root.appendChild(list)

  if (items.length === 0) {
    list.appendChild(createEl('p', 'viz-empty', '暂无数据'))
    container.appendChild(root)
    return makeHandle(root, [])
  }

  const values = items.map((item) => item.value)
  const [lo, hi] = paddedRange(values, log)

  const refIndex = opts?.refId ? items.findIndex((item) => item.id === opts.refId) : -1
  const refItem = refIndex >= 0 ? items[refIndex] : undefined
  const ratioBase = refItem ?? items[0]

  const cleanups: Array<() => void> = []

  const setReadout = (item: ScaleItem): void => {
    readName.textContent = item.label
    readValue.textContent = formatValue(item.value, item.unit)
    const isBase = item === ratioBase
    readRatio.textContent = isBase
      ? ratioBase === refItem
        ? '参照项'
        : '基准项'
      : `${formatMultiple(item.value / ratioBase.value)} ${ratioBase.label}`
    readRatio.className = 'viz-readout-ratio' + (isBase ? ' is-base' : '')
  }

  const resetReadout = (): void => {
    readName.textContent = '悬停或聚焦查看倍率'
    readValue.textContent = ''
    readRatio.textContent = ''
    readRatio.className = 'viz-readout-ratio'
  }

  items.forEach((item, index) => {
    const row = createEl('div', 'viz-row viz-row-scale')
    row.tabIndex = 0
    row.setAttribute('role', 'img')
    row.style.setProperty('--viz-c', item.color ?? paletteColor(index))

    const isRef = item === refItem
    const ratioText =
      item === ratioBase
        ? isRef
          ? '参照项'
          : '基准项'
        : `${formatMultiple(item.value / ratioBase.value)} ${ratioBase.label}`
    const labelParts = [
      `${item.label}：${formatValue(item.value, item.unit)}`,
      ratioText,
      item.note ?? '',
      isRef ? '参照项' : ''
    ].filter((part) => part.length > 0)
    row.setAttribute('aria-label', labelParts.join('，'))

    const main = createEl('div', 'viz-row-main')
    const name = createEl('span', 'viz-row-name', item.label)
    if (isRef) name.appendChild(createEl('span', 'viz-tag', '参照'))
    const track = createEl('div', 'viz-track')
    const bar = createEl('span', 'viz-bar')
    bar.style.setProperty('--w', `${(scalePosition(item.value, lo, hi, log) * 100).toFixed(2)}%`)
    track.appendChild(bar)
    const value = createEl('span', 'viz-row-val', formatValue(item.value, item.unit))
    main.appendChild(name)
    main.appendChild(track)
    main.appendChild(value)
    row.appendChild(main)

    if (item.note) row.appendChild(createEl('div', 'viz-row-note', item.note))

    cleanups.push(on(row, 'pointerenter', () => setReadout(item)))
    cleanups.push(on(row, 'pointerleave', resetReadout))
    cleanups.push(on(row, 'focus', () => setReadout(item)))
    cleanups.push(on(row, 'blur', resetReadout))

    list.appendChild(row)
  })

  cleanups.push(watchNarrow(root))
  container.appendChild(root)
  return makeHandle(root, cleanups)
}
