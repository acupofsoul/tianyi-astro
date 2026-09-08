import { renderHome } from './home'

export type BrowseRoute = { q: string; cat: string }

export type Route =
  | { page: 'home' }
  | { page: 'detail'; id: string }
  | { page: 'browse'; browse: BrowseRoute }
  | { page: 'timeline' }

function decodeParam(v: string | undefined): string {
  if (!v) return ''
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

export function parseRoute(): Route {
  const h = location.hash
  if (h.startsWith('#/p/')) return { page: 'detail', id: h.slice(4) }
  if (h.startsWith('#/browse')) {
    const qm = h.indexOf('?')
    const qs = qm >= 0 ? h.slice(qm + 1) : ''
    const params = new URLSearchParams(qs)
    return {
      page: 'browse',
      browse: {
        q: decodeParam(params.get('q') ?? ''),
        cat: decodeParam(params.get('cat') ?? '')
      }
    }
  }
  if (h.startsWith('#/timeline')) return { page: 'timeline' }
  return { page: 'home' }
}

let cleanup: (() => void) | null = null
let renderToken = 0

export function registerCleanup(fn: () => void) {
  cleanup = fn
}

export function runCleanup() {
  cleanup?.()
  cleanup = null
}

/**
 * 渲染失败时的兜底页面：不白屏，给出可读提示与重试入口。
 */
function renderRouteError(root: HTMLElement, err: unknown): void {
  const detail = err instanceof Error ? err.message : String(err)
  const box = document.createElement('div')
  box.className = 'route-error'
  box.setAttribute('role', 'alert')
  box.innerHTML =
    '<p class="route-error-title">页面加载失败</p>' +
    '<p class="route-error-text">' +
    detail.replace(/[<>&]/g, '') +
    '</p>' +
    '<button type="button" class="route-error-retry">重新加载</button>'
  box.querySelector('.route-error-retry')?.addEventListener('click', () => location.reload())
  root.replaceChildren(box)
}

/**
 * 路由渲染。
 *
 * 首页静态引入（首屏少一次请求，且首页不含 three）；详情 / 目录 / 时间线
 * 走动态 import —— 详情页是唯一依赖 three.js 的路由，拆开后首页与列表页
 * 的关键路径完全不含三维引擎。
 */
export function startRouter(root: HTMLElement) {
  const render = () => {
    const token = ++renderToken
    runCleanup()
    const route = parseRoute()

    if (route.page === 'home') {
      renderHome(root)
      window.scrollTo(0, 0)
      return
    }

    const load = async () => {
      if (route.page === 'detail') {
        // 详情页必然需要三维引擎：与外壳 chunk 并行拉取，省掉一次串行往返
        void import('../viewer').catch(() => {})
        void import('../scenes').catch(() => {})
        const mod = await import('./detail')
        if (token !== renderToken) return
        mod.renderDetail(root, route.id)
      } else if (route.page === 'browse') {
        const mod = await import('./browse')
        if (token !== renderToken) return
        mod.renderBrowse(root, route.browse)
      } else {
        const mod = await import('./timeline')
        if (token !== renderToken) return
        mod.renderTimeline(root)
      }
      window.scrollTo(0, 0)
    }

    void load().catch((err: unknown) => {
      if (token !== renderToken) return
      console.error('[router] 页面加载失败', err)
      renderRouteError(root, err)
    })
  }

  window.addEventListener('hashchange', render)
  render()
}
