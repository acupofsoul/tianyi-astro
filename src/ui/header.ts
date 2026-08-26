import { el } from './dom'
import { mountSearch } from './search'

export function renderSiteHeader(opts?: { query?: string; onInput?: (q: string) => void }): HTMLElement {
  const header = el('header', 'site-header')
  header.innerHTML = `
    <a href="#/" class="brand">知天易</a>
    <div class="searchbox" id="header-search"></div>
    <span class="header-sub">3D 天文科学馆</span>
  `
  const box = header.querySelector<HTMLElement>('#header-search')!
  mountSearch(box, opts)
  return header
}
