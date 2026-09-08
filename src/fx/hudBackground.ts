/**
 * HUD 背景层（工作流 E · 科幻视觉系统）
 * ---------------------------------------------------------------
 * 纯 Canvas 2D 实现（不引入 WebGL / 不引入任何依赖），由三部分组成：
 *   1. 缓慢漂移的细网格 + 固定主刻度 + 边缘刻度尺（"仪器台面"）
 *   2. 向下流动的数据流粒子（带拖尾）
 *   3. 自下而上缓慢扫过的扫描带
 *
 * 性能与降级：
 *   - 每帧用 performance.now() 计时，维护最近 120 帧样本（avg / p95 / max）；
 *   - 注意：Chromium 的 Canvas2D 是"延迟光栅化"的，performance.now() 包住 draw 只能量到
 *     命令录制成本，真正的光栅化发生在别处。因此预算判定 = 脚本耗时超预算 或 帧间隔中位数
 *     连续偏低（掉帧）。触发后按 渲染分辨率 → 粒子数 的顺序降级：
 *       renderScale 1 → 0.75 → 0.5，quality 1 → 0.5 → 0.3；
 *   - 默认 budgetMs = 3ms/帧、maxDpr = 1.5；真实耗时与当前降级档位可用 getStats() 读取；
 *   - prefers-reduced-motion: reduce 时只渲染一帧静态画面，不启动 rAF；
 *   - document.hidden 时暂停 rAF，恢复可见后继续；
 *   - 窗口 / 容器尺寸变化由 ResizeObserver + window.resize 共同处理；
 *   - dispose() 移除画布、监听器与观察者，可安全重复调用。
 *
 * 用法（容器需为定位上下文，若不是，构造时会临时补 position:relative 并在 dispose 时还原）：
 *   const bg = new HudBackground(host, { gridSize: 64 })
 *   bg.start()
 *   // 页面卸载 / 路由切换
 *   bg.dispose()
 */

/** 构造参数（全部可选，均有默认值） */
export interface HudBackgroundOptions {
  /** 网格间距（CSS px），默认 64 */
  gridSize?: number
  /** 细网格漂移速度（px/s），默认 4（很慢，不抢注意力） */
  gridSpeed?: number
  /** 数据流粒子数量；省略或 <= 0 时按容器面积自适应（约每 26000 px² 一条，钳制在 16~80） */
  streams?: number
  /** 扫描带移动速度（px/s），默认 46 */
  scanSpeed?: number
  /** 主色 RGB 分量，逗号分隔，默认 '95,214,255'（HUD 青） */
  tint?: string
  /** 整体不透明度，默认 0.7 */
  opacity?: number
  /** 每帧耗时预算（ms），默认 3 */
  budgetMs?: number
  /** 设备像素比上限，默认 1.5（背景层不需要 2x 精度，可显著降低填充率） */
  maxDpr?: number
  /** 画布 z-index，默认 0 */
  zIndex?: number
}

/** 运行状态与耗时统计（getStats() 返回值） */
export interface HudBackgroundStats {
  /** 已渲染帧数 */
  frames: number
  /** 最近样本平均每帧耗时（ms） */
  avgMs: number
  /** 最近样本 p95 每帧耗时（ms） */
  p95Ms: number
  /** 峰值每帧耗时（ms） */
  maxMs: number
  /** 当前画质系数（1 = 未降级；仅影响粒子数量） */
  quality: number
  /** 当前渲染分辨率系数（1 = 未降级；0.75 / 0.5 为自动降级档） */
  renderScale: number
  /** 当前参与绘制的粒子数 */
  activeStreams: number
  /** 目标粒子总数 */
  totalStreams: number
  /** 预算（ms/帧），针对脚本耗时 */
  budgetMs: number
  /** 脚本耗时超过预算的帧数 */
  overBudgetFrames: number
  /** 帧间隔 > 22ms（掉帧）的帧数 */
  jankFrames: number
  /** 最近帧间隔中位数（ms） */
  medianIntervalMs: number
  /** 是否处于 reduced-motion 降级 */
  reducedMotion: boolean
  /** 是否在运行（reduced-motion 下 running=true 但只画静态帧） */
  running: boolean
  /** 页面是否可见 */
  visible: boolean
  /** 画布逻辑尺寸（CSS px） */
  width: number
  /** 画布逻辑尺寸（CSS px） */
  height: number
  /** 实际使用的设备像素比（已钳制到 maxDpr） */
  dpr: number
}

