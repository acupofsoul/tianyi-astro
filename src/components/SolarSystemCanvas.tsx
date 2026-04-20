import React, { useRef, useEffect, useState } from 'react'
import ViewControls from './ViewControls'

interface Planet {
  id: string
  name: string
  radius: number
  distance: number
  orbitalPeriod: number
  rotationPeriod: number
  color: string
  glowColor: string
  rings?: boolean
  ringsColor?: string
  textureGradient?: string[]
}

interface SolarSystem {
  sun: {
    radius: number
    color: string
    glowColors: string[]
  }
  planets: Planet[]
}

interface ViewState {
  scale: number
  rotation: number
  offset: { x: number; y: number }
}

const SolarSystemCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,
    rotation: 0,
    offset: { x: 0, y: 0 }
  })

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  const performanceConfig = {
    isMobile,
    targetFps: isMobile ? 30 : 60,
    starCount: isMobile ? 150 : 300,
    enableSunGlow: !isMobile,
    enablePlanetNames: !isMobile,
    enableOrbitalLines: !isMobile,
    enablePlanetRings: true,
    enableParticleEffects: !isMobile
  }

  const solarSystemData: SolarSystem = {
    sun: {
      radius: 60,
      color: '#ffd700',
      glowColors: ['#ff6b00', '#ff9500', '#ffcc00', '#ffeb3b', '#ffffff']
    },
    planets: [
      {
        id: 'mercury',
        name: '水星',
        radius: 6,
        distance: 100,
        orbitalPeriod: 88,
        rotationPeriod: 58.6,
        color: '#8c8c8c',
        glowColor: '#a5a5a5',
        textureGradient: ['#5c5c5c', '#8c8c8c', '#a5a5a5', '#8c8c8c']
      },
      {
        id: 'venus',
        name: '金星',
        radius: 12,
        distance: 145,
        orbitalPeriod: 225,
        rotationPeriod: 243,
        color: '#e6c27a',
        glowColor: '#ffd700',
        textureGradient: ['#b8956a', '#d4a574', '#e6c27a', '#f0d090']
      },
      {
        id: 'earth',
        name: '地球',
        radius: 13,
        distance: 200,
        orbitalPeriod: 365,
        rotationPeriod: 1,
        color: '#4a90d9',
        glowColor: '#00d4ff',
        textureGradient: ['#2a5a8a', '#4a90d9', '#2ecc71', '#4a90d9']
      },
      {
        id: 'mars',
        name: '火星',
        radius: 9,
        distance: 260,
        orbitalPeriod: 687,
        rotationPeriod: 1.03,
        color: '#d45a3a',
        glowColor: '#ff6b35',
        textureGradient: ['#8b3a2a', '#d45a3a', '#e07a5a', '#d45a3a']
      },
      {
        id: 'jupiter',
        name: '木星',
        radius: 38,
        distance: 360,
        orbitalPeriod: 4333,
        rotationPeriod: 0.41,
        color: '#d4a574',
        glowColor: '#ffb347',
        textureGradient: ['#8b6a4a', '#c9a86c', '#d4a574', '#e0c48a', '#c9a86c']
      },
      {
        id: 'saturn',
        name: '土星',
        radius: 32,
        distance: 460,
        orbitalPeriod: 10759,
        rotationPeriod: 0.44,
        color: '#f4d59e',
        glowColor: '#ffcc00',
        rings: true,
        ringsColor: '#d4c4a4',
        textureGradient: ['#c9a56e', '#e0c58e', '#f4d59e', '#e8d0a0']
      },
      {
        id: 'uranus',
        name: '天王星',
        radius: 20,
        distance: 560,
        orbitalPeriod: 30687,
        rotationPeriod: 0.72,
        color: '#7fd1e0',
        glowColor: '#00ced1',
        textureGradient: ['#4a90a0', '#7fd1e0', '#a8e0e8', '#7fd1e0']
      },
      {
        id: 'neptune',
        name: '海王星',
        radius: 19,
        distance: 660,
        orbitalPeriod: 60190,
        rotationPeriod: 0.67,
        color: '#4a7dd4',
        glowColor: '#6495ed',
        textureGradient: ['#2a4a8a', '#4a7dd4', '#7aa0e0', '#4a7dd4']
      }
    ]
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const startTime = Date.now()
    let lastFrameTime = 0
    const frameInterval = 1000 / performanceConfig.targetFps

    const stars = Array(performanceConfig.starCount).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.7 
        ? `rgba(147, 112, 219, ${Math.random() * 0.5 + 0.5})` 
        : Math.random() > 0.5 
          ? `rgba(100, 149, 237, ${Math.random() * 0.5 + 0.5})` 
          : `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`
    }))

    const starCanvas = document.createElement('canvas')
    const starCtx = starCanvas.getContext('2d')
    if (!starCtx) return

    const updateStarCanvas = () => {
      starCanvas.width = canvas.width
      starCanvas.height = canvas.height
      starCtx.fillStyle = '#050a14'
      starCtx.fillRect(0, 0, starCanvas.width, starCanvas.height)

      const gradient1 = starCtx.createRadialGradient(
        starCanvas.width * 0.2, starCanvas.height * 0.8, 0,
        starCanvas.width * 0.2, starCanvas.height * 0.8, starCanvas.width * 0.4
      )
      gradient1.addColorStop(0, 'rgba(147, 112, 219, 0.08)')
      gradient1.addColorStop(1, 'transparent')
      starCtx.fillStyle = gradient1
      starCtx.fillRect(0, 0, starCanvas.width, starCanvas.height)

      const gradient2 = starCtx.createRadialGradient(
        starCanvas.width * 0.8, starCanvas.height * 0.2, 0,
        starCanvas.width * 0.8, starCanvas.height * 0.2, starCanvas.width * 0.35
      )
      gradient2.addColorStop(0, 'rgba(0, 206, 209, 0.06)')
      gradient2.addColorStop(1, 'transparent')
      starCtx.fillStyle = gradient2
      starCtx.fillRect(0, 0, starCanvas.width, starCanvas.height)

      const gradient3 = starCtx.createRadialGradient(
        starCanvas.width * 0.5, starCanvas.height * 0.5, 0,
        starCanvas.width * 0.5, starCanvas.height * 0.5, starCanvas.width * 0.45
      )
      gradient3.addColorStop(0, 'rgba(255, 105, 180, 0.04)')
      gradient3.addColorStop(1, 'transparent')
      starCtx.fillStyle = gradient3
      starCtx.fillRect(0, 0, starCanvas.width, starCanvas.height)
    }

    const resizeCanvas = () => {
      canvas.width = Math.min(window.innerWidth * 0.95, 1400)
      canvas.height = Math.min(window.innerHeight * 0.85, 900)
      updateStarCanvas()
    }

    updateStarCanvas()

    const drawSun = (centerX: number, centerY: number, time: number) => {
      const sun = solarSystemData.sun
      
      if (performanceConfig.enableSunGlow) {
        for (let i = sun.glowColors.length - 1; i >= 0; i--) {
          const radius = sun.radius * (2.5 + i * 0.4)
          const alpha = 0.15 - i * 0.03
          const glowGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
          )
          glowGradient.addColorStop(0, `${sun.glowColors[i]}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`)
          glowGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
          ctx.fillStyle = glowGradient
          ctx.fill()
        }
      }

      const sunGradient = ctx.createRadialGradient(
        centerX - sun.radius * 0.3, centerY - sun.radius * 0.3, 0,
        centerX, centerY, sun.radius
      )
      sunGradient.addColorStop(0, '#ffffff')
      sunGradient.addColorStop(0.3, '#ffeb3b')
      sunGradient.addColorStop(0.6, '#ffcc00')
      sunGradient.addColorStop(0.9, '#ff9500')
      sunGradient.addColorStop(1, '#ff6b00')

      ctx.beginPath()
      ctx.arc(centerX, centerY, sun.radius, 0, Math.PI * 2)
      ctx.fillStyle = sunGradient
      ctx.fill()

      const coronaGlow = ctx.createRadialGradient(
        centerX, centerY, sun.radius * 0.9,
        centerX, centerY, sun.radius * 1.8
      )
      coronaGlow.addColorStop(0, 'rgba(255, 215, 0, 0.3)')
      coronaGlow.addColorStop(0.5, 'rgba(255, 149, 0, 0.15)')
      coronaGlow.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, sun.radius * 1.8, 0, Math.PI * 2)
      ctx.fillStyle = coronaGlow
      ctx.fill()

      if (performanceConfig.enableSunGlow) {
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + time * 0.001
          const flareX = centerX + Math.cos(angle) * (sun.radius + 20)
          const flareY = centerY + Math.sin(angle) * (sun.radius + 20)
          
          const flareGradient = ctx.createRadialGradient(
            flareX, flareY, 0,
            flareX, flareY, 30
          )
          flareGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
          flareGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.arc(flareX, flareY, 30, 0, Math.PI * 2)
          ctx.fillStyle = flareGradient
          ctx.fill()
        }
      }
    }

    const drawPlanet = (planet: Planet, angle: number, centerX: number, centerY: number, _time: number) => {
      const x = centerX + Math.cos(angle) * planet.distance * viewState.scale
      const y = centerY + Math.sin(angle) * planet.distance * viewState.scale
      const radius = planet.radius * viewState.scale

      const glowGradient = ctx.createRadialGradient(x, y, radius, x, y, radius * 2.5)
      glowGradient.addColorStop(0, `${planet.glowColor}40`)
      glowGradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = glowGradient
      ctx.fill()

      if (planet.textureGradient) {
        const planetGradient = ctx.createRadialGradient(
          x - radius * 0.3, y - radius * 0.3, 0,
          x, y, radius
        )
        planet.textureGradient.forEach((color, i) => {
          const len = planet.textureGradient?.length ?? 1
          planetGradient.addColorStop(i / Math.max(1, len - 1), color)
        })
        
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = planetGradient
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = planet.color
        ctx.fill()
      }

      const highlightGradient = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, 0,
        x, y, radius
      )
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
      highlightGradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = highlightGradient
      ctx.fill()

      if (planet.rings && planet.ringsColor) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.PI / 6)
        
        for (let i = 0; i < 3; i++) {
          const innerRadius = radius * (1.4 + i * 0.25)
          const outerRadius = radius * (1.9 + i * 0.35)
          const ringGradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius)
          ringGradient.addColorStop(0, 'transparent')
          ringGradient.addColorStop(0.2, `${planet.ringsColor}80`)
          ringGradient.addColorStop(0.5, `${planet.ringsColor}60`)
          ringGradient.addColorStop(0.8, `${planet.ringsColor}40`)
          ringGradient.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.ellipse(0, 0, outerRadius, outerRadius * 0.35, 0, 0, Math.PI * 2)
          ctx.fillStyle = ringGradient
          ctx.fill()
        }
        ctx.restore()
      }

      if (performanceConfig.enablePlanetNames) {
        ctx.save()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px Orbitron'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = planet.glowColor
        ctx.shadowBlur = 10
        ctx.fillText(planet.name, x, y - radius - 20)
        ctx.restore()
      }

      if (selectedPlanet && selectedPlanet.id === planet.id) {
        ctx.beginPath()
        ctx.arc(x, y, radius + 8, 0, Math.PI * 2)
        ctx.strokeStyle = '#00d4ff'
        ctx.lineWidth = 3
        ctx.shadowColor = '#00d4ff'
        ctx.shadowBlur = 15
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      return { x, y, radius }
    }

    const drawOrbit = (distance: number, centerX: number, centerY: number) => {
      if (!performanceConfig.enableOrbitalLines) return
      
      const orbitRadius = distance * viewState.scale
      const gradient = ctx.createRadialGradient(
        centerX, centerY, orbitRadius - 5,
        centerX, centerY, orbitRadius + 5
      )
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(0.5, 'rgba(100, 149, 237, 0.2)')
      gradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.setLineDash([8, 4])
      ctx.stroke()
      ctx.setLineDash([])
    }

    const drawStars = (time: number) => {
      ctx.drawImage(starCanvas, 0, 0)
      
      stars.forEach((star, i) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + i) * 0.3 + 0.7
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        
        ctx.beginPath()
        ctx.arc(x, y, star.size * twinkle, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.globalAlpha = twinkle
        ctx.fill()
        ctx.globalAlpha = 1
      })
    }

    const draw = (currentTime: number) => {
      if (currentTime - lastFrameTime < frameInterval) {
        animationId = requestAnimationFrame(draw)
        return
      }
      lastFrameTime = currentTime

      const elapsedTime = currentTime - startTime
      const timeScale = 0.015
      
      const centerX = canvas.width / 2 + viewState.offset.x
      const centerY = canvas.height / 2 + viewState.offset.y

      drawStars(elapsedTime)

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(viewState.rotation)
      ctx.translate(-centerX, -centerY)

      solarSystemData.planets.forEach(planet => {
        drawOrbit(planet.distance, centerX, centerY)
      })

      drawSun(centerX, centerY, elapsedTime)

      const planetPositions: { [key: string]: { x: number; y: number; radius: number } } = {}
      solarSystemData.planets.forEach(planet => {
        const angle = (elapsedTime * timeScale) / planet.orbitalPeriod * Math.PI * 2
        const pos = drawPlanet(planet, angle, centerX, centerY, elapsedTime)
        planetPositions[planet.id] = pos
      })

      ctx.restore()
      
      animationId = requestAnimationFrame(draw)
    }

    draw(Date.now())

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left - viewState.offset.x
      const mouseY = e.clientY - rect.top - viewState.offset.y
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      const relativeX = mouseX - centerX
      const relativeY = mouseY - centerY
      const rotatedX = relativeX * Math.cos(-viewState.rotation) - relativeY * Math.sin(-viewState.rotation) + centerX
      const rotatedY = relativeX * Math.sin(-viewState.rotation) + relativeY * Math.cos(-viewState.rotation) + centerY

      let clickedPlanet: Planet | null = null
      solarSystemData.planets.forEach(planet => {
        const angle = Date.now() * 0.015 / planet.orbitalPeriod * Math.PI * 2
        const planetX = centerX + Math.cos(angle) * planet.distance * viewState.scale
        const planetY = centerY + Math.sin(angle) * planet.distance * viewState.scale
        const planetRadius = planet.radius * viewState.scale + 15

        const distance = Math.sqrt((rotatedX - planetX) ** 2 + (rotatedY - planetY) ** 2)
        if (distance <= planetRadius) {
          clickedPlanet = planet
        }
      })

      setSelectedPlanet(clickedPlanet)
    }

    canvas.addEventListener('click', handleClick)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('click', handleClick)
    }
  }, [viewState, selectedPlanet])

  const handleViewChange = (newViewState: ViewState) => {
    setViewState(newViewState)
  }

  return (
    <div className="relative w-full h-screen interstellar-bg flex flex-col items-center justify-center overflow-hidden digital-rain">
      <canvas
        ref={canvasRef}
        className="rounded-2xl interstellar-glass interstellar-border"
        style={{ 
          boxShadow: '0 0 120px rgba(0, 212, 255, 0.2), inset 0 0 80px rgba(0, 0, 0, 0.6)'
        }}
      />
      
      <ViewControls 
        initialState={viewState}
        onViewChange={handleViewChange}
        minScale={0.3}
        maxScale={2.5}
        enableRotation={true}
      />
      
      {selectedPlanet && (
        <div className="absolute top-6 right-6 interstellar-glass interstellar-border rounded-2xl p-6 max-w-sm fade-in hud-element">
          <h3 className="text-2xl font-bold mb-4 interstellar-font interstellar-text-glow" style={{ color: selectedPlanet.glowColor }}>
            {selectedPlanet.name}
          </h3>
          <div className="space-y-3 text-sm rajdhani-font">
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">半径:</span>
              <span className="text-interstellar-white font-medium">{selectedPlanet.radius} 单位</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">轨道距离:</span>
              <span className="text-interstellar-white font-medium">{selectedPlanet.distance} AU</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">公转周期:</span>
              <span className="text-interstellar-white font-medium">{selectedPlanet.orbitalPeriod} 天</span>
            </div>
            <div className="flex justify-between border-b border-interstellar-cyan/20 pb-2">
              <span className="text-interstellar-cyan/70">自转周期:</span>
              <span className="text-interstellar-white font-medium">{selectedPlanet.rotationPeriod} 天</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedPlanet(null)}
            className="mt-4 w-full py-3 px-4 interstellar-btn text-interstellar-cyan hover:text-interstellar-white transition-all"
          >
            <span className="interstellar-font text-xs">关闭</span>
          </button>
        </div>
      )}
      
      <div className="absolute bottom-6 left-6 interstellar-glass interstellar-border rounded-xl p-4 fade-in hud-element">
        <p className="text-sm text-interstellar-cyan/80 rajdhani-font mb-2">🖱️ 拖动: 移动视角</p>
        <p className="text-sm text-interstellar-cyan/80 rajdhani-font mb-2">🔍 滚轮: 缩放</p>
        <p className="text-sm text-interstellar-cyan/80 rajdhani-font mb-2">🔄 中键拖动: 旋转</p>
        <p className="text-sm text-interstellar-cyan/80 rajdhani-font">👆 点击: 行星信息</p>
        {performanceConfig.isMobile && (
          <p className="mt-3 text-interstellar-gold rajdhani-font text-sm">📱 移动设备优化已启用</p>
        )}
      </div>

      <div className="absolute top-6 left-6 interstellar-glass interstellar-border rounded-xl p-4 slide-in-left hud-element">
        <h2 className="text-xl font-bold mb-3 interstellar-font bg-gradient-to-r from-interstellar-cyan to-interstellar-purple bg-clip-text text-transparent">
          太阳系
        </h2>
        <div className="space-y-2 text-xs">
          {solarSystemData.planets.map((planet, index) => (
            <div 
              key={planet.id} 
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-interstellar-deep/50 transition-colors cursor-pointer interstellar-card"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedPlanet(planet)}
            >
              <div 
                className="w-4 h-4 rounded-full"
                style={{ 
                  backgroundColor: planet.color,
                  boxShadow: `0 0 8px ${planet.glowColor}`
                }}
              />
              <span className="text-interstellar-gray rajdhani-font uppercase">{planet.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SolarSystemCanvas
