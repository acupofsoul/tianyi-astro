import { useState, useRef, useEffect, useMemo } from 'react'
import '../styles/industrial.css'

const wondersData = [
  {
    id: 'blackHole',
    label: '黑洞',
    icon: '🌀',
    theme: 'gravity',
    subtitle: 'Gravitational Singularity',
    description: '宇宙中最强大的引力场，连光都无法逃脱',
    data: [
      { label: '质量', value: '10M', unit: 'M☉', trend: null },
      { label: '事件视界', value: '29.5', unit: 'km', trend: null },
      { label: '吸积盘温度', value: '1M', unit: '°C', trend: 'up' },
      { label: '类型', value: '超大质量', unit: '', trend: null }
    ]
  },
  {
    id: 'comet',
    label: '彗星',
    icon: '☄',
    theme: 'ion',
    subtitle: 'Cosmic Wanderer',
    description: '来自太阳系边缘的冰冷旅者，拖着美丽的尾巴划过夜空',
    data: [
      { label: '彗核直径', value: '10', unit: 'km', trend: null },
      { label: '轨道周期', value: '76', unit: '年', trend: null },
      { label: '距日距离', value: '2.5', unit: 'AU', trend: 'up' },
      { label: '尾长', value: '150', unit: 'km', trend: 'up' }
    ]
  },
  {
    id: 'binaryStar',
    label: '双星系统',
    icon: '⭐',
    theme: 'binary',
    subtitle: 'Binary Dance',
    description: '两颗恒星的引力之舞，宇宙中最壮观的双星系统',
    data: [
      { label: '主星质量', value: '2.3', unit: 'M☉', trend: null },
      { label: '伴星质量', value: '0.8', unit: 'M☉', trend: null },
      { label: '轨道周期', value: '3.7', unit: '天', trend: null },
      { label: '间距', value: '0.06', unit: 'AU', trend: 'down' }
    ]
  },
  {
    id: 'supernova',
    label: '超新星',
    icon: '💥',
    theme: 'supernova',
    subtitle: 'Stellar Death',
    description: '恒星的壮烈终章，宇宙中最剧烈的爆发事件',
    data: [
      { label: '爆发能量', value: '10', unit: 'foe', trend: null },
      { label: '亮度峰值', value: '-19', unit: 'mag', trend: 'down' },
      { label: '喷射质量', value: '10', unit: 'M☉', trend: null },
      { label: '残留物', value: '中子星', unit: '', trend: null }
    ]
  },
  {
    id: 'nebula',
    label: '星云',
    icon: '🌌',
    theme: 'nebula',
    subtitle: 'Stellar Nursery',
    description: '宇宙中的瑰丽云朵，新恒星诞生的摇篮',
    data: [
      { label: '直径', value: '24', unit: 'ly', trend: null },
      { label: '距地球', value: '1,344', unit: 'ly', trend: null },
      { label: '恒星数', value: '4,582', unit: '', trend: 'up' },
      { label: '年龄', value: '2.0', unit: 'Myr', trend: null }
    ]
  }
]

const infoCards = {
  blackHole: [
    { icon: '⚫', title: '事件视界', text: '连光都无法逃脱的边界，任何物质进入后都无法返回。这是黑洞最核心的特征标志。' },
    { icon: '🔥', title: '吸积盘', text: '被黑洞引力捕获的物质形成的旋转盘，摩擦产生极高温度，发出强烈辐射。' },
    { icon: '💫', title: '相对论性喷流', text: '高能粒子以接近光速的速度从黑洞两极喷射而出，延伸数万光年。' }
  ],
  comet: [
    { icon: '💨', title: '离子尾', text: '太阳风将电离气体吹向后方，形成笔直的蓝色尾迹。' },
    { icon: '✨', title: '尘埃尾', text: '尘埃颗粒被太阳辐射压推离，形成弯曲的黄色尾迹。' },
    { icon: '🌫️', title: '彗发', text: '彗星接近太阳时，表面物质升华形成的巨大大气层。' }
  ],
  binaryStar: [
    { icon: '🔄', title: '引力束缚', text: '两颗恒星相互绕行，共享物质，创造出独特的双星系统动力学。' },
    { icon: '🌊', title: '质量转移', text: '一颗恒星将物质转移给另一颗，形成复杂的吸积结构。' },
    { icon: '⚡', title: '引力波', text: '双星系统运动时辐射引力波，带走系统能量。' }
  ],
  supernova: [
    { icon: '💥', title: '核心坍缩', text: '大质量恒星燃料耗尽后，核心在自身引力下急剧坍缩。' },
    { icon: '🌊', title: '激波爆发', text: '坍缩释放的能量产生强大激波，将恒星外层物质抛射出去。' },
    { icon: '🕳️', title: '残留物', text: '爆发后可能形成中子星或黑洞，成为宇宙中最致密的天体。' }
  ],
  nebula: [
    { icon: '🌱', title: '恒星形成', text: '气体云在引力作用下坍缩，形成新的恒星和行星系统。' },
    { icon: '🎨', title: '五彩斑斓', text: '不同元素发出不同颜色的光，创造出宇宙中最绚丽的景观。' },
    { icon: '♻️', title: '物质循环', text: '超新星抛射的物质成为新一代恒星和行星的原材料。' }
  ]
}