/** 一条数据流粒子 */
interface StreamParticle {
  x: number
  y: number
  len: number
  /** 下落速度（px/s） */
  speed: number
  /** 基础不透明度（0~1） */
  alpha: number
  /** 预计算的颜色字符串，避免每帧拼接 */
  color: string
}

/** 内部已解析的配置 */
interface ResolvedOptions {
  gridSize: number
  gridSpeed: number
  streams: number
  scanSpeed: number
  tint: string
  opacity: number
  budgetMs: number
  maxDpr: number
  zIndex: number
}

const SAMPLE_WINDOW = 120
const ADAPT_INTERVAL = 90
/** 帧间隔超过该值视为掉帧（60fps 的 16.7ms 留出余量） */
const JANK_MS = 22

const DEFAULTS: ResolvedOptions = {
  gridSize: 64,
  gridSpeed: 4,
  streams: 0,
  scanSpeed: 46,
  tint: '95,214,255',
  opacity: 0.7,
  budgetMs: 3,
  maxDpr: 1.5,
  zIndex: 0
}

export class HudBackground {
  private readonly container: HTMLElement
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly options: ResolvedOptions
  private readonly motionQuery: MediaQueryList | null
  /** 构造时若容器不是定位上下文，记录原始 inline position 以便 dispose 还原 */
  private readonly restorePosition: string | null

  private resizeObserver: ResizeObserver | null = null
  private rafId = 0
  private running = false
  private visible = true
  private disposed = false
  private lastTs = 0
  private width = 0
  private height = 0
  private dpr = 1
  private gridPhase = 0
  private scanY = 0
  private scanGradient: CanvasGradient | null = null
  private streams: StreamParticle[] = []
  private activeStreams = 0
  private quality = 1
  private renderScale = 1
  private frames = 0
  private maxMs = 0
  private overBudgetFrames = 0
  private jankFrames = 0
  private intervalCursor = 0
  private readonly intervals: number[] = []
  private readonly samples: number[] = []
  private sampleCursor = 0

  constructor(container: HTMLElement, options: HudBackgroundOptions = {}) {
    this.container = container
    this.options = {
      gridSize: options.gridSize ?? DEFAULTS.gridSize,
      gridSpeed: options.gridSpeed ?? DEFAULTS.gridSpeed,
      streams: options.streams ?? DEFAULTS.streams,
      scanSpeed: options.scanSpeed ?? DEFAULTS.scanSpeed,
      tint: options.tint ?? DEFAULTS.tint,
      opacity: options.opacity ?? DEFAULTS.opacity,
      budgetMs: options.budgetMs ?? DEFAULTS.budgetMs,
      maxDpr: options.maxDpr ?? DEFAULTS.maxDpr,
      zIndex: options.zIndex ?? DEFAULTS.zIndex
    }

    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:' +
      String(this.options.zIndex)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('HudBackground: 无法获取 2D 上下文')

    this.canvas = canvas
    this.ctx = ctx

    // 容器不是定位上下文时临时补上，保证绝对定位生效
    let restore: string | null = null
    if (getComputedStyle(container).position === 'static') {
      restore = container.style.position
      container.style.position = 'relative'
    }
    this.restorePosition = restore

    container.appendChild(canvas)

    this.motionQuery =
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

    document.addEventListener('visibilitychange', this.handleVisibility)
    window.addEventListener('resize', this.handleResize)
    if (this.motionQuery) this.motionQuery.addEventListener('change', this.handleMotionChange)

    if (typeof ResizeObserver === 'function') {
      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(container)
    }

    this.visible = !document.hidden
    this.resize()
  }

  /** 是否处于 prefers-reduced-motion: reduce */
  get reducedMotion(): boolean {
    return this.motionQuery !== null && this.motionQuery.matches
  }

  /** 是否正在运行 */
  get isRunning(): boolean {
    return this.running
  }

  /** 启动渲染循环（reduced-motion 下只渲染一帧静态画面） */
  start(): void {
    if (this.disposed || this.running) return
    this.running = true
    this.lastTs = 0
    if (this.reducedMotion || !this.visible) {
      this.render(1 / 60)
      return
    }
    this.rafId = requestAnimationFrame(this.handleFrame)
  }

  /** 停止渲染循环（画布保留最后一帧） */
  stop(): void {
    this.running = false
    if (this.rafId !== 0) cancelAnimationFrame(this.rafId)
    this.rafId = 0
    this.lastTs = 0
  }

