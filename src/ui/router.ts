import { renderHome } from './home'

export type BrowseRoute = { q: string; cat: string }

export type Route =
  | { page: 'home' }
  | { page: 'detail'; id: string }
  | { page: 'browse'; browse: BrowseRoute }
  | { page: 'timeline' }
  | { page: 'scale' }

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
  if (h.startsWith('#/scale')) return { page: 'scale' }
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

const CHUNK_RELOAD_KEY = 'tianyi:chunk-reload'

/**
 * 判断是否为「按需 chunk 拉取失败」。
 * 典型场景：站点重新部署后，旧标签页里的 index.html 仍指向已被替换的
 * 哈希文件名，此时再切路由就会 404。这类错误重载一次页面即可恢复。
 */
function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch/i.test(msg)
}

function markChunkReload(): boolean {
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return false
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
    return true
  } catch {
    return false
  }
}

function clearChunkReload(): void {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
  } catch {
    /* 隐私模式下忽略 */
  }
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
      } else if (route.page === 'scale') {
        const mod = await import('./scale')
        if (token !== renderToken) return
        mod.renderScalePage(root)
      } else {
        const mod = await import('./timeline')
        if (token !== renderToken) return
        mod.renderTimeline(root)
      }
      window.scrollTo(0, 0)
    }

    void load()
      .then(() => {
        if (token === renderToken) clearChunkReload()
      })
      .catch((err: unknown) => {
        if (token !== renderToken) return
        console.error('[router] 页面加载失败', err)
        // 部署后旧标签页的 chunk 已失效：自动重载一次，避免用户看到错误页
        if (isChunkLoadError(err) && markChunkReload()) {
          location.reload()
          return
        }
        renderRouteError(root, err)
      })
  }

  window.addEventListener('hashchange', render)
  render()
}
