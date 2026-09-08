/**
 * 详情页四个标签页的内容渲染（工作流 C；第三轮迭代改为按需加载可视化）。
 *
 * 数据标签页：表格（来自 entry.facts）同步渲染，保证永远有内容；
 * 图表所需的 metrics 数据与 viz 组件是独立 chunk，只有真正打开「数据」页时才
 * 动态 import，失败时降级为纯表格，绝不白屏。
 */
import type { CatalogEntry } from '../../types'
import type { EntryMetrics } from '../../data/metrics'
import type { VizApi, VizHandle } from '../../viz/types'
import { entryHistory } from '../../history'
import { el } from '../dom'

export type DetailTab = 'intro' | 'science' | 'facts' | 'history'

/** 标签顺序即键盘 1~4 的映射顺序。 */
export const TAB_LIST: readonly { id: DetailTab; label: string; key: string }[] = [
  { id: 'intro', label: '介绍', key: '1' },
  { id: 'science', label: '原理', key: '2' },
  { id: 'facts', label: '数据', key: '3' },
  { id: 'history', label: '历史', key: '4' }
]

export function isDetailTab(v: string | null | undefined): v is DetailTab {
  return v === 'intro' || v === 'science' || v === 'facts' || v === 'history'
}

export interface PanelResult {
  el: HTMLElement
  /** 由可视化层创建、需要在切标签时 dispose 的实例。 */
  handles: VizHandle[]
  /** 取消尚未完成的异步渲染（切标签 / 离开页面），避免迟到的回调写入已卸载的 DOM。 */
  cancel?: () => void
}

export function renderPanel(tab: DetailTab, entry: CatalogEntry): PanelResult {
  switch (tab) {
    case 'intro':
      return textPanel(entry.intro, '展项简介')
    case 'science':
      return textPanel(entry.science, '科学原理')
    case 'facts':
      return factsPanel(entry)
    case 'history':
      return historyPanel(entry)
    default:
      return textPanel(entry.intro, '展项简介')
  }
}

// ------------------------------------------------------------------ 纯文本

function textPanel(text: string, label: string): PanelResult {
  const box = el('div', 'dt-tab-body')
  box.appendChild(el('div', 'hud-label dt-tab-kicker', label))
  box.appendChild(el('p', 'tab-text', text))
  return { el: box, handles: [] }
}

// -------------------------------------------------------------------- 数据

function safeMetrics(id: string, getMetrics: (id: string) => EntryMetrics | undefined): EntryMetrics | undefined {
  try {
    return getMetrics(id) ?? undefined
  } catch {
    return undefined
  }
}

