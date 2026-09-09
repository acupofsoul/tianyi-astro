import * as THREE from 'three'
import type { SceneLabelAnchor, SceneScaleRef } from './types'

/**
 * 场景道具与辅助层工具（工作流 B）。
 * 只被 scenes.ts / buildSceneFor 使用；不导出为对外契约。
 */

const _axisZ = new THREE.Vector3(0, 0, 1)

/** 给物体打上拾取名（userData.pickName）。 */
export function markPick<T extends THREE.Object3D>(obj: T, name: string, note?: string): T {
  obj.userData.pickName = name
  if (note) obj.userData.pickNote = note
  return obj
}

/**
 * 不可见拾取代理：visible=false 让 WebGLRenderer 跳过绘制，
 * 但 Raycaster 仍会递归命中（three 的 intersect 不检查 visible）。
 */
export function makePickProxy(
  geometry: THREE.BufferGeometry,
  name: string,
  position?: [number, number, number],
  rotation?: [number, number, number]
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial())
  mesh.visible = false
  if (position) mesh.position.set(position[0], position[1], position[2])
  if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2])
  return markPick(mesh, name)
}

/** 纹理坐标 (u,v)（同 gasTexture 的 x/w、y/h）→ 球面法线。 */
export function normalFromUv(u: number, v: number, out: THREE.Vector3): THREE.Vector3 {
  const phi = v * Math.PI
  const theta = u * Math.PI * 2
  const sinPhi = Math.sin(phi)
  out.set(-Math.cos(theta) * sinPhi, Math.cos(phi), Math.sin(theta) * sinPhi)
  return out
}

/**
 * 经纬度 → 球面法线。
 * 与 three SphereGeometry 的 UV 约定一致：lon=0 朝 +X，lon=90° 朝 +Z。
 */
export function normalFromLatLon(latDeg: number, lonDeg: number, out: THREE.Vector3): THREE.Vector3 {
  const phi = ((90 - latDeg) * Math.PI) / 180
  const theta = Math.PI - (lonDeg * Math.PI) / 180
  const sinPhi = Math.sin(phi)
  out.set(-Math.cos(theta) * sinPhi, Math.cos(phi), Math.sin(theta) * sinPhi)
  return out
}

export interface SurfaceSpotOptions {
  /** 球体半径（世界单位） */
  radius: number
  /** 颜色 */
  color: string
  /** 拾取名 */
  name: string
  /** 透明度，默认 0.82 */
  opacity?: number
  /** 可选贴图（例如环形山纹理） */
  map?: THREE.Texture
  /** 相对球面的抬升系数，默认 1.006 */
  lift?: number
}

/** 创建一个贴在球面上的小圆斑（可作大红斑 / 太阳黑子 / 陨石坑的可见标记）。 */
export function makeSurfaceSpot(opts: SurfaceSpotOptions): THREE.Mesh {
  const mat = new THREE.MeshBasicMaterial({
    color: opts.color,
    transparent: true,
    opacity: opts.opacity ?? 0.82,
    depthWrite: false,
    side: THREE.DoubleSide
  })
  // 不要给 map 传 undefined，否则 three 会打印 "parameter 'map' has value of undefined" 警告。
  if (opts.map) mat.map = opts.map
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 40), mat)
  mesh.userData.lift = opts.lift ?? 1.006
  return markPick(mesh, opts.name)
}

/**
 * 把圆斑放到球面法线指向的位置。
 * 用四元数直接把局部 +Z 对齐法线，避免 lookAt 在旋转父节点下的世界坐标换算。
 */
export function placeSurfaceSpot(
  spot: THREE.Mesh,
  radius: number,
  normal: THREE.Vector3,
  halfWidth: number,
  halfHeight: number
): void {
  const lift = typeof spot.userData.lift === 'number' ? spot.userData.lift : 1.006
  spot.position.copy(normal).multiplyScalar(radius * lift)
  spot.quaternion.setFromUnitVectors(_axisZ, normal)
  spot.scale.set(Math.max(halfWidth, 1e-4), Math.max(halfHeight, 1e-4), 1)
}

