import { categories, catalog, getEntry } from '../catalog'
import { el } from './dom'
import { mountSearch } from './search'
import { attachDrawerSwipe } from './ux/drawerSwipe'
import { attachScrollProgress } from './ux/scrollProgress'
import { pushRecent } from './ux/storage'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbInfo {
  /** 面包屑第一级：目录 */
  catalog?: string
  /** 面包屑第二级：分类 */
  category?: string
  /** 面包屑第三级：天体名 */
  name?: string
  /** 第一级的链接，默认 #/browse */
  catalogHref?: string
}

export type BreadcrumbInput = BreadcrumbItem[] | BreadcrumbInfo

export interface SiteHeaderOptions {
  query?: string
  onInput?: (q: string) => void
  hideSearch?: boolean
  /** 详情页可选面包屑；数组或 {catalog, category, name} 均可 */
  breadcrumb?: BreadcrumbInput
}

type PageKey = 'home' | 'browse' | 'timeline' | 'detail'

function currentPageKey(): PageKey {
  const hash = location.hash
  if (hash.startsWith('#/p/')) return 'detail'
  if (hash.startsWith('#/browse')) return 'browse'
  if (hash.startsWith('#/timeline')) return 'timeline'
  return 'home'
}

function currentDetailId(): string | null {
  const hash = location.hash
  if (!hash.startsWith('#/p/')) return null
  const id = hash.slice(4).split('?')[0]
  return id || null
}

function normalizeBreadcrumb(input: BreadcrumbInput | undefined, detailId: string | null): BreadcrumbItem[] {
  if (Array.isArray(input)) {
    return input.filter((item) => item && typeof item.label === 'string' && item.label.length > 0)
  }
  if (input) {
    const items: BreadcrumbItem[] = []
    if (input.catalog) items.push({ label: input.catalog, href: input.catalogHref ?? '#/browse' })
    if (input.category) items.push({ label: input.category, href: '#/browse?cat=' + encodeURIComponent(input.category) })
    if (input.name) items.push({ label: input.name })
    if (items.length > 0) return items
  }
  if (!detailId) return []
  const entry = getEntry(detailId)
  if (!entry) return []
  return [
    { label: '目录', href: '#/browse' },
    { label: entry.category, href: '#/browse?cat=' + encodeURIComponent(entry.category) },
    { label: entry.name }
  ]
}

