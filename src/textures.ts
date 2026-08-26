import * as THREE from 'three'

// ---------------------------------------------------------------- noise ----
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash21(x: number, y: number, seed: number) {
  let h = seed ^ Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function smooth(t: number) {
  return t * t * (3 - 2 * t)
}

export function valueNoise(x: number, y: number, seed = 1) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const a = hash21(xi, yi, seed)
  const b = hash21(xi + 1, yi, seed)
  const c = hash21(xi, yi + 1, seed)
  const d = hash21(xi + 1, yi + 1, seed)
  const u = smooth(xf)
  const v = smooth(yf)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

export function fbm(x: number, y: number, seed = 1, octaves = 4) {
  let amp = 0.5
  let freq = 1
  let sum = 0
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq, seed + i * 101)
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return sum / norm
}

// ------------------------------------------------------------ color utils -
type RGB = [number, number, number]

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ]
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function sample(palette: RGB[], t: number): RGB {
  const tt = Math.min(1, Math.max(0, t))
  const i0 = Math.floor(tt * (palette.length - 1))
  const i1 = Math.min(palette.length - 1, i0 + 1)
  const f = tt * (palette.length - 1) - i0
  return mixRgb(palette[i0], palette[i1], smooth(f))
}

// --------------------------------------------------------------- canvas ---
function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  return { canvas, ctx }
}

function toTexture(canvas: HTMLCanvasElement, repeat = true) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
  }
  tex.anisotropy = 4
  return tex
}

const cache = new Map<string, THREE.Texture>()

// ----------------------------------------------------------- planet texs --
export interface RockyOpts {
  land: string[]
  ocean?: string
  polar?: boolean
  craters?: number
}