  /** 手动触发一次尺寸重算 */
  resize(): void {
    this.handleResize()
  }

  /** 读取耗时统计（会做一次排序，调用不宜过频） */
  getStats(): HudBackgroundStats {
    const sorted = this.samples.slice().sort((a, b) => a - b)
    const avg = sorted.length > 0 ? sorted.reduce((sum, v) => sum + v, 0) / sorted.length : 0
    const p95 =
      sorted.length > 0 ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0
    return {
      frames: this.frames,
      avgMs: round3(avg),
      p95Ms: round3(p95),
      maxMs: round3(this.maxMs),
      quality: this.quality,
      renderScale: this.renderScale,
      activeStreams: this.activeStreams,
      totalStreams: this.streams.length,
      budgetMs: this.options.budgetMs,
      overBudgetFrames: this.overBudgetFrames,
      jankFrames: this.jankFrames,
      medianIntervalMs: round3(median(this.intervals)),
      reducedMotion: this.reducedMotion,
      running: this.running,
      visible: this.visible,
      width: this.width,
      height: this.height,
      dpr: this.dpr
    }
  }

  /** 移除画布与所有监听器；可重复调用 */
  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.stop()
    this.resizeObserver?.disconnect()
    this.resizeObserver = null
    document.removeEventListener('visibilitychange', this.handleVisibility)
    window.removeEventListener('resize', this.handleResize)
    this.motionQuery?.removeEventListener('change', this.handleMotionChange)
    this.streams = []
    this.samples.length = 0
    this.scanGradient = null
    if (this.canvas.parentElement === this.container) this.container.removeChild(this.canvas)
    if (this.restorePosition !== null) this.container.style.position = this.restorePosition
  }

  // ------------------------------------------------------------ 内部实现

  private readonly handleResize = (): void => {
    if (this.disposed) return
    const rect = this.container.getBoundingClientRect()
    const cap = Math.min(window.devicePixelRatio || 1, Math.max(1, this.options.maxDpr))
    // renderScale 是自动降级档：直接按面积削减填充率
    this.dpr = Math.max(0.5, cap * this.renderScale)
    this.width = Math.max(1, Math.round(rect.width))
    this.height = Math.max(1, Math.round(rect.height))
    this.canvas.width = Math.max(1, Math.floor(this.width * this.dpr))
    this.canvas.height = Math.max(1, Math.floor(this.height * this.dpr))
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.buildScanGradient()
    this.rebuildStreams()
    if (!this.running || this.reducedMotion) this.render(1 / 60)
  }

  private readonly handleVisibility = (): void => {
    this.visible = !document.hidden
    if (this.disposed || !this.running) return
    if (!this.visible) {
      if (this.rafId !== 0) cancelAnimationFrame(this.rafId)
      this.rafId = 0
      return
    }
    this.lastTs = 0
    if (!this.reducedMotion && this.rafId === 0) this.rafId = requestAnimationFrame(this.handleFrame)
  }

  private readonly handleMotionChange = (): void => {
    if (this.disposed || !this.running) return
    if (this.reducedMotion) {
      if (this.rafId !== 0) cancelAnimationFrame(this.rafId)
      this.rafId = 0
      this.render(1 / 60)
      return
    }
    if (this.visible && this.rafId === 0) {
      this.lastTs = 0
      this.rafId = requestAnimationFrame(this.handleFrame)
    }
  }

  private readonly handleFrame = (ts: number): void => {
    if (this.disposed || !this.running) return
    if (!this.visible || this.reducedMotion) {
      this.rafId = 0
      return
    }

    let dt = this.lastTs === 0 ? 1 / 60 : (ts - this.lastTs) / 1000
    if (this.lastTs !== 0) {
      const interval = ts - this.lastTs
      if (interval > 0 && interval < 1000) {
        if (interval > JANK_MS) this.jankFrames++
        if (this.intervals.length < 60) this.intervals.push(interval)
        else this.intervals[this.intervalCursor] = interval
        this.intervalCursor = (this.intervalCursor + 1) % 60
      }
    }
    this.lastTs = ts
    if (!(dt > 0)) dt = 1 / 60
    if (dt > 0.1) dt = 0.1 // 标签页卡顿后不做大跳跃

    const start = performance.now()
    this.render(dt)
    this.recordSample(performance.now() - start)

    this.rafId = requestAnimationFrame(this.handleFrame)
  }

  private recordSample(ms: number): void {
    this.frames++
    if (ms > this.maxMs) this.maxMs = ms
    if (ms > this.options.budgetMs) this.overBudgetFrames++

    if (this.samples.length < SAMPLE_WINDOW) {
      this.samples.push(ms)
    } else {
      this.samples[this.sampleCursor] = ms
      this.sampleCursor = (this.sampleCursor + 1) % SAMPLE_WINDOW
    }

    if (this.frames % ADAPT_INTERVAL === 0) this.adaptLoad()
  }

  /**
   * 负载自适应（只降不升，避免抖动）。
   * 触发条件：脚本耗时超预算，或帧间隔中位数明显掉帧。
   * 降级顺序：先削分辨率（填充率是大头），再削粒子数量。
   */
  private adaptLoad(): void {
    if (this.samples.length === 0) return
    const avg = this.samples.reduce((sum, v) => sum + v, 0) / this.samples.length
    const med = median(this.intervals)
    const overloaded = avg > this.options.budgetMs || med > JANK_MS

    if (!overloaded) return
    if (this.renderScale > 0.6) {
      this.renderScale = 0.75
      this.applyScale()
      return
    }
    if (this.quality > 0.6) {
      this.quality = 0.5
      this.applyQuality()
      return
    }
    if (this.renderScale > 0.35) {
      this.renderScale = 0.5
      this.applyScale()
      return
    }
    if (this.quality > 0.3) {
      this.quality = 0.3
      this.applyQuality()
    }
  }

  /** 应用分辨率降级档：重建画布并清空样本，让下一轮评估反映新成本 */
  private applyScale(): void {
    this.samples.length = 0
    this.sampleCursor = 0
    this.intervals.length = 0
    this.intervalCursor = 0
    this.handleResize()
  }

  private applyQuality(): void {
    this.activeStreams = Math.max(6, Math.round(this.streams.length * this.quality))
  }

  private buildScanGradient(): void {
    const band = Math.max(96, this.height * 0.16)
    const grad = this.ctx.createLinearGradient(0, -band / 2, 0, band / 2)
    grad.addColorStop(0, 'rgba(' + this.options.tint + ',0)')
    grad.addColorStop(0.5, 'rgba(' + this.options.tint + ',0.1)')
    grad.addColorStop(1, 'rgba(' + this.options.tint + ',0)')
    this.scanGradient = grad
  }

  private rebuildStreams(): void {
    const auto = Math.round((this.width * this.height) / 26000)
    const target =
      this.options.streams > 0 ? this.options.streams : Math.min(80, Math.max(16, auto))
    const next: StreamParticle[] = []
    for (let i = 0; i < target; i++) {
      const prev = this.streams[i]
      next.push(prev !== undefined ? prev : this.createStream(true))
    }
    this.streams = next
    this.applyQuality()
  }

  private createStream(spread: boolean): StreamParticle {
    return {
      x: Math.random() * this.width,
      y: spread ? Math.random() * this.height : -Math.random() * this.height * 0.4,
      len: 18 + Math.random() * 70,
      speed: 40 + Math.random() * 120,
      alpha: 0.1 + Math.random() * 0.28,
      color: 'rgba(' + this.options.tint + ',1)'
    }
  }

  // ------------------------------------------------------------- 绘制

  private render(dt: number): void {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.globalAlpha = this.options.opacity
    this.drawGrid(dt)
    this.drawStreams(dt)
    this.drawScan(dt)
    ctx.globalAlpha = 1
  }

  private drawGrid(dt: number): void {
    const ctx = this.ctx
    const w = this.width
    const h = this.height
    const g = Math.max(24, this.options.gridSize)
    const tint = this.options.tint

    // 细网格：整体缓慢漂移
    this.gridPhase = (this.gridPhase + dt * this.options.gridSpeed) % g
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(' + tint + ',0.07)'
    ctx.beginPath()
    for (let x = this.gridPhase - g; x <= w + g; x += g) {
      const px = Math.round(x) + 0.5
      ctx.moveTo(px, 0)
      ctx.lineTo(px, h)
    }
    for (let y = this.gridPhase - g; y <= h + g; y += g) {
      const py = Math.round(y) + 0.5
      ctx.moveTo(0, py)
      ctx.lineTo(w, py)
    }
    ctx.stroke()

    // 主刻度：固定不漂移，每 4 格一条
    const coarse = g * 4
    ctx.strokeStyle = 'rgba(' + tint + ',0.12)'
    ctx.beginPath()
    for (let x = 0; x <= w; x += coarse) {
      const px = Math.round(x) + 0.5
      ctx.moveTo(px, 0)
      ctx.lineTo(px, h)
    }
    for (let y = 0; y <= h; y += coarse) {
      const py = Math.round(y) + 0.5
      ctx.moveTo(0, py)
      ctx.lineTo(w, py)
    }
    ctx.stroke()

    // 四边刻度尺
    ctx.strokeStyle = 'rgba(' + tint + ',0.2)'
    ctx.beginPath()
    for (let x = 0; x <= w; x += g) {
      const px = Math.round(x) + 0.5
      ctx.moveTo(px, 0)
      ctx.lineTo(px, 6)
      ctx.moveTo(px, h - 6)
      ctx.lineTo(px, h)
    }
    for (let y = 0; y <= h; y += g) {
      const py = Math.round(y) + 0.5
      ctx.moveTo(0, py)
      ctx.lineTo(6, py)
      ctx.moveTo(w - 6, py)
      ctx.lineTo(w, py)
    }
    ctx.stroke()
  }

  private drawStreams(dt: number): void {
    const ctx = this.ctx
    const w = this.width
    const h = this.height
    const count = Math.min(this.streams.length, this.activeStreams)
    ctx.lineWidth = 1
    for (let i = 0; i < count; i++) {
      const s = this.streams[i]
      s.y += s.speed * dt
      if (s.y - s.len > h) {
        s.y = -s.len - Math.random() * h * 0.4
        s.x = Math.random() * w
        s.speed = 40 + Math.random() * 120
        s.len = 18 + Math.random() * 70
        s.alpha = 0.1 + Math.random() * 0.28
      }
      ctx.strokeStyle = s.color
      ctx.globalAlpha = this.options.opacity * s.alpha
      ctx.beginPath()
      ctx.moveTo(s.x, s.y - s.len)
      ctx.lineTo(s.x, s.y)
      ctx.stroke()

      // 粒子头部亮点
      ctx.fillStyle = s.color
      ctx.globalAlpha = this.options.opacity * Math.min(1, s.alpha * 3)
      ctx.fillRect(s.x - 0.5, s.y - 1, 1, 2)
    }
    ctx.globalAlpha = this.options.opacity
  }

  private drawScan(dt: number): void {
    const ctx = this.ctx
    const w = this.width
    const h = this.height
    const band = Math.max(96, h * 0.16)

    this.scanY += dt * this.options.scanSpeed
    if (this.scanY > h + band) this.scanY = -band

    if (this.scanGradient) {
      ctx.save()
      ctx.translate(0, this.scanY)
      ctx.fillStyle = this.scanGradient
      ctx.fillRect(0, -band / 2, w, band)
      ctx.fillStyle = 'rgba(' + this.options.tint + ',0.1)'
      ctx.fillRect(0, -0.5, w, 1)
      ctx.restore()
    }
  }
}

