import { categories, catalog } from '../catalog'
import { el } from './dom'
import { mountSearch } from './search'

export function renderSiteHeader(opts?: { query?: string; onInput?: (q: string) => void; hideSearch?: boolean }): HTMLElement {
  const header = el('header', 'site-header' + (opts?.hideSearch ? ' no-search' : ''))
  header.innerHTML = `
    <button class="menu-btn" id="menu-btn" aria-label="打开菜单">☰</button>
    <a href="#/" class="brand">知天易</a>
    <nav class="main-nav">
      <a href="#/browse" class="nav-link">目录</a>
      <a href="#/timeline" class="nav-link">天文史</a>
    </nav>
    <div class="searchbox" id="header-search"></div>
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
    <aside class="drawer" id="drawer">
      <div class="drawer-head">
        <span class="drawer-brand">知天易</span>
        <button class="drawer-close" id="drawer-close">×</button>
      </div>
      <nav class="drawer-links">
        <a href="#/" class="drawer-link">首页</a>
        <a href="#/p/solar-system" class="drawer-link">正片 · 从太阳系开始</a>
        <a href="#/browse" class="drawer-link">展品目录</a>
        <a href="#/timeline" class="drawer-link">天文史</a>
      </nav>
      <div class="drawer-groups" id="drawer-groups"></div>
    </aside>
  `

  const box = header.querySelector<HTMLElement>('#header-search')!
  mountSearch(box, opts)

  const groups = header.querySelector<HTMLElement>('#drawer-groups')!
  for (const cat of categories) {
    const group = el('div', 'drawer-group')
    group.innerHTML = `
      <button class="drawer-group-title"><span>${cat}</span><span class="chev">›</span></button>
      <div class="drawer-sub"></div>
    `
    const sub = group.querySelector<HTMLElement>('.drawer-sub')!
    const items = catalog.filter((c) => c.category === cat)
    for (const item of items) {
      const a = el('a', 'drawer-sub-link')
      a.href = '#/p/' + item.id
      a.innerHTML = `
        <span class="d-emoji">${item.emoji}</span>
        <span class="d-name">${item.name}</span>
        <span class="d-en">${item.enName}</span>
      `
      a.addEventListener('click', () => closeDrawer())
      sub.appendChild(a)
    }
    group.querySelector<HTMLButtonElement>('.drawer-group-title')!.addEventListener('click', () => {
      group.classList.toggle('open')
    })
    groups.appendChild(group)
  }

  const drawer = header.querySelector<HTMLElement>('#drawer')!
  const backdrop = header.querySelector<HTMLElement>('#drawer-backdrop')!
  const openBtn = header.querySelector<HTMLButtonElement>('#menu-btn')!
  const closeBtn = header.querySelector<HTMLButtonElement>('#drawer-close')!
  function openDrawer() {
    drawer.classList.add('open')
    backdrop.classList.add('open')
  }
  function closeDrawer() {
    drawer.classList.remove('open')
    backdrop.classList.remove('open')
  }
  openBtn.addEventListener('click', openDrawer)
  closeBtn.addEventListener('click', closeDrawer)
  backdrop.addEventListener('click', closeDrawer)
  header.querySelectorAll<HTMLAnchorElement>('.drawer-link').forEach((a) => {
    a.addEventListener('click', closeDrawer)
  })

  const current = location.hash || '#/'
  header.querySelectorAll<HTMLAnchorElement>('.main-nav a').forEach((a) => {
    if (a.getAttribute('href') === current) a.classList.add('active')
  })

  return header
}