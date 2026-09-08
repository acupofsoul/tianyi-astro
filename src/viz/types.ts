/**
 * 数据可视化层契约（Phase 0 定义）。
 * 工作流 A 在 src/viz/index.ts 中实现 VizApi；工作流 C 直接消费这些类型。
 * 规则：类型只增不改（新增字段必须是可选的），不得破坏已有签名。
 */

/** 一个可视化实例：插入到容器里的一块 DOM，卸载时调用 dispose。 */
export interface VizHandle {
  readonly el: HTMLElement
  dispose(): void
}

/** 尺度对比条上的一项（用于尺寸/距离/温度等跨数量级比较）。 */
export interface ScaleItem {
  id: string
  label: string
  value: number
  unit: string
  /** 短注释，例如 "= 11.2 个地球直径" */
  note?: string
  color?: string
}

export interface ScaleCompareOptions {
  /** 对数刻度（默认 true，跨数量级必须用） */
  log?: boolean
  /** 参照项 id，会以高亮标记 */
  refId?: string
  caption?: string
}

/** 单个数值仪表。 */
export interface GaugeSpec {
  label: string
  value: number
  unit: string
  /** 参照值（通常是地球），用于画刻度标记 */
  ref?: number
  refLabel?: string
  min?: number
  max?: number
  log?: boolean
  digits?: number
  note?: string
}

/** 与参照天体的多指标对比行。 */
export interface CompareRow {
  label: string
  unit: string
  value: number
  ref: number
  log?: boolean
  /** 哪一端更"大/强"更符合直觉，用于配色提示 */
  better?: 'high' | 'low'
  note?: string
}

export interface BarDatum {
  label: string
  value: number
  unit?: string
  color?: string
}

export interface VizApi {
  createScaleCompare(container: HTMLElement, items: ScaleItem[], opts?: ScaleCompareOptions): VizHandle
  createGaugeGrid(container: HTMLElement, specs: GaugeSpec[]): VizHandle
  createCompareMatrix(
    container: HTMLElement,
    rows: CompareRow[],
    opts?: { title?: string; refLabel?: string }
  ): VizHandle
  createBarChart(container: HTMLElement, data: BarDatum[], opts?: { title?: string; log?: boolean }): VizHandle
}
