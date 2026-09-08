/**
 * 数据可视化层入口（工作流 A 实现，替换 Phase 0 占位）。
 * 四个组件均为纯 DOM/SVG 实现，无第三方依赖；返回 VizHandle，dispose 会清理
 * 事件监听器、rAF 与 observer。
 */
import type {
  VizApi,
  VizHandle,
  ScaleItem,
  ScaleCompareOptions,
  GaugeSpec,
  CompareRow,
  BarDatum
} from './types'
import { createScaleCompare } from './scaleCompare'
import { createGaugeGrid } from './gaugeGrid'
import { createCompareMatrix } from './compareMatrix'
import { createBarChart } from './barChart'

export const viz: VizApi = {
  createScaleCompare(container: HTMLElement, items: ScaleItem[], opts?: ScaleCompareOptions): VizHandle {
    return createScaleCompare(container, items, opts)
  },
  createGaugeGrid(container: HTMLElement, specs: GaugeSpec[]): VizHandle {
    return createGaugeGrid(container, specs)
  },
  createCompareMatrix(
    container: HTMLElement,
    rows: CompareRow[],
    opts?: { title?: string; refLabel?: string }
  ): VizHandle {
    return createCompareMatrix(container, rows, opts)
  },
  createBarChart(container: HTMLElement, data: BarDatum[], opts?: { title?: string; log?: boolean }): VizHandle {
    return createBarChart(container, data, opts)
  }
}

export { createScaleCompare, createGaugeGrid, createCompareMatrix, createBarChart }
export type { VizApi, VizHandle, ScaleItem, ScaleCompareOptions, GaugeSpec, CompareRow, BarDatum }