/** 环形山 / 月海纹理：中心暗、边缘亮，带一点柔和的辐射纹。 */
export function makeCraterTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  const c = size / 2
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c)
  grad.addColorStop(0, 'rgba(20,18,20,0.95)')
  grad.addColorStop(0.55, 'rgba(40,38,40,0.75)')
  grad.addColorStop(0.82, 'rgba(210,205,200,0.42)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(c, c, c, 0, Math.PI * 2)
  ctx.fill()
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 2
  return tex
}

/** 画一张文字贴图，返回 sprite（sizeAttenuation=false，屏幕尺寸恒定）。 */
export function makeLabelSprite(text: string, sub?: string, color = '#dff1ff'): THREE.Sprite {
  const scaleFactor = 2
  const fontMain = '600 30px "Noto Serif SC", "Songti SC", "STSong", serif'
  const fontSub = '400 17px "JetBrains Mono", Consolas, monospace'
  const padX = 12
  const padY = 8
  const measure = document.createElement('canvas').getContext('2d')
  if (!measure) throw new Error('2D canvas unavailable')
  measure.font = fontMain
  const mainW = measure.measureText(text).width
  measure.font = fontSub
  const subW = sub ? measure.measureText(sub).width : 0
  const w = Math.ceil(Math.max(mainW, subW) + padX * 2 + 8)
  const h = sub ? 30 + 17 + padY * 2 + 2 : 30 + padY * 2
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(48, w * scaleFactor)
  canvas.height = Math.max(28, h * scaleFactor)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  ctx.scale(scaleFactor, scaleFactor)
  ctx.fillStyle = 'rgba(8, 14, 24, 0.72)'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(120, 200, 255, 0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 3, h)
  ctx.font = fontMain
  ctx.textBaseline = 'top'
  ctx.fillStyle = color
  ctx.fillText(text, padX, padY - 2)
  if (sub) {
    ctx.font = fontSub
    ctx.fillStyle = 'rgba(126, 147, 168, 0.95)'
    ctx.fillText(sub, padX, padY + 32)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 2
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    sizeAttenuation: false
  })
  const sprite = new THREE.Sprite(mat)
  sprite.renderOrder = 900
  sprite.userData.labelPx = { width: w, height: h }
  return sprite
}

/** 构建天体标签层（默认隐藏，由 Viewer.setOverlay('labels', true) 开启）。 */
export function makeLabelOverlay(anchors: SceneLabelAnchor[]): THREE.Group {
  const group = new THREE.Group()
  group.name = 'overlay-labels'
  for (const anchor of anchors) {
    const sprite = makeLabelSprite(anchor.name, anchor.sub, anchor.color ?? '#dff1ff')
    sprite.position.set(anchor.position[0], anchor.position[1], anchor.position[2])
    group.add(sprite)
  }
  group.visible = false
  return group
}

/** 构建比例尺参考球（线框球 + 赤道环 + 坐标轴 + 小标签，默认隐藏）。 */
export function makeScaleOverlay(ref: SceneScaleRef): THREE.Group {
  const group = new THREE.Group()
  group.name = 'overlay-scale'
  const color = new THREE.Color(ref.color ?? '#5fd6ff')
  const r = Math.max(ref.radius, 1e-3)

  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(r, 24, 16),
    new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.22, depthWrite: false })
  )
  group.add(wire)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(r, Math.max(r * 0.006, 0.0035), 6, 72),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false })
  )
  ring.rotation.x = Math.PI / 2
  group.add(ring)

  const axisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-r * 1.18, 0, 0),
    new THREE.Vector3(r * 1.18, 0, 0),
    new THREE.Vector3(0, -r * 1.18, 0),
    new THREE.Vector3(0, r * 1.18, 0)
  ])
  const axes = new THREE.LineSegments(
    axisGeo,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.22 })
  )
  group.add(axes)

  const label = makeLabelSprite('比例尺参考球', undefined, '#5fd6ff')
  label.position.set(0, r * 1.16, 0)
  group.add(label)

  if (ref.position) group.position.set(ref.position[0], ref.position[1], ref.position[2])
  group.visible = false
  group.userData.scaleRef = ref
  return group
}

