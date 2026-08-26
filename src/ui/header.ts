import { el } from './dom'
import { mountSearch } from './search'

const navLinks: [string, string][] = [
  ['首页', '#/'],
  ['目录', '#/browse'],
  ['天文史', '#/timeline'],
  ['太阳系', '#/browse?cat=太阳系'],
  ['行星', '#/browse?cat=行星'],
  ['卫星', '#/browse?cat=卫星'],
  ['矮行星', '#/browse?cat=矮行星'],
  ['深空天体', '#/browse?cat=深空天体'],
  ['天文现象', '#/browse?cat=天文现象']
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
    if (a.getAttribute('href') === current) a.classList.add('active')
  })

  return header
}