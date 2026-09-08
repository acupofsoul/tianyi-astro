import * as THREE from 'three'

/**
 * 点击拾取高亮（工作流 B）。
 * 一个可复用的屏幕空间准星 sprite + 被命中材质上的临时发光/透明度脉冲；
 * 同一时刻只高亮一个物体，切换时先恢复上一个物体的材质。
 */

export interface HighlightTarget {
  name: string
  point: [number, number, number]
  object: THREE.Object3D
}

interface SavedMaterialState {
  material: THREE.Material
  emissive?: THREE.Color
  emissiveIntensity?: number
  opacity?: number
}

function primaryMaterial(obj: THREE.Object3D): THREE.Material | null {
  const mat = (obj as THREE.Mesh).material
  if (Array.isArray(mat)) return mat[0] ?? null
  return mat ?? null
}

function isStandardMaterial(mat: THREE.Material): mat is THREE.MeshStandardMaterial {
  return mat instanceof THREE.MeshStandardMaterial
}

function hasOpacity(mat: THREE.Material): mat is THREE.Material & { opacity: number } {
  return typeof (mat as unknown as { opacity?: unknown }).opacity === 'number'
}

export class PickHighlight {
  readonly sprite: THREE.Sprite
  private readonly texture: THREE.CanvasTexture
  private readonly material: THREE.SpriteMaterial
  private saved: SavedMaterialState | null = null
  private pulse = 0
  private active = false

  constructor() {
    this.texture = makeReticleTexture()
    this.material = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0.8,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    this.sprite = new THREE.Sprite(this.material)
    this.sprite.visible = false
    this.sprite.renderOrder = 999
    this.sprite.frustumCulled = false
  }

  show(target: HighlightTarget, accent = '#5fd6ff'): void {
    this.clear()
    this.sprite.position.set(target.point[0], target.point[1], target.point[2])
    this.sprite.visible = true
    this.active = true
    this.pulse = 0
    const mat = primaryMaterial(target.object)
    if (!mat) return
    if (isStandardMaterial(mat)) {
      this.saved = {
        material: mat,
        emissive: mat.emissive.clone(),
        emissiveIntensity: mat.emissiveIntensity
      }
      mat.emissive.set(accent)
      mat.emissiveIntensity = 0.85
      return
    }
    if (hasOpacity(mat)) {
      this.saved = { material: mat, opacity: mat.opacity }
      mat.opacity = Math.min(1, mat.opacity * 1.2 + 0.1)
    }
  }

  update(dt: number, camera: THREE.Camera): void {
    if (!this.active) return
    this.pulse += dt
    const dist = camera.position.distanceTo(this.sprite.position)
    const wave = 0.5 + 0.5 * Math.sin(this.pulse * 5.2)
    const size = Math.max(dist * 0.048, 0.015) * (1 + 0.06 * wave)
    this.sprite.scale.setScalar(size)
    this.material.opacity = 0.5 + 0.4 * wave
    const saved = this.saved
    if (!saved) return
    if (saved.emissiveIntensity !== undefined && isStandardMaterial(saved.material)) {
      saved.material.emissiveIntensity = saved.emissiveIntensity + 0.6 * wave
    }
    if (saved.opacity !== undefined && hasOpacity(saved.material)) {
      saved.material.opacity = Math.min(1, saved.opacity * (1.05 + 0.25 * wave))
    }
  }

  clear(): void {
    this.active = false
    this.sprite.visible = false
    const saved = this.saved
    if (!saved) return
    if (saved.emissive && isStandardMaterial(saved.material)) {
      saved.material.emissive.copy(saved.emissive)
    }
    if (saved.emissiveIntensity !== undefined && isStandardMaterial(saved.material)) {
      saved.material.emissiveIntensity = saved.emissiveIntensity
    }
    if (saved.opacity !== undefined && hasOpacity(saved.material)) {
      saved.material.opacity = saved.opacity
    }
    this.saved = null
  }

  dispose(): void {
    this.clear()
    this.texture.dispose()
    this.material.dispose()
  }
}

function makeReticleTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  const c = size / 2
  const grad = ctx.createRadialGradient(c, c, size * 0.2, c, c, size * 0.5)
  grad.addColorStop(0, 'rgba(95,214,255,0)')
  grad.addColorStop(0.58, 'rgba(95,214,255,0.12)')
  grad.addColorStop(0.76, 'rgba(95,214,255,0.8)')
  grad.addColorStop(0.86, 'rgba(223,241,255,1)')
  grad.addColorStop(1, 'rgba(95,214,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(223,241,255,0.9)'
  ctx.lineWidth = 3
  const tick = 14
  const gap = size * 0.5 - tick
  ctx.beginPath()
  ctx.moveTo(c, 0)
  ctx.lineTo(c, tick)
  ctx.moveTo(c, size - tick)
  ctx.lineTo(c, size)
  ctx.moveTo(0, c)
  ctx.lineTo(tick, c)
  ctx.moveTo(size - tick, c)
  ctx.lineTo(size, c)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(95,214,255,0.55)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(c, c, gap, 0, Math.PI * 2)
  ctx.stroke()
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 2
  return tex
}