/** 按视口高度把标签 sprite 的屏幕尺寸固定在设计像素附近。 */
export function updateLabelScales(
  group: THREE.Object3D | undefined,
  camera: THREE.PerspectiveCamera,
  viewportHeight: number
): void {
  if (!group) return
  // 注意：标签材质是 sizeAttenuation:false，three 的 sprite 着色器会把缩放
  // 再乘以视空间深度，因此屏幕尺寸本身就与距离无关 —— 这里不能再乘距离，
  // 否则标签会随距离线性膨胀成一片白条。
  const f = 1 / Math.tan((camera.fov * Math.PI) / 360)
  const h = Math.max(1, viewportHeight)
  group.traverse((obj) => {
    if (!(obj instanceof THREE.Sprite)) return
    const px = obj.userData.labelPx as { width?: number; height?: number } | undefined
    if (!px || typeof px.width !== 'number' || typeof px.height !== 'number') return
    const sx = (px.width * 2) / (f * h)
    const sy = (px.height * 2) / (f * h)
    obj.scale.set(sx, sy, 1)
  })
}

const TEXTURE_SLOTS: readonly string[] = [
  'map',
  'alphaMap',
  'aoMap',
  'bumpMap',
  'normalMap',
  'displacementMap',
  'emissiveMap',
  'envMap',
  'lightMap',
  'metalnessMap',
  'roughnessMap',
  'specularMap',
  'gradientMap',
  'matcap',
  'clearcoatMap',
  'clearcoatNormalMap',
  'clearcoatRoughnessMap',
  'iridescenceMap',
  'iridescenceThicknessMap',
  'sheenColorMap',
  'sheenRoughnessMap',
  'transmissionMap',
  'thicknessMap',
  'specularIntensityMap',
  'specularColorMap',
  'anisotropyMap'
]

interface MaybeMesh extends THREE.Object3D {
  geometry?: THREE.BufferGeometry
  material?: THREE.Material | THREE.Material[]
}

function collectMaterialTextures(mat: THREE.Material, out: Set<THREE.Texture>): void {
  const record = mat as unknown as Record<string, unknown>
  for (const slot of TEXTURE_SLOTS) {
    const value = record[slot]
    if (value instanceof THREE.Texture) out.add(value)
  }
  const uniforms = (mat as unknown as { uniforms?: Record<string, { value?: unknown }> }).uniforms
  if (uniforms) {
    for (const key of Object.keys(uniforms)) {
      const value = uniforms[key]?.value
      if (value instanceof THREE.Texture) out.add(value)
    }
  }
}

/**
 * 递归释放 geometry / material / texture。
 * 可重复调用（userData.__disposed 标记）；共享缓存的纹理也按 three 语义释放，
 * 下次复用时会自动重新上传（Texture.dispose 会移除 GPU 资源，但保留 CPU 数据）。
 */
export function disposeObject3D(root: THREE.Object3D): void {
  if (root.userData.__disposed === true) return
  root.userData.__disposed = true
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  root.traverse((child) => {
    const obj = child as MaybeMesh
    if (obj.geometry) obj.geometry.dispose()
    const mat = obj.material
    if (Array.isArray(mat)) {
      for (const m of mat) materials.add(m)
    } else if (mat) {
      materials.add(mat)
    }
  })
  for (const mat of materials) {
    collectMaterialTextures(mat, textures)
    mat.dispose()
  }
  for (const tex of textures) tex.dispose()
}
