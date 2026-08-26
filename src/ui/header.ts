import { el } from './dom'
import { mountSearch } from './search'

const navLinks: [string, string][] = [
  ['首页', '#/'],
  ['正片', '#/p/solar-system'],
  ['目录', '#/browse'],
  ['天文史', '#/timeline']
]

export function renderSiteHeader(opts?: { query?: string; onInput?: (q: string) => void }): HTMLElement {
  const header = el('header', 'site-header')
  header.innerHTML = `
    <a href="#/" class="brand">知天易</a>
    <nav class="main-nav">
      ${navLinks.map(([label, href]) => '<a href="' + href + '" class="nav-link">' + label + '</a>').join('')}
    </nav>
    <div class="searchbox" id="header-search"></div>
  `
  const box = header.querySelector<HTMLElement>('#header-search')!
  mountSearch(box, opts)

  const current = location.hash || '#/'
  header.querySelectorAll<HTMLAnchorElement>('.main-nav a').forEach((a) => {
    const href = a.getAttribute('href') ?? ''
    if (href === current) a.classList.add('active')
    else if (href === '#/p/solar-system' && current.startsWith('#/p/')) a.classList.add('active')
  })

  return header
}
