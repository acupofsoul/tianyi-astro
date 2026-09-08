import { el } from '../dom'

/**
 * 详情页加载态（工作流 C）。
 * 场景构建 / 首帧渲染完成前显示骨架，就绪后淡出；WebGL 不可用时给出可读的降级提示。
 */
export interface LoadingHandle {
  el: HTMLElement
  ready(): void
  fail(message: string): void
  dispose(): void
}

export function createLoading(entryName: string, enName: string): LoadingHandle {
  const box = el('div', 'dt-loading')
  box.setAttribute('role', 'status')
  box.setAttribute('aria-live', 'polite')

  const inner = el('div', 'dt-loading-inner')
  const ring = el('div', 'dt-loading-ring')
  ring.setAttribute('aria-hidden', 'true')
  const title = el('div', 'dt-loading-title')
  title.textContent = '正在构建三维场景'
  const sub = el('div', 'hud-label dt-loading-sub')
  sub.textContent = 'SCENE BUILDING · ' + enName
  const bar = el('div', 'dt-loading-bar')
  bar.appendChild(el('span', 'dt-loading-bar-fill'))
  const name = el('div', 'dt-loading-name')
  name.textContent = entryName

  inner.appendChild(ring)
  inner.appendChild(title)
  inner.appendChild(sub)
  inner.appendChild(bar)
  inner.appendChild(name)
  box.appendChild(inner)

  let timer = 0

  return {
    el: box,
    ready() {
      if (box.classList.contains('dt-loading-out')) return
      box.classList.add('dt-loading-out')
      timer = window.setTimeout(() => {
        box.remove()
      }, 420)
    },
    fail(message: string) {
      window.clearTimeout(timer)
      box.classList.remove('dt-loading-out')
      box.classList.add('dt-loading-fail')
      ring.remove()
      title.textContent = '三维渲染不可用'
      sub.textContent = 'WEBGL UNAVAILABLE'
      bar.remove()
      name.textContent = message
    },
    dispose() {
      window.clearTimeout(timer)
      box.remove()
    }
  }
}
