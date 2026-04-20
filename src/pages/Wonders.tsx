import { useState, useRef, useEffect } from 'react'

const Wonders = () => {
  const [activeTab, setActiveTab] = useState('blackHole')

  return (
    <div className="min-h-screen nebula-bg py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 fade-in">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ✨ 天文奇观
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            探索宇宙中最壮观的天文现象，从黑洞的引力奇观到超新星的绚丽爆发
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { id: 'blackHole', label: '🌀 黑洞', desc: '宇宙中的引力之王' },
            { id: 'comet', label: '☄️ 彗星', desc: '带着尾巴的宇宙旅者' },
            { id: 'binaryStar', label: '⭐ 双星系统', desc: '两颗恒星的引力之舞' },
            { id: 'supernova', label: '💥 超新星', desc: '恒星的壮烈终章' },
            { id: 'nebula', label: '🌌 星云', desc: '宇宙中的瑰丽云朵' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className={`font-bold ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="glass-effect rounded-3xl p-2 border-gradient">
          {activeTab === 'blackHole' && <BlackHoleSimulator />}
          {activeTab === 'comet' && <CometSimulator />}
          {activeTab === 'binaryStar' && <BinaryStarSimulator />}
          {activeTab === 'supernova' && <SupernovaSimulator />}
          {activeTab === 'nebula' && <NebulaSimulator />}
        </div>
      </div>
    </div>
  )
}

const BlackHoleSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [speed, setSpeed] = useState(1)
  const [accretionBrightness, setAccretionBrightness] = useState(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = 500
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationId: number
    let time = 0

    const stars = Array(300).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.3,
      twinkleSpeed: Math.random() * 0.04 + 0.005,
      brightness: Math.random() * 0.5 + 0.5
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const blackHoleRadius = 70

      // 深空背景
      ctx.fillStyle = '#02040a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 深空光晕
      const deepSpaceGradient = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.2, 0,
        canvas.width * 0.3, canvas.height * 0.2, 300
      )
      deepSpaceGradient.addColorStop(0, 'rgba(30, 40, 80, 0.15)')
      deepSpaceGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = deepSpaceGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const deepSpaceGradient2 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.7, 0,
        canvas.width * 0.7, canvas.height * 0.7, 250
      )
      deepSpaceGradient2.addColorStop(0, 'rgba(60, 30, 80, 0.12)')
      deepSpaceGradient2.addColorStop(1, 'transparent')
      ctx.fillStyle = deepSpaceGradient2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制背景星星并应用引力透镜效应
      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + i) * 0.2 + 0.8
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        
        const dx = x - centerX
        const dy = y - centerY
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist > blackHoleRadius * 1.5) {
          // 更强的引力透镜效应，模拟《星际穿越》中的效果
          const lensStrength = 80 / (dist / 80 + 1)
          const lensX = x + (dx / dist) * lensStrength * 0.6
          const lensY = y + (dy / dist) * lensStrength * 0.6
          
          // 星星亮度随距离黑洞远近变化
          const distanceFactor = Math.min(1, (dist - blackHoleRadius * 1.5) / 200)
          const starColor = star.brightness > 0.7 ? '255, 255, 255' : 
                             star.brightness > 0.5 ? '200, 220, 255' : '255, 230, 200'
          
          ctx.beginPath()
          ctx.arc(lensX, lensY, star.size * twinkle, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${starColor}, ${twinkle * 0.9 * distanceFactor})`
          ctx.fill()
        }
      })

      const diskRotation = time * 0.008 * speed
      
      // 绘制爱因斯坦环 - 这是黑洞最典型的视觉特征
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = blackHoleRadius * 2.5 + ring * 8
        const ringOpacity = 0.15 - ring * 0.04
        
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation * 0.3)
        
        const ringGradient = ctx.createRadialGradient(0, 0, ringRadius - 5, 0, 0, ringRadius + 5)
        ringGradient.addColorStop(0, 'transparent')
        ringGradient.addColorStop(0.5, `rgba(255, 200, 100, ${ringOpacity * accretionBrightness})`)
        ringGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.ellipse(0, 0, ringRadius, ringRadius * 0.12, 0, 0, Math.PI * 2)
        ctx.fillStyle = ringGradient
        ctx.fill()
        
        ctx.restore()
      }
      
      // 绘制吸积盘 - 基于《星际穿越》中的卡冈图雅黑洞设计
      for (let layer = 0; layer < 15; layer++) {
        const diskRadius = 85 + layer * 12
        const diskThickness = 6 + layer * 1.5
        
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation)
        ctx.scale(1, 0.12)
        
        // 多普勒效应：一侧更亮偏蓝，另一侧偏红暗淡
        const diskGradient = ctx.createLinearGradient(-diskRadius, 0, diskRadius, 0)
        
        // 基于《星际穿越》的颜色方案：橙色、黄色、红色为主
        const layerColors = [
          { left: 'rgba(100, 180, 255, ', center: 'rgba(255, 220, 150, ', right: 'rgba(255, 100, 80, ' },
          { left: 'rgba(80, 150, 220, ', center: 'rgba(255, 200, 100, ', right: 'rgba(220, 80, 60, ' },
          { left: 'rgba(60, 120, 180, ', center: 'rgba(255, 180, 50, ', right: 'rgba(180, 60, 40, ' },
          { left: 'rgba(40, 90, 140, ', center: 'rgba(255, 150, 20, ', right: 'rgba(140, 40, 20, ' },
          { left: 'rgba(20, 60, 100, ', center: 'rgba(220, 120, 0, ', right: 'rgba(100, 20, 10, ' }
        ]
        
        const colorSet = layerColors[layer % layerColors.length]
        const opacity = Math.max(0.1, 0.9 - layer * 0.05) * accretionBrightness
        
        diskGradient.addColorStop(0, 'transparent')
        diskGradient.addColorStop(0.3, `${colorSet.left}${Math.floor(opacity * 180).toString(16).padStart(2, '0')})`)
        diskGradient.addColorStop(0.45, `${colorSet.center}${Math.floor(opacity * 255).toString(16).padStart(2, '0')})`)
        diskGradient.addColorStop(0.5, `${colorSet.center}${Math.floor(opacity * 255).toString(16).padStart(2, '0')})`)
        diskGradient.addColorStop(0.55, `${colorSet.right}${Math.floor(opacity * 220).toString(16).padStart(2, '0')})`)
        diskGradient.addColorStop(0.7, `${colorSet.right}${Math.floor(opacity * 120).toString(16).padStart(2, '0')})`)
        diskGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.ellipse(0, 0, diskRadius, diskThickness, 0, 0, Math.PI * 2)
        ctx.fillStyle = diskGradient
        ctx.fill()
        
        ctx.restore()
      }

      // 绘制吸积盘的背面影像（引力透镜效应）
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(diskRotation * 0.5)
      ctx.scale(1, 0.08)
      
      const backDiskGradient = ctx.createLinearGradient(-180, 0, 180, 0)
      backDiskGradient.addColorStop(0, 'transparent')
      backDiskGradient.addColorStop(0.3, `rgba(80, 120, 180, ${0.3 * accretionBrightness})`)
      backDiskGradient.addColorStop(0.5, `rgba(180, 140, 100, ${0.5 * accretionBrightness})`)
      backDiskGradient.addColorStop(0.7, `rgba(150, 80, 60, ${0.3 * accretionBrightness})`)
      backDiskGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.ellipse(0, 0, 180, 25, 0, 0, Math.PI * 2)
      ctx.fillStyle = backDiskGradient
      ctx.fill()
      
      ctx.restore()

      // 绘制发光的粒子和能量流
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2 + time * 0.04 * speed
        const distance = 75 + Math.sin(i * 0.25 + time * 0.12) * 25
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance * 0.12
        
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation)
        
        // 根据位置不同，粒子颜色也不同，模拟多普勒效应
        const particleColor = x > 0 ? 
          `rgba(200, 220, 255, ${0.7 * accretionBrightness})` : 
          `rgba(255, 180, 150, ${0.5 * accretionBrightness})`
        
        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 6)
        particleGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * accretionBrightness})`)
        particleGradient.addColorStop(0.4, particleColor)
        particleGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fillStyle = particleGradient
        ctx.fill()
        
        ctx.restore()
      }

      // 黑洞日冕
      const coronaGradient = ctx.createRadialGradient(
        centerX, centerY, blackHoleRadius,
        centerX, centerY, blackHoleRadius * 3
      )
      coronaGradient.addColorStop(0, 'rgba(255, 200, 100, 0.15)')
      coronaGradient.addColorStop(0.2, 'rgba(255, 150, 50, 0.1)')
      coronaGradient.addColorStop(0.5, 'rgba(150, 80, 30, 0.05)')
      coronaGradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(centerX, centerY, blackHoleRadius * 3, 0, Math.PI * 2)
      ctx.fillStyle = coronaGradient
      ctx.fill()

      // 黑洞本体 - 事件视界
      const blackHoleGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, blackHoleRadius
      )
      blackHoleGradient.addColorStop(0, '#000000')
      blackHoleGradient.addColorStop(0.9, '#000000')
      blackHoleGradient.addColorStop(1, '#1a1510')
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, blackHoleRadius, 0, Math.PI * 2)
      ctx.fillStyle = blackHoleGradient
      ctx.fill()

      // 黑洞阴影
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 100
      ctx.beginPath()
      ctx.arc(centerX, centerY, blackHoleRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // 相对论性喷流 - 更加精细的效果
      for (let i = 0; i < 10; i++) {
        const jetOffset = (i - 4.5) * 6
        const jetLength = 220 + Math.sin(time * 0.08 + i * 0.5) * 50
        
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation * 0.2)
        
        const jetGradient = ctx.createLinearGradient(0, 0, 0, jetLength * (i % 2 === 0 ? -1 : 1))
        jetGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
        jetGradient.addColorStop(0.2, 'rgba(200, 220, 255, 0.8)')
        jetGradient.addColorStop(0.4, 'rgba(150, 180, 255, 0.6)')
        jetGradient.addColorStop(0.6, 'rgba(100, 140, 200, 0.4)')
        jetGradient.addColorStop(0.8, 'rgba(60, 80, 120, 0.2)')
        jetGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.moveTo(jetOffset * 0.15, 0)
        ctx.lineTo(jetOffset * 0.1 + 8, (i % 2 === 0 ? -1 : 1) * jetLength)
        ctx.lineTo(jetOffset * 0.1 - 8, (i % 2 === 0 ? -1 : 1) * jetLength)
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
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [speed, accretionBrightness])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          🌀 黑洞
        </h2>
        <p className="text-interstellar-gray">宇宙中最强大的引力场，连光都无法逃脱</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl interstellar-glass interstellar-border"
          style={{ boxShadow: '0 0 120px rgba(0, 212, 255, 0.3), inset 0 0 80px rgba(0, 0, 0, 0.6)' }}
        />
        
        <div className="absolute top-4 left-4 interstellar-glass interstellar-border rounded-xl p-4 max-w-xs slide-in-left hud-element">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 interstellar-font text-sm">
            <span className="text-interstellar-cyan">⚙️</span> 控制面板
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">旋转速度</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-interstellar-cyan"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{speed.toFixed(1)}x</div>
            </div>
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">吸积盘亮度</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={accretionBrightness}
                onChange={(e) => setAccretionBrightness(parseFloat(e.target.value))}
                className="w-full accent-interstellar-purple"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{accretionBrightness.toFixed(1)}x</div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 interstellar-glass interstellar-border rounded-xl p-4 max-w-xs slide-in-right hud-element">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 interstellar-font text-sm">
            <span className="text-interstellar-cyan">📊</span> 黑洞数据
          </h3>
          <div className="space-y-2 text-sm rajdhani-font">
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">质量:</span>
              <span className="text-interstellar-white">10,000,000 M☉</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">事件视界:</span>
              <span className="text-interstellar-white">3,000 km</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">吸积盘温度:</span>
              <span className="text-interstellar-white">1,000,000°C</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">类型:</span>
              <span className="text-interstellar-white">超大质量黑洞</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">💨</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">事件视界</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">连光都无法逃脱的边界，任何物质进入后都无法返回</p>
        </div>
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">🌀</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">吸积盘</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">被黑洞引力捕获的物质形成的旋转盘，摩擦产生极高温度</p>
        </div>
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">💫</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">相对论性喷流</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">高能粒子以接近光速的速度从黑洞两极喷射而出</p>
        </div>
      </div>
    </div>
  )
}

const CometSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tailLength, setTailLength] = useState(200)
  const [cometSpeed, setCometSpeed] = useState(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = 500
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationId: number
    let time = 0

    const stars = Array(100).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.3
    }))

    const dustParticles = Array(50).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2,
      offset: Math.random() * 50,
      size: Math.random() * 3 + 1
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const sunX = centerX
      const sunY = centerY + 50

      ctx.fillStyle = '#050a14'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`
        ctx.fill()
      })

      const a = 200
      const b = 100
      const angle = time * 0.008 * cometSpeed
      const cometX = centerX + Math.cos(angle) * a
      const cometY = centerY + Math.sin(angle) * b

      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60)
      sunGradient.addColorStop(0, '#ffffff')
      sunGradient.addColorStop(0.3, '#ffcc00')
      sunGradient.addColorStop(0.6, '#ff6600')
      sunGradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(sunX, sunY, 60, 0, Math.PI * 2)
      ctx.fillStyle = sunGradient
      ctx.fill()

      ctx.strokeStyle = 'rgba(100, 149, 237, 0.3)'
      ctx.lineWidth = 2
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

      const tailEndX = cometX + tailDirX * tailLength
      const tailEndY = cometY + tailDirY * tailLength

      const ionTailGradient = ctx.createLinearGradient(
        cometX, cometY, tailEndX, tailEndY
      )
      const ionOpacity = Math.max(0.3, 1 - distToSun / 400)
      ionTailGradient.addColorStop(0, `rgba(100, 200, 255, ${ionOpacity})`)
      ionTailGradient.addColorStop(0.4, `rgba(150, 220, 255, ${ionOpacity * 0.6})`)
      ionTailGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.moveTo(cometX, cometY)
      ctx.lineTo(tailEndX + tailDirY * 20, tailEndY - tailDirX * 20)
      ctx.lineTo(tailEndX - tailDirY * 20, tailEndY + tailDirX * 20)
      ctx.closePath()
      ctx.fillStyle = ionTailGradient
      ctx.fill()

      const dustTailLength = tailLength * 0.8
      const dustTailEndX = cometX + tailDirX * dustTailLength + Math.cos(angle + Math.PI / 4) * 30
      const dustTailEndY = cometY + tailDirY * dustTailLength + Math.sin(angle + Math.PI / 4) * 30

      const dustTailGradient = ctx.createLinearGradient(
        cometX, cometY, dustTailEndX, dustTailEndY
      )
      dustTailGradient.addColorStop(0, `rgba(255, 220, 150, ${ionOpacity * 0.8})`)
      dustTailGradient.addColorStop(0.5, `rgba(255, 180, 100, ${ionOpacity * 0.4})`)
      dustTailGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.moveTo(cometX, cometY)
      ctx.lineTo(dustTailEndX + tailDirY * 40, dustTailEndY - tailDirX * 40)
      ctx.lineTo(dustTailEndX - tailDirY * 40, dustTailEndY + tailDirX * 40)
      ctx.closePath()
      ctx.fillStyle = dustTailGradient
      ctx.fill()

      dustParticles.forEach((particle, _i) => {
        const particleAngle = angle + particle.angle
        const particleDist = particle.offset + time * 0.5
        const particleX = cometX + Math.cos(particleAngle) * particleDist * 0.3 + tailDirX * particleDist * 0.5
        const particleY = cometY + Math.sin(particleAngle) * particleDist * 0.3 + tailDirY * particleDist * 0.5

        if (particleDist < tailLength) {
          ctx.beginPath()
          ctx.arc(particleX, particleY, particle.size * (1 - particleDist / tailLength), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 200, 150, ${0.5 * (1 - particleDist / tailLength)})`
          ctx.fill()
        }
      })

      const nucleusGradient = ctx.createRadialGradient(
        cometX - 3, cometY - 3, 0,
        cometX, cometY, 15
      )
      nucleusGradient.addColorStop(0, '#ffffff')
      nucleusGradient.addColorStop(0.5, '#cccccc')
      nucleusGradient.addColorStop(1, '#666666')

      ctx.beginPath()
      ctx.arc(cometX, cometY, 15, 0, Math.PI * 2)
      ctx.fillStyle = nucleusGradient
      ctx.fill()

      const comaGradient = ctx.createRadialGradient(
        cometX, cometY, 0,
        cometX, cometY, 40
      )
      comaGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
      comaGradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.3)')
      comaGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(cometX, cometY, 40, 0, Math.PI * 2)
      ctx.fillStyle = comaGradient
      ctx.fill()

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [tailLength, cometSpeed])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          ☄️ 彗星
        </h2>
        <p className="text-gray-400">来自太阳系边缘的冰冷旅者，拖着美丽的尾巴划过夜空</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl shadow-2xl"
          style={{ boxShadow: '0 0 80px rgba(100, 200, 255, 0.15)' }}
        />

        <div className="absolute top-4 left-4 glass-effect rounded-xl p-4 max-w-xs slide-in-left">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-cyan-400">⚙️</span> 控制面板
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">彗尾长度</label>
              <input
                type="range"
                min="50"
                max="350"
                step="10"
                value={tailLength}
                onChange={(e) => setTailLength(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="text-xs text-gray-500 text-center mt-1">{tailLength} px</div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">轨道速度</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={cometSpeed}
                onChange={(e) => setCometSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="text-xs text-gray-500 text-center mt-1">{cometSpeed.toFixed(1)}x</div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 glass-effect rounded-xl p-4 max-w-xs slide-in-right">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-purple-400">📊</span> 彗星数据
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">彗核直径:</span>
              <span className="text-white">10 km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">轨道周期:</span>
              <span className="text-white">76 年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">温度:</span>
              <span className="text-white">-200°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">成分:</span>
              <span className="text-white">冰、尘埃、气体</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">💨</div>
          <h4 className="font-bold text-white mb-1">离子尾</h4>
          <p className="text-gray-400 text-sm">太阳风将电离气体吹向后方，形成笔直的蓝色尾迹</p>
        </div>
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">🌟</div>
          <h4 className="font-bold text-white mb-1">尘埃尾</h4>
          <p className="text-gray-400 text-sm">尘埃颗粒被太阳辐射压推离，形成弯曲的黄色尾迹</p>
        </div>
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">❄️</div>
          <h4 className="font-bold text-white mb-1">彗发</h4>
          <p className="text-gray-400 text-sm">彗星接近太阳时，表面物质升华形成的巨大大气层</p>
        </div>
      </div>
    </div>
  )
}

const BinaryStarSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotationSpeed, setRotationSpeed] = useState(1)
  const [showGravityWaves, setShowGravityWaves] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = 500
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationId: number
    let time = 0

    const stars = Array(80).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.3
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const orbitRadius = 100

      ctx.fillStyle = '#050a14'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`
        ctx.fill()
      })

      const angle = time * 0.015 * rotationSpeed
      
      const star1X = centerX + Math.cos(angle) * orbitRadius
      const star1Y = centerY + Math.sin(angle) * orbitRadius
      const star2X = centerX + Math.cos(angle + Math.PI) * orbitRadius * 0.7
      const star2Y = centerY + Math.sin(angle + Math.PI) * orbitRadius * 0.7

      if (showGravityWaves) {
        for (let wave = 0; wave < 5; wave++) {
          const waveRadius = 30 + wave * 40 + (time * 2) % 40
          const waveOpacity = 0.3 - wave * 0.05
          
          const waveGradient = ctx.createRadialGradient(
            centerX, centerY, waveRadius - 10,
            centerX, centerY, waveRadius + 10
          )
          waveGradient.addColorStop(0, 'transparent')
          waveGradient.addColorStop(0.5, `rgba(150, 200, 255, ${waveOpacity})`)
          waveGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2)
          ctx.strokeStyle = waveGradient
          ctx.lineWidth = 3
          ctx.stroke()
        }
      }

      ctx.strokeStyle = 'rgba(100, 149, 237, 0.3)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(centerX, centerY, orbitRadius * 0.7, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      const dx = star2X - star1X
      const dy = star2Y - star1Y

      for (let i = 0; i < 8; i++) {
        const t = (i + 0.5) / 8
        const pointX = star1X + dx * t + Math.sin(time * 0.05 + i) * 8 * t
        const pointY = star1Y + dy * t + Math.sin(time * 0.05 + i) * 8 * t
        
        const particleGradient = ctx.createRadialGradient(pointX, pointY, 0, pointX, pointY, 8)
        particleGradient.addColorStop(0, 'rgba(255, 200, 100, 0.7)')
        particleGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(pointX, pointY, 8, 0, Math.PI * 2)
        ctx.fillStyle = particleGradient
        ctx.fill()
      }

      const star1Gradient = ctx.createRadialGradient(
        star1X - star1X * 0.1, star1Y - star1Y * 0.1, 0,
        star1X, star1Y, 40
      )
      star1Gradient.addColorStop(0, '#ffffff')
      star1Gradient.addColorStop(0.3, '#ffcc00')
      star1Gradient.addColorStop(0.6, '#ff6600')
      star1Gradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(star1X, star1Y, 40, 0, Math.PI * 2)
      ctx.fillStyle = star1Gradient
      ctx.fill()

      ctx.beginPath()
      ctx.arc(star1X, star1Y, 25, 0, Math.PI * 2)
      ctx.fillStyle = '#ffcc00'
      ctx.fill()

      const star2Gradient = ctx.createRadialGradient(
        star2X - star2X * 0.1, star2Y - star2Y * 0.1, 0,
        star2X, star2Y, 30
      )
      star2Gradient.addColorStop(0, '#ffffff')
      star2Gradient.addColorStop(0.3, '#99ccff')
      star2Gradient.addColorStop(0.6, '#3366ff')
      star2Gradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(star2X, star2Y, 30, 0, Math.PI * 2)
      ctx.fillStyle = star2Gradient
      ctx.fill()

      ctx.beginPath()
      ctx.arc(star2X, star2Y, 18, 0, Math.PI * 2)
      ctx.fillStyle = '#6699ff'
      ctx.fill()

      const massRatio = 1.5
      const barycenterX = (star1X * massRatio + star2X * 1) / (massRatio + 1)
      const barycenterY = (star1Y * massRatio + star2Y * 1) / (massRatio + 1)

      const barycenterGradient = ctx.createRadialGradient(
        barycenterX, barycenterY, 0,
        barycenterX, barycenterY, 10
      )
      barycenterGradient.addColorStop(0, 'rgba(255, 0, 102, 0.8)')
      barycenterGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(barycenterX, barycenterY, 10, 0, Math.PI * 2)
      ctx.fillStyle = barycenterGradient
      ctx.fill()

      ctx.beginPath()
      ctx.arc(barycenterX, barycenterY, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#ff0066'
      ctx.fill()

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [rotationSpeed, showGravityWaves])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          ⭐ 双星系统
        </h2>
        <p className="text-gray-400">两颗恒星相互绕转，演绎宇宙中最美的引力之舞</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl shadow-2xl"
          style={{ boxShadow: '0 0 80px rgba(255, 200, 100, 0.15)' }}
        />

        <div className="absolute top-4 left-4 glass-effect rounded-xl p-4 max-w-xs slide-in-left">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-yellow-400">⚙️</span> 控制面板
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">轨道速度</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="w-full accent-yellow-500"
              />
              <div className="text-xs text-gray-500 text-center mt-1">{rotationSpeed.toFixed(1)}x</div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">引力波效果</label>
              <button
                onClick={() => setShowGravityWaves(!showGravityWaves)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  showGravityWaves ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  showGravityWaves ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 glass-effect rounded-xl p-4 max-w-xs slide-in-right">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-orange-400">📊</span> 系统数据
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-yellow-400">恒星A质量:</span>
              <span className="text-white">1.5 M☉</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">恒星B质量:</span>
              <span className="text-white">1.0 M☉</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">轨道周期:</span>
              <span className="text-white">10 天</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">距离:</span>
              <span className="text-white">0.1 AU</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">⚖️</div>
          <h4 className="font-bold text-white mb-1">质心</h4>
          <p className="text-gray-400 text-sm">两颗恒星围绕共同的质心旋转，标记为红色亮点</p>
        </div>
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">🌊</div>
          <h4 className="font-bold text-white mb-1">引力波</h4>
          <p className="text-gray-400 text-sm">加速运动的质量产生引力波，扰动周围的时空</p>
        </div>
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">🔄</div>
          <h4 className="font-bold text-white mb-1">质量转移</h4>
          <p className="text-gray-400 text-sm">物质从一颗恒星流向另一颗，形成壮观的气体桥</p>
        </div>
      </div>
    </div>
  )
}

const SupernovaSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = 500
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationId: number
    let time = 0

    const stars = Array(100).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.3
    }))

    const debris = Array(100).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 3 + 1,
      size: Math.random() * 5 + 2,
      color: Math.random() > 0.5 ? '#ff6600' : Math.random() > 0.5 ? '#ffcc00' : '#ff0066'
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      ctx.fillStyle = '#050a14'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.5})`
        ctx.fill()
      })

      const currentPhase = (phase * 200 + time) % 800

      if (currentPhase < 100) {
        const starPulse = 1 + Math.sin(time * 0.1) * 0.1
        const starGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, 60 * starPulse
        )
        starGradient.addColorStop(0, '#ffffff')
        starGradient.addColorStop(0.3, '#ff9900')
        starGradient.addColorStop(0.6, '#ff3300')
        starGradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(centerX, centerY, 60 * starPulse, 0, Math.PI * 2)
        ctx.fillStyle = starGradient
        ctx.fill()

      } else if (currentPhase < 300) {
        const explosionProgress = (currentPhase - 100) / 200
        const explosionRadius = 50 + explosionProgress * 200

        for (let layer = 0; layer < 5; layer++) {
          const layerRadius = explosionRadius * (0.6 + layer * 0.15)
          const layerOpacity = 0.8 - explosionProgress * 0.3 - layer * 0.04

          const explosionGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, layerRadius
          )
          const colors = ['#ffffff', '#ffcc00', '#ff6600', '#ff0066', '#9900ff']
          explosionGradient.addColorStop(0, `${colors[layer]}${Math.floor(layerOpacity * 255).toString(16).padStart(2, '0')}`)
          explosionGradient.addColorStop(0.5, `${colors[(layer + 1) % 5]}${Math.floor(layerOpacity * 0.7 * 255).toString(16).padStart(2, '0')}`)
          explosionGradient.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2)
          ctx.fillStyle = explosionGradient
          ctx.fill()
        }

      } else if (currentPhase < 700) {
        const debrisProgress = (currentPhase - 300) / 400

        debris.forEach((particle, _i) => {
          const distance = 20 + particle.speed * debrisProgress * 150
          const x = centerX + Math.cos(particle.angle) * distance
          const y = centerY + Math.sin(particle.angle) * distance
          const opacity = 0.8 - debrisProgress * 0.6

          ctx.beginPath()
          ctx.arc(x, y, particle.size * (1 - debrisProgress * 0.3), 0, Math.PI * 2)
          ctx.fillStyle = `${particle.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
          ctx.fill()
        })

        const remnantRadius = 15 + Math.sin(time * 0.05) * 3
        const remnantGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, remnantRadius * 2
        )
        remnantGradient.addColorStop(0, '#ffffff')
        remnantGradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(centerX, centerY, remnantRadius * 2, 0, Math.PI * 2)
        ctx.fillStyle = remnantGradient
        ctx.fill()

        ctx.beginPath()
        ctx.arc(centerX, centerY, remnantRadius, 0, Math.PI * 2)
        ctx.fillStyle = '#99ccff'
        ctx.fill()

      } else {
        const nebulaProgress = (currentPhase - 700) / 100

        for (let layer = 0; layer < 8; layer++) {
          const layerRadius = 80 + layer * 25 + Math.sin(time * 0.02 + layer) * 5
          const layerOpacity = 0.4 - layer * 0.04 + nebulaProgress * 0.1

          const nebulaGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, layerRadius
          )
          const colors = ['#ff6600', '#ffcc00', '#ff0066', '#9900ff', '#00ccff', '#00ff66', '#6600ff', '#ff0099']
          nebulaGradient.addColorStop(0, `${colors[layer]}${Math.floor(layerOpacity * 255).toString(16).padStart(2, '0')}`)
          nebulaGradient.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2)
          ctx.fillStyle = nebulaGradient
          ctx.fill()
        }

        const pulsarRadius = 10 + Math.sin(time * 0.2) * 3
        const pulsarGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, pulsarRadius * 2
        )
        pulsarGradient.addColorStop(0, '#ffffff')
        pulsarGradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(centerX, centerY, pulsarRadius * 2, 0, Math.PI * 2)
        ctx.fillStyle = pulsarGradient
        ctx.fill()

        ctx.beginPath()
        ctx.arc(centerX, centerY, pulsarRadius, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()

        for (let beam = 0; beam < 2; beam++) {
          const beamAngle = time * 0.1 + beam * Math.PI
          ctx.save()
          ctx.translate(centerX, centerY)
          ctx.rotate(beamAngle)

          const beamGradient = ctx.createLinearGradient(0, 0, 150, 0)
          beamGradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)')
          beamGradient.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.moveTo(0, -8)
          ctx.lineTo(150, -3)
          ctx.lineTo(150, 3)
          ctx.lineTo(0, 8)
          ctx.closePath()
          ctx.fillStyle = beamGradient
          ctx.fill()

          ctx.restore()
        }
      }

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [phase])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          💥 超新星爆发
        </h2>
        <p className="text-gray-400">大质量恒星生命的壮烈终章，宇宙中最辉煌的能量释放</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl shadow-2xl"
          style={{ boxShadow: '0 0 80px rgba(255, 100, 50, 0.2)' }}
        />

        <div className="absolute top-4 left-4 glass-effect rounded-xl p-4 max-w-xs slide-in-left">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-red-400">⚙️</span> 阶段控制
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">时间轴</label>
              <input
                type="range"
                min="0"
                max="4"
                step="0.01"
                value={phase}
                onChange={(e) => setPhase(parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
              <div className="text-xs text-gray-500 text-center mt-1">
                {phase < 0.5 ? '1. 不稳定恒星' : phase < 1.5 ? '2. 核心坍缩' : phase < 3.5 ? '3. 物质抛射' : '4. 超新星遗迹'}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 glass-effect rounded-xl p-4 max-w-xs slide-in-right">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-orange-400">📊</span> 爆发数据
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">原恒星质量:</span>
              <span className="text-white">20 M☉</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">能量释放:</span>
              <span className="text-white">10⁴⁴ J</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">温度:</span>
              <span className="text-white">100,000°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">残留物:</span>
              <span className="text-white">中子星</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">⚠️</div>
          <h4 className="font-bold text-white mb-1">1. 不稳定</h4>
          <p className="text-gray-400 text-sm">恒星核心耗尽燃料，开始不稳定脉动</p>
        </div>
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">💥</div>
          <h4 className="font-bold text-white mb-1">2. 核心坍缩</h4>
          <p className="text-gray-400 text-sm">核心突然坍缩，引发剧烈的爆炸</p>
        </div>
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">💫</div>
          <h4 className="font-bold text-white mb-1">3. 物质抛射</h4>
          <p className="text-gray-400 text-sm">外层物质以10,000 km/s抛向太空</p>
        </div>
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">🌟</div>
          <h4 className="font-bold text-white mb-1">4. 遗迹形成</h4>
          <p className="text-gray-400 text-sm">留下中子星或黑洞，周围形成星云</p>
        </div>
      </div>
    </div>
  )
}

const NebulaSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [colorScheme, setColorScheme] = useState('pink')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = 500
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationId: number
    let time = 0

    const stars = Array(150).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5
    }))

    const colorSchemes = {
      pink: ['#ff69b4', '#ff1493', '#c71585', '#db7093'],
      blue: ['#00bfff', '#1e90ff', '#4169e1', '#6495ed'],
      purple: ['#9370db', '#8a2be2', '#9400d3', '#ba55d3'],
      green: ['#00ff7f', '#32cd32', '#228b22', '#2e8b57']
    }

    const colors = colorSchemes[colorScheme as keyof typeof colorSchemes]

    const gasClouds = Array(8).fill(0).map((_, i) => ({
      x: 0.3 + Math.random() * 0.4,
      y: 0.3 + Math.random() * 0.4,
      radius: 80 + Math.random() * 120,
      color: colors[i % colors.length],
      phase: Math.random() * Math.PI * 2
    }))

    const filaments = Array(15).fill(0).map(() => ({
      startX: Math.random(),
      startY: Math.random(),
      endX: Math.random(),
      endY: Math.random(),
      thickness: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)]
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      ctx.fillStyle = '#050a14'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.5})`
        ctx.fill()
      })

      gasClouds.forEach((cloud, _i) => {
        const cloudX = centerX + (cloud.x - 0.5) * canvas.width * 0.8 + Math.sin(time * 0.01 + cloud.phase) * 10
        const cloudY = centerY + (cloud.y - 0.5) * canvas.height * 0.8 + Math.cos(time * 0.008 + cloud.phase) * 10
        const cloudRadius = cloud.radius + Math.sin(time * 0.02 + cloud.phase) * 15

        const cloudGradient = ctx.createRadialGradient(
          cloudX, cloudY, 0,
          cloudX, cloudY, cloudRadius
        )
        cloudGradient.addColorStop(0, `${cloud.color}66`)
        cloudGradient.addColorStop(0.5, `${cloud.color}33`)
        cloudGradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(cloudX, cloudY, cloudRadius, 0, Math.PI * 2)
        ctx.fillStyle = cloudGradient
        ctx.fill()
      })

      filaments.forEach((filament, _i) => {
        const startX = filament.startX * canvas.width + Math.sin(time * 0.01) * 5
        const startY = filament.startY * canvas.height + Math.cos(time * 0.01) * 5
        const endX = filament.endX * canvas.width + Math.sin(time * 0.01 + 1) * 5
        const endY = filament.endY * canvas.height + Math.cos(time * 0.01 + 1) * 5

        ctx.beginPath()
        ctx.moveTo(startX, startY)
        const ctrl1X = (startX + endX) / 2 + Math.sin(time * 0.02) * 20
        const ctrl1Y = (startY + endY) / 2 + Math.cos(time * 0.02) * 20
        ctx.quadraticCurveTo(ctrl1X, ctrl1Y, endX, endY)

        const filamentGradient = ctx.createLinearGradient(startX, startY, endX, endY)
        filamentGradient.addColorStop(0, `${filament.color}00`)
        filamentGradient.addColorStop(0.5, `${filament.color}66`)
        filamentGradient.addColorStop(1, `${filament.color}00`)

        ctx.strokeStyle = filamentGradient
        ctx.lineWidth = filament.thickness
        ctx.lineCap = 'round'
        ctx.stroke()
      })

      for (let starCluster = 0; starCluster < 5; starCluster++) {
        const clusterX = centerX + Math.cos(time * 0.005 + starCluster * 1.2) * 100
        const clusterY = centerY + Math.sin(time * 0.005 + starCluster * 1.2) * 80
        
        for (let star = 0; star < 10; star++) {
          const offsetAngle = star * 0.6 + time * 0.02
          const offsetDist = 20 + star * 3
          const starX = clusterX + Math.cos(offsetAngle) * offsetDist
          const starY = clusterY + Math.sin(offsetAngle) * offsetDist
          const starSize = 2 + Math.sin(time * 0.1 + star) * 0.5
          
          ctx.beginPath()
          ctx.arc(starX, starY, starSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 200, ${0.6 + Math.sin(time * 0.1 + star) * 0.3})`
          ctx.fill()
        }
      }

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [colorScheme])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          🌌 星云
        </h2>
        <p className="text-gray-400">宇宙中最美丽的气体和尘埃云，恒星的诞生与死亡之地</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl shadow-2xl"
          style={{ boxShadow: '0 0 80px rgba(255, 105, 180, 0.15)' }}
        />

        <div className="absolute top-4 left-4 glass-effect rounded-xl p-4 max-w-xs slide-in-left">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-pink-400">🎨</span> 颜色方案
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'pink', label: '粉色星云', color: '#ff69b4' },
              { id: 'blue', label: '蓝色星云', color: '#00bfff' },
              { id: 'purple', label: '紫色星云', color: '#9370db' },
              { id: 'green', label: '绿色星云', color: '#00ff7f' }
            ].map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => setColorScheme(scheme.id)}
                className={`py-2 px-3 rounded-lg transition-all flex items-center gap-2 ${
                  colorScheme === scheme.id
                    ? 'bg-white/10 border border-white/20'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.color }} />
                <span className="text-xs text-white">{scheme.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="absolute top-4 right-4 glass-effect rounded-xl p-4 max-w-xs slide-in-right">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-purple-400">📊</span> 星云数据
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">距离:</span>
              <span className="text-white">6,500 光年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">直径:</span>
              <span className="text-white">110 光年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">温度:</span>
              <span className="text-white">10,000°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">年龄:</span>
              <span className="text-white">8,000 年</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">⭐</div>
          <h4 className="font-bold text-white mb-1">发射星云</h4>
          <p className="text-gray-400 text-sm">被年轻恒星激发而发光的气体云，显示出明亮的色彩</p>
        </div>
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">🌫️</div>
          <h4 className="font-bold text-white mb-1">尘埃带</h4>
          <p className="text-gray-400 text-sm">星际尘埃吸收和散射光线，形成暗带和细丝结构</p>
        </div>
        <div className="glass-effect rounded-xl p-4 card-hover">
          <div className="text-3xl mb-2">✨</div>
          <h4 className="font-bold text-white mb-1">星团</h4>
          <p className="text-gray-400 text-sm">在星云中诞生的年轻星团，照亮周围的气体</p>
        </div>
      </div>
    </div>
  )
}

export default Wonders