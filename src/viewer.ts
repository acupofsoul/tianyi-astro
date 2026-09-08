import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { SceneHandle } from './scenes'
import { updateLabelScales } from './scenes/props'
import { PickHighlight } from './viewer/highlight'

/** 视角预设（Phase 0 契约；工作流 B 可扩展字段，但不得改 id 语义）。 */
export interface ViewPreset {
  id: 'near' | 'orbit' | 'top' | 'side'
  label: string
  position: [number, number, number]
  target: [number, number, number]
}

/** 点击拾取结果（工作流 B 负责在场景里打标记，这里只描述结构）。 */
export interface PickInfo {
  /** 显示名，例如 "大红斑" / "木星" */
  name: string
  /** 场景内命中点（世界坐标） */
  point: [number, number, number]
  object: THREE.Object3D
}

/** 可视化辅助层 id。 */
export type OverlayId = 'orbits' | 'labels' | 'scale'

/** 渲染统计（用于性能自测 / HUD 调试，不参与业务逻辑）。 */
export interface RenderStats {
  geometries: number
  textures: number
  programs: number
  calls: number
  triangles: number
  /** 当前模拟时间（秒）；暂停时应保持不变。 */
  simTime: number
  paused: boolean
  timeScale: number
}

type CameraTween = {
  fromPos: THREE.Vector3
  toPos: THREE.Vector3
  fromTarget: THREE.Vector3
  toTarget: THREE.Vector3
  t: number
  duration: number
}

type Intro = {
  start: THREE.Vector3
  end: THREE.Vector3
  t: number
  duration: number
}

const MIN_TIME_SCALE = 0.1
/** 上限与 UI 滑块末档（32×）对齐，避免「读数 32× 而实际被夹到 20×」的不一致。 */
const MAX_TIME_SCALE = 32
const CLICK_SLOP_PX = 6

export class Viewer {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls | null
  private handle: SceneHandle | null = null
  private endPos = new THREE.Vector3()
  private targetVec = new THREE.Vector3()
  private intro: Intro | null = null
  private raf = 0
  private container: HTMLElement
  private ro: ResizeObserver
  private viewportHeight = 1

  // ---- 时间控制 ----
  private timeScale = 1
  private paused = false
  private simTime = 0

  // ---- 拾取 ----
  private pickEnabled = false
  private pickCb: ((info: PickInfo | null) => void) | null = null
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2()
  private pointerStart = new THREE.Vector2()
  private highlight = new PickHighlight()

  // ---- 视角缓动 ----
  private cameraTween: CameraTween | null = null
  private tweenLook = new THREE.Vector3()
  private tmpVec = new THREE.Vector3()
  private tmpVec2 = new THREE.Vector3()

  // ---- 场景资源 / 辅助层 ----
  private twinkleMats: THREE.ShaderMaterial[] = []
  private overlayState: Record<OverlayId, boolean> = { orbits: false, labels: false, scale: false }
  private overlayRoot: HTMLDivElement
  private scalePanel: HTMLDivElement
  private scaleBall: HTMLDivElement
  private scaleText: HTMLDivElement
  private lastScalePx = -1

  // ---- 事件 ----
  private onPointerDown: ((e: PointerEvent) => void) | null = null
  private onPointerUp: ((e: PointerEvent) => void) | null = null
  private onPointerCancel: (() => void) | null = null
  private onControlsStart: (() => void) | null = null

