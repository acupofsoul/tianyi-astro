import { Viewer } from '../viewer'
import { buildSceneFor } from '../scenes'
import { getEntry, searchCatalog } from '../catalog'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import type { CatalogEntry } from '../types'

export function renderDetail(root: HTMLElement, id: string) {
  const entry = getEntry(id)
  if (!entry) {
    location.hash = '#/'
    return
  }
  clear(root)
  document.title = entry.name + ' · 天一天文馆'

  const topbar = el('nav', 'topbar')
  topbar.innerHTML = `
    <a href="#/" class="back">← 返回</a>
    <span class="brand">天一天文馆</span>
  `
  root.appendChild(topbar)

  const hero = el('section', 'detail-hero')
  hero.style.setProperty('--accent', entry.accent)
  hero.innerHTML = `
    <div class="viewer-wrap">
      <div id="viewer-canvas"></div>
      <div class="viewer-hint">🖱️ 拖拽旋转 · 滚轮缩放</div>
      <div class="title-badge">${entry.category}</div>
    </div>
    <div class="detail-head">
      <h1>${entry.emoji} ${entry.name}</h1>
      <p class="en">${entry.enName}</p>
      <p class="summary">${entry.summary}</p>
    </div>
  `
  root.appendChild(hero)

  const body = el('section', 'detail-body')
  body.appendChild(section('📖 简介', entry.intro))

  const science = section('🔬 科学原理', entry.science)
  body.appendChild(science)

  const factsArticle = el('article')
  const fh = el('h2', undefined, '📊 数据档案')
  factsArticle.appendChild(fh)
  const table = el('table')
  for (const f of entry.facts) {
    const tr = el('tr')
    tr.appendChild(el('td', undefined, f.label))
    tr.appendChild(el('td', undefined, f.value))
    table.appendChild(tr)
  }
  factsArticle.appendChild(table)
  body.appendChild(factsArticle)

  const related = searchCatalog('', entry.category).filter((x) => x.id !== entry.id).slice(0, 3)
  if (related.length > 0) {
    const ra = el('article')
    ra.appendChild(el('h2', undefined, '🔗 相关天体'))
    const rGrid = el('div', 'related')
    for (const r of related) {
      const a = el('a', 'mini')
      a.href = '#/p/' + r.id
      a.style.setProperty('--accent', r.accent)
      a.innerHTML = `
        <div class="r-emoji">${r.emoji}</div>
        <div class="r-name">${r.name}</div>
        <div class="r-en">${r.enName}</div>
      `
      rGrid.appendChild(a)
    }
    ra.appendChild(rGrid)
    body.appendChild(ra)
  }

  root.appendChild(body)

  const canvas = hero.querySelector<HTMLElement>('#viewer-canvas')!
  const viewer = new Viewer(canvas)
  viewer.load(buildSceneFor(entry))
  viewer.start()
  registerCleanup(() => viewer.dispose())
}

function section(title: string, text: string): HTMLElement {
  const article = el('article')
  article.appendChild(el('h2', undefined, title))
  const p = el('p')
  p.textContent = text
  article.appendChild(p)
  return article
}