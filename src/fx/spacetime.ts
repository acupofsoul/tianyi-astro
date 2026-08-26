// Canvas 2D 网状时空弯曲特效：数据驱动的网格 + 粒子场
export class SpacetimeCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private ro: ResizeObserver
  private raf = 0
  private t = 0
  private width = 0
  private height = 0
  private dpr = 1
  private cols = 30
  private rows = 18
  private mouse = { x: 0, y: 0, active: false }
  private sparks: { x: number; y: number; z: number; vx: number; vy: number; vz: number; r: number; hue: number }[] = []

  constructor(private container: HTMLElement) {
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
    container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')!

    for (let i = 0; i < 140; i++) {
      this.sparks.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 1.4 - 0.4,
        vx: (Math.random() - 0.5) * 0.0008,
        vy: (Math.random() - 0.5) * 0.0008,
        vz: (Math.random() - 0.5) * 0.0005,
        r: 0.5 + Math.random() * 1.6,
        hue: 195 + Math.random() * 55
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
    // 两个缓慢移动的引力井，模拟大质量天体造成的时空弯曲
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
    // 细微波动，像引力波涟漪
    const ripple = 0.03 * Math.sin(wx * 12 - t * 1.2) * Math.cos(wz * 9 + t * 0.9)
    return -(dip + ripple)
  }

  private drawGrid() {
    const { ctx } = this
    const { width, height } = this
    ctx.clearRect(0, 0, width, height)

    // 预计算投影点与深度亮度
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

    // 网格线：深度越大越亮，形成被压弯的发光感
    ctx.lineWidth = 0.6
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 1; c++) {
        const a = pts[r][c]
        const b = pts[r][c + 1]
        const depth = Math.max(0, -((a.wy + b.wy) / 2))
        const alpha = 0.05 + depth * 0.55
        ctx.strokeStyle = 'rgba(64, 140, 255, ' + alpha.toFixed(3) + ')'
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
        const alpha = 0.05 + depth * 0.55
        ctx.strokeStyle = 'rgba(64, 140, 255, ' + alpha.toFixed(3) + ')'
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }

    // 节点：像发光星点
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const a = pts[r][c]
        const depth = Math.max(0, -a.wy)
        const size = (0.6 + depth * 2.4) * a.p
        ctx.fillStyle = 'rgba(120, 180, 255, ' + (0.15 + depth * 0.6).toFixed(3) + ')'
        ctx.beginPath()
        ctx.arc(a.x, a.y, size * 2.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(210, 235, 255, ' + (0.25 + depth * 0.7).toFixed(3) + ')'
        ctx.beginPath()
        ctx.arc(a.x, a.y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  private drawSparks() {
    const { ctx } = this
    ctx.globalCompositeOperation = 'lighter'
    for (const s of this.sparks) {
      s.x += s.vx
      s.y += s.vy
      s.z += s.vz
      if (s.x < -1.1) s.x = 1.1
      if (s.x > 1.1) s.x = -1.1
      if (s.y < -1.1) s.y = 1.1
      if (s.y > 1.1) s.y = -1.1
      if (s.z < -0.6) s.z = 0.6
      if (s.z > 0.6) s.z = -0.6

      const pr = this.project(s.x * 0.9, s.z, s.y * 0.4)
      const alpha = 0.12 + 0.2 * (1 - Math.abs(s.z))
      ctx.fillStyle = 'hsla(' + s.hue + ', 90%, 70%, ' + alpha.toFixed(3) + ')'
      ctx.beginPath()
      ctx.arc(pr.x, pr.y, s.r * pr.p, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  start() {
    const loop = () => {
      this.t += 0.016
      this.drawGrid()
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
