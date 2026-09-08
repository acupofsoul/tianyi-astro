/**
 * 顶部阅读进度条：自动寻找当前页面的主滚动容器。
 * 首页/天文史/目录/详情面板的滚动容器各不相同，这里按优先级探测。
 */

const SCROLLER_SELECTORS = ['.home-scroll', '.timeline-wrap', '.browse-list', '.panel-scroll']

function findScroller(): HTMLElement | null {
  for (const selector of SCROLLER_SELECTORS) {
    const node = document.querySelector<HTMLElement>(selector)
    if (node && node.clientHeight > 0 && node.scrollHeight > node.clientHeight + 2) return node
  }
  const root = document.scrollingElement
  return root instanceof HTMLElement ? root : null
}

export function attachScrollProgress(header: HTMLElement, bar: HTMLElement, track: HTMLElement): void {
  let frame = 0

  function update(): void {
    frame = 0
    if (!header.isConnected) {
      document.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
      return
    }
    const scroller = findScroller()
    let ratio = 0
    if (scroller) {
      const max = scroller.scrollHeight - scroller.clientHeight
      ratio = max > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / max)) : 0
    }
    const percent = Math.round(ratio * 100)
    bar.style.transform = `scaleX(${ratio.toFixed(4)})`
    track.setAttribute('aria-valuenow', String(percent))
    header.setAttribute('data-progress', String(percent))
  }

  function schedule(): void {
    if (frame) return
    frame = window.requestAnimationFrame(update)
  }

  document.addEventListener('scroll', schedule, true)
  window.addEventListener('resize', schedule)
  update()
}
