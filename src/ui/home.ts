import { SpacetimeCanvas } from '../fx/spacetime'
import { catalog } from '../catalog'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { renderSiteHeader } from './header'
import { mountSearch } from './search'
import type { CatalogEntry } from '../types'

const featuredIds = ['solar-system', 'blackhole', 'galaxy']

export function renderHome(root: HTMLElement) {
  document.title = '知天易 · 天文知识库'
  clear(root)

  // 首页只有一个搜索（顶部搜索在首页隐藏）
  root.appendChild(renderSiteHeader({ hideSearch: true }))

  const home = el('main', 'home')
  home.innerHTML = `
    <div id="spacetime-bg" class="spacetime-bg"></div>
    <div class="home-scroll">
      <div class="home-hero">
        <h1 class="home-title">知天易</h1>
        <p class="home-desc">天文知识库 · 20 个主题 · 可 3D 查看</p>
        <div class="home-search" id="home-search"></div>
      </div>
      <div class="featured-grid" id="featured-grid"></div>
      <div class="home-more">
        <a href="#/browse" class="more-link">查看全部 20 个主题 →</a>
      </div>
    </div>
  `
  root.appendChild(home)

  const bg = home.querySelector<HTMLElement>('#spacetime-bg')!
  const fx = new SpacetimeCanvas(bg)
  fx.start()
  registerCleanup(() => fx.dispose())

  mountSearch(home.querySelector<HTMLElement>('#home-search')!, { inputId: 'home-search' })

  const grid = home.querySelector<HTMLElement>('#featured-grid')!
  for (const id of featuredIds) {
    const item = catalog.find((x) => x.id === id)
    if (item) grid.appendChild(makeCard(item))
  }
}

function makeCard(item: CatalogEntry): HTMLAnchorElement {
  const order = catalog.findIndex((x) => x.id === item.id)
  const a = el('a', 'k-card')
  a.href = '#/p/' + item.id
  a.style.setProperty('--accent', item.accent)
  a.innerHTML = `
    <div class="k-head">
      <span class="k-num">${String(order + 1).padStart(2, '0')}</span>
      <span class="k-cat">${item.category}</span>
    </div>
    <div class="k-body">
      <span class="k-emoji">${item.emoji}</span>
      <div class="k-main">
        <h3>${item.name}</h3>
        <p class="k-en">${item.enName}</p>
        <p class="k-summary">${item.summary}</p>
      </div>
    </div>
  `
  return a
}