const Wonders = () => {
  const [activeTab, setActiveTab] = useState('blackHole')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [controls, setControls] = useState({
    speed: 50,
    brightness: 50,
    scale: 50,
    density: 50
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour12: false,
      timeZone: 'UTC'
    })
  }, [currentTime])

  const activeData = wondersData.find(w => w.id === activeTab)

  return (
    <div className="obs-container">
      {/* Header */}
      <header className="obs-header">
        <div className="obs-header__brand">
          <div className="obs-header__logo">DS</div>
          <div>
            <div className="obs-header__title">Deep Space Observatory</div>
          </div>
        </div>
        <div className="obs-header__status">
          <div className="obs-header__status-item">
            <span className="obs-header__status-dot" />
            <span>系统在线</span>
          </div>
          <div className="obs-header__time">{formattedTime} UTC</div>
        </div>
      </header>

      <div className="obs-main">
        {/* Navigation Sidebar */}
        <nav className="obs-nav">
          <div className="obs-nav__section">
            <div className="obs-nav__section-title">天文奇观</div>
            <div className="obs-nav__list">
              {wondersData.map(wonder => (
                <button
                  key={wonder.id}
                  className={`obs-nav__item ${activeTab === wonder.id ? 'is-active' : ''}`}
                  data-theme={wonder.theme}
                  onClick={() => setActiveTab(wonder.id)}
                >
                  <span className="obs-nav__icon">{wonder.icon}</span>
                  <span className="obs-nav__label">{wonder.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="obs-content">
          {/* Page Header */}
          <div className="obs-page-header">
            <div>
              <h1 className="obs-page-title">{activeData?.label}</h1>
              <p className="obs-page-subtitle">{activeData?.subtitle} — {activeData?.description}</p>
            </div>
            <div className="obs-page-actions">
              <button className="obs-btn obs-btn--icon" title="全屏">
                ⛶
              </button>
              <button className="obs-btn obs-btn--icon" title="截图">
                📷
              </button>
            </div>
          </div>

          {/* Canvas Section */}
          <section className="obs-canvas-section">
            <div className="obs-canvas-wrapper">
              <canvas ref={useRef(null)} className="obs-canvas" id="mainCanvas" />
              <div className="obs-canvas-overlay">
                <span className="obs-canvas-tag obs-canvas-tag--live">实时模拟</span>
                <span className="obs-canvas-tag">{activeData?.theme.toUpperCase()}</span>
              </div>
              {activeTab === 'blackHole' && <BlackHoleCanvas />}
              {activeTab === 'comet' && <CometCanvas />}
              {activeTab === 'binaryStar' && <BinaryStarCanvas />}
              {activeTab === 'supernova' && <SupernovaCanvas />}
              {activeTab === 'nebula' && <NebulaCanvas />}
            </div>
          </section>

          {/* Control Panels */}
          <div className="obs-panels">
            {/* Control Panel */}
            <div className="obs-panel">
              <div className="obs-panel__header">
                <div className="obs-panel__title">
                  <span className="obs-panel__icon">⚙</span>
                  参数控制
                </div>
                <span className="obs-panel__badge">可调节</span>
              </div>
              <div className="obs-panel__body">
                <SliderControl
                  label="旋转速度"
                  value={controls.speed}
                  min={0}
                  max={100}
                  onChange={(v) => setControls(c => ({ ...c, speed: v }))}
                />
                <SliderControl
                  label="亮度"
                  value={controls.brightness}
                  min={0}
                  max={100}
                  onChange={(v) => setControls(c => ({ ...c, brightness: v }))}
                />
                <SliderControl
                  label="缩放比例"
                  value={controls.scale}
                  min={10}
                  max={100}
                  onChange={(v) => setControls(c => ({ ...c, scale: v }))}
                />
                <SliderControl
                  label="粒子密度"
                  value={controls.density}
                  min={0}
                  max={100}
                  onChange={(v) => setControls(c => ({ ...c, density: v }))}
                />
              </div>
            </div>

            {/* Data Panel */}
            <div className="obs-panel">
              <div className="obs-panel__header">
                <div className="obs-panel__title">
                  <span className="obs-panel__icon">📊</span>
                  实时数据
                </div>
                <span className="obs-panel__badge">监测中</span>
              </div>
              <div className="obs-panel__body">
                <div className="obs-data-grid">
                  {activeData?.data.map((item, idx) => (
                    <div key={idx} className="obs-data-item">
                      <span className="obs-data-item__label">{item.label}</span>
                      <span className="obs-data-item__value">
                        {item.value}
                        <span className="obs-data-item__unit">{item.unit}</span>
                        {item.trend && (
                          <span className={`obs-data-item__trend obs-data-item__trend--${item.trend}`}>
                            {item.trend === 'up' ? '↑' : '↓'}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="obs-panel">
              <div className="obs-panel__header">
                <div className="obs-panel__title">
                  <span className="obs-panel__icon">ℹ</span>
                  科学知识
                </div>
                <span className="obs-panel__badge">参考</span>
              </div>
              <div className="obs-panel__body">
                <div className="obs-info-list">
                  {infoCards[activeTab as keyof typeof infoCards]?.map((card, idx) => (
                    <div key={idx} className="obs-info-card">
                      <div className="obs-info-card__header">
                        <span className="obs-info-card__icon">{card.icon}</span>
                        <span className="obs-info-card__title">{card.title}</span>
                      </div>
                      <p className="obs-info-card__text">{card.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

const SliderControl = ({ label, value, min, max, onChange }: SliderControlProps) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="obs-slider">
      <div className="obs-slider__header">
        <span className="obs-slider__label">{label}</span>
        <span className="obs-slider__value">{value}</span>
      </div>
      <div className="obs-slider__track">
        <div className="obs-slider__fill" style={{ width: `${percentage}%` }} />
        <input
          type="range"
          className="obs-slider__input"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      <div className="obs-slider__markers">
        <span className="obs-slider__marker">{min}</span>
        <span className="obs-slider__marker">{max}</span>
      </div>
    </div>
  )
}

// Canvas Components
const BlackHoleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.offsetWidth
        canvas.height = 500
      }
    }
    resize()
    window.addEventListener('resize', resize)

    let animationId: number
    let time = 0

    const stars = Array(600).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5,
      brightness: Math.random() * 0.6 + 0.4,
      twinkle: Math.random() * 0.02 + 0.005
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const blackHoleRadius = 60

      ctx.fillStyle = '#050810'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.twinkle + i) * 0.3 + 0.7
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        const dx = x - centerX
        const dy = y - centerY
        const dist = Math.sqrt(dx * dx + dy * dy)

        let drawX = x, drawY = y
        if (dist > blackHoleRadius * 1.5) {
          const lensStrength = 80 / (dist / 40 + 1)
          drawX = x + (dx / dist) * lensStrength * 0.8
          drawY = y + (dy / dist) * lensStrength * 0.8
        }

        ctx.beginPath()
        ctx.arc(drawX, drawY, star.size * twinkle, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`
        ctx.fill()
      })

      const diskRotation = time * 0.008

      for (let ring = 0; ring < 8; ring++) {
        const ringRadius = blackHoleRadius * 2 + ring * 10
        const opacity = 0.15 - ring * 0.015

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation * 0.3 + ring * 0.2)

        const gradient = ctx.createRadialGradient(0, 0, ringRadius - 3, 0, 0, ringRadius + 3)
        gradient.addColorStop(0, 'transparent')
        gradient.addColorStop(0.5, `rgba(255, 180, 100, ${opacity})`)
        gradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.ellipse(0, 0, ringRadius, ringRadius * 0.12, 0, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.restore()
      }

      for (let layer = 0; layer < 20; layer++) {
        const diskRadius = 70 + layer * 7
        const diskThickness = 4 + layer * 1.5

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation)
        ctx.scale(1, 0.08 + layer * 0.008)

        const gradient = ctx.createLinearGradient(-diskRadius, 0, diskRadius, 0)
        const baseOpacity = Math.max(0.05, 0.8 - layer * 0.035)

        gradient.addColorStop(0, 'transparent')
        gradient.addColorStop(0.3, `rgba(100, 150, 220, ${baseOpacity * 0.6})`)
        gradient.addColorStop(0.45, `rgba(255, 220, 150, ${baseOpacity})`)
        gradient.addColorStop(0.5, `rgba(255, 240, 180, ${baseOpacity * 1.2})`)
        gradient.addColorStop(0.55, `rgba(255, 200, 100, ${baseOpacity})`)
        gradient.addColorStop(0.7, `rgba(200, 80, 50, ${baseOpacity * 0.6})`)
        gradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.ellipse(0, 0, diskRadius, diskThickness, 0, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.restore()
      }

      for (let i = 0; i < 150; i++) {
        const angle = (i / 150) * Math.PI * 2 + time * 0.04
        const distance = 60 + Math.sin(i * 0.3 + time * 0.12) * 15
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance * 0.08

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation)

        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 4)
        particleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
        particleGradient.addColorStop(0.5, `rgba(255, 200, 100, 0.5)`)
        particleGradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = particleGradient
        ctx.fill()
        ctx.restore()
      }

      const coronaGradient = ctx.createRadialGradient(
        centerX, centerY, blackHoleRadius,
        centerX, centerY, blackHoleRadius * 3
      )
      coronaGradient.addColorStop(0, 'rgba(255, 200, 100, 0.2)')
      coronaGradient.addColorStop(0.4, 'rgba(255, 150, 50, 0.1)')
      coronaGradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(centerX, centerY, blackHoleRadius * 3, 0, Math.PI * 2)
      ctx.fillStyle = coronaGradient
      ctx.fill()

      const blackHoleGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, blackHoleRadius
      )
      blackHoleGradient.addColorStop(0, '#000000')
      blackHoleGradient.addColorStop(0.85, '#000000')
      blackHoleGradient.addColorStop(1, '#0a0500')

      ctx.beginPath()
      ctx.arc(centerX, centerY, blackHoleRadius, 0, Math.PI * 2)
      ctx.fillStyle = blackHoleGradient
      ctx.fill()

      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 100
      ctx.fill()
      ctx.shadowBlur = 0

      for (let i = 0; i < 8; i++) {
        const jetLength = 180 + Math.sin(time * 0.05 + i * 0.8) * 40
        const jetWidth = 3 + i * 0.5

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation * 0.2)

        const jetGradient = ctx.createLinearGradient(0, 0, 0, jetLength * (i % 2 === 0 ? -1 : 1))
        jetGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
        jetGradient.addColorStop(0.2, 'rgba(200, 220, 255, 0.7)')
        jetGradient.addColorStop(0.5, 'rgba(150, 180, 255, 0.4)')
        jetGradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.moveTo(-jetWidth, 0)
        ctx.lineTo(0, jetLength * (i % 2 === 0 ? -1 : 1))
        ctx.lineTo(jetWidth, 0)
        ctx.closePath()
        ctx.fillStyle = jetGradient
        ctx.fill()
        ctx.restore()
      }

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="obs-canvas" />
}

const CometCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.offsetWidth
        canvas.height = 500
      }
    }
    resize()
    window.addEventListener('resize', resize)

    let animationId: number
    let time = 0

    const stars = Array(200).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5,
      brightness: Math.random() * 0.5 + 0.3,
      twinkle: Math.random() * 0.03 + 0.005
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const sunX = centerX
      const sunY = centerY + 30

      ctx.fillStyle = '#050810'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.twinkle + i) * 0.3 + 0.7
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, star.size * twinkle, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`
        ctx.fill()
      })

      const a = 180
      const b = 90
      const angle = time * 0.006
      const cometX = centerX + Math.cos(angle) * a
      const cometY = centerY + Math.sin(angle) * b

      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50)
      sunGradient.addColorStop(0, '#ffffff')
      sunGradient.addColorStop(0.2, '#ffeecc')
      sunGradient.addColorStop(0.5, '#ffaa44')
      sunGradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(sunX, sunY, 50, 0, Math.PI * 2)
      ctx.fillStyle = sunGradient
      ctx.fill()

      ctx.strokeStyle = 'rgba(100, 149, 237, 0.2)'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, a, b, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      const dx = cometX - sunX
      const dy = cometY - sunY
      const distToSun = Math.sqrt(dx * dx + dy * dy)
      const tailDirX = dx / distToSun
      const tailDirY = dy / distToSun

      const tailLength = 180 + (400 - distToSun) / 3

      const ionTailLength = tailLength * 1.2
      const ionTailEndX = cometX + tailDirX * ionTailLength
      const ionTailEndY = cometY + tailDirY * ionTailLength

      const ionTailGradient = ctx.createLinearGradient(cometX, cometY, ionTailEndX, ionTailEndY)
      const baseOpacity = Math.max(0.3, 1 - distToSun / 400)
      ionTailGradient.addColorStop(0, `rgba(100, 200, 255, ${baseOpacity * 0.7})`)
      ionTailGradient.addColorStop(0.5, `rgba(150, 220, 255, ${baseOpacity * 0.4})`)
      ionTailGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.moveTo(cometX, cometY - 8)
      ctx.quadraticCurveTo(
        (cometX + ionTailEndX) / 2 + Math.sin(time * 0.02) * 20,
        (cometY + ionTailEndY) / 2,
        ionTailEndX + Math.sin(time * 0.03) * 15,
        ionTailEndY
      )
      ctx.lineTo(ionTailEndX + Math.sin(time * 0.03 + 1) * 10, ionTailEndY + 30)
      ctx.quadraticCurveTo(
        (cometX + ionTailEndX) / 2 + Math.sin(time * 0.02 + 2) * 25,
        (cometY + ionTailEndY) / 2 + 10,
        cometX,
        cometY + 8
      )
      ctx.closePath()
      ctx.fillStyle = ionTailGradient
      ctx.fill()

      const dustTailLength = tailLength * 0.8
      const dustTailEndX = cometX + tailDirX * dustTailLength + Math.cos(angle + Math.PI / 4) * 40
      const dustTailEndY = cometY + tailDirY * dustTailLength + Math.sin(angle + Math.PI / 4) * 40

      const dustTailGradient = ctx.createLinearGradient(cometX, cometY, dustTailEndX, dustTailEndY)
      dustTailGradient.addColorStop(0, `rgba(255, 220, 150, ${baseOpacity * 0.6})`)
      dustTailGradient.addColorStop(0.6, `rgba(255, 180, 100, ${baseOpacity * 0.3})`)
      dustTailGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.moveTo(cometX, cometY - 5)
      ctx.quadraticCurveTo(
        (cometX + dustTailEndX) / 2 + Math.cos(time * 0.015) * 30,
        (cometY + dustTailEndY) / 2 + 20,
        dustTailEndX,
        dustTailEndY
      )
      ctx.lineTo(dustTailEndX + 20, dustTailEndY + 40)
      ctx.quadraticCurveTo(
        (cometX + dustTailEndX) / 2 + Math.cos(time * 0.015 + 1) * 35,
        (cometY + dustTailEndY) / 2 + 30,
        cometX,
        cometY + 5
      )
      ctx.closePath()
      ctx.fillStyle = dustTailGradient
      ctx.fill()

      const comaSize = 35 + (400 - distToSun) / 12
      const comaGradient = ctx.createRadialGradient(cometX, cometY, 0, cometX, cometY, comaSize)
      comaGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)')
      comaGradient.addColorStop(0.4, 'rgba(200, 220, 255, 0.4)')
      comaGradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(cometX, cometY, comaSize, 0, Math.PI * 2)
      ctx.fillStyle = comaGradient
      ctx.fill()

      const nucleusGradient = ctx.createRadialGradient(
        cometX - 2, cometY - 2, 0,
        cometX, cometY, 12
      )
      nucleusGradient.addColorStop(0, '#ffffff')
      nucleusGradient.addColorStop(0.6, '#dddddd')
      nucleusGradient.addColorStop(1, '#888888')

      ctx.beginPath()
      ctx.arc(cometX, cometY, 12, 0, Math.PI * 2)
      ctx.fillStyle = nucleusGradient
      ctx.fill()

      const highlightGradient = ctx.createRadialGradient(
        cometX - 4, cometY - 4, 0,
        cometX - 4, cometY - 4, 8
      )
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      highlightGradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(cometX - 4, cometY - 4, 8, 0, Math.PI * 2)
      ctx.fillStyle = highlightGradient
      ctx.fill()

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="obs-canvas" />
}

const BinaryStarCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.offsetWidth
        canvas.height = 500
      }
    }
    resize()
    window.addEventListener('resize', resize)

    let animationId: number
    let time = 0

    const stars = Array(150).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.3,
      brightness: Math.random() * 0.5 + 0.3,
      twinkle: Math.random() * 0.03 + 0.005
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const orbitRadius = 80

      ctx.fillStyle = '#050810'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.twinkle + i) * 0.3 + 0.7
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, star.size * twinkle, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`
        ctx.fill()
      })

      for (let w = 0; w < 5; w++) {
        const waveRadius = 150 + w * 40 - (time * 0.5 % 40)
        const waveOpacity = 0.1 * (1 - w / 5) * Math.max(0, 1 - (150 + w * 40 - waveRadius) / 40)

        ctx.beginPath()
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 217, 61, ${waveOpacity})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      const angle = time * 0.012
      const star1X = centerX + Math.cos(angle) * orbitRadius
      const star1Y = centerY + Math.sin(angle) * orbitRadius * 0.4
      const star2X = centerX + Math.cos(angle + Math.PI) * orbitRadius * 0.7
      const star2Y = centerY + Math.sin(angle + Math.PI) * orbitRadius * 0.3

      const accretionGradient1 = ctx.createRadialGradient(
        star1X, star1Y, 20,
        star1X, star1Y, 50
      )
      accretionGradient1.addColorStop(0, 'rgba(255, 180, 80, 0.3)')
      accretionGradient1.addColorStop(0.5, 'rgba(255, 150, 50, 0.15)')
      accretionGradient1.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(star1X, star1Y, 50, 0, Math.PI * 2)
      ctx.fillStyle = accretionGradient1
      ctx.fill()

      for (let i = 0; i < 30; i++) {
        const transferAngle = angle + (i / 30) * Math.PI + Math.sin(time * 0.03 + i) * 0.3
        const transferProgress = ((time * 0.02 + i * 0.1) % 1)
        const transferX = star2X + (star1X - star2X) * transferProgress + Math.sin(transferAngle) * 10
        const transferY = star2Y + (star1Y - star2Y) * transferProgress * 0.5 + Math.cos(transferAngle) * 5

        ctx.beginPath()
        ctx.arc(transferX, transferY, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 200, 100, ${0.6 * (1 - transferProgress)})`
        ctx.fill()
      }

      const star1Gradient = ctx.createRadialGradient(
        star1X - 8, star1Y - 8, 0,
        star1X, star1Y, 30
      )
      star1Gradient.addColorStop(0, '#ffffff')
      star1Gradient.addColorStop(0.3, '#ffeeaa')
      star1Gradient.addColorStop(0.7, '#ffaa44')
      star1Gradient.addColorStop(1, '#ff6600')

      ctx.beginPath()
      ctx.arc(star1X, star1Y, 30, 0, Math.PI * 2)
      ctx.fillStyle = star1Gradient
      ctx.fill()

      ctx.shadowColor = '#ffaa44'
      ctx.shadowBlur = 40
      ctx.fill()
      ctx.shadowBlur = 0

      const star2Gradient = ctx.createRadialGradient(
        star2X - 5, star2Y - 5, 0,
        star2X, star2Y, 22
      )
      star2Gradient.addColorStop(0, '#ffffff')
      star2Gradient.addColorStop(0.3, '#aaddff')
      star2Gradient.addColorStop(0.7, '#6699dd')
      star2Gradient.addColorStop(1, '#3366aa')

      ctx.beginPath()
      ctx.arc(star2X, star2Y, 22, 0, Math.PI * 2)
      ctx.fillStyle = star2Gradient
      ctx.fill()

      ctx.shadowColor = '#6699dd'
      ctx.shadowBlur = 25
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.strokeStyle = 'rgba(255, 217, 61, 0.15)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, orbitRadius, orbitRadius * 0.4, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="obs-canvas" />
}

const SupernovaCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.offsetWidth
        canvas.height = 500
      }
    }
    resize()
    window.addEventListener('resize', resize)

    let animationId: number
    let time = 0

    const stars = Array(100).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.3,
      brightness: Math.random() * 0.4 + 0.2,
      twinkle: Math.random() * 0.02 + 0.005
    }))

    const debris = Array(80).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: Math.random() * 4 + 1,
      brightness: Math.random() * 0.8 + 0.2
    }))

    const filaments = Array(20).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2,
      length: Math.random() * 100 + 50,
      width: Math.random() * 20 + 10,
      speed: (Math.random() - 0.5) * 0.02
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const phase = (time % 300) / 300
      const explosionScale = Math.sin(phase * Math.PI)

      ctx.fillStyle = '#050810'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.twinkle + i) * 0.3 + 0.7
        const x = star.x * canvas.width
        const y = star.y * canvas.height

        const dx = x - centerX
        const dy = y - centerY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const brightness = dist < 150 * explosionScale + 50
          ? star.brightness * twinkle * 0.3
          : star.brightness * twinkle

        ctx.beginPath()
        ctx.arc(x, y, star.size * twinkle, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`
        ctx.fill()
      })

      filaments.forEach((filament, i) => {
        filament.angle += filament.speed
        const filamentX = centerX + Math.cos(filament.angle) * 100 * explosionScale
        const filamentY = centerY + Math.sin(filament.angle) * 60 * explosionScale

        const gradient = ctx.createRadialGradient(
          filamentX, filamentY, 0,
          filamentX, filamentY, filament.length * explosionScale
        )
        gradient.addColorStop(0, `rgba(255, 100, 50, ${0.3 * explosionScale})`)
        gradient.addColorStop(0.5, `rgba(255, 50, 100, ${0.15 * explosionScale})`)
        gradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(filamentX, filamentY, filament.length * explosionScale, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      debris.forEach(particle => {
        particle.x += particle.vx * explosionScale
        particle.y += particle.vy * explosionScale

        const particleX = centerX + particle.x
        const particleY = centerY + particle.y
        const dist = Math.sqrt(particle.x * particle.x + particle.y * particle.y)

        if (dist < 200 * explosionScale) {
          const gradient = ctx.createRadialGradient(
            particleX, particleY, 0,
            particleX, particleY, particle.size
          )
          gradient.addColorStop(0, `rgba(255, 255, 200, ${particle.brightness * explosionScale})`)
          gradient.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.arc(particleX, particleY, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }
      })

      for (let i = 0; i < 8; i++) {
        const shockRadius = 80 + i * 25 + explosionScale * 50
        const shockOpacity = Math.max(0, 0.3 - i * 0.03) * explosionScale

        ctx.beginPath()
        ctx.arc(centerX, centerY, shockRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 150, 50, ${shockOpacity})`
        ctx.lineWidth = 3
        ctx.stroke()
      }

      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 40 * explosionScale
      )
      coreGradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * explosionScale})`)
      coreGradient.addColorStop(0.3, `rgba(255, 255, 200, ${0.7 * explosionScale})`)
      coreGradient.addColorStop(0.6, `rgba(255, 200, 100, ${0.4 * explosionScale})`)
      coreGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX, centerY, 40 * explosionScale, 0, Math.PI * 2)
      ctx.fillStyle = coreGradient
      ctx.fill()

      if (Math.sin(time * 0.1) > 0.5) {
        const pulseRadius = 20 + Math.sin(time * 0.2) * 5
        const pulseGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, pulseRadius * explosionScale
        )
        pulseGradient.addColorStop(0, `rgba(255, 255, 255, ${0.6 * explosionScale})`)
        pulseGradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(centerX, centerY, pulseRadius * explosionScale, 0, Math.PI * 2)
        ctx.fillStyle = pulseGradient
        ctx.fill()
      }

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="obs-canvas" />
}

const NebulaCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.offsetWidth
        canvas.height = 500
      }
    }
    resize()
    window.addEventListener('resize', resize)

    let animationId: number
    let time = 0

    const particles = Array(400).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1,
      brightness: Math.random() * 0.6 + 0.4,
      phase: Math.random() * Math.PI * 2
    }))

    const gasClouds = Array(6).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 150 + 100,
      hue: Math.random() * 60 + 260,
      speed: (Math.random() - 0.5) * 0.001
    }))

    const draw = () => {
      ctx.fillStyle = '#050810'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const bgGradient = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.4, 0,
        canvas.width * 0.3, canvas.height * 0.4, 300
      )
      bgGradient.addColorStop(0, 'rgba(100, 50, 150, 0.15)')
      bgGradient.addColorStop(0.5, 'rgba(50, 30, 100, 0.1)')
      bgGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const bgGradient2 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.6, 0,
        canvas.width * 0.7, canvas.height * 0.6, 250
      )
      bgGradient2.addColorStop(0, 'rgba(150, 80, 120, 0.12)')
      bgGradient2.addColorStop(0.5, 'rgba(100, 50, 80, 0.08)')
      bgGradient2.addColorStop(1, 'transparent')
      ctx.fillStyle = bgGradient2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      gasClouds.forEach((cloud, i) => {
        cloud.x += cloud.speed
        cloud.y += cloud.speed * 0.5
        if (cloud.x < -0.2) cloud.x = 1.2
        if (cloud.x > 1.2) cloud.x = -0.2

        const cloudX = cloud.x * canvas.width
        const cloudY = cloud.y * canvas.height

        for (let j = 0; j < 3; j++) {
          const offsetX = Math.sin(time * 0.005 + j * 2) * 20
          const offsetY = Math.cos(time * 0.004 + j * 2) * 15

          const gradient = ctx.createRadialGradient(
            cloudX + offsetX, cloudY + offsetY, 0,
            cloudX + offsetX, cloudY + offsetY, cloud.size * (1 - j * 0.2)
          )
          gradient.addColorStop(0, `hsla(${cloud.hue}, 60%, 50%, ${0.08 - j * 0.02})`)
          gradient.addColorStop(0.5, `hsla(${cloud.hue}, 50%, 40%, ${0.04 - j * 0.01})`)
          gradient.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.arc(cloudX + offsetX, cloudY + offsetY, cloud.size * (1 - j * 0.2), 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }
      })

      particles.forEach((particle, i) => {
        particle.phase += particle.speed * 0.02
        const x = particle.x * canvas.width + Math.sin(time * 0.003 + particle.phase) * 10
        const y = particle.y * canvas.height + Math.cos(time * 0.002 + particle.phase) * 8
        const brightness = particle.brightness * (0.7 + Math.sin(particle.phase) * 0.3)

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`)
        gradient.addColorStop(0.5, `rgba(200, 180, 255, ${brightness * 0.5})`)
        gradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      for (let i = 0; i < 5; i++) {
        const starX = canvas.width * (0.2 + i * 0.15) + Math.sin(time * 0.002 + i) * 5
        const starY = canvas.height * (0.3 + (i % 3) * 0.2) + Math.cos(time * 0.003 + i) * 5
        const starSize = 3 + Math.sin(time * 0.01 + i * 2) * 1

        const starGradient = ctx.createRadialGradient(starX, starY, 0, starX, starY, starSize * 4)
        starGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        starGradient.addColorStop(0.2, 'rgba(200, 220, 255, 0.6)')
        starGradient.addColorStop(0.5, 'rgba(150, 180, 255, 0.2)')
        starGradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(starX, starY, starSize * 4, 0, Math.PI * 2)
        ctx.fillStyle = starGradient
        ctx.fill()

        ctx.beginPath()
        ctx.arc(starX, starY, starSize, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
      }

      for (let i = 0; i < 8; i++) {
        const tendrilAngle = (i / 8) * Math.PI * 2 + time * 0.002
        const tendrilLength = 80 + Math.sin(time * 0.008 + i) * 30

        ctx.beginPath()
        ctx.moveTo(canvas.width / 2, canvas.height / 2)

        for (let j = 0; j <= 20; j++) {
          const t = j / 20
          const tx = canvas.width / 2 + Math.cos(tendrilAngle + Math.sin(t * Math.PI) * 0.3) * tendrilLength * t
          const ty = canvas.height / 2 + Math.sin(tendrilAngle + Math.sin(t * Math.PI) * 0.3) * tendrilLength * t * 0.6
          ctx.lineTo(tx, ty)
        }

        ctx.strokeStyle = `rgba(180, 140, 255, ${0.1 + Math.sin(time * 0.01 + i) * 0.05})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="obs-canvas" />
}

export default Wonders