/** 便捷挂载：创建并立即启动 */
export function mountHudBackground(container: HTMLElement, options?: HudBackgroundOptions): HudBackground {
  const bg = new HudBackground(container, options)
  bg.start()
  return bg
}

/**
 * 一步挂载（推荐给入口文件用）：自建一个全屏 fixed 宿主层再启动。
 * 层级 z-index 默认 1 —— 与 hud.css 的 body::before 网格同层：
 * 位于全屏 3D canvas 之上、正文（z-index ≥2 的面板/内容）之下，且 pointer-events:none 不吃交互。
 *
 * 用法（main.ts 里一行接入，无需改 DOM）：
 *   import { attachHudBackground } from './fx/hudBackground'
 *   const hudBg = attachHudBackground({ opacity: 0.6 })
 *   // 需要时 hudBg.dispose()（会连同宿主层一起移除）
 */
export function attachHudBackground(options?: HudBackgroundOptions): HudBackground {
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:' + String(options?.zIndex ?? 1)
  document.body.appendChild(host)

  const bg = new HudBackground(host, options)
  const baseDispose = bg.dispose.bind(bg)
  bg.dispose = (): void => {
    baseDispose()
    host.remove()
  }
  bg.start()
  return bg
}

function round3(v: number): number {
  return Math.round(v * 1000) / 1000
}

/** 中位数（输入不被修改） */
function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = values.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}
