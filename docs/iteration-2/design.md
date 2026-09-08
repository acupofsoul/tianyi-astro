# 迭代 2 · 数字化天文馆（设计 + 文件所有权契约）

日期：2026-09-09 · 状态：已获用户批准（"按这个方案开工"）

## 目标（用户原话拆解）

1. **更多数字化的视角来了解天文知识** → 数据可视化层：尺度对比、数值仪表、对比矩阵、图表。
2. **直观的 3D 视角画面** → 3D 交互层：时间控制、视角预设、点击拾取、场景内标注与标尺。
3. **考虑用户体验** → 快捷键、最近查看、搜索增强、加载态、移动端手势、深链。
4. **完善的交互和科幻感** → 视觉系统：等宽数字 / 发光描边 / 扫描线 / HUD 网格 / 数据流粒子，叠加在既有 Huashu 复古底之上。

## 并行工作流与文件所有权（硬约束：谁都不许改别人的文件）

| 工作流 | 独占文件 | 说明 |
|---|---|---|
| **Phase 0（编排者）** | `main.ts`、`src/styles/tokens.css`、`src/viz/types.ts`、`src/viz/index.ts`(stub)、`src/data/metrics.ts`(stub)、`src/viewer.ts`(API 骨架)、`src/styles/{hud,viz,viewer,detail,ux}.css`(stub)、`docs/`、`index.html` | 契约层，先落地 |
| **A 数据可视化** | `src/viz/**`(types.ts 只增不改)、`src/data/**`、`src/styles/viz.css` | 实现 `src/viz/types.ts` 的 VizApi |
| **B 3D 层** | `src/viewer.ts`、`src/scenes.ts`、`src/viewer/**`、`src/scenes/**`、`src/styles/viewer.css` | 保持 `src/viewer.ts` 已导出的 API 签名 |
| **C 详情页** | `src/ui/detail.ts`、`src/ui/detail/**`、`src/styles/detail.css` | 消费 A 的 VizApi 与 B 的 Viewer API |
| **D 首页/导航/UX** | `src/ui/home.ts`、`header.ts`、`browse.ts`、`search.ts`、`timeline.ts`、`src/ui/ux/**`、`src/styles/ux.css` | `renderSiteHeader(opts)` 签名保持向后兼容 |
| **E 科幻视觉系统** | `src/styles/hud.css`、`src/fx/hudBackground.ts`、`src/fx/**`(新增文件) | 只增不改既有 fx 文件 |

`src/catalog.ts`、`src/history.ts`、`src/textures.ts`、`src/ui/{router,dom}.ts` 本轮**只读**（需要新增数据时在自己的文件里写）。

## 契约

### 数据可视化（`src/viz/types.ts`，A 实现、C 消费）

```ts
export interface VizHandle { readonly el: HTMLElement; dispose(): void }
export interface ScaleItem { id: string; label: string; value: number; unit: string; note?: string; color?: string }
export interface ScaleCompareOptions { log?: boolean; refId?: string; caption?: string }
export interface GaugeSpec { label: string; value: number; unit: string; ref?: number; refLabel?: string; min?: number; max?: number; log?: boolean; digits?: number; note?: string }
export interface CompareRow { label: string; unit: string; value: number; ref: number; log?: boolean; better?: 'high' | 'low'; note?: string }
export interface BarDatum { label: string; value: number; unit?: string; color?: string }
export interface VizApi {
  createScaleCompare(container: HTMLElement, items: ScaleItem[], opts?: ScaleCompareOptions): VizHandle
  createGaugeGrid(container: HTMLElement, specs: GaugeSpec[]): VizHandle
  createCompareMatrix(container: HTMLElement, rows: CompareRow[], opts?: { title?: string; refLabel?: string }): VizHandle
  createBarChart(container: HTMLElement, data: BarDatum[], opts?: { title?: string; log?: boolean }): VizHandle
}
```

### 指标数据（`src/data/metrics.ts`，A 实现）

```ts
export interface EntryMetrics { refName: string; scales: ScaleItem[]; gauges: GaugeSpec[]; compare: CompareRow[] }
export function getMetrics(id: string): EntryMetrics | undefined
```

### 3D 层（`src/viewer.ts`，B 实现）

已有：`load / start / stop / playIntro / setAutoRotate / isAutoRotate / resetView / resize / dispose`。
本轮新增（Phase 0 已给出骨架实现，B 必须保留签名并强化）：

```ts
setTimeScale(k: number): void; getTimeScale(): number
setPaused(v: boolean): void; isPaused(): boolean
presets(): ViewPreset[]; applyPreset(id: string): void
capture(): string; onPick(cb: (info: PickInfo | null) => void): void
setPickEnabled(v: boolean): void; getHandle(): SceneHandle | null
setOverlay(id: 'orbits' | 'labels' | 'scale', on: boolean): void; isOverlay(id): boolean
```

时间倍率范围：**0.1–32**（与 UI 滑块 9 档 0.1/0.25/0.5/1/2/4/8/16/32 对齐；初版契约写 20，集成阶段按 UI 放宽为 32）。

## 验收标准

- `npx tsc --noEmit` 通过（`strict: true`，不许 `any` 逃逸，不许 `@ts-ignore`）
- `npm run build` 通过，产物在 `dist/`
- headless Edge 截图逐页目检：`/`、`#/browse`、`#/timeline`、`#/p/blackhole`、`#/p/saturn`、`#/p/solar-system`
- 不新增运行时依赖；不改 `package.json`；不碰 git（由编排者统一提交）
- 移动端 375px 宽不出现横向滚动
