import { renderHome } from './home'
import { renderDetail } from './detail'
import { renderBrowse } from './browse'
import { renderTimeline } from './timeline'

export type HomeRoute = { q: string; cat: string }
export type Route =
  | { page: 'home'; home: HomeRoute }
  | { page: 'detail'; id: string }
  | { page: 'browse' }
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
  if (h.startsWith('#/browse')) return { page: 'browse' }
  if (h.startsWith('#/timeline')) return { page: 'timeline' }
  const qm = h.indexOf('?')
  const qs = qm >= 0 ? h.slice(qm + 1) : ''
  const params = new URLSearchParams(qs)
  return {
    page: 'home',
    home: {
      q: decodeParam(params.get('q') ?? ''),
      cat: decodeParam(params.get('cat') ?? '')
    }
  }
}

let cleanup: (() => void) | null = null

export function registerCleanup(fn: () => void) {
  cleanup = fn
}

export function runCleanup() {
  cleanup?.()
  cleanup = null
}

export function startRouter(root: HTMLElement) {
  const render = () => {
    runCleanup()
    const route = parseRoute()
    if (route.page === 'detail') renderDetail(root, route.id)
    else if (route.page === 'browse') renderBrowse(root)
    else if (route.page === 'timeline') renderTimeline(root)
    else renderHome(root, route.home)
    window.scrollTo(0, 0)
  }
  window.addEventListener('hashchange', render)
  render()
}