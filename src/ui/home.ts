import { Viewer } from '../viewer'
import { buildStarfieldScene } from '../scenes'
import { categories, searchCatalog, catalog } from '../catalog'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { renderSiteHeader } from './header'
import type { CatalogEntry } from '../types'

function parseQuery(): string {
  const m = location.hash.match(/[?&]q=([^&]+)/)
  return m ? decodeURIComponent(m[1]) : ''
}

export function renderHome(root: HTMLElement) {
  document.title = '知天易 · 3D 天文科学馆'
  clear(root)

  const state = { q: parseQuery(), cat: '全部' }

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
      <p class="tagline">以科学为尺度，触摸真实的宇宙</p>
      <div class="hero-actions">
        <a href="#/p/solar-system" class="btn-primary">🌌 探索太阳系</a>
        <button class="btn-ghost" id="random-btn">🎲 随机漫游</button>
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

  const footer = el('footer', undefined, '知天易 · 3D 天文科学馆 · 三维场景与贴图均为程序化生成')
  root.appendChild(footer)

  const heroCanvas = hero.querySelector<HTMLElement>('#hero-canvas')!
  const viewer = new Viewer(heroCanvas, false)
  viewer.load(buildStarfieldScene())
  viewer.start()
  registerCleanup(() => viewer.dispose())

  hero.querySelector<HTMLButtonElement>('#random-btn')!.addEventListener('click', () => {
    const item = catalog[Math.floor(Math.random() * catalog.length)]
    location.hash = '#/p/' + item.id
  })

  function makeCard(item: CatalogEntry): HTMLAnchorElement {
    const a = el('a', 'card')
    a.href = '#/p/' + item.id
    a.style.setProperty('--accent', item.accent)
    a.innerHTML = `
      <div class="card-top">
        <span class="card-emoji">${item.emoji}</span>
        <span class="badge">${item.category}</span>
      </div>
      <h3>${item.name}</h3>
      <p class="en">${item.enName}</p>
      <p class="summary">${item.summary}</p>
      <span class="hint">进入 3D 场景 →</span>
    `
    return a
  }

  function renderGrid() {
    clear(grid)
    const items = searchCatalog(state.q, state.cat)
    if (items.length === 0) {
      grid.appendChild(el('div', 'empty', '未找到相关天体，换个关键词试试吧 🌠'))
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
