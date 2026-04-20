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
  texture?: string
}

interface SolarSystem {
  sun: {
    radius: number
    color: string
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

  // 设备检测
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // 性能配置
  const performanceConfig = {
    isMobile,
    targetFps: isMobile ? 30 : 60,
    starCount: isMobile ? 100 : 200,
    enableSunGlow: !isMobile,
    enablePlanetNames: !isMobile,
    enableOrbitalLines: !isMobile
  }

  const solarSystemData: SolarSystem = {
    sun: {
      radius: 50,
      color: '#f1c40f'
    },
    planets: [
      {
        id: 'mercury',
        name: '水星',
        radius: 4,
        distance: 80,
        orbitalPeriod: 88,
        rotationPeriod: 58.6,
        color: '#8c8c8c'
      },
      {
        id: 'venus',
        name: '金星',
        radius: 10,
        distance: 120,
        orbitalPeriod: 225,
        rotationPeriod: 243,
        color: '#e67e22'
      },
      {
        id: 'earth',
        name: '地球',
        radius: 10,
        distance: 160,
        orbitalPeriod: 365,
        rotationPeriod: 1,
        color: '#3498db'
      },
      {
        id: 'mars',
        name: '火星',
        radius: 6,
        distance: 200,
        orbitalPeriod: 687,
        rotationPeriod: 1.03,
        color: '#e74c3c'
      },
      {
        id: 'jupiter',
        name: '木星',
        radius: 30,
        distance: 280,
        orbitalPeriod: 4333,
        rotationPeriod: 0.41,
        color: '#f39c12'
      },
      {
        id: 'saturn',
        name: '土星',
        radius: 25,
        distance: 360,
        orbitalPeriod: 10759,
        rotationPeriod: 0.44,
        color: '#f1c40f'
      },
      {
        id: 'uranus',
        name: '天王星',
        radius: 15,
        distance: 440,
        orbitalPeriod: 30687,
        rotationPeriod: 0.72,
        color: '#1abc9c'
      },
      {
        id: 'neptune',
        name: '海王星',
        radius: 15,
        distance: 520,
        orbitalPeriod: 60190,
        rotationPeriod: 0.67,
        color: '#3498db'
      }
    ]
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.9
      canvas.height = window.innerHeight * 0.8
      updateStarCanvas()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationId: number
    const startTime = Date.now()
    let lastFrameTime = 0
    const frameInterval = 1000 / performanceConfig.targetFps

    // 预计算星星位置，避免每次渲染都重新生成
    const stars = Array(performanceConfig.starCount).fill(0).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2
    }))

    // 创建离屏Canvas用于绘制星空背景
    const starCanvas = document.createElement('canvas')
    const starCtx = starCanvas.getContext('2d')
    if (!starCtx) return

    const updateStarCanvas = () => {
      starCanvas.width = canvas.width
      starCanvas.height = canvas.height
      
      // 绘制星空背景
      starCtx.fillStyle = '#0b1a2b'
      starCtx.fillRect(0, 0, starCanvas.width, starCanvas.height)

      // 绘制星星
      starCtx.fillStyle = '#ffffff'
      stars.forEach(star => {
        const x = star.x * starCanvas.width
        const y = star.y * starCanvas.height
        starCtx.beginPath()
        starCtx.arc(x, y, star.size, 0, Math.PI * 2)
        starCtx.fill()
      })
    }

    // 初始更新星星Canvas
    updateStarCanvas()

    const draw = (currentTime: number) => {
      // 动画节流
      if (currentTime - lastFrameTime < frameInterval) {
        animationId = requestAnimationFrame(draw)
        return
      }
      lastFrameTime = currentTime

      const elapsedTime = currentTime - startTime
      const timeScale = 0.01

      const centerX = canvas.width / 2 + viewState.offset.x
      const centerY = canvas.height / 2 + viewState.offset.y

      // 绘制星空背景（使用离屏Canvas）
      ctx.drawImage(starCanvas, 0, 0)

      // 保存当前状态
      ctx.save()
      
      // 应用旋转
      ctx.translate(centerX, centerY)
      ctx.rotate(viewState.rotation)
      ctx.translate(-centerX, -centerY)

      // 绘制太阳发光效果
      if (performanceConfig.enableSunGlow) {
        const sunGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, solarSystemData.sun.radius * 2
        )
        sunGradient.addColorStop(0, 'rgba(255, 255, 0, 1)')
        sunGradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.8)')
        sunGradient.addColorStop(1, 'rgba(255, 100, 0, 0)')

        ctx.beginPath()
        ctx.arc(centerX, centerY, solarSystemData.sun.radius * 2, 0, Math.PI * 2)
        ctx.fillStyle = sunGradient
        ctx.fill()
      }

      // 绘制太阳
      ctx.beginPath()
      ctx.arc(centerX, centerY, solarSystemData.sun.radius, 0, Math.PI * 2)
      ctx.fillStyle = solarSystemData.sun.color
      ctx.fill()

      // 绘制行星轨道
      if (performanceConfig.enableOrbitalLines) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.setLineDash([5, 5])
        solarSystemData.planets.forEach((planet) => {
          ctx.beginPath()
          ctx.arc(centerX, centerY, planet.distance * viewState.scale, 0, Math.PI * 2)
          ctx.stroke()
        })
        ctx.setLineDash([])
      }

      // 绘制行星
      solarSystemData.planets.forEach((planet) => {
        const angle = (elapsedTime * timeScale) / planet.orbitalPeriod * Math.PI * 2
        const x = centerX + Math.cos(angle) * planet.distance * viewState.scale
        const y = centerY + Math.sin(angle) * planet.distance * viewState.scale

        // 绘制行星
        ctx.beginPath()
        ctx.arc(x, y, planet.radius * viewState.scale, 0, Math.PI * 2)
        ctx.fillStyle = planet.color
        ctx.fill()

        // 绘制行星名称
        if (performanceConfig.enablePlanetNames) {
          ctx.fillStyle = '#ffffff'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(planet.name, x, y - planet.radius * viewState.scale - 10)
        }

        // 检测鼠标是否悬停在行星上
        if (selectedPlanet && selectedPlanet.id === planet.id) {
          ctx.beginPath()
          ctx.arc(x, y, planet.radius * viewState.scale + 5, 0, Math.PI * 2)
          ctx.strokeStyle = '#ffffff'
          ctx.stroke()
        }
      })

      // 恢复状态
      ctx.restore()

      animationId = requestAnimationFrame(draw)
    }

    draw(Date.now())

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [viewState, selectedPlanet])

  const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left - viewState.offset.x
    const mouseY = e.clientY - rect.top - viewState.offset.y
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // 考虑旋转的影响
    const relativeX = mouseX - centerX
    const relativeY = mouseY - centerY
    const rotatedX = relativeX * Math.cos(-viewState.rotation) - relativeY * Math.sin(-viewState.rotation) + centerX
    const rotatedY = relativeX * Math.sin(-viewState.rotation) + relativeY * Math.cos(-viewState.rotation) + centerY

    let clickedPlanet: Planet | null = null
    solarSystemData.planets.forEach((planet) => {
      const angle = Date.now() * 0.01 / planet.orbitalPeriod * Math.PI * 2
      const planetX = centerX + Math.cos(angle) * planet.distance * viewState.scale
      const planetY = centerY + Math.sin(angle) * planet.distance * viewState.scale

      const distance = Math.sqrt((rotatedX - planetX) ** 2 + (rotatedY - planetY) ** 2)
      if (distance <= planet.radius * viewState.scale) {
        clickedPlanet = planet
      }
    })

    setSelectedPlanet(clickedPlanet)
  }

  const handleViewChange = (newViewState: ViewState) => {
    setViewState(newViewState)
  }

  return (
    <div className="relative w-full h-screen bg-[#0b1a2b] flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        className="border border-gray-800 rounded-lg"
        onClick={handleMouseClick}
      />
      
      <ViewControls 
        initialState={viewState}
        onViewChange={handleViewChange}
        minScale={0.1}
        maxScale={3}
        enableRotation={true}
      />
      
      {selectedPlanet && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg border border-gray-700">
          <h3 className="text-xl font-bold mb-2">{selectedPlanet.name}</h3>
          <p className="mb-1">半径: {selectedPlanet.radius} 单位</p>
          <p className="mb-1">距离太阳: {selectedPlanet.distance} 单位</p>
          <p className="mb-1">公转周期: {selectedPlanet.orbitalPeriod} 天</p>
          <p className="mb-1">自转周期: {selectedPlanet.rotationPeriod} 天</p>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-white text-sm">
        <p>拖动: 移动视角</p>
        <p>滚轮: 缩放</p>
        <p>中键: 旋转视角</p>
        <p>点击行星: 查看信息</p>
        {performanceConfig.isMobile && <p className="mt-2 text-yellow-300">移动设备模式: 已优化性能</p>}
      </div>
    </div>
  )
}

export default SolarSystemCanvas