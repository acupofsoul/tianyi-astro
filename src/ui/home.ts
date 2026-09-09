import { SpacetimeCanvas } from '../fx/spacetime'
import { catalog, categories } from '../catalog'
import type { CatalogEntry, SceneKind } from '../types'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { renderSiteHeader } from './header'
import { mountSearch } from './search'
import { clearRecent, formatRelativeTime, readRecent } from './ux/storage'
import type { RecentItem } from './ux/storage'

const featuredIds = ['solar-system', 'blackhole', 'galaxy']
const quickStartIds = ['solar-system', 'blackhole', 'saturn', 'galaxy']

const sceneLabels: Record<SceneKind, string> = {
  solarSystem: '太阳系全景',
  planet: '行星',
  sun: '恒星',
  moon: '卫星',
  blackhole: '黑洞',
  comet: '彗星',
  nebula: '星云',
  galaxy: '星系',
  meteor: '流星',
  eclipse: '日食',
  aurora: '极光',
  supernova: '超新星',
  pulsar: '脉冲星',
  asteroid: '小行星带',
  exoplanet: '系外行星系'
}

export function renderHome(root: HTMLElement) {
  document.title = '知天易 · 天文知识库'
  clear(root)

  // 首页只有一个搜索（顶部搜索在首页隐藏）
  root.appendChild(renderSiteHeader({ hideSearch: true }))

  const sceneCount = new Set(catalog.map((item) => item.scene)).size
  const factCount = catalog.reduce((sum, item) => sum + item.facts.length, 0)

  const home = el('main', 'home')
  home.innerHTML = `
    <div id="spacetime-bg" class="spacetime-bg"></div>
    <div class="home-scroll">
      <div class="home-inner">
        <div class="home-hero">
          <p class="ux-kicker">TIANYI · ASTRONOMY ARCHIVE</p>
          <h1 class="home-title">知天易</h1>
          <p class="home-desc">天文知识库 · ${catalog.length} 个主题</p>
          <div class="home-search"></div>
          <p class="ux-search-hint"><kbd>Ctrl</kbd><span>/</span><kbd>⌘</kbd> + <kbd>K</kbd> 快速搜索 · <kbd>↑</kbd><kbd>↓</kbd> 选择 · <kbd>Esc</kbd> 关闭</p>
        </div>

        <section class="ux-dash" aria-label="站点数据概览">
          <div class="ux-dash-head">
            <span class="hud-label">SITE TELEMETRY</span>
            <span class="ux-dash-status"><span class="ux-dot" aria-hidden="true"></span>在线</span>
          </div>
          <div class="ux-stats">
            <div class="ux-stat hud-frame">
              <span class="hud-label">展项</span>
              <span class="ux-stat-value"><span class="hud-num">${catalog.length}</span><span class="ux-stat-unit">个</span></span>
              <span class="ux-stat-note">已编目主题</span>
            </div>
            <div class="ux-stat hud-frame">
              <span class="hud-label">3D 场景</span>
              <span class="ux-stat-value"><span class="hud-num">${sceneCount}</span><span class="ux-stat-unit">类</span></span>
              <span class="ux-stat-note">场景类型</span>
            </div>
            <div class="ux-stat hud-frame">
              <span class="hud-label">数据条目</span>
              <span class="ux-stat-value"><span class="hud-num">${factCount}</span><span class="ux-stat-unit">条</span></span>
              <span class="ux-stat-note">目录事实条目</span>
            </div>
            <div class="ux-stat hud-frame">
              <span class="hud-label">分类</span>
              <span class="ux-stat-value"><span class="hud-num">${categories.length}</span><span class="ux-stat-unit">类</span></span>
              <span class="ux-stat-note">展厅分类</span>
            </div>
          </div>
        </section>

        <section class="ux-section" aria-labelledby="recent-title">
          <div class="ux-section-head">
            <div>
              <span class="hud-label">RECENT</span>
              <h2 id="recent-title">最近查看</h2>
            </div>
            <button type="button" class="ux-text-btn" id="recent-clear" hidden>清除记录</button>
          </div>
          <div class="ux-recent" id="recent-list" aria-live="polite"></div>
        </section>

        <section class="ux-section" aria-labelledby="featured-title">
          <div class="ux-section-head">
            <div>
              <span class="hud-label">FEATURED</span>
              <h2 id="featured-title">精选展项</h2>
            </div>
            <a href="#/browse" class="ux-section-link">查看全部 ${catalog.length} 个 →</a>
          </div>
          <div class="featured-grid" id="featured-grid"></div>
        </section>
      </div>
    </div>
  `
  root.appendChild(home)

  const bg = home.querySelector<HTMLElement>('#spacetime-bg')!
  const fx = new SpacetimeCanvas(bg)
  fx.start()
  registerCleanup(() => fx.dispose())

  // 容器只用 class 定位：input 必须保留 id="home-search"（style.css 的 `.home-search #home-search` 依赖它）
  mountSearch(home.querySelector<HTMLElement>('.home-search')!, { inputId: 'home-search', showCategories: true })

  const recentList = home.querySelector<HTMLElement>('#recent-list')!
  const recentClear = home.querySelector<HTMLButtonElement>('#recent-clear')!

  function renderRecent(): void {
    clear(recentList)
    const records = readRecent()
      .map((record) => ({ record, item: catalog.find((entry) => entry.id === record.id) }))
      .filter((entry): entry is { record: RecentItem; item: CatalogEntry } => entry.item !== undefined)
    recentClear.hidden = records.length === 0

    if (records.length === 0) {
      const empty = el('div', 'ux-recent-empty hud-frame')
      empty.innerHTML = `
        <p class="ux-empty-title">还没有浏览记录</p>
        <p class="ux-empty-text">打开任意展项后，这里会按时间留下你的足迹（最多 6 条）。</p>
        <div class="ux-quick-links" aria-label="推荐起点"></div>
      `
      const quickLinks = empty.querySelector<HTMLElement>('.ux-quick-links')!
      for (const id of quickStartIds) {
        const item = catalog.find((entry) => entry.id === id)
        if (!item) continue
        const link = el('a', 'ux-quick-link')
        link.href = '#/p/' + item.id
        link.innerHTML = `<span aria-hidden="true">${item.emoji}</span><span>${item.name}</span>`
        quickLinks.appendChild(link)
      }
      recentList.appendChild(empty)
      return
    }

    for (const { record, item } of records) {
      const link = el('a', 'ux-recent-card')
      link.href = '#/p/' + item.id
      link.style.setProperty('--accent', item.accent)
      link.setAttribute('aria-label', `再次打开 ${item.name}，${formatRelativeTime(record.at)}`)
      link.innerHTML = `
        <span class="ux-recent-swatch" aria-hidden="true"></span>
        <span class="ux-recent-emoji" aria-hidden="true">${item.emoji}</span>
        <span class="ux-recent-main">
          <span class="ux-recent-name">${item.name}</span>
          <span class="ux-recent-meta">${item.category} · ${formatRelativeTime(record.at)}</span>
        </span>
        <span class="ux-recent-go" aria-hidden="true">→</span>
      `
      recentList.appendChild(link)
    }
  }

  recentClear.addEventListener('click', () => {
    clearRecent()
    renderRecent()
  })

  const grid = home.querySelector<HTMLElement>('#featured-grid')!
  for (const id of featuredIds) {
    const item = catalog.find((entry) => entry.id === id)
    if (item) grid.appendChild(makeCard(item))
  }

  renderRecent()
}

function makeCard(item: CatalogEntry): HTMLAnchorElement {
  const order = catalog.findIndex((entry) => entry.id === item.id)
  const link = el('a', 'k-card ux-card')
  link.href = '#/p/' + item.id
  link.style.setProperty('--accent', item.accent)
  link.setAttribute('aria-label', `打开 ${item.name} 详情`)
  link.innerHTML = `
    <span class="ux-card-accent" aria-hidden="true"></span>
    <div class="k-head">
      <span class="k-num hud-num">${String(order + 1).padStart(2, '0')}</span>
      <span class="k-cat">${item.category}</span>
    </div>
    <div class="k-body">
      <span class="k-emoji" aria-hidden="true">${item.emoji}</span>
      <div class="k-main">
        <h3>${item.name}</h3>
        <p class="k-en">${item.enName}</p>
        <p class="k-summary">${item.summary}</p>
      </div>
    </div>
    <div class="ux-card-foot">
      <span class="hud-label">SCENE</span>
      <span class="ux-card-scene">${sceneLabels[item.scene]}</span>
      <span class="ux-card-go">打开 →</span>
    </div>
  `
  return link
}