export function renderSiteHeader(opts?: SiteHeaderOptions): HTMLElement {
  const page = currentPageKey()
  const detailId = currentDetailId()
  if (detailId) pushRecent(detailId)

  const crumbs = normalizeBreadcrumb(opts?.breadcrumb, detailId)
  const header = el('header', 'site-header' + (opts?.hideSearch ? ' no-search' : '') + (crumbs.length > 0 ? ' has-crumbs' : ''))
  header.dataset.page = page

  header.innerHTML = `
    <button class="menu-btn" id="menu-btn" type="button" aria-label="打开菜单" aria-expanded="false" aria-controls="drawer">☰</button>
    <a href="#/" class="brand${page === 'home' ? ' active' : ''}"${page === 'home' ? ' aria-current="page"' : ''}>知天易</a>
    <nav class="main-nav" aria-label="主导航">
      <a href="#/browse" class="nav-link">目录</a>
      <a href="#/timeline" class="nav-link">天文史</a>
    </nav>
    <nav class="crumbs" id="header-crumbs" aria-label="面包屑"></nav>
    <div class="searchbox" id="header-search"></div>
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
    <aside class="drawer" id="drawer" aria-label="站点菜单">
      <div class="drawer-head">
        <span class="drawer-brand">知天易</span>
        <button class="drawer-close" id="drawer-close" type="button" aria-label="关闭菜单">×</button>
      </div>
      <nav class="drawer-links" aria-label="站点导航">
        <a href="#/" class="drawer-link">首页</a>
        <a href="#/p/solar-system" class="drawer-link">正片 · 从太阳系开始</a>
        <a href="#/browse" class="drawer-link">展品目录</a>
        <a href="#/timeline" class="drawer-link">天文史</a>
      </nav>
      <div class="drawer-groups" id="drawer-groups"></div>
    </aside>
    <div class="ux-progress" id="ux-progress" role="progressbar" aria-label="页面阅读进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="ux-progress-bar"></i></div>
  `

  // 面包屑
  const crumbsEl = header.querySelector<HTMLElement>('#header-crumbs')!
  crumbs.forEach((item, index) => {
    if (index > 0) crumbsEl.appendChild(el('span', 'crumb-sep', '/'))
    if (item.href) {
      const link = el('a', 'crumb', item.label)
      link.href = item.href
      crumbsEl.appendChild(link)
    } else {
      const current = el('span', 'crumb current', item.label)
      current.setAttribute('aria-current', 'page')
      crumbsEl.appendChild(current)
    }
  })

  // 搜索
  const searchBox = header.querySelector<HTMLElement>('#header-search')!
  mountSearch(searchBox, { query: opts?.query, onInput: opts?.onInput })

  // 抽屉分类
  const groups = header.querySelector<HTMLElement>('#drawer-groups')!
  categories.forEach((category, categoryIndex) => {
    const group = el('div', 'drawer-group')
    const subId = `drawer-sub-${categoryIndex}`
    group.innerHTML = `
      <button class="drawer-group-title" type="button" aria-expanded="false" aria-controls="${subId}">
        <span>${category}</span><span class="chev" aria-hidden="true">›</span>
      </button>
      <div class="drawer-sub" id="${subId}"></div>
    `
    const sub = group.querySelector<HTMLElement>('.drawer-sub')!
    const items = catalog.filter((entry) => entry.category === category)
    for (const item of items) {
      const link = el('a', 'drawer-sub-link')
      link.href = '#/p/' + item.id
      if (detailId === item.id) {
        link.classList.add('active')
        link.setAttribute('aria-current', 'page')
      }
      link.innerHTML = `
        <span class="d-emoji" aria-hidden="true">${item.emoji}</span>
        <span class="d-name">${item.name}</span>
        <span class="d-en">${item.enName}</span>
      `
      link.addEventListener('click', () => closeDrawer(false))
      sub.appendChild(link)
    }
    const title = group.querySelector<HTMLButtonElement>('.drawer-group-title')!
    title.addEventListener('click', () => {
      const open = group.classList.toggle('open')
      title.setAttribute('aria-expanded', open ? 'true' : 'false')
    })
    groups.appendChild(group)
  })

  // 当前页高亮
  const navTargets: Record<string, PageKey> = { '#/browse': 'browse', '#/timeline': 'timeline' }
  header.querySelectorAll<HTMLAnchorElement>('.main-nav a').forEach((link) => {
    const href = link.getAttribute('href') ?? ''
    const key = navTargets[href]
    if (key && (key === page || (page === 'detail' && key === 'browse'))) {
      link.classList.add('active')
      link.setAttribute('aria-current', 'page')
    }
  })
  header.querySelectorAll<HTMLAnchorElement>('.drawer-link').forEach((link) => {
    const href = link.getAttribute('href') ?? ''
    const active =
      (href === '#/' && page === 'home') ||
      (href === '#/browse' && (page === 'browse' || page === 'detail')) ||
      (href === '#/timeline' && page === 'timeline')
    if (active) {
      link.classList.add('active')
      link.setAttribute('aria-current', 'page')
    }
  })

  // 抽屉开关
  const drawer = header.querySelector<HTMLElement>('#drawer')!
  const backdrop = header.querySelector<HTMLElement>('#drawer-backdrop')!
  const openBtn = header.querySelector<HTMLButtonElement>('#menu-btn')!
  const closeBtn = header.querySelector<HTMLButtonElement>('#drawer-close')!

  function openDrawer(): void {
    drawer.classList.add('open')
    backdrop.classList.add('open')
    openBtn.setAttribute('aria-expanded', 'true')
    closeBtn.focus()
  }

  function closeDrawer(returnFocus: boolean): void {
    drawer.classList.remove('open')
    backdrop.classList.remove('open')
    openBtn.setAttribute('aria-expanded', 'false')
    if (returnFocus) openBtn.focus()
  }

  openBtn.addEventListener('click', openDrawer)
  closeBtn.addEventListener('click', () => closeDrawer(true))
  backdrop.addEventListener('click', () => closeDrawer(true))
  attachDrawerSwipe(drawer, () => closeDrawer(true))

  header.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape' && drawer.classList.contains('open')) {
      event.preventDefault()
      closeDrawer(true)
    }
  })

  // 抽屉内 Tab 循环，避免焦点跑到背景页面
  drawer.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return
    const focusables = Array.from(drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })

  // 滚动进度
  const progressTrack = header.querySelector<HTMLElement>('#ux-progress')!
  const progressBar = header.querySelector<HTMLElement>('#ux-progress-bar')!
  attachScrollProgress(header, progressBar, progressTrack)

  return header
}
