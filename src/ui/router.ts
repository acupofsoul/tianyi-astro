import { renderHome } from './home'
import { renderDetail } from './detail'

export type Route = { page: 'home' } | { page: 'detail'; id: string }

export function parseRoute(): Route {
  const m = location.hash.match(/^#\/p\/([\w-]+)/)
  if (m) return { page: 'detail', id: m[1] }
  return { page: 'home' }
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
    else renderHome(root)
    window.scrollTo(0, 0)
  }
  window.addEventListener('hashchange', render)
  render()
}