function factsPanel(entry: CatalogEntry): PanelResult {
  const box = el('div', 'dt-tab-body dt-facts')
  const handles: VizHandle[] = []
  let cancelled = false

  // 图表区先占位：metrics 数据与 viz 组件都是独立 chunk，打开「数据」页时才下载
  const charts = el('div', 'dt-charts')
  const skeleton = el('div', 'dt-charts-skeleton hud-frame')
  skeleton.appendChild(el('span', 'hud-label dt-charts-skeleton-tag', 'LOADING VIZ'))
  skeleton.appendChild(el('p', 'dt-charts-skeleton-text', '正在加载数据可视化组件…'))
  charts.appendChild(skeleton)
  box.appendChild(charts)

  // 表格只依赖 entry.facts，同步渲染：即使可视化组件下载失败也有内容可读
  const tableHead = el('div', 'dt-facts-head')
  tableHead.appendChild(el('div', 'hud-label dt-tab-kicker', '观测数据'))
  box.appendChild(tableHead)

  const table = el('table', 'dt-table')
  const tbody = el('tbody')
  for (const f of entry.facts) {
    const tr = el('tr')
    const th = el('th')
    th.scope = 'row'
    th.textContent = f.label
    const td = el('td')
    td.textContent = f.value
    tr.appendChild(th)
    tr.appendChild(td)
    tbody.appendChild(tr)
  }
  table.appendChild(tbody)
  box.appendChild(table)

  void (async () => {
    let getMetrics: (id: string) => EntryMetrics | undefined
    let viz: VizApi
    try {
      const [metricsMod, vizMod] = await Promise.all([import('../../data/metrics'), import('../../viz')])
      getMetrics = metricsMod.getMetrics
      viz = vizMod.viz
    } catch {
      if (cancelled) return
      charts.replaceChildren(
        el('p', 'dt-viz-fallback', '数据可视化组件加载失败，下方表格为原始数据。')
      )
      return
    }
    if (cancelled) return

    const metrics = safeMetrics(entry.id, getMetrics)
    const hasMetrics =
      !!metrics && metrics.scales.length + metrics.gauges.length + metrics.compare.length > 0

    if (!metrics || !hasMetrics) {
      charts.replaceChildren(
        el('p', 'dt-lead', '该展项暂未接入量化可视化，以下为展项自带的观测数据表。')
      )
      return
    }

    const parts: HTMLElement[] = []
    parts.push(
      el(
        'p',
        'dt-lead',
        `下方图表以「${metrics.refName}」为参照，把 ${entry.name} 的关键数值放到同一量级上对照。数值取自公开发表的近似值，单位随图表标注，未做精度补零。`
      )
    )

    if (metrics.scales.length > 0) {
      const block = vizBlock('尺度对比', 'SCALE / LOG')
      const refId = metrics.scales.find((s) => s.label === metrics.refName)?.id ?? metrics.scales[0]?.id
      try {
        handles.push(
          viz.createScaleCompare(block.host, metrics.scales, {
            log: true,
            refId,
            caption: `对数刻度 · 参照天体：${metrics.refName}`
          })
        )
      } catch {
        vizFailed(block.host, '尺度对比图未能渲染，可查看下方原始数据。')
      }
      parts.push(block.box)
    }

    if (metrics.gauges.length > 0) {
      const block = vizBlock('数值仪表', 'GAUGE GRID')
      try {
        handles.push(viz.createGaugeGrid(block.host, metrics.gauges))
      } catch {
        vizFailed(block.host, '数值仪表未能渲染，可查看下方原始数据。')
      }
      parts.push(block.box)
    }

    if (metrics.compare.length > 0) {
      const block = vizBlock('对比矩阵', 'MATRIX')
      try {
        handles.push(
          viz.createCompareMatrix(block.host, metrics.compare, {
            title: `${entry.name} / ${metrics.refName}`,
            refLabel: metrics.refName
          })
        )
      } catch {
        vizFailed(block.host, '对比矩阵未能渲染，可查看下方原始数据。')
      }
      parts.push(block.box)
    }

    charts.replaceChildren(...parts)
  })()

  return {
    el: box,
    handles,
    cancel: () => {
      cancelled = true
    }
  }
}

function vizBlock(title: string, tag: string): { box: HTMLElement; host: HTMLElement } {
  const box = el('section', 'dt-viz-block hud-frame')
  const head = el('div', 'dt-viz-head')
  head.appendChild(el('h3', 'dt-viz-title', title))
  head.appendChild(el('span', 'hud-label dt-viz-tag', tag))
  box.appendChild(head)
  const host = el('div', 'dt-viz-host')
  box.appendChild(host)
  return { box, host }
}

function vizFailed(host: HTMLElement, msg: string) {
  host.replaceChildren(el('p', 'dt-viz-fallback', msg))
}

// -------------------------------------------------------------------- 历史

function historyPanel(entry: CatalogEntry): PanelResult {
  const box = el('div', 'dt-tab-body')
  box.appendChild(el('div', 'hud-label dt-tab-kicker', '观测与发现史'))
  const events = entryHistory[entry.id] ?? []
  if (events.length === 0) {
    box.appendChild(el('p', 'tab-text', '暂无该展项的专门历史条目，可在「天文史」页查看全局时间轴。'))
    return { el: box, handles: [] }
  }
  const tl = el('div', 'local-timeline')
  for (const ev of events) {
    const node = el('div', 't-event')
    const year = el('div', 't-year')
    year.textContent = ev.year
    const body = el('div', 't-body')
    const h3 = el('h3')
    h3.textContent = ev.title
    const p = el('p')
    p.textContent = ev.text
    body.appendChild(h3)
    body.appendChild(p)
    node.appendChild(year)
    node.appendChild(body)
    tl.appendChild(node)
  }
  box.appendChild(tl)
  return { el: box, handles: [] }
}
