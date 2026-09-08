/** 移动端抽屉：从左向右滑动手势关闭（垂直滑动时交给页面滚动）。 */

export function attachDrawerSwipe(drawer: HTMLElement, onClose: () => void): void {
  let startX = 0
  let startY = 0
  let dx = 0
  let tracking = false

  function reset(): void {
    tracking = false
    dx = 0
    drawer.classList.remove('dragging')
    drawer.style.transition = ''
    drawer.style.transform = ''
  }

  drawer.addEventListener(
    'touchstart',
    (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      const touch = event.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      dx = 0
      tracking = true
    },
    { passive: true }
  )

  drawer.addEventListener(
    'touchmove',
    (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return
      const touch = event.touches[0]
      dx = touch.clientX - startX
      const dy = touch.clientY - startY
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
        reset()
        return
      }
      if (dx > 0) dx = 0
      if (dx < -drawer.clientWidth) dx = -drawer.clientWidth
      drawer.classList.add('dragging')
      drawer.style.transition = 'none'
      drawer.style.transform = `translateX(${dx}px)`
    },
    { passive: true }
  )

  function finish(): void {
    if (!tracking) return
    const shouldClose = dx < -60
    reset()
    if (shouldClose) onClose()
  }

  drawer.addEventListener('touchend', finish, { passive: true })
  drawer.addEventListener('touchcancel', finish, { passive: true })
}
