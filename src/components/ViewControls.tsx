import React, { useState, useCallback, useRef, useEffect } from 'react'

interface ViewState {
  scale: number
  rotation: number
  offset: { x: number; y: number }
}

interface ViewControlsProps {
  initialState?: Partial<ViewState>
  onViewChange: (state: ViewState) => void
  minScale?: number
  maxScale?: number
  enableRotation?: boolean
}

const ViewControls: React.FC<ViewControlsProps> = ({
  initialState = {},
  onViewChange,
  minScale = 0.1,
  maxScale = 5,
  enableRotation = true
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [rotateStart, setRotateStart] = useState(0)
  
  const [viewState, setViewState] = useState<ViewState>({
    scale: initialState.scale || 1,
    rotation: initialState.rotation || 0,
    offset: initialState.offset || { x: 0, y: 0 }
  })

  const lastStateRef = useRef<ViewState>(viewState)
  const animationFrameRef = useRef<number>()
  const transitionRef = useRef<{
    target: ViewState
    start: ViewState
    startTime: number
    duration: number
  } | null>(null)

  useEffect(() => {
    lastStateRef.current = viewState
  }, [viewState])

  useEffect(() => {
    const animate = () => {
      if (transitionRef.current) {
        const { target, start, startTime, duration } = transitionRef.current
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // 使用缓动函数
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        const newState: ViewState = {
          scale: start.scale + (target.scale - start.scale) * easeOut,
          rotation: start.rotation + (target.rotation - start.rotation) * easeOut,
          offset: {
            x: start.offset.x + (target.offset.x - start.offset.x) * easeOut,
            y: start.offset.y + (target.offset.y - start.offset.y) * easeOut
          }
        }
        
        setViewState(newState)
        onViewChange(newState)
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          transitionRef.current = null
        }
      }
    }

    if (transitionRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [onViewChange])

  const updateViewState = useCallback((newState: Partial<ViewState>) => {
    const updatedState = {
      ...viewState,
      ...newState,
      scale: Math.max(minScale, Math.min(maxScale, newState.scale || viewState.scale))
    }
    setViewState(updatedState)
    onViewChange(updatedState)
  }, [viewState, onViewChange, minScale, maxScale])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) { // 左键
      setIsDragging(true)
      setDragStart({ x: e.clientX - viewState.offset.x, y: e.clientY - viewState.offset.y })
    } else if (e.button === 1 && enableRotation) { // 中键
      setIsRotating(true)
      setRotateStart(e.clientX)
    }
  }, [viewState.offset, enableRotation])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateViewState({
        offset: {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }
      })
    } else if (isRotating && enableRotation) {
      const delta = e.clientX - rotateStart
      updateViewState({
        rotation: viewState.rotation + delta * 0.01
      })
      setRotateStart(e.clientX)
    }
  }, [isDragging, isRotating, dragStart, rotateStart, viewState.rotation, enableRotation, updateViewState])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsRotating(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const zoomFactor = 1 - e.deltaY * 0.001
    updateViewState({
      scale: viewState.scale * zoomFactor
    })
  }, [viewState.scale, updateViewState])

  const resetView = useCallback(() => {
    transitionRef.current = {
      target: {
        scale: 1,
        rotation: 0,
        offset: { x: 0, y: 0 }
      },
      start: viewState,
      startTime: Date.now(),
      duration: 500
    }
  }, [viewState])

  const zoomTo = useCallback((factor: number) => {
    const targetScale = Math.max(minScale, Math.min(maxScale, viewState.scale * factor))
    transitionRef.current = {
      target: {
        ...viewState,
        scale: targetScale
      },
      start: viewState,
      startTime: Date.now(),
      duration: 300
    }
  }, [viewState, minScale, maxScale])

  const rotateTo = useCallback((targetRotation: number) => {
    transitionRef.current = {
      target: {
        ...viewState,
        rotation: targetRotation
      },
      start: viewState,
      startTime: Date.now(),
      duration: 500
    }
  }, [viewState])

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ touchAction: 'none' }}
    >
      {/* 交互层 */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-auto"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* 控制按钮 */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-3 pointer-events-auto">
        <button
          onClick={resetView}
          className="interstellar-btn text-interstellar-cyan p-4 rounded-full hover:interstellar-glow transition-all"
          title="RESET VIEW"
        >
          <span className="text-lg">⟲</span>
        </button>
        <button
          onClick={() => zoomTo(1.2)}
          className="interstellar-btn text-interstellar-cyan p-4 rounded-full hover:interstellar-glow transition-all"
          title="ZOOM IN"
        >
          <span className="text-lg font-bold">+</span>
        </button>
        <button
          onClick={() => zoomTo(0.8)}
          className="interstellar-btn text-interstellar-cyan p-4 rounded-full hover:interstellar-glow transition-all"
          title="ZOOM OUT"
        >
          <span className="text-lg font-bold">−</span>
        </button>
        {enableRotation && (
          <button
            onClick={() => rotateTo(viewState.rotation + Math.PI / 2)}
            className="interstellar-btn text-interstellar-cyan p-4 rounded-full hover:interstellar-glow transition-all"
            title="ROTATE"
          >
            <span className="text-lg">↻</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ViewControls