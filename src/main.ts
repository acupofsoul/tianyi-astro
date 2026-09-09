import './style.css'
import './styles/tokens.css'
import './styles/hud.css'
import './styles/viz.css'
import './styles/viewer.css'
import './styles/detail.css'
import './styles/ux.css'
import './styles/perf.css'
import './styles/scale.css'
import { startRouter } from './ui/router'
import { installDetailPrefetch } from './ui/prefetch'

const app = document.getElementById('app')
if (!app) throw new Error('#app not found')

/**
 * 全局 HUD 背景层（工作流 E 交付）：fixed 宿主 + Canvas 2D，位于全屏 3D canvas
 * 之上、正文之下，pointer-events:none，不参与交互。
 *
 * 它是纯装饰层，因此从关键路径上摘掉：等首屏内容渲染两帧后，在空闲时间再
 * 动态 import 并淡入。这样首屏不需要等待这段动画代码，也不会和 3D 首帧抢主线程。
 */
type HudLayer = { dispose(): void }

let hudBg: HudLayer | null = null
let hudHost: HTMLDivElement | null = null
let idleHandle = 0
let cancelled = false

function mountHudBackground(): void {
  if (cancelled || hudBg) return
  void import('./fx/hudBackground')
    .then(({ mountHudBackground: mount }) => {
      if (cancelled || hudBg) return
      const host = document.createElement('div')
      host.setAttribute('aria-hidden', 'true')
      host.style.cssText =
        'position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;' +
        'transition:opacity 700ms ease-out'
      document.body.appendChild(host)
      hudHost = host
      hudBg = mount(host, { opacity: 0.55 })
      requestAnimationFrame(() => {
        host.style.opacity = '1'
      })
    })
    .catch(() => {
      /* 装饰层加载失败不影响内容浏览 */
    })
}

function scheduleHudBackground(): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (cancelled) return
      const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
      if (typeof idle === 'function') idleHandle = idle(mountHudBackground, { timeout: 1500 })
      else idleHandle = window.setTimeout(mountHudBackground, 300)
    })
  })
}

function cancelIdle(): void {
  if (!idleHandle) return
  const cancel = (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback
  if (typeof cancel === 'function') cancel(idleHandle)
  else window.clearTimeout(idleHandle)
  idleHandle = 0
}

scheduleHudBackground()

// HMR 时先卸载旧实例，避免多层 Canvas 叠加。
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cancelled = true
    cancelIdle()
    hudBg?.dispose()
    hudBg = null
    hudHost?.remove()
    hudHost = null
  })
}

// 悬停 / 聚焦展项链接时预取三维引擎，点击进详情页时通常已在缓存里。
installDetailPrefetch()

// 先让内联的启动画面真的上屏（两帧），再交给路由渲染真实内容：
// 冷启动时用户立刻看到品牌与加载指示，而不是等 JS 解析完的空白。
requestAnimationFrame(() => {
  requestAnimationFrame(() => startRouter(app))
})
