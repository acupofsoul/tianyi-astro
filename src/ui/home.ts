import { Viewer } from '../viewer'
import { buildStarfieldScene } from '../scenes'
import { categories, searchCatalog, catalog } from '../catalog'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { renderSiteHeader } from './header'
import type { CatalogEntry } from '../types'

export function renderHome(root: HTMLElement, initial: { q: string; cat: string } = { q: '', cat: '' }) {
  document.title = '知天易 · 3D 天文科学馆'
  clear(root)

  const state = { q: initial.q, cat: initial.cat || '全部' }

  const header = renderSiteHeader({
    query: state.q,
    onInput: (q) => {
      state.q = q
      renderGrid()
    }
  })
  root.appendChild(header)

  const hero = el('section', 'hero')
  hero.innerHTML = `
    <div id="hero-canvas" class="hero-canvas"></div>
    <div class="hero-content">
      <h1>知天易</h1>
      <p class="tagline">太阳系、行星、黑洞、彗星……能转、能缩放、能检索的 3D 天文科普</p>
      <div class="hero-actions">
        <a href="#/browse" class="btn-primary">从目录开始</a>
        <a href="#/p/solar-system" class="btn-ghost">先看太阳系</a>
        <button class="btn-ghost" id="random-btn">随机看一个</button>
      </div>
    </div>
  `
  root.appendChild(hero)

  const chips = el('div', 'chips')
  root.appendChild(chips)

  const gridWrap = el('main', 'grid-wrap')
  const grid = el('div', 'grid')
  grid.id = 'card-grid'
  gridWrap.appendChild(grid)
  root.appendChild(gridWrap)

  const footer = el('footer', undefined, '知天易 · 仰望星空，看懂宇宙')
  root.appendChild(footer)

  hero.querySelector<HTMLButtonElement>('#random-btn')!.addEventListener('click', () => {
    const item = catalog[Math.floor(Math.random() * catalog.length)]
    location.hash = '#/p/' + item.id
  })

  const heroCanvas = hero.querySelector<HTMLElement>('#hero-canvas')!
  const viewer = new Viewer(heroCanvas, false)
  viewer.load(buildStarfieldScene())
  viewer.start()
  registerCleanup(() => viewer.dispose())

  function makeCard(item: CatalogEntry): HTMLAnchorElement {
    const order = catalog.findIndex((x) => x.id === item.id)
    const a = el('a', 'card')
    a.href = '#/p/' + item.id
    a.style.setProperty('--accent', item.accent)
    a.innerHTML = `
      <div class="card-top">
        <span class="card-num">${String(order + 1).padStart(2, '0')}</span>
        <span class="card-emoji">${item.emoji}</span>
        <span class="badge">${item.category}</span>
      </div>
      <h3>${item.name}</h3>
      <p class="en">${item.enName}</p>
      <p class="summary">${item.summary}</p>
      <span class="hint">查看 →</span>
    `
    return a
  }

  function renderGrid() {
    clear(grid)
    const items = searchCatalog(state.q, state.cat)
    if (items.length === 0) {
      grid.appendChild(el('div', 'empty', '未找到相关天体，换个关键词试试吧'))
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