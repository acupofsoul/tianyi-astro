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

  const halls = el('section', 'halls')
  halls.innerHTML = `
    <div class="section-head">
      <h2>展馆导览</h2>
      <p>按主题进入展厅，或前往完整目录</p>
    </div>
    <div class="hall-grid">
      <a class="hall-card" href="#/?cat=太阳系"><span class="hall-num">01</span><span class="hall-title">太阳系厅</span><span class="hall-desc">行星轨道与真实公转</span></a>
      <a class="hall-card" href="#/?cat=行星"><span class="hall-num">02</span><span class="hall-title">行星厅</span><span class="hall-desc">八大行星与矮行星</span></a>
      <a class="hall-card" href="#/?cat=卫星"><span class="hall-num">03</span><span class="hall-title">卫星厅</span><span class="hall-desc">月球与潮汐锁定</span></a>
      <a class="hall-card" href="#/?cat=矮行星"><span class="hall-num">04</span><span class="hall-title">矮行星厅</span><span class="hall-desc">柯伊伯带与冥王星</span></a>
      <a class="hall-card" href="#/?cat=深空天体"><span class="hall-num">05</span><span class="hall-title">深空厅</span><span class="hall-desc">黑洞、星云与星系</span></a>
      <a class="hall-card" href="#/?cat=天文现象"><span class="hall-num">06</span><span class="hall-title">奇观现象厅</span><span class="hall-desc">彗星、日食、极光、超新星</span></a>
      <a class="hall-card" href="#/timeline"><span class="hall-num">07</span><span class="hall-title">天文史时间轴</span><span class="hall-desc">人类认识宇宙的历程</span></a>
      <a class="hall-card" href="#/browse"><span class="hall-num">08</span><span class="hall-title">展品总目录</span><span class="hall-desc">按顺序浏览全部 20 个展项</span></a>
    </div>
  `
  root.appendChild(halls)

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