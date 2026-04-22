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
          {
            [
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
            ))
          }
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
  const [lensingStrength, setLensingStrength] = useState(1)
  const [diskInstability, setDiskInstability] = useState(1)

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

    // 背景星星 - 更多更真实的星星效果
    const stars = Array(800).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.1,
      twinkleSpeed: Math.random() * 0.05 + 0.003,
      brightness: Math.random() * 0.6 + 0.4,
      color: Math.random() > 0.7 ? 0 : Math.random() > 0.5 ? 1 : 2
    }))

    // 星系背景 - 模拟远处的星系
    const galaxies = Array(20).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 30 + 10,
      rotation: Math.random() * Math.PI * 2,
      brightness: Math.random() * 0.3 + 0.1,
      color: Math.random() > 0.5 ? 'blue' : 'purple'
    }))

    // 吸积盘热点 - 模拟盘内的不稳定性和热点
    const hotspots = Array(15).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2,
      radius: 80 + Math.random() * 120,
      size: Math.random() * 15 + 5,
      intensity: Math.random() * 0.8 + 0.5,
      driftSpeed: (Math.random() - 0.5) * 0.002
    }))

    // 喷流粒子
    const jetParticles = Array(100).fill(0).map(() => ({
      angle: (Math.random() - 0.5) * 0.2,
      distance: 0,
      speed: Math.random() * 3 + 2,
      size: Math.random() * 3 + 1,
      life: Math.random() * 100 + 50
    }))

    // 引力透镜计算函数
    const calculateLensing = (x: number, y: number, centerX: number, centerY: number, blackHoleRadius: number) => {
      const dx = x - centerX
      const dy = y - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < blackHoleRadius * 1.2) return { x, y, visible: false }
      
      const calculatedLensStrength = 120 / (dist / 60 + 1) * lensingStrength
      const lensX = x + (dx / dist) * calculatedLensStrength * 0.6
      const lensY = y + (dy / dist) * calculatedLensStrength * 0.6
      
      return { x: lensX, y: lensY, visible: true }
    }

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const blackHoleRadius = 75

      // 深空背景 - 更深邃的宇宙背景
      ctx.fillStyle = '#02040a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 深空光晕 - 更真实的深空效果
      const deepSpaceGradient = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.2, 0,
        canvas.width * 0.3, canvas.height * 0.2, 400
      )
      deepSpaceGradient.addColorStop(0, 'rgba(30, 40, 80, 0.18)')
      deepSpaceGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = deepSpaceGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const deepSpaceGradient2 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.7, 0,
        canvas.width * 0.7, canvas.height * 0.7, 350
      )
      deepSpaceGradient2.addColorStop(0, 'rgba(60, 30, 80, 0.15)')
      deepSpaceGradient2.addColorStop(1, 'transparent')
      ctx.fillStyle = deepSpaceGradient2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制远处的星系
      galaxies.forEach((galaxy, i) => {
        const galaxyX = galaxy.x * canvas.width
        const galaxyY = galaxy.y * canvas.height
        const lensResult = calculateLensing(galaxyX, galaxyY, centerX, centerY, blackHoleRadius)
        
        if (lensResult.visible) {
          ctx.save()
          ctx.translate(lensResult.x, lensResult.y)
          ctx.rotate(galaxy.rotation + time * 0.0005)
          
          const galaxyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size)
          const galaxyColors = galaxy.color === 'blue' 
            ? ['rgba(100, 180, 255, ', 'rgba(80, 140, 200, ', 'rgba(60, 100, 160, ']
            : ['rgba(180, 120, 255, ', 'rgba(140, 80, 200, ', 'rgba(100, 60, 160, ']
          galaxyGradient.addColorStop(0, `${galaxyColors[0]}${galaxy.brightness * 0.8})`)
          galaxyGradient.addColorStop(0.3, `${galaxyColors[1]}${galaxy.brightness * 0.5})`)
          galaxyGradient.addColorStop(0.7, `${galaxyColors[2]}${galaxy.brightness * 0.2})`)
          galaxyGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.ellipse(0, 0, galaxy.size, galaxy.size * 0.3, 0, 0, Math.PI * 2)
          ctx.fillStyle = galaxyGradient
          ctx.fill()
          
          // 旋臂
          for (let arm = 0; arm < 2; arm++) {
            ctx.beginPath()
            for (let point = 0; point < 36; point++) {
              const angle = (point / 36) * Math.PI * 2 + arm * Math.PI
              const radius = galaxy.size * 0.2 + (point / 36) * galaxy.size * 0.8
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius * 0.3
              if (point === 0) {
                ctx.moveTo(x, y)
              } else {
                ctx.lineTo(x, y)
              }
            }
            ctx.strokeStyle = `${galaxyColors[0]}${galaxy.brightness * 0.4})`
            ctx.lineWidth = 2
            ctx.stroke()
          }
          
          ctx.restore()
        }
      })

      // 绘制背景星星并应用引力透镜效应
      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + i) * 0.2 + 0.8
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        const lensResult = calculateLensing(x, y, centerX, centerY, blackHoleRadius)
        
        if (lensResult.visible) {
          // 星星亮度随距离黑洞远近变化
          const dx = x - centerX
          const dy = y - centerY
          const dist = Math.sqrt(dx * dx + dy * dy)
          const distanceFactor = Math.min(1, (dist - blackHoleRadius * 1.2) / 180)
          const starColors = ['255, 255, 255', '200, 220, 255', '255, 230, 200']
          const starColor = starColors[star.color]
          
          ctx.beginPath()
          ctx.arc(lensResult.x, lensResult.y, star.size * twinkle, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${starColor}, ${twinkle * 0.9 * distanceFactor})`
          ctx.fill()
        }
      })

      const diskRotation = time * 0.006 * speed
      
      // 绘制爱因斯坦环 - 更真实的引力透镜效果
      for (let ring = 0; ring < 6; ring++) {
        const ringRadius = blackHoleRadius * 2.2 + ring * 8
        const ringOpacity = 0.2 - ring * 0.03
        
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation * 0.2)
        
        const ringGradient = ctx.createRadialGradient(0, 0, ringRadius - 4, 0, 0, ringRadius + 4)
        ringGradient.addColorStop(0, 'transparent')
        ringGradient.addColorStop(0.45, `rgba(255, 200, 100, ${ringOpacity * accretionBrightness})`)
        ringGradient.addColorStop(0.5, `rgba(255, 220, 150, ${ringOpacity * 1.2 * accretionBrightness})`)
        ringGradient.addColorStop(0.55, `rgba(255, 200, 100, ${ringOpacity * accretionBrightness})`)
        ringGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.ellipse(0, 0, ringRadius, ringRadius * 0.1, 0, 0, Math.PI * 2)
        ctx.fillStyle = ringGradient
        ctx.fill()
        
        ctx.restore()
      }
      
      // 绘制吸积盘 - 基于《星际穿越》中的卡冈图雅黑洞设计，更加精细
      for (let layer = 0; layer < 25; layer++) {
        const diskRadius = 80 + layer * 8
        const diskThickness = 5 + layer * 1.2
        const diskWarp = Math.sin(layer * 0.1 + time * 0.01) * 0.02 * diskInstability
        
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation)
        ctx.scale(1, 0.1 + diskWarp)
        
        // 多普勒效应：一侧更亮偏蓝，另一侧偏红暗淡
        const diskGradient = ctx.createLinearGradient(-diskRadius, 0, diskRadius, 0)
        
        // 基于《星际穿越》的颜色方案：橙色、黄色、红色为主，更真实的光谱
        const layerColors = [
          { left: 'rgba(100, 180, 255, ', center: 'rgba(255, 220, 150, ', right: 'rgba(255, 100, 80, ' },
          { left: 'rgba(80, 150, 220, ', center: 'rgba(255, 200, 100, ', right: 'rgba(220, 80, 60, ' },
          { left: 'rgba(60, 120, 180, ', center: 'rgba(255, 180, 50, ', right: 'rgba(180, 60, 40, ' },
          { left: 'rgba(40, 90, 140, ', center: 'rgba(255, 150, 20, ', right: 'rgba(140, 40, 20, ' },
          { left: 'rgba(20, 60, 100, ', center: 'rgba(220, 120, 0, ', right: 'rgba(100, 20, 10, ' }
        ]
        
        const colorSet = layerColors[layer % layerColors.length]
        const opacity = Math.max(0.08, 0.9 - layer * 0.03) * accretionBrightness
        
        diskGradient.addColorStop(0, 'transparent')
        diskGradient.addColorStop(0.3, `${colorSet.left}${Math.floor(opacity * 160).toString(16).padStart(2, '0')})`)
        diskGradient.addColorStop(0.45, `${colorSet.center}${Math.floor(opacity * 230).toString(16).padStart(2, '0')})`)
        diskGradient.addColorStop(0.5, `${colorSet.center}${Math.floor(opacity * 255).toString(16).padStart(2, '0')})`)
        diskGradient.addColorStop(0.55, `${colorSet.right}${Math.floor(opacity * 200).toString(16).padStart(2, '0')})`)
        diskGradient.addColorStop(0.7, `${colorSet.right}${Math.floor(opacity * 100).toString(16).padStart(2, '0')})`)
        diskGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.ellipse(0, 0, diskRadius, diskThickness, 0, 0, Math.PI * 2)
        ctx.fillStyle = diskGradient
        ctx.fill()
        
        ctx.restore()
      }

      // 绘制吸积盘的背面影像（引力透镜效应）- 更明显的效果
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(diskRotation * 0.4)
      ctx.scale(1, 0.06)
      
      const backDiskGradient = ctx.createLinearGradient(-200, 0, 200, 0)
      backDiskGradient.addColorStop(0, 'transparent')
      backDiskGradient.addColorStop(0.3, `rgba(80, 120, 180, ${0.25 * accretionBrightness})`)
      backDiskGradient.addColorStop(0.5, `rgba(180, 140, 100, ${0.4 * accretionBrightness})`)
      backDiskGradient.addColorStop(0.7, `rgba(150, 80, 60, ${0.25 * accretionBrightness})`)
      backDiskGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.ellipse(0, 0, 200, 30, 0, 0, Math.PI * 2)
      ctx.fillStyle = backDiskGradient
      ctx.fill()
      
      ctx.restore()

      // 绘制吸积盘热点
      hotspots.forEach((hotspot) => {
        hotspot.angle += hotspot.driftSpeed * speed
        const x = Math.cos(hotspot.angle) * hotspot.radius
        const y = Math.sin(hotspot.angle) * hotspot.radius * 0.1
        
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation)
        
        const hotspotGradient = ctx.createRadialGradient(x, y, 0, x, y, hotspot.size)
        hotspotGradient.addColorStop(0, `rgba(255, 255, 255, ${hotspot.intensity * accretionBrightness})`)
        hotspotGradient.addColorStop(0.3, `rgba(255, 200, 100, ${hotspot.intensity * 0.8 * accretionBrightness})`)
        hotspotGradient.addColorStop(0.7, `rgba(255, 150, 50, ${hotspot.intensity * 0.4 * accretionBrightness})`)
        hotspotGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(x, y, hotspot.size, 0, Math.PI * 2)
        ctx.fillStyle = hotspotGradient
        ctx.fill()
        
        // 热点周围的光晕
        const glowGradient = ctx.createRadialGradient(x, y, hotspot.size, x, y, hotspot.size * 3)
        glowGradient.addColorStop(0, `rgba(255, 200, 100, ${hotspot.intensity * 0.3 * accretionBrightness})`)
        glowGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(x, y, hotspot.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = glowGradient
        ctx.fill()
        
        ctx.restore()
      })

      // 绘制发光的粒子和能量流 - 更多粒子，更真实的运动
      for (let i = 0; i < 200; i++) {
        const angle = (i / 200) * Math.PI * 2 + time * 0.03 * speed
        const distance = 70 + Math.sin(i * 0.2 + time * 0.1) * 20
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance * 0.1
        
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation)
        
        // 根据位置不同，粒子颜色也不同，模拟多普勒效应
        const particleColor = x > 0 ? 
          `rgba(200, 220, 255, ${0.6 * accretionBrightness})` : 
          `rgba(255, 180, 150, ${0.4 * accretionBrightness})`
        
        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 5)
        particleGradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * accretionBrightness})`)
        particleGradient.addColorStop(0.4, particleColor)
        particleGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fillStyle = particleGradient
        ctx.fill()
        
        // 粒子尾迹
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - Math.cos(angle) * 8, y - Math.sin(angle) * 8 * 0.1)
        ctx.strokeStyle = particleColor
        ctx.lineWidth = 2
        ctx.stroke()
        
        ctx.restore()
      }

      // 黑洞日冕 - 更强烈的效果
      const coronaGradient = ctx.createRadialGradient(
        centerX, centerY, blackHoleRadius,
        centerX, centerY, blackHoleRadius * 3.5
      )
      coronaGradient.addColorStop(0, 'rgba(255, 200, 100, 0.25)')
      coronaGradient.addColorStop(0.2, 'rgba(255, 150, 50, 0.2)')
      coronaGradient.addColorStop(0.5, 'rgba(150, 80, 30, 0.1)')
      coronaGradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(centerX, centerY, blackHoleRadius * 3.5, 0, Math.PI * 2)
      ctx.fillStyle = coronaGradient
      ctx.fill()

      // 黑洞本体 - 事件视界，更真实的黑色
      const blackHoleGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, blackHoleRadius
      )
      blackHoleGradient.addColorStop(0, '#000000')
      blackHoleGradient.addColorStop(0.8, '#000000')
      blackHoleGradient.addColorStop(1, '#0a0500')
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, blackHoleRadius, 0, Math.PI * 2)
      ctx.fillStyle = blackHoleGradient
      ctx.fill()

      // 黑洞阴影 - 更强烈的阴影效果
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 150
      ctx.beginPath()
      ctx.arc(centerX, centerY, blackHoleRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // 相对论性喷流 - 更加精细和真实的效果
      for (let i = 0; i < 12; i++) {
        const jetOffset = (i - 5.5) * 5
        const jetLength = 250 + Math.sin(time * 0.06 + i * 0.4) * 60
        
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(diskRotation * 0.15)
        
        const jetGradient = ctx.createLinearGradient(0, 0, 0, jetLength * (i % 2 === 0 ? -1 : 1))
        jetGradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
        jetGradient.addColorStop(0.1, 'rgba(255, 220, 150, 0.9)')
        jetGradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)')
        jetGradient.addColorStop(0.5, 'rgba(255, 180, 80, 0.6)')
        jetGradient.addColorStop(0.7, 'rgba(255, 150, 50, 0.4)')
        jetGradient.addColorStop(0.9, 'rgba(255, 120, 30, 0.2)')
        jetGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.moveTo(jetOffset * 0.12, 0)
        ctx.lineTo(jetOffset * 0.08 + 6, (i % 2 === 0 ? -1 : 1) * jetLength)
        ctx.lineTo(jetOffset * 0.08 - 6, (i % 2 === 0 ? -1 : 1) * jetLength)
        ctx.closePath()
        ctx.fillStyle = jetGradient
        ctx.fill()
        
        // 喷流粒子
        for (let j = 0; j < 15; j++) {
          const jetParticleX = jetOffset * 0.12 + (Math.random() - 0.5) * 8
          const jetParticleY = (i % 2 === 0 ? -1 : 1) * (j / 15) * jetLength
          
          const jetParticleGradient = ctx.createRadialGradient(jetParticleX, jetParticleY, 0, jetParticleX, jetParticleY, 4)
          jetParticleGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * accretionBrightness})`)
          jetParticleGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.arc(jetParticleX, jetParticleY, 4, 0, Math.PI * 2)
          ctx.fillStyle = jetParticleGradient
          ctx.fill()
        }
        
        ctx.restore()
      }

      // 喷流粒子系统
      jetParticles.forEach((particle, index) => {
        particle.distance += particle.speed * speed
        particle.life -= 1
        
        if (particle.life <= 0) {
          jetParticles[index] = {
            angle: (Math.random() - 0.5) * 0.2,
            distance: 0,
            speed: Math.random() * 3 + 2,
            size: Math.random() * 3 + 1,
            life: Math.random() * 100 + 50
          }
        } else {
          ctx.save()
          ctx.translate(centerX, centerY)
          ctx.rotate(diskRotation * 0.15)
          
          const x = Math.sin(particle.angle) * 10
          const y = particle.distance * (particle.distance > 0 ? -1 : 1)
          
          const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size)
          particleGradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * accretionBrightness})`)
          particleGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.arc(x, y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = particleGradient
          ctx.fill()
          
          ctx.restore()
        }
      })

      // 时空扭曲效果 - 黑洞周围的空间扭曲
      for (let distortion = 0; distortion < 6; distortion++) {
        const distortionRadius = blackHoleRadius * (1.5 + distortion * 0.25)
        const distortionOpacity = 0.1 - distortion * 0.015
        
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(time * 0.002 * speed)
        
        const distortionGradient = ctx.createRadialGradient(0, 0, distortionRadius - 10, 0, 0, distortionRadius + 10)
        distortionGradient.addColorStop(0, 'transparent')
        distortionGradient.addColorStop(0.5, `rgba(0, 212, 255, ${distortionOpacity})`)
        distortionGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.ellipse(0, 0, distortionRadius, distortionRadius * 0.15, 0, 0, Math.PI * 2)
        ctx.fillStyle = distortionGradient
        ctx.fill()
        
        // 扭曲波纹
        ctx.beginPath()
        for (let point = 0; point < 36; point++) {
          const angle = (point / 36) * Math.PI * 2
          const radius = distortionRadius + Math.sin(angle * 5 + time * 0.01) * 5
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius * 0.15
          if (point === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.strokeStyle = `rgba(0, 212, 255, ${distortionOpacity * 0.5})`
        ctx.lineWidth = 1
        ctx.stroke()
        
        ctx.restore()
      }

      // X射线辐射效果
      const xrayGradient = ctx.createRadialGradient(
        centerX, centerY, blackHoleRadius * 1.5,
        centerX, centerY, blackHoleRadius * 4
      )
      xrayGradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)')
      xrayGradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.05)')
      xrayGradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(centerX, centerY, blackHoleRadius * 4, 0, Math.PI * 2)
      ctx.fillStyle = xrayGradient
      ctx.fill()

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [speed, accretionBrightness, lensingStrength, diskInstability])

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
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">引力透镜强度</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={lensingStrength}
                onChange={(e) => setLensingStrength(parseFloat(e.target.value))}
                className="w-full accent-interstellar-orange"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{lensingStrength.toFixed(1)}x</div>
            </div>
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">吸积盘不稳定性</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={diskInstability}
                onChange={(e) => setDiskInstability(parseFloat(e.target.value))}
                className="w-full accent-interstellar-green"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{diskInstability.toFixed(1)}x</div>
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
  const [tailDensity, setTailDensity] = useState(1)

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

    const stars = Array(200).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.3,
      twinkleSpeed: Math.random() * 0.05 + 0.003,
      brightness: Math.random() * 0.6 + 0.4
    }))

    // 尘埃粒子系统
    const dustParticles = Array(200).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2,
      offset: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.2,
      life: Math.random() * 200 + 100
    }))

    // 离子粒子系统
    const ionParticles = Array(150).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2,
      offset: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 1 + 0.5,
      life: Math.random() * 150 + 50
    }))

    // 彗星表面特征
    const nucleusFeatures = Array(20).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      size: Math.random() * 3 + 1,
      depth: Math.random() * 0.5 + 0.1
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const sunX = centerX
      const sunY = centerY + 50

      ctx.fillStyle = '#050a14'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制闪烁的星星
      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + i) * 0.2 + 0.8
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, star.size * twinkle, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`
        ctx.fill()
      })

      const a = 200
      const b = 100
      const angle = time * 0.008 * cometSpeed
      const cometX = centerX + Math.cos(angle) * a
      const cometY = centerY + Math.sin(angle) * b

      // 太阳效果增强
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60)
      sunGradient.addColorStop(0, '#ffffff')
      sunGradient.addColorStop(0.3, '#ffcc00')
      sunGradient.addColorStop(0.6, '#ff6600')
      sunGradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(sunX, sunY, 60, 0, Math.PI * 2)
      ctx.fillStyle = sunGradient
      ctx.fill()

      // 太阳风效果
      for (let i = 0; i < 50; i++) {
        const windAngle = (i / 50) * Math.PI * 2
        const windDistance = 60 + Math.sin(time * 0.01 + i) * 10
        const windX = sunX + Math.cos(windAngle) * windDistance
        const windY = sunY + Math.sin(windAngle) * windDistance
        
        ctx.beginPath()
        ctx.arc(windX, windY, 1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.2})`
        ctx.fill()
      }

      // 轨道
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

      // 计算彗尾长度和密度基于距离太阳的距离
      const actualTailLength = tailLength * (1 + (400 - distToSun) / 400)
      const actualDensity = tailDensity * (1 + (400 - distToSun) / 400)

      // 离子尾 - 更真实的物理模型
      const ionTailLength = actualTailLength * 1.2
      const ionTailEndX = cometX + tailDirX * ionTailLength
      const ionTailEndY = cometY + tailDirY * ionTailLength

      // 离子尾的湍流效果
      const ionTailSegments = 20
      const ionTailPoints = []
      for (let i = 0; i <= ionTailSegments; i++) {
        const t = i / ionTailSegments
        const segmentX = cometX + tailDirX * ionTailLength * t
        const segmentY = cometY + tailDirY * ionTailLength * t
        const turbulence = Math.sin(t * 10 + time * 0.02) * 15 * actualDensity
        ionTailPoints.push({
          x: segmentX + tailDirY * turbulence,
          y: segmentY - tailDirX * turbulence
        })
      }

      const ionTailGradient = ctx.createLinearGradient(
        cometX, cometY, ionTailEndX, ionTailEndY
      )
      const ionOpacity = Math.max(0.3, 1 - distToSun / 400)
      ionTailGradient.addColorStop(0, `rgba(100, 200, 255, ${ionOpacity * 0.8})`)
      ionTailGradient.addColorStop(0.4, `rgba(150, 220, 255, ${ionOpacity * 0.6})`)
      ionTailGradient.addColorStop(1, 'transparent')

      // 绘制离子尾
      ctx.beginPath()
      ctx.moveTo(ionTailPoints[0].x, ionTailPoints[0].y)
      for (let i = 1; i < ionTailPoints.length; i++) {
        const midX = (ionTailPoints[i-1].x + ionTailPoints[i].x) / 2
        const midY = (ionTailPoints[i-1].y + ionTailPoints[i].y) / 2
        ctx.quadraticCurveTo(ionTailPoints[i-1].x, ionTailPoints[i-1].y, midX, midY)
      }
      ctx.lineTo(ionTailEndX + tailDirY * 30 * actualDensity, ionTailEndY - tailDirX * 30 * actualDensity)
      for (let i = ionTailPoints.length - 1; i > 0; i--) {
        const midX = (ionTailPoints[i].x + ionTailPoints[i-1].x) / 2
        const midY = (ionTailPoints[i].y + ionTailPoints[i-1].y) / 2
        ctx.quadraticCurveTo(ionTailPoints[i].x, ionTailPoints[i].y, midX, midY)
      }
      ctx.closePath()
      ctx.fillStyle = ionTailGradient
      ctx.fill()

      // 尘埃尾 - 更真实的物理模型
      const dustTailLength = actualTailLength * 0.8
      const dustTailEndX = cometX + tailDirX * dustTailLength + Math.cos(angle + Math.PI / 4) * 50
      const dustTailEndY = cometY + tailDirY * dustTailLength + Math.sin(angle + Math.PI / 4) * 50

      // 尘埃尾的湍流效果
      const dustTailSegments = 15
      const dustTailPoints = []
      for (let i = 0; i <= dustTailSegments; i++) {
        const t = i / dustTailSegments
        const segmentX = cometX + tailDirX * dustTailLength * t + Math.cos(angle + Math.PI / 4 + t * 2) * 30 * t
        const segmentY = cometY + tailDirY * dustTailLength * t + Math.sin(angle + Math.PI / 4 + t * 2) * 30 * t
        const turbulence = Math.sin(t * 8 + time * 0.01) * 20 * actualDensity
        dustTailPoints.push({
          x: segmentX + tailDirY * turbulence,
          y: segmentY - tailDirX * turbulence
        })
      }

      const dustTailGradient = ctx.createLinearGradient(
        cometX, cometY, dustTailEndX, dustTailEndY
      )
      dustTailGradient.addColorStop(0, `rgba(255, 220, 150, ${ionOpacity * 0.8})`)
      dustTailGradient.addColorStop(0.5, `rgba(255, 180, 100, ${ionOpacity * 0.4})`)
      dustTailGradient.addColorStop(1, 'transparent')

      // 绘制尘埃尾
      ctx.beginPath()
      ctx.moveTo(dustTailPoints[0].x, dustTailPoints[0].y)
      for (let i = 1; i < dustTailPoints.length; i++) {
        const midX = (dustTailPoints[i-1].x + dustTailPoints[i].x) / 2
        const midY = (dustTailPoints[i-1].y + dustTailPoints[i].y) / 2
        ctx.quadraticCurveTo(dustTailPoints[i-1].x, dustTailPoints[i-1].y, midX, midY)
      }
      ctx.lineTo(dustTailEndX + tailDirY * 40 * actualDensity, dustTailEndY - tailDirX * 40 * actualDensity)
      for (let i = dustTailPoints.length - 1; i > 0; i--) {
        const midX = (dustTailPoints[i].x + dustTailPoints[i-1].x) / 2
        const midY = (dustTailPoints[i].y + dustTailPoints[i-1].y) / 2
        ctx.quadraticCurveTo(dustTailPoints[i].x, dustTailPoints[i].y, midX, midY)
      }
      ctx.closePath()
      ctx.fillStyle = dustTailGradient
      ctx.fill()

      // 尘埃粒子效果
      dustParticles.forEach((particle, index) => {
        particle.offset += particle.speed * cometSpeed * actualDensity
        particle.life -= 1
        
        if (particle.life <= 0) {
          dustParticles[index] = {
            angle: Math.random() * Math.PI * 2,
            offset: 0,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.2,
            life: Math.random() * 200 + 100
          }
        } else if (particle.offset < actualTailLength) {
          const particleAngle = angle + particle.angle
          const particleX = cometX + Math.cos(particleAngle) * particle.offset * 0.3 + tailDirX * particle.offset * 0.5 + Math.cos(angle + Math.PI / 4) * particle.offset * 0.2
          const particleY = cometY + Math.sin(particleAngle) * particle.offset * 0.3 + tailDirY * particle.offset * 0.5 + Math.sin(angle + Math.PI / 4) * particle.offset * 0.2
          
          ctx.beginPath()
          ctx.arc(particleX, particleY, particle.size * (1 - particle.offset / actualTailLength), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 200, 150, ${0.5 * (1 - particle.offset / actualTailLength)})`
          ctx.fill()
        }
      })

      // 离子粒子效果
      ionParticles.forEach((particle, index) => {
        particle.offset += particle.speed * cometSpeed * actualDensity
        particle.life -= 1
        
        if (particle.life <= 0) {
          ionParticles[index] = {
            angle: Math.random() * Math.PI * 2,
            offset: 0,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 1 + 0.5,
            life: Math.random() * 150 + 50
          }
        } else if (particle.offset < ionTailLength) {
          const particleAngle = angle + particle.angle
          const particleX = cometX + Math.cos(particleAngle) * particle.offset * 0.1 + tailDirX * particle.offset
          const particleY = cometY + Math.sin(particleAngle) * particle.offset * 0.1 + tailDirY * particle.offset
          
          ctx.beginPath()
          ctx.arc(particleX, particleY, particle.size * (1 - particle.offset / ionTailLength), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(100, 200, 255, ${0.6 * (1 - particle.offset / ionTailLength)})`
          ctx.fill()
        }
      })

      // 彗发效果增强
      const comaSize = 40 + (400 - distToSun) / 10
      const comaGradient = ctx.createRadialGradient(
        cometX, cometY, 0,
        cometX, cometY, comaSize
      )
      comaGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      comaGradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.6)')
      comaGradient.addColorStop(0.7, 'rgba(150, 180, 255, 0.3)')
      comaGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(cometX, cometY, comaSize, 0, Math.PI * 2)
      ctx.fillStyle = comaGradient
      ctx.fill()

      // 彗核 - 更真实的表面细节
      const nucleusRadius = 15
      
      // 彗核主体
      const nucleusGradient = ctx.createRadialGradient(
        cometX - 3, cometY - 3, 0,
        cometX, cometY, nucleusRadius
      )
      nucleusGradient.addColorStop(0, '#ffffff')
      nucleusGradient.addColorStop(0.5, '#cccccc')
      nucleusGradient.addColorStop(1, '#666666')

      ctx.beginPath()
      ctx.arc(cometX, cometY, nucleusRadius, 0, Math.PI * 2)
      ctx.fillStyle = nucleusGradient
      ctx.fill()

      // 彗核表面特征 - 陨石坑和不规则形状
      nucleusFeatures.forEach((feature) => {
        const featureX = cometX + feature.x
        const featureY = cometY + feature.y
        const featureSize = feature.size * (0.8 + Math.sin(time * 0.01 + feature.x + feature.y) * 0.2)
        
        // 陨石坑效果
        const craterGradient = ctx.createRadialGradient(
          featureX, featureY, 0,
          featureX, featureY, featureSize
        )
        craterGradient.addColorStop(0, `rgba(0, 0, 0, ${feature.depth})`)
        craterGradient.addColorStop(0.7, `rgba(50, 50, 50, ${feature.depth * 0.5})`)
        craterGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(featureX, featureY, featureSize, 0, Math.PI * 2)
        ctx.fillStyle = craterGradient
        ctx.fill()
      })

      // 彗核表面反光效果
      const highlightGradient = ctx.createRadialGradient(
        cometX - nucleusRadius * 0.3, cometY - nucleusRadius * 0.3, 0,
        cometX - nucleusRadius * 0.3, cometY - nucleusRadius * 0.3, nucleusRadius * 0.5
      )
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      highlightGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(cometX - nucleusRadius * 0.3, cometY - nucleusRadius * 0.3, nucleusRadius * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = highlightGradient
      ctx.fill()

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [tailLength, cometSpeed, tailDensity])

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

        <div className="absolute top-4 left-4 interstellar-glass interstellar-border rounded-xl p-4 max-w-xs slide-in-left hud-element">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 interstellar-font text-sm">
            <span className="text-interstellar-cyan">⚙️</span> 控制面板
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">彗尾长度</label>
              <input
                type="range"
                min="50"
                max="350"
                step="10"
                value={tailLength}
                onChange={(e) => setTailLength(parseInt(e.target.value))}
                className="w-full accent-interstellar-cyan"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{tailLength} px</div>
            </div>
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">轨道速度</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={cometSpeed}
                onChange={(e) => setCometSpeed(parseFloat(e.target.value))}
                className="w-full accent-interstellar-blue"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{cometSpeed.toFixed(1)}x</div>
            </div>
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">彗尾密度</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={tailDensity}
                onChange={(e) => setTailDensity(parseFloat(e.target.value))}
                className="w-full accent-interstellar-purple"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{tailDensity.toFixed(1)}x</div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 interstellar-glass interstellar-border rounded-xl p-4 max-w-xs slide-in-right hud-element">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 interstellar-font text-sm">
            <span className="text-interstellar-cyan">📊</span> 彗星数据
          </h3>
          <div className="space-y-2 text-sm rajdhani-font">
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">彗核直径:</span>
              <span className="text-interstellar-white">10 km</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">轨道周期:</span>
              <span className="text-interstellar-white">76 年</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">温度:</span>
              <span className="text-interstellar-white">-200°C</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">成分:</span>
              <span className="text-interstellar-white">冰、尘埃、气体</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">💨</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">离子尾</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">太阳风将电离气体吹向后方，形成笔直的蓝色尾迹</p>
        </div>
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">🌟</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">尘埃尾</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">尘埃颗粒被太阳辐射压推离，形成弯曲的黄色尾迹</p>
        </div>
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">❄️</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">彗发</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">彗星接近太阳时，表面物质升华形成的巨大大气层</p>
        </div>
      </div>
    </div>
  )
}

const BinaryStarSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotationSpeed, setRotationSpeed] = useState(1)
  const [showGravityWaves, setShowGravityWaves] = useState(true)
  const [massTransferRate, setMassTransferRate] = useState(1)

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
      size: Math.random() * 2 + 0.3,
      twinkleSpeed: Math.random() * 0.05 + 0.003,
      brightness: Math.random() * 0.6 + 0.4
    }))

    // 质量转移粒子
    const transferParticles = Array(100).fill(0).map(() => ({
      progress: Math.random(),
      speed: Math.random() * 0.02 + 0.01,
      size: Math.random() * 2 + 1,
      offset: (Math.random() - 0.5) * 20
    }))

    // 引力波粒子
    const gravityWaveParticles = Array(50).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2,
      distance: Math.random() * 300,
      speed: Math.random() * 2 + 1,
      size: Math.random() * 2 + 1
    }))

    // 恒星表面特征
    const star1Features = Array(15).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 40,
      size: Math.random() * 5 + 2,
      intensity: Math.random() * 0.5 + 0.3
    }))

    const star2Features = Array(12).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 30,
      size: Math.random() * 4 + 1,
      intensity: Math.random() * 0.5 + 0.3
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const orbitRadius = 100

      ctx.fillStyle = '#050a14'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制闪烁的星星
      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + i) * 0.2 + 0.8
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, star.size * twinkle, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`
        ctx.fill()
      })

      const angle = time * 0.015 * rotationSpeed
      
      const star1X = centerX + Math.cos(angle) * orbitRadius
      const star1Y = centerY + Math.sin(angle) * orbitRadius
      const star2X = centerX + Math.cos(angle + Math.PI) * orbitRadius * 0.7
      const star2Y = centerY + Math.sin(angle + Math.PI) * orbitRadius * 0.7

      // 更精确的引力波模型
      if (showGravityWaves) {
        // 引力波涟漪
        for (let wave = 0; wave < 8; wave++) {
          const waveRadius = 30 + wave * 30 + (time * 3) % 30
          const waveOpacity = 0.3 - wave * 0.03
          
          const waveGradient = ctx.createRadialGradient(
            centerX, centerY, waveRadius - 8,
            centerX, centerY, waveRadius + 8
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

        // 引力波粒子
        gravityWaveParticles.forEach((particle, index) => {
          particle.distance += particle.speed * rotationSpeed
          if (particle.distance > 400) {
            particle.distance = 0
            particle.angle = Math.random() * Math.PI * 2
          }
          
          const x = centerX + Math.cos(particle.angle) * particle.distance
          const y = centerY + Math.sin(particle.angle) * particle.distance
          
          ctx.beginPath()
          ctx.arc(x, y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(150, 200, 255, ${0.3 * (1 - particle.distance / 400)})`
          ctx.fill()
        })
      }

      // 轨道
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

      // 增强的质量转移效果
      const dx = star2X - star1X
      const dy = star2Y - star1Y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const dirX = dx / dist
      const dirY = dy / dist

      // 质量转移流
      const transferGradient = ctx.createLinearGradient(star1X, star1Y, star2X, star2Y)
      transferGradient.addColorStop(0, 'rgba(255, 200, 100, 0.8)')
      transferGradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.6)')
      transferGradient.addColorStop(1, 'rgba(200, 100, 30, 0.4)')

      ctx.beginPath()
      ctx.moveTo(star1X + dirX * 40, star1Y + dirY * 40)
      ctx.lineTo(star2X - dirX * 30, star2Y - dirY * 30)
      ctx.lineWidth = 15 * massTransferRate
      ctx.strokeStyle = transferGradient
      ctx.stroke()

      // 质量转移粒子
      transferParticles.forEach((particle, index) => {
        particle.progress += particle.speed * rotationSpeed * massTransferRate
        if (particle.progress > 1) {
          transferParticles[index] = {
            progress: 0,
            speed: Math.random() * 0.02 + 0.01,
            size: Math.random() * 2 + 1,
            offset: (Math.random() - 0.5) * 20
          }
        }
        
        const t = particle.progress
        const x = star1X + dx * t + Math.sin(time * 0.1 + index) * particle.offset * t
        const y = star1Y + dy * t + Math.cos(time * 0.1 + index) * particle.offset * t
        
        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size)
        particleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
        particleGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.7)')
        particleGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(x, y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particleGradient
        ctx.fill()
      })

      // 恒星1 - 更真实的表面细节
      const star1Radius = 40
      
      // 恒星1大气
      const star1AtmosphereGradient = ctx.createRadialGradient(
        star1X, star1Y, 0,
        star1X, star1Y, star1Radius * 1.5
      )
      star1AtmosphereGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
      star1AtmosphereGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.2)')
      star1AtmosphereGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(star1X, star1Y, star1Radius * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = star1AtmosphereGradient
      ctx.fill()

      // 恒星1主体
      const star1Gradient = ctx.createRadialGradient(
        star1X - star1Radius * 0.2, star1Y - star1Radius * 0.2, 0,
        star1X, star1Y, star1Radius
      )
      star1Gradient.addColorStop(0, '#ffffff')
      star1Gradient.addColorStop(0.3, '#ffcc00')
      star1Gradient.addColorStop(0.6, '#ff6600')
      star1Gradient.addColorStop(1, '#cc3300')

      ctx.beginPath()
      ctx.arc(star1X, star1Y, star1Radius, 0, Math.PI * 2)
      ctx.fillStyle = star1Gradient
      ctx.fill()

      // 恒星1表面特征
      star1Features.forEach((feature) => {
        const featureX = star1X + feature.x
        const featureY = star1Y + feature.y
        const featureSize = feature.size * (0.8 + Math.sin(time * 0.01 + feature.x + feature.y) * 0.3)
        
        // 耀斑效果
        const flareGradient = ctx.createRadialGradient(
          featureX, featureY, 0,
          featureX, featureY, featureSize
        )
        flareGradient.addColorStop(0, `rgba(255, 255, 255, ${feature.intensity})`)
        flareGradient.addColorStop(0.5, `rgba(255, 200, 100, ${feature.intensity * 0.7})`)
        flareGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(featureX, featureY, featureSize, 0, Math.PI * 2)
        ctx.fillStyle = flareGradient
        ctx.fill()
      })

      // 恒星2 - 更真实的表面细节
      const star2Radius = 30
      
      // 恒星2大气
      const star2AtmosphereGradient = ctx.createRadialGradient(
        star2X, star2Y, 0,
        star2X, star2Y, star2Radius * 1.5
      )
      star2AtmosphereGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
      star2AtmosphereGradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.2)')
      star2AtmosphereGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(star2X, star2Y, star2Radius * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = star2AtmosphereGradient
      ctx.fill()

      // 恒星2主体
      const star2Gradient = ctx.createRadialGradient(
        star2X - star2Radius * 0.2, star2Y - star2Radius * 0.2, 0,
        star2X, star2Y, star2Radius
      )
      star2Gradient.addColorStop(0, '#ffffff')
      star2Gradient.addColorStop(0.3, '#99ccff')
      star2Gradient.addColorStop(0.6, '#3366ff')
      star2Gradient.addColorStop(1, '#1a3399')

      ctx.beginPath()
      ctx.arc(star2X, star2Y, star2Radius, 0, Math.PI * 2)
      ctx.fillStyle = star2Gradient
      ctx.fill()

      // 恒星2表面特征
      star2Features.forEach((feature) => {
        const featureX = star2X + feature.x
        const featureY = star2Y + feature.y
        const featureSize = feature.size * (0.8 + Math.sin(time * 0.01 + feature.x + feature.y) * 0.3)
        
        // 耀斑效果
        const flareGradient = ctx.createRadialGradient(
          featureX, featureY, 0,
          featureX, featureY, featureSize
        )
        flareGradient.addColorStop(0, `rgba(255, 255, 255, ${feature.intensity})`)
        flareGradient.addColorStop(0.5, `rgba(100, 150, 255, ${feature.intensity * 0.7})`)
        flareGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(featureX, featureY, featureSize, 0, Math.PI * 2)
        ctx.fillStyle = flareGradient
        ctx.fill()
      })

      // 质量转移对恒星2的影响 - 吸积盘
      const accretionDiskRadius = star2Radius * 1.8
      const accretionDiskRotation = time * 0.03 * rotationSpeed
      
      ctx.save()
      ctx.translate(star2X, star2Y)
      ctx.rotate(accretionDiskRotation)
      ctx.scale(1, 0.3)
      
      const accretionDiskGradient = ctx.createLinearGradient(-accretionDiskRadius, 0, accretionDiskRadius, 0)
      accretionDiskGradient.addColorStop(0, 'transparent')
      accretionDiskGradient.addColorStop(0.4, `rgba(255, 200, 100, ${0.6 * massTransferRate})`)
      accretionDiskGradient.addColorStop(0.5, `rgba(255, 150, 50, ${0.8 * massTransferRate})`)
      accretionDiskGradient.addColorStop(0.6, `rgba(255, 200, 100, ${0.6 * massTransferRate})`)
      accretionDiskGradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.ellipse(0, 0, accretionDiskRadius, star2Radius * 0.8, 0, 0, Math.PI * 2)
      ctx.fillStyle = accretionDiskGradient
      ctx.fill()
      
      ctx.restore()

      // 质心
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
  }, [rotationSpeed, showGravityWaves, massTransferRate])

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

        <div className="absolute top-4 left-4 interstellar-glass interstellar-border rounded-xl p-4 max-w-xs slide-in-left hud-element">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 interstellar-font text-sm">
            <span className="text-interstellar-cyan">⚙️</span> 控制面板
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">轨道速度</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="w-full accent-interstellar-yellow"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{rotationSpeed.toFixed(1)}x</div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-interstellar-cyan/70 rajdhani-font">引力波效果</label>
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
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">质量转移速率</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={massTransferRate}
                onChange={(e) => setMassTransferRate(parseFloat(e.target.value))}
                className="w-full accent-interstellar-orange"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{massTransferRate.toFixed(1)}x</div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 interstellar-glass interstellar-border rounded-xl p-4 max-w-xs slide-in-right hud-element">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 interstellar-font text-sm">
            <span className="text-interstellar-cyan">📊</span> 系统数据
          </h3>
          <div className="space-y-2 text-sm rajdhani-font">
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-yellow">恒星A质量:</span>
              <span className="text-interstellar-white">1.5 M☉</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-blue">恒星B质量:</span>
              <span className="text-interstellar-white">1.0 M☉</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">轨道周期:</span>
              <span className="text-interstellar-white">10 天</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">距离:</span>
              <span className="text-interstellar-white">0.1 AU</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">⚖️</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">质心</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">两颗恒星围绕共同的质心旋转，标记为红色亮点</p>
        </div>
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">🌊</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">引力波</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">加速运动的质量产生引力波，扰动周围的时空</p>
        </div>
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">🔄</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">质量转移</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">物质从一颗恒星流向另一颗，形成壮观的气体桥</p>
        </div>
      </div>
    </div>
  )
}

const SupernovaSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState(0)
  const [explosionIntensity, setExplosionIntensity] = useState(1)

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
      size: Math.random() * 2 + 0.3,
      twinkleSpeed: Math.random() * 0.05 + 0.003,
      brightness: Math.random() * 0.6 + 0.4
    }))

    // 物质抛射粒子
    const debris = Array(200).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 4 + 1,
      size: Math.random() * 6 + 2,
      color: Math.random() > 0.5 ? '#ff6600' : Math.random() > 0.5 ? '#ffcc00' : Math.random() > 0.5 ? '#ff0066' : '#9900ff',
      life: Math.random() * 300 + 200
    }))

    // 冲击波粒子
    const shockwaveParticles = Array(150).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2,
      distance: 0,
      speed: Math.random() * 6 + 3,
      size: Math.random() * 3 + 1
    }))

    // 星云细丝
    const nebulaFilaments = Array(50).fill(0).map(() => ({
      startAngle: Math.random() * Math.PI * 2,
      length: Math.random() * Math.PI * 0.5 + Math.PI * 0.2,
      thickness: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? '#ff6600' : Math.random() > 0.5 ? '#ff0066' : '#9900ff'
    }))

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      ctx.fillStyle = '#050a14'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制闪烁的星星
      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + i) * 0.2 + 0.8
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, star.size * twinkle, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`
        ctx.fill()
      })

      const currentPhase = (phase * 200 + time) % 800

      if (currentPhase < 100) {
        // 1. 不稳定恒星阶段
        const starPulse = 1 + Math.sin(time * 0.1) * 0.2
        const instability = Math.sin(time * 0.05) * 5 * explosionIntensity
        
        // 恒星大气
        const starAtmosphereGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, 70 * starPulse
        )
        starAtmosphereGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
        starAtmosphereGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.2)')
        starAtmosphereGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, 70 * starPulse, 0, Math.PI * 2)
        ctx.fillStyle = starAtmosphereGradient
        ctx.fill()

        // 恒星主体
        const starGradient = ctx.createRadialGradient(
          centerX - instability, centerY - instability, 0,
          centerX, centerY, 60 * starPulse
        )
        starGradient.addColorStop(0, '#ffffff')
        starGradient.addColorStop(0.3, '#ff9900')
        starGradient.addColorStop(0.6, '#ff3300')
        starGradient.addColorStop(1, '#cc0000')

        ctx.beginPath()
        ctx.arc(centerX, centerY, 60 * starPulse, 0, Math.PI * 2)
        ctx.fillStyle = starGradient
        ctx.fill()

        // 恒星表面耀斑
        for (let i = 0; i < 8; i++) {
          const flareAngle = (i / 8) * Math.PI * 2 + time * 0.02
          const flareX = centerX + Math.cos(flareAngle) * (50 * starPulse)
          const flareY = centerY + Math.sin(flareAngle) * (50 * starPulse)
          const flareSize = 8 + Math.sin(time * 0.1 + i) * 3
          
          const flareGradient = ctx.createRadialGradient(
            flareX, flareY, 0,
            flareX, flareY, flareSize
          )
          flareGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
          flareGradient.addColorStop(0.5, 'rgba(255, 100, 50, 0.7)')
          flareGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.arc(flareX, flareY, flareSize, 0, Math.PI * 2)
          ctx.fillStyle = flareGradient
          ctx.fill()
        }

      } else if (currentPhase < 300) {
        // 2. 核心坍缩阶段
        const explosionProgress = (currentPhase - 100) / 200
        const explosionRadius = 50 + explosionProgress * 200 * explosionIntensity

        // 冲击波
        const shockwaveRadius = explosionRadius * 1.2
        const shockwaveGradient = ctx.createRadialGradient(
          centerX, centerY, shockwaveRadius - 15,
          centerX, centerY, shockwaveRadius + 15
        )
        shockwaveGradient.addColorStop(0, 'transparent')
        shockwaveGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.8 * (1 - explosionProgress)})`)
        shockwaveGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, shockwaveRadius, 0, Math.PI * 2)
        ctx.strokeStyle = shockwaveGradient
        ctx.lineWidth = 3
        ctx.stroke()

        // 爆炸核心
        for (let layer = 0; layer < 8; layer++) {
          const layerRadius = explosionRadius * (0.4 + layer * 0.1)
          const layerOpacity = 0.9 - explosionProgress * 0.4 - layer * 0.05

          const explosionGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, layerRadius
          )
          const colors = ['#ffffff', '#ffcc00', '#ff6600', '#ff0066', '#9900ff', '#6600cc', '#330066', '#000000']
          explosionGradient.addColorStop(0, `${colors[layer]}${Math.floor(layerOpacity * 255).toString(16).padStart(2, '0')}`)
          explosionGradient.addColorStop(0.5, `${colors[(layer + 1) % colors.length]}${Math.floor(layerOpacity * 0.7 * 255).toString(16).padStart(2, '0')}`)
          explosionGradient.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2)
          ctx.fillStyle = explosionGradient
          ctx.fill()
        }

        // 爆炸粒子
        for (let i = 0; i < 100; i++) {
          const particleAngle = (i / 100) * Math.PI * 2
          const particleDistance = explosionRadius * 0.8 + Math.sin(time * 0.1 + i) * 10
          const particleX = centerX + Math.cos(particleAngle) * particleDistance
          const particleY = centerY + Math.sin(particleAngle) * particleDistance
          
          ctx.beginPath()
          ctx.arc(particleX, particleY, 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - explosionProgress)})`
          ctx.fill()
        }

      } else if (currentPhase < 700) {
        // 3. 物质抛射阶段
        const debrisProgress = (currentPhase - 300) / 400

        // 冲击波粒子
        shockwaveParticles.forEach((particle, index) => {
          particle.distance += particle.speed * explosionIntensity
          if (particle.distance > 400) {
            shockwaveParticles[index] = {
              angle: Math.random() * Math.PI * 2,
              distance: 0,
              speed: Math.random() * 6 + 3,
              size: Math.random() * 3 + 1
            }
          }
          
          const x = centerX + Math.cos(particle.angle) * particle.distance
          const y = centerY + Math.sin(particle.angle) * particle.distance
          
          ctx.beginPath()
          ctx.arc(x, y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * (1 - particle.distance / 400)})`
          ctx.fill()
        })

        // 物质抛射
        debris.forEach((particle, index) => {
          particle.life -= 1
          if (particle.life <= 0) {
            debris[index] = {
              angle: Math.random() * Math.PI * 2,
              speed: Math.random() * 4 + 1,
              size: Math.random() * 6 + 2,
              color: Math.random() > 0.5 ? '#ff6600' : Math.random() > 0.5 ? '#ffcc00' : Math.random() > 0.5 ? '#ff0066' : '#9900ff',
              life: Math.random() * 300 + 200
            }
          }
          
          const distance = particle.speed * debrisProgress * 150 * explosionIntensity
          const x = centerX + Math.cos(particle.angle) * distance
          const y = centerY + Math.sin(particle.angle) * distance
          const opacity = 0.8 - debrisProgress * 0.6

          ctx.beginPath()
          ctx.arc(x, y, particle.size * (1 - debrisProgress * 0.3), 0, Math.PI * 2)
          ctx.fillStyle = `${particle.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
          ctx.fill()

          // 粒子尾迹
          const tailLength = 15 * (1 - debrisProgress)
          const tailX = x - Math.cos(particle.angle) * tailLength
          const tailY = y - Math.sin(particle.angle) * tailLength
          
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(tailX, tailY)
          ctx.strokeStyle = `${particle.color}${Math.floor(opacity * 128).toString(16).padStart(2, '0')}`
          ctx.lineWidth = 2
          ctx.stroke()
        })

        // 中子星遗迹
        const remnantRadius = 15 + Math.sin(time * 0.05) * 3
        const remnantAtmosphereRadius = remnantRadius * 3
        
        const remnantAtmosphereGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, remnantAtmosphereRadius
        )
        remnantAtmosphereGradient.addColorStop(0, 'rgba(100, 200, 255, 0.6)')
        remnantAtmosphereGradient.addColorStop(0.5, 'rgba(50, 150, 200, 0.3)')
        remnantAtmosphereGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, remnantAtmosphereRadius, 0, Math.PI * 2)
        ctx.fillStyle = remnantAtmosphereGradient
        ctx.fill()

        const remnantGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, remnantRadius
        )
        remnantGradient.addColorStop(0, '#ffffff')
        remnantGradient.addColorStop(0.5, '#99ccff')
        remnantGradient.addColorStop(1, '#3366cc')

        ctx.beginPath()
        ctx.arc(centerX, centerY, remnantRadius, 0, Math.PI * 2)
        ctx.fillStyle = remnantGradient
        ctx.fill()

      } else {
        // 4. 超新星遗迹阶段
        const nebulaProgress = (currentPhase - 700) / 100

        // 星云背景
        for (let layer = 0; layer < 10; layer++) {
          const layerRadius = 80 + layer * 20 + Math.sin(time * 0.02 + layer) * 10
          const layerOpacity = 0.4 - layer * 0.03 + nebulaProgress * 0.1

          const nebulaGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, layerRadius
          )
          const colors = ['#ff6600', '#ffcc00', '#ff0066', '#9900ff', '#00ccff', '#00ff66', '#6600ff', '#ff0099', '#ff9900', '#cc66ff']
          nebulaGradient.addColorStop(0, `${colors[layer]}${Math.floor(layerOpacity * 255).toString(16).padStart(2, '0')}`)
          nebulaGradient.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2)
          ctx.fillStyle = nebulaGradient
          ctx.fill()
        }

        // 星云细丝
        nebulaFilaments.forEach((filament, index) => {
          const filamentRadius = 120 + Math.sin(time * 0.01 + index) * 30
          const filamentAngle = filament.startAngle + time * 0.005
          
          ctx.save()
          ctx.translate(centerX, centerY)
          ctx.rotate(filamentAngle)
          
          ctx.beginPath()
          ctx.arc(0, 0, filamentRadius, 0, filament.length)
          ctx.strokeStyle = `${filament.color}40`
          ctx.lineWidth = filament.thickness
          ctx.stroke()
          
          ctx.restore()
        })

        // 脉冲星
        const pulsarRadius = 10 + Math.sin(time * 0.2) * 3
        const pulsarAtmosphereRadius = pulsarRadius * 3
        
        const pulsarAtmosphereGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, pulsarAtmosphereRadius
        )
        pulsarAtmosphereGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
        pulsarAtmosphereGradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, pulsarAtmosphereRadius, 0, Math.PI * 2)
        ctx.fillStyle = pulsarAtmosphereGradient
        ctx.fill()

        const pulsarGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, pulsarRadius
        )
        pulsarGradient.addColorStop(0, '#ffffff')
        pulsarGradient.addColorStop(0.5, '#99ccff')
        pulsarGradient.addColorStop(1, '#3366cc')

        ctx.beginPath()
        ctx.arc(centerX, centerY, pulsarRadius, 0, Math.PI * 2)
        ctx.fillStyle = pulsarGradient
        ctx.fill()

        // 脉冲星光束
        for (let beam = 0; beam < 2; beam++) {
          const beamAngle = time * 0.1 + beam * Math.PI
          ctx.save()
          ctx.translate(centerX, centerY)
          ctx.rotate(beamAngle)

          const beamGradient = ctx.createLinearGradient(0, 0, 200, 0)
          beamGradient.addColorStop(0, 'rgba(100, 200, 255, 0.9)')
          beamGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.6)')
          beamGradient.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.moveTo(0, -10)
          ctx.lineTo(200, -4)
          ctx.lineTo(200, 4)
          ctx.lineTo(0, 10)
          ctx.closePath()
          ctx.fillStyle = beamGradient
          ctx.fill()

          // 光束粒子
          for (let i = 0; i < 20; i++) {
            const beamParticleX = (i / 20) * 200
            const beamParticleY = (Math.random() - 0.5) * 15
            
            ctx.beginPath()
            ctx.arc(beamParticleX, beamParticleY, 2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(100, 200, 255, ${0.8 * (1 - i / 20)})`
            ctx.fill()
          }

          ctx.restore()
        }

        // 遗迹中的物质结
        for (let i = 0; i < 15; i++) {
          const clumpAngle = (i / 15) * Math.PI * 2 + time * 0.002
          const clumpDistance = 150 + Math.sin(time * 0.01 + i) * 50
          const clumpX = centerX + Math.cos(clumpAngle) * clumpDistance
          const clumpY = centerY + Math.sin(clumpAngle) * clumpDistance
          const clumpSize = 10 + Math.sin(time * 0.02 + i) * 5
          
          const clumpGradient = ctx.createRadialGradient(
            clumpX, clumpY, 0,
            clumpX, clumpY, clumpSize
          )
          const clumpColors = ['#ff6600', '#ff0066', '#9900ff', '#00ccff']
          const clumpColor = clumpColors[i % clumpColors.length]
          clumpGradient.addColorStop(0, `${clumpColor}80`)
          clumpGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.arc(clumpX, clumpY, clumpSize, 0, Math.PI * 2)
          ctx.fillStyle = clumpGradient
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
  }, [phase, explosionIntensity])

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

        <div className="absolute top-4 left-4 interstellar-glass interstellar-border rounded-xl p-4 max-w-xs slide-in-left hud-element">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 interstellar-font text-sm">
            <span className="text-interstellar-cyan">⚙️</span> 阶段控制
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">时间轴</label>
              <input
                type="range"
                min="0"
                max="4"
                step="0.01"
                value={phase}
                onChange={(e) => setPhase(parseFloat(e.target.value))}
                className="w-full accent-interstellar-red"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">
                {phase < 0.5 ? '1. 不稳定恒星' : phase < 1.5 ? '2. 核心坍缩' : phase < 3.5 ? '3. 物质抛射' : '4. 超新星遗迹'}
              </div>
            </div>
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">爆炸强度</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={explosionIntensity}
                onChange={(e) => setExplosionIntensity(parseFloat(e.target.value))}
                className="w-full accent-interstellar-orange"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{explosionIntensity.toFixed(1)}x</div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 interstellar-glass interstellar-border rounded-xl p-4 max-w-xs slide-in-right hud-element">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 interstellar-font text-sm">
            <span className="text-interstellar-cyan">📊</span> 爆发数据
          </h3>
          <div className="space-y-2 text-sm rajdhani-font">
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">原恒星质量:</span>
              <span className="text-interstellar-white">20 M☉</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">能量释放:</span>
              <span className="text-interstellar-white">10⁴⁴ J</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">温度:</span>
              <span className="text-interstellar-white">100,000°C</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">残留物:</span>
              <span className="text-interstellar-white">中子星</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">⚠️</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">1. 不稳定</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">恒星核心耗尽燃料，开始不稳定脉动</p>
        </div>
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">💥</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">2. 核心坍缩</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">核心突然坍缩，引发剧烈的爆炸</p>
        </div>
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">💫</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">3. 物质抛射</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">外层物质以10,000 km/s抛向太空</p>
        </div>
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">🌟</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">4. 遗迹形成</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">留下中子星或黑洞，周围形成星云</p>
        </div>
      </div>
    </div>
  )
}

const NebulaSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [colorScheme, setColorScheme] = useState('pink')
  const [density, setDensity] = useState(1)
  const [turbulence, setTurbulence] = useState(1)
  const [starFormation, setStarFormation] = useState(1)

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

    // 背景星星 - 更多更真实的星星效果
    const stars = Array(300).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.1,
      twinkleSpeed: Math.random() * 0.05 + 0.003,
      brightness: Math.random() * 0.6 + 0.4,
      color: Math.random() > 0.7 ? 0 : Math.random() > 0.5 ? 1 : 2
    }))

    // 颜色方案 - 更真实的星云颜色
    const colorSchemes = {
      pink: {
        primary: ['#ff69b4', '#ff1493', '#c71585', '#db7093'],
        secondary: ['#ffb6c1', '#ff6961', '#ff8c00', '#ffd700'],
        dark: ['#4b0082', '#8a2be2', '#9400d3', '#ba55d3']
      },
      blue: {
        primary: ['#00bfff', '#1e90ff', '#4169e1', '#6495ed'],
        secondary: ['#87ceeb', '#00ced1', '#20b2aa', '#7fffd4'],
        dark: ['#00008b', '#0000cd', '#191970', '#483d8b']
      },
      purple: {
        primary: ['#9370db', '#8a2be2', '#9400d3', '#ba55d3'],
        secondary: ['#dda0dd', '#da70d6', '#ee82ee', '#ff69b4'],
        dark: ['#4b0082', '#6a0dad', '#8a2be2', '#9932cc']
      },
      green: {
        primary: ['#00ff7f', '#32cd32', '#228b22', '#2e8b57'],
        secondary: ['#98fb98', '#90ee90', '#87cefa', '#add8e6'],
        dark: ['#006400', '#228b22', '#2e8b57', '#3cb371']
      }
    }

    const colors = colorSchemes[colorScheme as keyof typeof colorSchemes]

    // 气体云 - 更复杂的结构
    const gasClouds = Array(15).fill(0).map((_, i) => ({
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6,
      radius: 60 + Math.random() * 150,
      color: colors.primary[i % colors.primary.length],
      phase: Math.random() * Math.PI * 2,
      density: Math.random() * 0.5 + 0.3
    }))

    // 细丝结构 - 更真实的星云丝
    const filaments = Array(30).fill(0).map(() => ({
      startX: Math.random(),
      startY: Math.random(),
      endX: Math.random(),
      endY: Math.random(),
      thickness: Math.random() * 4 + 0.5,
      color: colors.secondary[Math.floor(Math.random() * colors.secondary.length)],
      opacity: Math.random() * 0.4 + 0.2
    }))

    // 恒星形成区域
    const starFormingRegions = Array(8).fill(0).map(() => ({
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6,
      size: 40 + Math.random() * 80,
      intensity: Math.random() * 0.8 + 0.3,
      phase: Math.random() * Math.PI * 2
    }))

    // 粒子系统 - 模拟星云气体流动
    const particles = Array(200).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      direction: Math.random() * Math.PI * 2,
      life: Math.random() * 300 + 100,
      color: colors.primary[Math.floor(Math.random() * colors.primary.length)]
    }))

    // 湍流效果函数
    const turbulenceEffect = (x: number, y: number, t: number) => {
      return {
        x: Math.sin(x * 0.01 + t * 0.005) * turbulence * 10 + Math.cos(y * 0.015 + t * 0.003) * turbulence * 5,
        y: Math.cos(x * 0.012 + t * 0.004) * turbulence * 8 + Math.sin(y * 0.008 + t * 0.006) * turbulence * 6
      }
    }

    const draw = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // 深空背景 - 更深邃的宇宙背景
      ctx.fillStyle = '#02040a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 深空光晕 - 更真实的深空效果
      const deepSpaceGradient = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.2, 0,
        canvas.width * 0.3, canvas.height * 0.2, 400
      )
      deepSpaceGradient.addColorStop(0, 'rgba(30, 40, 80, 0.18)')
      deepSpaceGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = deepSpaceGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const deepSpaceGradient2 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.7, 0,
        canvas.width * 0.7, canvas.height * 0.7, 350
      )
      deepSpaceGradient2.addColorStop(0, 'rgba(60, 30, 80, 0.15)')
      deepSpaceGradient2.addColorStop(1, 'transparent')
      ctx.fillStyle = deepSpaceGradient2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制背景星星
      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + i) * 0.2 + 0.8
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        const starColors = ['255, 255, 255', '200, 220, 255', '255, 230, 200']
        const starColor = starColors[star.color]
        
        ctx.beginPath()
        ctx.arc(x, y, star.size * twinkle, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${starColor}, ${star.brightness * twinkle})`
        ctx.fill()
      })

      // 绘制暗尘云 - 增加星云的层次感
      gasClouds.forEach((cloud, i) => {
        const cloudX = centerX + (cloud.x - 0.5) * canvas.width * 0.8 + Math.sin(time * 0.01 + cloud.phase) * 15
        const cloudY = centerY + (cloud.y - 0.5) * canvas.height * 0.8 + Math.cos(time * 0.008 + cloud.phase) * 15
        const cloudRadius = cloud.radius + Math.sin(time * 0.02 + cloud.phase) * 20
        const turbulence = turbulenceEffect(cloudX, cloudY, time)

        // 暗尘云效果
        const dustCloudGradient = ctx.createRadialGradient(
          cloudX, cloudY, 0,
          cloudX, cloudY, cloudRadius * 1.2
        )
        dustCloudGradient.addColorStop(0, `rgba(10, 10, 20, ${cloud.density * 0.3 * density})`)
        dustCloudGradient.addColorStop(0.5, `rgba(10, 10, 20, ${cloud.density * 0.15 * density})`)
        dustCloudGradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(cloudX + turbulence.x * 0.3, cloudY + turbulence.y * 0.3, cloudRadius, 0, Math.PI * 2)
        ctx.fillStyle = dustCloudGradient
        ctx.fill()
      })

      // 绘制气体云 - 更真实的颜色和结构
      gasClouds.forEach((cloud, i) => {
        const cloudX = centerX + (cloud.x - 0.5) * canvas.width * 0.8 + Math.sin(time * 0.01 + cloud.phase) * 15
        const cloudY = centerY + (cloud.y - 0.5) * canvas.height * 0.8 + Math.cos(time * 0.008 + cloud.phase) * 15
        const cloudRadius = cloud.radius + Math.sin(time * 0.02 + cloud.phase) * 20
        const turbulence = turbulenceEffect(cloudX, cloudY, time)

        const cloudGradient = ctx.createRadialGradient(
          cloudX, cloudY, 0,
          cloudX, cloudY, cloudRadius
        )
        cloudGradient.addColorStop(0, `${cloud.color}${Math.floor(cloud.density * 180 * density).toString(16).padStart(2, '0')}`)
        cloudGradient.addColorStop(0.3, `${cloud.color}${Math.floor(cloud.density * 120 * density).toString(16).padStart(2, '0')}`)
        cloudGradient.addColorStop(0.7, `${cloud.color}${Math.floor(cloud.density * 60 * density).toString(16).padStart(2, '0')}`)
        cloudGradient.addColorStop(1, 'transparent')

        // 不规则云形状
        ctx.beginPath()
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const radiusVariation = 1 + Math.sin(angle * 5 + time * 0.01 + cloud.phase) * 0.1 * turbulence
          const r = cloudRadius * radiusVariation
          const x = cloudX + Math.cos(angle) * r + turbulence.x * 0.5
          const y = cloudY + Math.sin(angle) * r + turbulence.y * 0.5
          if (angle === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.fillStyle = cloudGradient
        ctx.fill()
      })

      // 绘制细丝结构 - 更真实的星云丝
      filaments.forEach((filament, i) => {
        const startX = filament.startX * canvas.width + Math.sin(time * 0.01 + i) * 10
        const startY = filament.startY * canvas.height + Math.cos(time * 0.01 + i) * 10
        const endX = filament.endX * canvas.width + Math.sin(time * 0.01 + i + 1) * 10
        const endY = filament.endY * canvas.height + Math.cos(time * 0.01 + i + 1) * 10

        // 湍流效果
        const turbulence1 = turbulenceEffect(startX, startY, time)
        const turbulence2 = turbulenceEffect(endX, endY, time)
        const ctrl1X = (startX + endX) / 2 + Math.sin(time * 0.02 + i) * 30 + (turbulence1.x + turbulence2.x) * 0.5
        const ctrl1Y = (startY + endY) / 2 + Math.cos(time * 0.02 + i) * 30 + (turbulence1.y + turbulence2.y) * 0.5

        ctx.beginPath()
        ctx.moveTo(startX + turbulence1.x * 0.3, startY + turbulence1.y * 0.3)
        ctx.quadraticCurveTo(ctrl1X, ctrl1Y, endX + turbulence2.x * 0.3, endY + turbulence2.y * 0.3)

        const filamentGradient = ctx.createLinearGradient(
          startX, startY, endX, endY
        )
        filamentGradient.addColorStop(0, 'transparent')
        filamentGradient.addColorStop(0.4, `${filament.color}${Math.floor(filament.opacity * 200 * density).toString(16).padStart(2, '0')}`)
        filamentGradient.addColorStop(0.5, `${filament.color}${Math.floor(filament.opacity * 255 * density).toString(16).padStart(2, '0')}`)
        filamentGradient.addColorStop(0.6, `${filament.color}${Math.floor(filament.opacity * 200 * density).toString(16).padStart(2, '0')}`)
        filamentGradient.addColorStop(1, 'transparent')

        ctx.strokeStyle = filamentGradient
        ctx.lineWidth = filament.thickness * density
        ctx.lineCap = 'round'
        ctx.stroke()
      })

      // 绘制恒星形成区域
      starFormingRegions.forEach((region, i) => {
        const regionX = centerX + (region.x - 0.5) * canvas.width * 0.8 + Math.sin(time * 0.008 + region.phase) * 20
        const regionY = centerY + (region.y - 0.5) * canvas.height * 0.8 + Math.cos(time * 0.006 + region.phase) * 20
        const regionSize = region.size + Math.sin(time * 0.015 + region.phase) * 15
        const turbulence = turbulenceEffect(regionX, regionY, time)

        // 电离气体效果
        const ionizedGradient = ctx.createRadialGradient(
          regionX, regionY, 0,
          regionX, regionY, regionSize
        )
        const ionColor = colors.primary[i % colors.primary.length]
        ionizedGradient.addColorStop(0, `${ionColor}${Math.floor(region.intensity * 200 * starFormation).toString(16).padStart(2, '0')}`)
        ionizedGradient.addColorStop(0.4, `${ionColor}${Math.floor(region.intensity * 150 * starFormation).toString(16).padStart(2, '0')}`)
        ionizedGradient.addColorStop(0.8, `${ionColor}${Math.floor(region.intensity * 80 * starFormation).toString(16).padStart(2, '0')}`)
        ionizedGradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(regionX + turbulence.x * 0.4, regionY + turbulence.y * 0.4, regionSize, 0, Math.PI * 2)
        ctx.fillStyle = ionizedGradient
        ctx.fill()

        // 年轻恒星
        if (Math.random() > 0.7) {
          const starX = regionX + (Math.random() - 0.5) * regionSize * 0.8
          const starY = regionY + (Math.random() - 0.5) * regionSize * 0.8
          const starSize = 3 + Math.random() * 5
          
          const starGradient = ctx.createRadialGradient(
            starX, starY, 0,
            starX, starY, starSize
          )
          starGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
          starGradient.addColorStop(0.5, 'rgba(255, 220, 150, 0.8)')
          starGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.arc(starX, starY, starSize, 0, Math.PI * 2)
          ctx.fillStyle = starGradient
          ctx.fill()

          // 恒星辐射
          const radiationGradient = ctx.createRadialGradient(
            starX, starY, starSize,
            starX, starY, starSize * 3
          )
          radiationGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
          radiationGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.arc(starX, starY, starSize * 3, 0, Math.PI * 2)
          ctx.fillStyle = radiationGradient
          ctx.fill()
        }
      })

      // 绘制粒子系统 - 模拟气体流动
      particles.forEach((particle, index) => {
        particle.life -= 1
        if (particle.life <= 0) {
          particles[index] = {
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            direction: Math.random() * Math.PI * 2,
            life: Math.random() * 300 + 100,
            color: colors.primary[Math.floor(Math.random() * colors.primary.length)]
          }
        } else {
          const x = particle.x * canvas.width
          const y = particle.y * canvas.height
          const turbulence = turbulenceEffect(x, y, time)
          
          // 更新粒子位置
          particle.x += Math.cos(particle.direction) * particle.speed * 0.001
          particle.y += Math.sin(particle.direction) * particle.speed * 0.001
          
          if (particle.x < 0) particle.x = 1
          if (particle.x > 1) particle.x = 0
          if (particle.y < 0) particle.y = 1
          if (particle.y > 1) particle.y = 0

          // 绘制粒子
          const particleGradient = ctx.createRadialGradient(
            x + turbulence.x * 0.2, y + turbulence.y * 0.2, 0,
            x + turbulence.x * 0.2, y + turbulence.y * 0.2, particle.size
          )
          particleGradient.addColorStop(0, `${particle.color}ff`)
          particleGradient.addColorStop(0.5, `${particle.color}80`)
          particleGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.arc(x + turbulence.x * 0.2, y + turbulence.y * 0.2, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = particleGradient
          ctx.fill()
        }
      })

      time += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [colorScheme, density, turbulence, starFormation])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          🌌 星云
        </h2>
        <p className="text-interstellar-gray">宇宙中最美丽的气体和尘埃云，恒星的诞生与死亡之地</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl interstellar-glass interstellar-border"
          style={{ boxShadow: '0 0 120px rgba(255, 105, 180, 0.3), inset 0 0 80px rgba(0, 0, 0, 0.6)' }}
        />

        <div className="absolute top-4 left-4 interstellar-glass interstellar-border rounded-xl p-4 max-w-xs slide-in-left hud-element">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 interstellar-font text-sm">
            <span className="text-interstellar-cyan">⚙️</span> 控制面板
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">颜色方案</label>
              <div className="grid grid-cols-2 gap-2">
                {
                  [
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
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.color }} />
                      <span className="text-xs text-white rajdhani-font">{scheme.label}</span>
                    </button>
                  ))
                }
              </div>
            </div>
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">星云密度</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={density}
                onChange={(e) => setDensity(parseFloat(e.target.value))}
                className="w-full accent-interstellar-pink"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{density.toFixed(1)}x</div>
            </div>
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">湍流强度</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={turbulence}
                onChange={(e) => setTurbulence(parseFloat(e.target.value))}
                className="w-full accent-interstellar-purple"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{turbulence.toFixed(1)}x</div>
            </div>
            <div>
              <label className="text-sm text-interstellar-cyan/70 mb-1 block rajdhani-font">恒星形成</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={starFormation}
                onChange={(e) => setStarFormation(parseFloat(e.target.value))}
                className="w-full accent-interstellar-blue"
              />
              <div className="text-xs text-interstellar-cyan/60 text-center mt-1 rajdhani-font">{starFormation.toFixed(1)}x</div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 interstellar-glass interstellar-border rounded-xl p-4 max-w-xs slide-in-right hud-element">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 interstellar-font text-sm">
            <span className="text-interstellar-cyan">📊</span> 星云数据
          </h3>
          <div className="space-y-2 text-sm rajdhani-font">
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">距离:</span>
              <span className="text-interstellar-white">6,500 光年</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">直径:</span>
              <span className="text-interstellar-white">110 光年</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">温度:</span>
              <span className="text-interstellar-white">10,000°C</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">年龄:</span>
              <span className="text-interstellar-white">8,000 年</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">质量:</span>
              <span className="text-interstellar-white">10,000 M☉</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">⭐</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">发射星云</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">被年轻恒星激发而发光的气体云，显示出明亮的色彩</p>
        </div>
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">🌫️</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">尘埃带</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">星际尘埃吸收和散射光线，形成暗带和细丝结构</p>
        </div>
        <div className="interstellar-glass interstellar-border rounded-xl p-4 interstellar-card">
          <div className="text-3xl mb-2">✨</div>
          <h4 className="font-bold text-white mb-1 interstellar-font text-sm">星团</h4>
          <p className="text-interstellar-gray text-sm rajdhani-font">在星云中诞生的年轻星团，照亮周围的气体</p>
        </div>
      </div>
    </div>
  )
}

export default Wonders