export function rockyTexture(seed: number, opts: RockyOpts): THREE.Texture {
  const key = 'rocky|' + seed + '|' + JSON.stringify(opts)
  const hit = cache.get(key)
  if (hit) return hit
  const w = 512
  const h = 256
  const { canvas, ctx } = makeCanvas(w, h)
  const img = ctx.createImageData(w, h)
  const data = img.data
  const land = opts.land.map(hexToRgb)
  const ocean = opts.ocean ? hexToRgb(opts.ocean) : null
  const craters: { x: number; y: number; r: number }[] = []
  const rng = mulberry32(seed * 7919 + 13)
  const nCraters = opts.craters ?? 0
  for (let k = 0; k < nCraters; k++) {
    craters.push({ x: rng(), y: rng(), r: 0.02 + rng() * 0.08 })
  }
  const hasOcean = !!ocean
  for (let y = 0; y < h; y++) {
    const v = y / h
    for (let x = 0; x < w; x++) {
      const u = x / w
      const n = fbm(u * 5, v * 5, seed, 5)
      let col: RGB
      if (hasOcean && n < 0.42) {
        const depth = 1 - n / 0.42
        col = mixRgb(ocean!, [18, 34, 66], depth * 0.7)
      } else {
        const t = hasOcean ? (n - 0.42) / 0.58 : n
        col = sample(land, Math.min(1, Math.max(0, t)))
        const shade = 0.82 + 0.3 * fbm(u * 14, v * 14, seed + 7, 3)
        col = mixRgb(col, [8, 10, 16], (1 - shade) * 0.45)
      }
      if (opts.polar) {
        let cap = 0
        if (v < 0.17) cap = 1 - v / 0.17
        else if (v > 0.83) cap = (v - 0.83) / 0.17
        col = mixRgb(col, [236, 242, 250], Math.pow(cap, 1.6) * 0.9)
      }
      for (const c of craters) {
        const dx = u - c.x
        const dy = v - c.y
        const d2 = dx * dx + dy * dy
        if (d2 < c.r * c.r) {
          const d = Math.sqrt(d2) / c.r
          col = mixRgb(col, [26, 28, 38], (1 - d) * 0.65)
        }
      }
      const i = (y * w + x) * 4
      data[i] = col[0]
      data[i + 1] = col[1]
      data[i + 2] = col[2]
      data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = toTexture(canvas)
  cache.set(key, tex)
  return tex
}

export function gasTexture(seed: number, colors: string[]): THREE.Texture {
  const key = 'gas|' + seed + '|' + colors.join(',')
  const hit = cache.get(key)
  if (hit) return hit
  const w = 512
  const h = 256
  const { canvas, ctx } = makeCanvas(w, h)
  const img = ctx.createImageData(w, h)
  const data = img.data
  const pal = colors.map(hexToRgb)
  const bands = pal.length
  for (let y = 0; y < h; y++) {
    const v = y / h
    for (let x = 0; x < w; x++) {
      const u = x / w
      const d = fbm(u * 3.2, v * 9, seed, 5)
      const bandPos = v * bands + (d - 0.5) * 1.6
      const i0 = Math.floor(bandPos)
      const t = bandPos - i0
      const c0 = pal[((i0 % bands) + bands) % bands]
      const c1 = pal[(((i0 + 1) % bands) + bands) % bands]
      let col = mixRgb(c0, c1, smooth(Math.min(1, Math.max(0, t))))
      const shade = 0.72 + 0.38 * fbm(u * 22, v * 26, seed + 3, 4)
      col = mixRgb(col, [0, 0, 0], (1 - shade) * 0.5)
      const i = (y * w + x) * 4
      data[i] = col[0]
      data[i + 1] = col[1]
      data[i + 2] = col[2]
      data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = toTexture(canvas)
  cache.set(key, tex)
  return tex
}

export function earthTexture(seed: number): THREE.Texture {
  return rockyTexture(seed, {
    ocean: '#1d4f9c',
    land: ['#3d7a3a', '#6d9b4a', '#8a6f3f', '#b39a6b', '#d8cfb2'],
    polar: true
  })
}

export function cloudTexture(seed: number): THREE.Texture {
  const key = 'cloud|' + seed
  const hit = cache.get(key)
  if (hit) return hit
  const w = 512
  const h = 256
  const { canvas, ctx } = makeCanvas(w, h)
  const img = ctx.createImageData(w, h)
  const data = img.data
  for (let y = 0; y < h; y++) {
    const v = y / h
    for (let x = 0; x < w; x++) {
      const u = x / w
      const n = fbm(u * 6, v * 6, seed, 5)
      const a = Math.max(0, n - 0.54) / 0.46
      const i = (y * w + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = Math.round(a * 235)
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = toTexture(canvas)
  cache.set(key, tex)
  return tex
}

export function moonTexture(seed: number): THREE.Texture {
  const key = 'moon|' + seed
  const hit = cache.get(key)
  if (hit) return hit
  const w = 512
  const h = 256
  const { canvas, ctx } = makeCanvas(w, h)
  const img = ctx.createImageData(w, h)
  const data = img.data
  const craters: { x: number; y: number; r: number }[] = []
  const rng = mulberry32(seed * 104729 + 7)
  for (let k = 0; k < 90; k++) {
    craters.push({ x: rng(), y: rng(), r: 0.015 + rng() * 0.1 })
  }
  for (let y = 0; y < h; y++) {
    const v = y / h
    for (let x = 0; x < w; x++) {
      const u = x / w
      let col: RGB = [172, 174, 180]
      const n = fbm(u * 6, v * 6, seed, 5)
      col = mixRgb(col, [120, 122, 132], Math.max(0, 0.52 - n) / 0.52 * 0.7)
      col = mixRgb(col, [208, 210, 216], Math.max(0, n - 0.55) / 0.45 * 0.6)
      for (const c of craters) {
        const dx = u - c.x
        const dy = v - c.y
        const d2 = dx * dx + dy * dy
        if (d2 < c.r * c.r) {
          const d = Math.sqrt(d2) / c.r
          col = mixRgb(col, [52, 54, 62], Math.pow(1 - d, 1.4) * 0.9)
        }
      }
      const i = (y * w + x) * 4
      data[i] = col[0]
      data[i + 1] = col[1]
      data[i + 2] = col[2]
      data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = toTexture(canvas)
  cache.set(key, tex)
  return tex
}

export function sunTexture(seed: number): THREE.Texture {
  const key = 'sun|' + seed
  const hit = cache.get(key)
  if (hit) return hit
  const w = 512
  const h = 256
  const { canvas, ctx } = makeCanvas(w, h)
  const img = ctx.createImageData(w, h)
  const data = img.data
  const pal: RGB[] = [
    [255, 214, 90],
    [255, 170, 40],
    [255, 110, 20],
    [255, 246, 200]
  ]
  for (let y = 0; y < h; y++) {
    const v = y / h
    for (let x = 0; x < w; x++) {
      const u = x / w
      const n = fbm(u * 7, v * 7, seed, 6)
      const col = sample(pal, n)
      const i = (y * w + x) * 4
      data[i] = col[0]
      data[i + 1] = col[1]
      data[i + 2] = col[2]
      data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = toTexture(canvas)
  cache.set(key, tex)
  return tex
}

// ------------------------------------------------------------------ rings --
export function ringTexture(inner: number, outer: number, seed: number, colors: string[]): THREE.Texture {
  const key = 'ring|' + seed + '|' + colors.join(',')
  const hit = cache.get(key)
  if (hit) return hit
  const size = 512
  const { canvas, ctx } = makeCanvas(size, size)
  const img = ctx.createImageData(size, size)
  const data = img.data
  const pal = colors.map(hexToRgb)
  const ir = inner / outer
  const cx = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5 - cx) / cx
      const dy = (y + 0.5 - cx) / cx
      const d = Math.sqrt(dx * dx + dy * dy)
      const i = (y * size + x) * 4
      if (d < ir || d > 1) {
        data[i + 3] = 0
        continue
      }
      const t = (d - ir) / (1 - ir)
      const band = fbm(t * 16, 0.5, seed, 3)
      let col = sample(pal, t + band * 0.4)
      const a = 0.8 * (0.55 + 0.45 * Math.sin(t * 52 + band * 14)) *
        smoothstep(0, 0.05, t) * (1 - smoothstep(0.86, 1, t))
      data[i] = col[0]
      data[i + 1] = col[1]
      data[i + 2] = col[2]
      data[i + 3] = Math.round(a * 255)
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = toTexture(canvas, false)
  cache.set(key, tex)
  return tex
}

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

// ---------------------------------------------------------------- sprites --
export function glowTexture(color: string): THREE.Texture {
  const key = 'glow|' + color
  const hit = cache.get(key)
  if (hit) return hit
  const size = 256
  const { canvas, ctx } = makeCanvas(size, size)
  const c = hexToRgb(color)
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.25, 'rgba(' + c.join(',') + ',0.85)')
  grad.addColorStop(0.6, 'rgba(' + c.join(',') + ',0.25)')
  grad.addColorStop(1, 'rgba(' + c.join(',') + ',0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  cache.set(key, tex)
  return tex
}

export function circleTexture(color: string): THREE.Texture {
  const key = 'circle|' + color
  const hit = cache.get(key)
  if (hit) return hit
  const size = 128
  const { canvas, ctx } = makeCanvas(size, size)
  const c = hexToRgb(color)
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(' + c.join(',') + ',1)')
  grad.addColorStop(0.6, 'rgba(' + c.join(',') + ',0.7)')
  grad.addColorStop(1, 'rgba(' + c.join(',') + ',0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  cache.set(key, tex)
  return tex
}
