import { SpacetimeCanvas } from '../fx/spacetime'
import { categories, searchCatalog, catalog } from '../catalog'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { renderSiteHeader } from './header'
import { mountSearch } from './search'
import type { CatalogEntry } from '../types'

export function renderHome(root: HTMLElement) {
  document.title = '知天易 · 天文知识库'
  clear(root)

  // 首页只有一个搜索（顶部搜索在首页隐藏）
  root.appendChild(renderSiteHeader({ hideSearch: true }))

  const state = { q: '', cat: '全部' }

  const home = el('main', 'home')
  home.innerHTML = `
    <div id="spacetime-bg" class="spacetime-bg"></div>
    <div class="home-scroll">
      <div class="home-hero">
        <h1 class="home-title">知天易</h1>
        <p class="home-desc">天文知识库 · 20 个主题 · 可 3D 查看</p>
        <div class="home-search" id="home-search"></div>
      </div>
      <div class="chips" id="home-chips"></div>
      <div class="knowledge-grid" id="knowledge-grid"></div>
    </div>
  `
  root.appendChild(home)

  const bg = home.querySelector<HTMLElement>('#spacetime-bg')!
  const fx = new SpacetimeCanvas(bg)
  fx.start()
  registerCleanup(() => fx.dispose())

  const grid = home.querySelector<HTMLElement>('#knowledge-grid')!
  const chips = home.querySelector<HTMLElement>('#home-chips')!

  mountSearch(home.querySelector<HTMLElement>('#home-search')!, {
    inputId: 'home-search',
    onInput: (q) => {
      state.q = q
      renderGrid()
    }
  })

  function makeCard(item: CatalogEntry): HTMLAnchorElement {
    const order = catalog.findIndex((x) => x.id === item.id)
    const a = el('a', 'k-card')
    a.href = '#/p/' + item.id
    a.style.setProperty('--accent', item.accent)
    a.innerHTML = `
      <span class="k-num">${String(order + 1).padStart(2, '0')}</span>
      <span class="k-emoji">${item.emoji}</span>
      <div class="k-main">
        <h3>${item.name}<span class="k-en">${item.enName}</span></h3>
        <p class="k-summary">${item.summary}</p>
      </div>
      <span class="k-cat">${item.category}</span>
    `
    return a
  }

  function renderGrid() {
    clear(grid)
    const items = searchCatalog(state.q, state.cat)
    if (items.length === 0) {
      grid.appendChild(el('div', 'knowledge-empty', '未找到相关主题，换个关键词试试'))
      return
    }
    for (const item of items) grid.appendChild(makeCard(item))
  }

  function renderChips() {
    clear(chips)
    const all = ['全部', ...categories]
    for (const c of all) {
      const chip = el('button', 'chip' + (c === state.cat ? ' active' : ''), c)
      chip.addEventListener('click', () => {
        state.cat = c
        renderChips()
        renderGrid()
      })
      chips.appendChild(chip)
    }
  }

  renderChips()
  renderGrid()
}
