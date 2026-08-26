import { Viewer } from '../viewer'
import { buildStarfieldScene } from '../scenes'
import { categories, searchCatalog } from '../catalog'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import type { CatalogEntry } from '../types'

export function renderHome(root: HTMLElement) {
  clear(root)

  const hero = el('header', 'hero')
  hero.innerHTML = `
    <div id="hero-canvas" class="hero-canvas"></div>
    <div class="hero-content">
      <h1>天一天文馆</h1>
      <p>拖动 · 缩放 · 旋转 — 探索太阳系、黑洞与星云的 3D 世界</p>
      <input id="search-input" type="search" placeholder="搜索天文现象，如：黑洞、土星、哈雷彗星、极光…" autocomplete="off" />
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

  const footer = el('footer', undefined, '天一天文馆 · 3D 天文科普 · Three.js 程序化生成，无需外部贴图')
  root.appendChild(footer)

  const heroCanvas = hero.querySelector<HTMLElement>('#hero-canvas')!
  const viewer = new Viewer(heroCanvas, false)
  viewer.load(buildStarfieldScene())
  viewer.start()
  registerCleanup(() => viewer.dispose())

  let q = ''
  let cat = '全部'

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
    const items = searchCatalog(q, cat)
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
      const chip = el('button', 'chip' + (c === cat ? ' active' : ''), c)
      chip.addEventListener('click', () => {
        cat = c
        renderChips()
        renderGrid()
      })
      chips.appendChild(chip)
    }
  }

  const input = hero.querySelector<HTMLInputElement>('#search-input')!
  input.addEventListener('input', () => {
    q = input.value
    renderGrid()
  })

  renderChips()
  renderGrid()
}
