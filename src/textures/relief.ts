/**
 * 表面起伏与材质变化贴图 —— 第三轮迭代 · 真实感渲染。
 *
 * 法线贴图与反照率贴图用同一个 fbm 高度场（同种子、同频率）生成，
 * 因此明暗起伏与颜色纹理天然对齐：斜射光下岩石行星、卫星会出现真实的
 * 丘陵与环形山阴影，而不是一个光滑的球。
 *
 * 分辨率默认 256×128（法线频率低，半分辨率足够），成本约为主纹理的 1/4。
 * 地球额外提供粗糙度贴图：海洋低粗糙度 → 出现太阳镜面反射（海面反光），
 * 陆地高粗糙度 → 保持漫反射。
 */
import * as THREE from 'three'
import { fbm, mulberry32 } from '../textures'

const cache = new Map<string, THREE.Texture>()

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return { canvas, ctx: canvas.getContext('2d')! }
}

export interface ReliefOpts {
  seed: number
  /** 贴图宽度（高度取一半）。默认 256。 */
  size?: number
  /** 高度放大系数，越大凹凸越明显。默认 1.8。 */
  strength?: number
  /** 陨石坑数量。默认 0。 */
  craters?: number
  /** fbm 基础频率，需与反照率贴图一致才能对齐。默认 5。 */
  frequency?: number
  /** 陨石坑随机数种子基数，需与反照率贴图一致才能对齐。 */
  craterSeed?: number
  /** 陨石坑半径范围（uv 单位）。默认 [0.02, 0.08]。 */
  craterRadius?: [number, number]
}

/** 由高度场生成法线贴图（中央差分 + 环绕采样，保证经度接缝连续）。 */
export function rockyNormalTexture(opts: ReliefOpts): THREE.Texture {
  const size = opts.size ?? 256
  const strength = opts.strength ?? 3
  const frequency = opts.frequency ?? 5
  const craters = opts.craters ?? 0
  const craterSeed = opts.craterSeed ?? opts.seed * 7919 + 13
  const [crMin, crMax] = opts.craterRadius ?? [0.02, 0.08]
  const key = 'relief|' + opts.seed + '|' + size + '|' + strength + '|' + craters + '|' + frequency
  const hit = cache.get(key)
  if (hit) return hit

  const w = size
  const h = size >> 1
  // 高度场 = 低频地貌（与反照率主色同源）+ 高频细节（与反照率的
  // 「shade = fbm(u*14, v*14, seed+7)」项同源），这样凹凸与明暗严格对齐。
  const height = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    const v = y / h
    for (let x = 0; x < w; x++) {
      const low = fbm((x / w) * frequency, v * frequency, opts.seed, 5)
      const high = fbm((x / w) * 14, v * 14, opts.seed + 7, 3)
      height[y * w + x] = low * 0.68 + high * 0.32
    }
  }

  // 陨石坑：碗状凹陷 + 抬起的边缘，直接写进高度场
  if (craters > 0) {
    // 与反照率贴图完全相同的随机序列与半径定义（uv 空间），保证坑的凹陷
    // 与颜色变暗落在同一位置；uv 半径在像素空间是椭圆，这里按 w/h 分别缩放。
    const rng = mulberry32(craterSeed)
    for (let k = 0; k < craters; k++) {
      // 必须与反照率贴图消耗完全相同的随机数序列（x, y, r 三次），
      // 多调一次 rng() 就会让后续所有坑位错开；深度因此改为按序号推导。
      const cu = rng()
      const cv = rng()
      const r = crMin + rng() * (crMax - crMin)
      const depth = 0.55 + (k % 4) * 0.12
      const rx = r * w
      const ry = r * h
      const x0 = Math.max(0, Math.floor(cu * w - rx))
      const x1 = Math.min(w - 1, Math.ceil(cu * w + rx))
      const y0 = Math.max(0, Math.floor(cv * h - ry))
      const y1 = Math.min(h - 1, Math.ceil(cv * h + ry))
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const dx = (x / w - cu) / r
          const dy = (y / h - cv) / r
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > 1) continue
          // d<0.75 为碗底，0.75~1 为环形隆起
          const bowl = d < 0.75 ? -depth * (1 - d / 0.75) : depth * 0.55 * ((d - 0.75) / 0.25)
          height[y * w + x] += bowl
        }
      }
    }
  }

  const { canvas, ctx } = makeCanvas(w, h)
  const img = ctx.createImageData(w, h)
  const data = img.data
  const scale = strength * w * 0.5
  for (let y = 0; y < h; y++) {
    const yUp = ((y + 1) % h) * w
    const yDown = ((y - 1 + h) % h) * w
    const row = y * w
    for (let x = 0; x < w; x++) {
      const xl = height[row + ((x - 1 + w) % w)]
      const xr = height[row + ((x + 1) % w)]
      const yd = height[yDown + x]
      const yu = height[yUp + x]
      let nx = (xl - xr) * scale
      let ny = (yd - yu) * scale
      const nz = 1
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
      nx /= len
      ny /= len
      const i = (row + x) * 4
      data[i] = Math.round((nx * 0.5 + 0.5) * 255)
      data[i + 1] = Math.round((ny * 0.5 + 0.5) * 255)
      data[i + 2] = Math.round((nz / len * 0.5 + 0.5) * 255)
      data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  // 法线贴图必须保持线性（不做 sRGB 解码），CanvasTexture 默认即 NoColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

/**
 * 地球粗糙度贴图：海洋（fbm < 0.42）低粗糙度 → 出现海面太阳反光，
 * 陆地高粗糙度 → 保持漫反射。粗糙度写进 G 通道（three 读取 .g）。
 */
export function earthRoughnessTexture(seed: number, size = 256): THREE.Texture {
  const key = 'earth-rough|' + seed + '|' + size
  const hit = cache.get(key)
  if (hit) return hit
  const w = size
  const h = size >> 1
  const { canvas, ctx } = makeCanvas(w, h)
  const img = ctx.createImageData(w, h)
  const data = img.data
  for (let y = 0; y < h; y++) {
    const v = y / h
    for (let x = 0; x < w; x++) {
      const n = fbm((x / w) * 5, v * 5, seed, 5)
      // 海洋：0.06~0.2（有反光但不至于像镜子）；陆地：0.85~1
      const rough = n < 0.42 ? 0.06 + (n / 0.42) * 0.14 : 0.85 + Math.min(1, (n - 0.42) / 0.58) * 0.15
      const g = Math.round(rough * 255)
      const i = (y * w + x) * 4
      data[i] = g
      data[i + 1] = g
      data[i + 2] = g
      data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}