  constructor(container: HTMLElement, interactive = true) {
    this.container = container
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.viewportHeight = Math.max(container.clientHeight || 1, 1)
    this.renderer.setSize(container.clientWidth || 1, this.viewportHeight)
    const canvas = this.renderer.domElement
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', '三维天文场景：拖拽旋转，滚轮缩放，点击天体查看名称')
    canvas.tabIndex = 0
    container.appendChild(canvas)

    this.camera = new THREE.PerspectiveCamera(
      55,
      (container.clientWidth || 1) / this.viewportHeight,
      0.05,
      800
    )
    this.camera.position.set(0, 1, 5)

    if (interactive) {
      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.08
      this.controls.minDistance = 0.5
      this.controls.maxDistance = 200
      this.controls.rotateSpeed = 0.85
      this.controls.zoomSpeed = 0.9
      this.controls.screenSpacePanning = true
      this.onControlsStart = () => {
        this.cancelIntro()
        this.cancelCameraTween()
      }
      this.controls.addEventListener('start', this.onControlsStart)
    } else {
      this.controls = null
    }

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const dir = new THREE.DirectionalLight(0xffffff, 1.4)
    dir.position.set(6, 9, 7)
    this.scene.add(dir)

    this.scene.add(this.highlight.sprite)

    this.overlayRoot = document.createElement('div')
    this.overlayRoot.className = 'viewer-overlays'
    this.overlayRoot.setAttribute('aria-hidden', 'true')
    this.scalePanel = document.createElement('div')
    this.scalePanel.className = 'viewer-scale hud'
    this.scalePanel.hidden = true
    this.scaleBall = document.createElement('div')
    this.scaleBall.className = 'viewer-scale-ball'
    this.scaleText = document.createElement('div')
    this.scaleText.className = 'viewer-scale-text hud-label'
    this.scalePanel.appendChild(this.scaleBall)
    this.scalePanel.appendChild(this.scaleText)
    this.overlayRoot.appendChild(this.scalePanel)
    container.appendChild(this.overlayRoot)

    this.onPointerDown = (e: PointerEvent) => {
      this.cancelIntro()
      this.cancelCameraTween()
      this.pointerStart.set(e.clientX, e.clientY)
    }
    this.onPointerUp = (e: PointerEvent) => {
      if (!this.pickEnabled || !this.pickCb) return
      const moved = Math.hypot(e.clientX - this.pointerStart.x, e.clientY - this.pointerStart.y)
      if (moved > CLICK_SLOP_PX) return
      this.handlePick(e)
    }
    this.onPointerCancel = () => {
      this.pointerStart.set(0, 0)
    }
    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerCancel)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)

    // 仅开发环境：暴露实例供 CDP / 控制台做性能与拾取自测，不参与业务逻辑。
    if (import.meta.env.DEV) {
      ;(window as unknown as { __tianyiViewer?: Viewer }).__tianyiViewer = this
    }
  }

  // ------------------------------------------------------------------ 生命周期
  load(handle: SceneHandle) {
    this.highlight.clear()
    if (this.handle) {
      this.scene.remove(this.handle.group)
      this.handle.dispose?.()
    }
    this.handle = handle
    this.scene.add(handle.group)
    this.simTime = 0
    this.intro = null
    this.cameraTween = null

    const pos = handle.camera?.position ?? [0, 1, 5]
    const target = handle.camera?.target ?? [0, 0, 0]
    this.endPos.set(pos[0], pos[1], pos[2])
    this.targetVec.set(target[0], target[1], target[2])
    this.camera.position.copy(this.endPos)
    this.camera.lookAt(this.targetVec)
    this.camera.near = Math.max(0.01, (handle.minDistance ?? 0.5) * 0.04)
    this.camera.far = Math.max(200, (handle.maxDistance ?? 200) * 6)
    this.camera.updateProjectionMatrix()

    this.collectSceneResources(handle)
    this.syncOverlayState(handle)
    this.raycaster.params.Points.threshold = Math.max(0.35, (handle.subjectRadius ?? 1) * 0.06)

    if (this.controls) {
      this.controls.enabled = true
      this.controls.target.copy(this.targetVec)
      this.controls.autoRotate = !!handle.autoRotate
      this.controls.autoRotateSpeed = handle.autoRotateSpeed ?? 0.4
      if (handle.minDistance !== undefined) this.controls.minDistance = handle.minDistance
      if (handle.maxDistance !== undefined) this.controls.maxDistance = handle.maxDistance
      this.controls.update(0)
    }
    this.updateLabels()
    this.renderScalePanel(true)
  }

  start() {
    this.stop()
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1)
      last = now
      const animDt = this.paused ? 0 : dt
      if (!this.paused) {
        this.simTime += dt * this.timeScale
        this.handle?.update?.(this.simTime, dt * this.timeScale)
        for (const mat of this.twinkleMats) {
          const uniform = mat.uniforms.uTime
          if (uniform) uniform.value = this.simTime
        }
      }

      if (this.intro) {
        this.intro.t += animDt
        const k = Math.min(1, this.intro.t / this.intro.duration)
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
        this.camera.position.lerpVectors(this.intro.start, this.intro.end, e)
        this.camera.lookAt(this.targetVec)
        if (k >= 1) {
          this.camera.position.copy(this.intro.end)
          this.intro = null
          if (this.controls) {
            this.controls.enabled = true
            this.controls.target.copy(this.targetVec)
            this.controls.update(0)
          }
        }
      }

      if (this.cameraTween) {
        const tw = this.cameraTween
        tw.t += animDt
        const k = Math.min(1, tw.t / tw.duration)
        const e = 1 - Math.pow(1 - k, 3)
        this.camera.position.lerpVectors(tw.fromPos, tw.toPos, e)
        this.tweenLook.lerpVectors(tw.fromTarget, tw.toTarget, e)
        this.camera.lookAt(this.tweenLook)
        if (this.controls) this.controls.target.copy(this.tweenLook)
        if (k >= 1) {
          this.camera.position.copy(tw.toPos)
          this.tweenLook.copy(tw.toTarget)
          this.cameraTween = null
          if (this.controls) {
            this.controls.enabled = true
            this.controls.target.copy(tw.toTarget)
            this.controls.update(0)
          }
        }
      }

      this.highlight.update(animDt, this.camera)
      // 暂停时传 0 让 OrbitControls 的 autoRotate 停止，但阻尼与用户拖拽仍生效。
      this.controls?.update(this.paused ? 0 : dt)
      this.renderScalePanel()
      this.renderer.render(this.scene, this.camera)
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  playIntro(duration = 2.8) {
    if (!this.handle) return
    this.cancelCameraTween()
    const dir = this.tmpVec.copy(this.endPos).sub(this.targetVec)
    const start = this.tmpVec2.copy(this.targetVec).add(dir.multiplyScalar(1.7))
    start.y += 1.2
    this.camera.position.copy(start)
    this.camera.lookAt(this.targetVec)
    this.intro = { start: start.clone(), end: this.endPos.clone(), t: 0, duration: Math.max(duration, 0.01) }
    if (this.controls) this.controls.enabled = false
  }

  setAutoRotate(on: boolean) {
    if (this.controls) {
      this.controls.autoRotate = on
      this.controls.update(0)
    }
  }

  isAutoRotate(): boolean {
    return !!this.controls?.autoRotate
  }

  resetView() {
    if (!this.handle) return
    this.cancelIntro()
    this.cancelCameraTween()
    const pos = this.handle.camera?.position ?? [0, 1, 5]
    const target = this.handle.camera?.target ?? [0, 0, 0]
    this.camera.position.set(pos[0], pos[1], pos[2])
    this.camera.lookAt(target[0], target[1], target[2])
    if (this.controls) {
      this.controls.target.set(target[0], target[1], target[2])
      this.controls.enabled = true
      this.controls.update(0)
    }
    this.highlight.clear()
    this.renderScalePanel(true)
  }

  // ---------------------------------------------------------------- 时间控制
  /** 时间倍率：0.1–20；非有限值回退到 1。 */
  setTimeScale(k: number) {
    this.timeScale = Number.isFinite(k)
      ? Math.min(MAX_TIME_SCALE, Math.max(MIN_TIME_SCALE, k))
      : 1
  }

  getTimeScale(): number {
    return this.timeScale
  }

  setPaused(v: boolean) {
    this.paused = !!v
  }

  isPaused(): boolean {
    return this.paused
  }

  // ---------------------------------------------------------------- 视角预设
  /** 基于场景默认机位与主体尺度推导 4 个预设视角。 */
  presets(): ViewPreset[] {
    const handle = this.handle
    const base = this.endPos.clone()
    const target = this.targetVec.clone()
    const center = handle?.subjectCenter
      ? new THREE.Vector3(handle.subjectCenter[0], handle.subjectCenter[1], handle.subjectCenter[2])
      : target.clone()
    const subjectRadius = Math.max(handle?.subjectRadius ?? handle?.boundsRadius ?? 1, 0.001)
    const boundsRadius = Math.max(handle?.boundsRadius ?? subjectRadius * 3, subjectRadius)
    const minDistance = handle?.minDistance ?? subjectRadius * 1.2
    const maxDistance = handle?.maxDistance ?? subjectRadius * 8

    const dir = base.clone().sub(target)
    let dist = dir.length()
    if (!Number.isFinite(dist) || dist < 1e-4) {
      dir.set(0, 0.35, 1)
      dist = subjectRadius * 3
    }
    const unit = dir.normalize()
    const up = new THREE.Vector3(0, 1, 0)
    const side = new THREE.Vector3().crossVectors(unit, up)
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0)
    side.normalize()

    let nearDistance = subjectRadius * 2.2
    let topDistance = Math.max(boundsRadius * 1.9, dist * 0.95)
    let sideDistance = Math.max(boundsRadius * 1.8, dist * 0.9)
    let topLift = 0.12
    let sideLift = 0.08

    switch (handle?.kind) {
      case 'solarSystem':
        // 轨道半径对数压缩：近观看内太阳系，俯视看全部轨道。
        nearDistance = subjectRadius * 1.55
        topDistance = Math.max(boundsRadius * 1.35, 26)
        sideDistance = Math.max(boundsRadius * 1.18, 24)
        topLift = 0.06
        sideLift = 0.18
        break
      case 'blackhole':
        // 近观贴着阴影与内盘；俯视看盘面，侧视看引力透镜的上下弯折。
        nearDistance = subjectRadius * 0.8
        topDistance = Math.max(boundsRadius * 1.15, 21)
        sideDistance = Math.max(boundsRadius * 1.15, 21)
        topLift = 0.1
        sideLift = 0.06
        break
      case 'comet':
        // 近观看彗核与彗发，轨道/侧视留出尾巴长度。
        nearDistance = Math.max(subjectRadius * 0.45, 4.5)
        topDistance = Math.max(boundsRadius * 0.95, 13)
        sideDistance = Math.max(boundsRadius * 0.95, 13)
        topLift = 0.1
        sideLift = 0.12
        break
      case 'planet':
        // 有环时 subjectRadius 已包含环外缘，近观能同时看到行星与环。
        nearDistance = subjectRadius * 2
        topDistance = Math.max(boundsRadius * 1.75, dist * 0.92)
        sideDistance = Math.max(boundsRadius * 1.65, dist * 0.88)
        break
      case 'sun':
        nearDistance = subjectRadius * 2.6
        topDistance = Math.max(boundsRadius * 1.85, dist * 0.95)
        sideDistance = Math.max(boundsRadius * 1.75, dist * 0.9)
        break
      case 'moon':
        nearDistance = subjectRadius * 2.3
        topDistance = Math.max(boundsRadius * 1.85, dist * 0.95)
        sideDistance = Math.max(boundsRadius * 1.75, dist * 0.9)
        break
      case 'galaxy':
      case 'nebula':
        nearDistance = subjectRadius * 1.15
        topDistance = Math.max(boundsRadius * 1.85, dist * 1.05)
        sideDistance = Math.max(boundsRadius * 1.75, dist)
        break
      case 'supernova':
        nearDistance = subjectRadius * 1.35
        topDistance = Math.max(boundsRadius * 1.8, dist * 1.02)
        sideDistance = Math.max(boundsRadius * 1.7, dist * 0.98)
        break
      case 'meteor':
      case 'eclipse':
      case 'aurora':
        nearDistance = subjectRadius * 1.25
        topDistance = Math.max(boundsRadius * 1.7, dist * 0.95)
        sideDistance = Math.max(boundsRadius * 1.6, dist * 0.9)
        break
      default:
        break
    }

    const clampDistance = (d: number): number =>
      Math.min(Math.max(d, minDistance), Math.max(minDistance, maxDistance))
    const nearD = clampDistance(nearDistance)
    const topD = clampDistance(topDistance)
    const sideD = clampDistance(sideDistance)

    const nearPos = center.clone().add(unit.clone().multiplyScalar(nearD))
    const topPos = center
      .clone()
      .add(up.clone().multiplyScalar(topD))
      .add(unit.clone().multiplyScalar(topD * topLift))
      .add(side.clone().multiplyScalar(topD * 0.04))
    const sidePos = center
      .clone()
      .add(side.clone().multiplyScalar(sideD))
      .add(up.clone().multiplyScalar(sideD * sideLift))
      .add(unit.clone().multiplyScalar(sideD * 0.05))

    const v = (x: THREE.Vector3): [number, number, number] => [x.x, x.y, x.z]
    const tTarget = v(target)
    const tCenter = v(center)
    return [
      { id: 'near', label: '近观', position: v(nearPos), target: tCenter },
      { id: 'orbit', label: '轨道', position: v(base), target: tTarget },
      { id: 'top', label: '俯视', position: v(topPos), target: tCenter },
      { id: 'side', label: '侧视', position: v(sidePos), target: tCenter }
    ]
  }

  applyPreset(id: string) {
    const preset = this.presets().find((p) => p.id === id)
    if (!preset) return
    this.cancelIntro()
    const fromTarget = this.controls ? this.controls.target.clone() : this.targetVec.clone()
    this.tweenLook.copy(fromTarget)
    this.cameraTween = {
      fromPos: this.camera.position.clone(),
      toPos: new THREE.Vector3(preset.position[0], preset.position[1], preset.position[2]),
      fromTarget,
      toTarget: new THREE.Vector3(preset.target[0], preset.target[1], preset.target[2]),
      t: 0,
      duration: 0.85
    }
    if (this.controls) this.controls.enabled = false
  }

  // ------------------------------------------------------------------ 拾取
  /** 注册拾取回调；命中返回 PickInfo，点空白返回 null。 */
  onPick(cb: (info: PickInfo | null) => void) {
    this.pickCb = cb
  }

  setPickEnabled(v: boolean) {
    this.pickEnabled = !!v
    if (!this.pickEnabled) this.highlight.clear()
  }

  private handlePick(e: PointerEvent) {
    const handle = this.handle
    const cb = this.pickCb
    if (!handle || !cb) return
    const rect = this.renderer.domElement.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObjects(handle.group.children, true)
    const hit = hits.find((h) => !!pickNameOf(h.object))
    if (!hit) {
      this.highlight.clear()
      cb(null)
      return
    }
    const info: PickInfo = {
      name: pickNameOf(hit.object) as string,
      point: [hit.point.x, hit.point.y, hit.point.z],
      object: hit.object
    }
    this.highlight.show(info)
    cb(info)
  }

  // ------------------------------------------------------------ 可视化辅助层
  /** 开关轨道线 / 天体标签 / 比例尺参考球。 */
  setOverlay(id: OverlayId, on: boolean): void {
    const overlay = this.handle?.overlays?.[id]
    if (overlay) overlay.visible = !!on
    this.overlayState[id] = !!on
    if (id === 'labels') this.updateLabels()
    if (id === 'scale') this.renderScalePanel(true)
  }

  isOverlay(id: OverlayId): boolean {
    return this.overlayState[id] && !!this.handle?.overlays?.[id]
  }

  // ------------------------------------------------------------------ 其他
  /** 当前帧 PNG dataURL（用于"保存快照"）。 */
  capture(): string {
    this.renderer.render(this.scene, this.camera)
    return this.renderer.domElement.toDataURL('image/png')
  }

  getHandle(): SceneHandle | null {
    return this.handle
  }

  /** 渲染统计：场景切换泄漏自测用。 */
  getRenderInfo(): RenderStats {
    const info = this.renderer.info
    return {
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: Array.isArray(info.programs) ? info.programs.length : 0,
      calls: info.render.calls,
      triangles: info.render.triangles,
      simTime: this.simTime,
      paused: this.paused,
      timeScale: this.timeScale
    }
  }

  /** 当前相机状态：预设缓动 / 拾取自测用。 */
  getCameraState(): { position: [number, number, number]; target: [number, number, number]; tweening: boolean } {
    const target = this.controls ? this.controls.target : this.targetVec
    return {
      position: [this.camera.position.x, this.camera.position.y, this.camera.position.z],
      target: [target.x, target.y, target.z],
      tweening: !!this.cameraTween
    }
  }

  resize() {
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.viewportHeight = Math.max(h, 1)
    this.renderer.setSize(w, h)
    this.camera.aspect = w / this.viewportHeight
    this.camera.updateProjectionMatrix()
    this.updateLabels()
    this.renderScalePanel(true)
  }

  dispose() {
    this.stop()
    this.ro.disconnect()
    const canvas = this.renderer.domElement
    if (this.onPointerDown) canvas.removeEventListener('pointerdown', this.onPointerDown)
    if (this.onPointerUp) canvas.removeEventListener('pointerup', this.onPointerUp)
    if (this.onPointerCancel) canvas.removeEventListener('pointercancel', this.onPointerCancel)
    if (this.controls && this.onControlsStart) this.controls.removeEventListener('start', this.onControlsStart)
    this.controls?.dispose()
    this.controls = null
    this.highlight.clear()
    this.highlight.dispose()
    this.handle?.dispose?.()
    this.handle = null
    this.pickCb = null
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    if (canvas.parentElement === this.container) this.container.removeChild(canvas)
    if (this.overlayRoot.parentElement === this.container) this.container.removeChild(this.overlayRoot)
    if (import.meta.env.DEV) {
      const w = window as unknown as { __tianyiViewer?: Viewer }
      if (w.__tianyiViewer === this) delete w.__tianyiViewer
    }
  }

  // ------------------------------------------------------------------ 内部
  private cancelIntro(): void {
    if (!this.intro) return
    this.intro = null
    if (this.controls) {
      this.controls.enabled = true
      this.controls.target.copy(this.targetVec)
      this.controls.update(0)
    }
  }

  private cancelCameraTween(): void {
    if (!this.cameraTween) return
    this.cameraTween = null
    if (this.controls) {
      this.controls.enabled = true
      this.controls.target.copy(this.tweenLook)
      this.controls.update(0)
    }
  }

  private collectSceneResources(handle: SceneHandle): void {
    this.twinkleMats = []
    handle.group.traverse((obj) => {
      const mat = (obj as THREE.Mesh).material
      const list = Array.isArray(mat) ? mat : mat ? [mat] : []
      for (const m of list) {
        if (m instanceof THREE.ShaderMaterial && m.userData.twinkle === true) {
          this.twinkleMats.push(m)
        }
      }
    })
  }

  private syncOverlayState(handle: SceneHandle): void {
    this.overlayState.orbits = !!handle.overlays?.orbits?.visible
    this.overlayState.labels = !!handle.overlays?.labels?.visible
    this.overlayState.scale = !!handle.overlays?.scale?.visible
  }

  private updateLabels(): void {
    updateLabelScales(this.handle?.overlays?.labels, this.camera, this.viewportHeight)
  }

  private renderScalePanel(force = false): void {
    const handle = this.handle
    const ref = handle?.scaleRef
    if (!this.overlayState.scale || !ref) {
      if (!this.scalePanel.hidden) this.scalePanel.hidden = true
      return
    }
    this.scalePanel.hidden = false
    const center = handle?.subjectCenter
      ? this.tmpVec.set(handle.subjectCenter[0], handle.subjectCenter[1], handle.subjectCenter[2])
      : this.tmpVec.set(0, 0, 0)
    const dist = Math.max(this.camera.position.distanceTo(center), 1e-3)
    const f = 1 / Math.tan((this.camera.fov * Math.PI) / 360)
    const truePx = (ref.radius / dist) * (f / 2) * Math.max(this.viewportHeight, 1)
    const clamped = Math.min(88, Math.max(10, truePx))
    if (force || Math.abs(clamped - this.lastScalePx) > 0.5) {
      this.lastScalePx = clamped
      this.scaleBall.style.width = clamped * 2 + 'px'
      this.scaleBall.style.height = clamped * 2 + 'px'
    }
    const prefix = truePx > 88 ? '≈ ' : truePx < 10 ? '< ' : ''
    const text = prefix + ref.label
    if (this.scaleText.textContent !== text) this.scaleText.textContent = text
  }
}

/** 从命中的物体向上找 userData.pickName（工作流 B 在场景里打标）。 */
function pickNameOf(obj: THREE.Object3D): string | undefined {
  let cur: THREE.Object3D | null = obj
  while (cur) {
    const meta = cur.userData as { pickName?: unknown } | undefined
    if (meta && typeof meta.pickName === 'string' && meta.pickName) return meta.pickName
    cur = cur.parent
  }
  return undefined
}
