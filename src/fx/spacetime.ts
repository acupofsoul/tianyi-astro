// Canvas 2D 背景：地面仰望星空 + 银河 + 时空弯曲网格 + 粒子
export class SpacetimeCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private ro: ResizeObserver
  private raf = 0
  private t = 0
  private width = 0
  private height = 0
  private dpr = 1
  private cols = 26
  private rows = 14
  private mouse = { x: 0, y: 0, active: false }
  private sparks: { x: number; y: number; z: number; vx: number; vy: number; vz: number; r: number; hue: number }[] = []
  private stars: { x: number; y: number; r: number; a: number; speed: number; phase: number; hue: number }[] = []

  constructor(private container: HTMLElement) {
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
    container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')!

    for (let i = 0; i < 120; i++) {
      this.sparks.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 1.4 - 0.4,
        z: Math.random() * 1.2 - 0.3,
        vx: (Math.random() - 0.5) * 0.0008,
        vy: (Math.random() - 0.5) * 0.0008,
        vz: (Math.random() - 0.5) * 0.0004,
        r: 0.4 + Math.random() * 1.4,
        hue: 190 + Math.random() * 55
      })
    }

    // 星空：大部分是暗星，少数亮星；部分集中在银河带上
    for (let i = 0; i < 900; i++) {
      const nearBand = Math.random() < 0.42
      this.stars.push({
        x: Math.random(),
        y: nearBand ? 0.05 + Math.random() * 0.55 : Math.random() * 0.9,
        r: 0.25 + Math.random() * 1.2,
        a: 0.15 + Math.random() * 0.7,
        speed: 0.5 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        hue: 200 + Math.random() * 40
      })
    }

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)
    this.resize()

    container.addEventListener('pointermove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      this.mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      this.mouse.active = true
    })
    container.addEventListener('pointerleave', () => {
      this.mouse.active = false
    })
  }

  private resize() {
    const rect = this.container.getBoundingClientRect()
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.width = Math.max(1, rect.width)
    this.height = Math.max(1, rect.height)
    this.canvas.width = Math.floor(this.width * this.dpr)
    this.canvas.height = Math.floor(this.height * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  private project(wx: number, wz: number, wy: number) {
    const rotX = 0.72
    const ry = wy * Math.cos(rotX) - wz * Math.sin(rotX)
    const rz = wy * Math.sin(rotX) + wz * Math.cos(rotX)
    const focal = 2.6
    const persp = focal / (focal + rz + 1.2)
    return {
      x: this.width / 2 + wx * this.width * 0.72 * persp,
      y: this.height * 0.46 - ry * this.height * 0.85 * persp,
      p: persp
    }
  }

  private curvatureAt(wx: number, wz: number) {
    const t = this.t
    const wells = [
      { x: Math.sin(t * 0.16) * 0.55, z: Math.cos(t * 0.13) * 0.2, s: 0.62, r: 0.46 },
      { x: Math.cos(t * 0.11) * 0.7, z: Math.sin(t * 0.17) * 0.24, s: 0.4, r: 0.3 },
      { x: this.mouse.active ? this.mouse.x * 0.9 : 0, z: this.mouse.active ? -this.mouse.y * 0.4 : 0, s: this.mouse.active ? 0.32 : 0, r: 0.22 }
    ]
    let dip = 0
    for (const w of wells) {
      const dx = wx - w.x
      const dz = wz - w.z
      dip += w.s * Math.exp(-(dx * dx + dz * dz) / (w.r * w.r))
    }
    const ripple = 0.03 * Math.sin(wx * 12 - t * 1.2) * Math.cos(wz * 9 + t * 0.9)
    return -(dip + ripple)
  }

  private horizonY() {
    return this.height * 0.8
  }

  private drawSky() {
    const { ctx, width, height } = this
    const horizon = this.horizonY()

    // 天空渐变：地面较亮、天顶更深，模拟仰望星空
    const sky = ctx.createLinearGradient(0, 0, 0, horizon)
    sky.addColorStop(0, '#04070f')
    sky.addColorStop(0.55, '#0a1428')
    sky.addColorStop(1, '#0f2a46')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, width, horizon + 1)

    // 银河带：一条斜向的柔和光带
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const cx = width * 0.5
    const cy = height * 0.38
    const angle = -0.38
    for (let i = -7; i <= 7; i++) {
      const t = i / 7
      const x = cx + Math.cos(angle) * t * width * 0.52
      const y = cy + Math.sin(angle) * t * width * 0.52
      const rr = width * (0.13 + Math.abs(t) * 0.03)
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr)
      g.addColorStop(0, 'rgba(160, 180, 235, 0.10)')
      g.addColorStop(0.5, 'rgba(110, 140, 220, 0.05)')
      g.addColorStop(1, 'rgba(80, 110, 200, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, rr, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  private drawStars() {
    const { ctx, width, height } = this
    const horizon = this.horizonY()
    const cx = width * 0.5
    const cy = height * 0.38
    const angle = -0.38

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (const s of this.stars) {
      // 让一部分星靠近银河带分布
      let x = s.x * width
      let y = s.y * height
      if (s.y < 0.6 && Math.abs((s.x - 0.5) * Math.sin(-angle) + (s.y - 0.38) * Math.cos(-angle)) < 0.12) {
        x = cx + (s.x - 0.5) * width * 1.4
        y = cy + (s.y - 0.38) * height * 1.4
      }
      const tw = 0.6 + 0.4 * Math.sin(this.t * s.speed + s.phase)
      const alpha = Math.max(0, s.a * tw)
      ctx.fillStyle = 'hsla(' + s.hue + ', 80%, 85%, ' + alpha.toFixed(3) + ')'
      ctx.beginPath()
      ctx.arc(x, y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  private drawGround() {
    const { ctx, width, height } = this
    const horizon = this.horizonY()
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(0, horizon)
    for (let x = 0; x <= width; x += 40) {
      const y = horizon + Math.sin(x * 0.012) * 6 + Math.sin(x * 0.003) * 14
      ctx.lineTo(x, y)
    }
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    const g = ctx.createLinearGradient(0, horizon, 0, height)
    g.addColorStop(0, 'rgba(4, 8, 16, 0.2)')
    g.addColorStop(1, 'rgba(2, 4, 10, 0.95)')
    ctx.fillStyle = g
    ctx.fill()
    ctx.restore()
  }

  private drawGrid() {
    const { ctx, width, height } = this
    const horizon = this.horizonY()

    const pts: { x: number; y: number; wy: number; p: number }[][] = []
    for (let r = 0; r < this.rows; r++) {
      const row: { x: number; y: number; wy: number; p: number }[] = []
      const wz = (r / (this.rows - 1) - 0.5) * 1.5
      for (let c = 0; c < this.cols; c++) {
        const wx = (c / (this.cols - 1) - 0.5) * 1.9
        const wy = this.curvatureAt(wx, wz)
        const pr = this.project(wx, wz, wy)
        row.push({ x: pr.x, y: pr.y, wy, p: pr.p })
      }
      pts.push(row)
    }

    // 网格线：保持较淡，让星空和银河成为主角
    ctx.lineWidth = 0.5
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 1; c++) {
        const a = pts[r][c]
        const b = pts[r][c + 1]
        const depth = Math.max(0, -((a.wy + b.wy) / 2))
        ctx.strokeStyle = 'rgba(64, 140, 255, ' + (0.04 + depth * 0.3).toFixed(3) + ')'
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows - 1; r++) {
        const a = pts[r][c]
        const b = pts[r + 1][c]
        const depth = Math.max(0, -((a.wy + b.wy) / 2))
        ctx.strokeStyle = 'rgba(64, 140, 255, ' + (0.04 + depth * 0.3).toFixed(3) + ')'
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }

    // 网格节点
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const a = pts[r][c]
        if (a.y > horizon) continue
        const depth = Math.max(0, -a.wy)
        const size = (0.5 + depth * 2) * a.p
        ctx.fillStyle = 'rgba(120, 180, 255, ' + (0.1 + depth * 0.4).toFixed(3) + ')'
        ctx.beginPath()
        ctx.arc(a.x, a.y, size * 1.9, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(210, 235, 255, ' + (0.16 + depth * 0.5).toFixed(3) + ')'
        ctx.beginPath()
        ctx.arc(a.x, a.y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  private drawSparks() {
    const { ctx } = this
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (const s of this.sparks) {
      s.x += s.vx
      s.y += s.vy
      s.z += s.vz
      if (s.x < -1.1) s.x = 1.1
      if (s.x > 1.1) s.x = -1.1
      if (s.y < -0.4) s.y = 0.8
      if (s.y > 0.8) s.y = -0.4
      if (s.z < -0.5) s.z = 0.5
      if (s.z > 0.5) s.z = -0.5
      const pr = this.project(s.x * 0.9, s.z, s.y * 0.4)
      if (pr.y > this.horizonY()) continue
      const alpha = 0.12 + 0.2 * (1 - Math.abs(s.z))
      ctx.fillStyle = 'hsla(' + s.hue + ', 90%, 70%, ' + alpha.toFixed(3) + ')'
      ctx.beginPath()
      ctx.arc(pr.x, pr.y, s.r * pr.p, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  start() {
    const loop = () => {
      this.t += 0.016
      const { ctx, width, height } = this
      ctx.clearRect(0, 0, width, height)
      this.drawSky()
      this.drawGrid()
      this.drawStars()
      this.drawGround()
      this.drawSparks()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    if (this.canvas.parentElement === this.container) this.container.removeChild(this.canvas)
  }
}
