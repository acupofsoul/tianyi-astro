/**
 * 移动端底部抽屉（≤900px，工作流 C）。
 * 拖拽把手可上下拖动，松手吸附到「半开 / 全开 / 收起」三档；键盘 Enter/空格 也能切换。
 * 桌面端（>900px）不做任何处理，面板保持右侧 HUD 侧栏。
 */
export interface DrawerHandle {
  dispose(): void
  /** 展开到全开档 */
  expand(): void
  /** 收起到最小可见档 */
  peek(): void
  /** 半开档（默认） */
  half(): void
}

const BREAKPOINT = '(max-width: 900px)'

export function setupDrawer(panel: HTMLElement, grip: HTMLButtonElement): DrawerHandle {
  const mq = window.matchMedia(BREAKPOINT)
  let active = mq.matches
  let y = 0
  let dragging = false
  let moved = false
  let startPointerY = 0
  let startY = 0

  function panelHeight(): number {
    return panel.getBoundingClientRect().height || 1
  }

  /** [全开, 半开, 收起] 的 translateY 偏移（px，越大越收起）。 */
  function snapPoints(): [number, number, number] {
    const h = panelHeight()
    const peekVisible = Math.min(h, 176)
    // 手机首屏给 3D 留出更多空间：半开档约占视口 40%
    const halfVisible = Math.min(h, Math.max(232, window.innerHeight * 0.34))
    const full = 0
    const half = Math.max(0, h - halfVisible)
    const peek = Math.max(0, h - peekVisible)
    return [full, half, peek]
  }

  function apply(v: number, animate: boolean) {
    y = v
    panel.style.setProperty('--dt-drawer-y', Math.round(v) + 'px')
    panel.classList.toggle('dt-drawer-dragging', !animate)
    const pts = snapPoints()
    grip.setAttribute('aria-expanded', v < pts[2] - 8 ? 'true' : 'false')
  }

  function nearest(): number {
    const pts = snapPoints()
    let best = pts[0]
    for (const p of pts) if (Math.abs(p - y) < Math.abs(best - y)) best = p
    return best
  }

  function cycle() {
    if (!active) return
    const pts = snapPoints()
    const cur = nearest()
    const idx = pts.indexOf(cur)
    const next = idx >= pts.length - 1 ? pts[0] : pts[idx + 1]
    apply(next, true)
  }

  function onPointerDown(e: PointerEvent) {
    if (!active || e.button !== 0) return
    dragging = true
    moved = false
    startPointerY = e.clientY
    startY = y
    panel.classList.add('dt-drawer-dragging')
    grip.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return
    const dy = e.clientY - startPointerY
    if (Math.abs(dy) > 4) moved = true
    const pts = snapPoints()
    const v = Math.min(pts[2], Math.max(pts[0], startY + dy))
    y = v
    panel.style.setProperty('--dt-drawer-y', Math.round(v) + 'px')
  }

  function onPointerUp(e: PointerEvent) {
    if (!dragging) return
    dragging = false
    panel.classList.remove('dt-drawer-dragging')
    if (grip.hasPointerCapture(e.pointerId)) grip.releasePointerCapture(e.pointerId)
    if (moved) apply(nearest(), true)
    else cycle()
  }

  function onGripClick(e: MouseEvent) {
    // 键盘触发的 click detail 为 0；指针交互已在 pointerup 处理
    if (e.detail === 0) cycle()
  }

  let rafId = 0
  function onResize() {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
      rafId = 0
      const now = mq.matches
      if (now !== active) {
        active = now
        if (active) apply(snapPoints()[1], false)
        else panel.style.removeProperty('--dt-drawer-y')
        return
      }
      if (active) {
        const pts = snapPoints()
        apply(Math.min(pts[2], Math.max(pts[0], y)), false)
      }
    })
  }

  function onMqChange() {
    active = mq.matches
    if (active) apply(snapPoints()[1], false)
    else panel.style.removeProperty('--dt-drawer-y')
  }

  grip.addEventListener('pointerdown', onPointerDown)
  grip.addEventListener('pointermove', onPointerMove)
  grip.addEventListener('pointerup', onPointerUp)
  grip.addEventListener('pointercancel', onPointerUp)
  grip.addEventListener('click', onGripClick)
  window.addEventListener('resize', onResize)
  mq.addEventListener('change', onMqChange)

  if (active) apply(snapPoints()[1], false)

  return {
    expand() {
      if (active) apply(snapPoints()[0], true)
    },
    peek() {
      if (active) apply(snapPoints()[2], true)
    },
    half() {
      if (active) apply(snapPoints()[1], true)
    },
    dispose() {
      if (rafId) cancelAnimationFrame(rafId)
      grip.removeEventListener('pointerdown', onPointerDown)
      grip.removeEventListener('pointermove', onPointerMove)
      grip.removeEventListener('pointerup', onPointerUp)
      grip.removeEventListener('pointercancel', onPointerUp)
      grip.removeEventListener('click', onGripClick)
      window.removeEventListener('resize', onResize)
      mq.removeEventListener('change', onMqChange)
      panel.style.removeProperty('--dt-drawer-y')
    }
  }
}
