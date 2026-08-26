import { Viewer } from '../viewer'
import { buildSceneFor } from '../scenes'
import { getEntry, searchCatalog } from '../catalog'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { renderSiteHeader } from './header'
import type { CatalogEntry } from '../types'

const sceneNotes: Record<string, string> = {
  solarSystem: '轨道半径采用对数压缩；公转相对速度基于真实周期（开普勒第三定律），体积与距离非真实比例。',
  planet: '单个天体独立可视化；自转方向、轴倾角、大气与表面特征按真实数据设定，大小非真实比例。',
  sun: '光球层展示米粒组织、黑子与临边昏暗效应；日冕为示意。',
  moon: '陨石坑与月海为程序化示意，未标注具体地貌命名。',
  blackhole: '黑洞阴影半径 ≈ 2.6 Rs，光子环位于阴影边缘，吸积盘内缘为 ISCO ≈ 3 Rs（史瓦西黑洞）。',
  comet: '太阳位于右侧；离子尾笔直背向太阳，尘埃尾沿轨道向后弯曲。',
  nebula: '星云颜色参考发射星云的 Hα 红色与反射蓝紫，形态为艺术化粒子示意。',
  galaxy: '银河系棒旋结构与旋臂为简化示意，非逐星模拟。',
  meteor: '流星轨迹反向延长后交汇于辐射点。',
  eclipse: '月球本影锥与日冕为示意；全食时日冕可见。',
  aurora: '极光颜色按海拔分层：低层蓝紫（氮）、中层绿（氧）、高层红（氧）。',
  supernova: '示意核坍缩抛射物，中心遗留中子星遗迹。'
}

export function renderDetail(root: HTMLElement, id: string) {
  const entry = getEntry(id)
  if (!entry) {
    location.hash = '#/'
    return
  }
  clear(root)
  document.title = entry.name + ' · 知天易'
  const item = entry

  root.appendChild(renderSiteHeader())

  const layout = el('main', 'detail-layout')
  layout.style.setProperty('--accent', entry.accent)

  const viewerCol = el('aside', 'viewer-col')
  viewerCol.innerHTML = `
    <div class="viewer-wrap">
      <div id="viewer-canvas"></div>
      <div class="viewer-hint">🖱️ 拖拽旋转 · 滚轮缩放</div>
      <div class="title-badge">${entry.category}</div>
      <div class="viewer-controls">
        <button id="auto-btn" class="ctrl-btn">⏸ 自动旋转</button>
        <button id="reset-btn" class="ctrl-btn">⟳ 重置视角</button>
      </div>
    </div>
    <div class="scale-note">📐 ${sceneNotes[entry.scene] ?? '三维场景为示意，真实数值请见数据档案。'}</div>
  `
  layout.appendChild(viewerCol)

  const content = el('article', 'content-col')
  content.innerHTML = `
    <div class="detail-head">
      <h1>${entry.emoji} ${entry.name}</h1>
      <p class="en">${entry.enName}</p>
      <p class="summary">${entry.summary}</p>
    </div>
    <nav class="tabs">
      <button class="tab active" data-tab="intro">📖 简介</button>
      <button class="tab" data-tab="science">🔬 科学原理</button>
      <button class="tab" data-tab="facts">📊 数据档案</button>
    </nav>
    <div id="tab-panel" class="tab-panel"></div>
    <div id="related-block" class="related-block"></div>
  `
  layout.appendChild(content)
  root.appendChild(layout)

  const panel = content.querySelector<HTMLElement>('#tab-panel')!
  function renderTab(tab: 'intro' | 'science' | 'facts') {
    clear(panel)
    if (tab === 'intro') {
      const p = el('p', 'tab-text')
      p.textContent = item.intro
      panel.appendChild(p)
    } else if (tab === 'science') {
      const p = el('p', 'tab-text')
      p.textContent = item.science
      panel.appendChild(p)
    } else {
      const table = el('table')
      for (const f of item.facts) {
        const tr = el('tr')
        tr.appendChild(el('td', undefined, f.label))
        tr.appendChild(el('td', undefined, f.value))
        table.appendChild(tr)
      }
      panel.appendChild(table)
    }
  }

  const tabs = content.querySelectorAll<HTMLButtonElement>('.tab')
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      renderTab(btn.dataset.tab as 'intro' | 'science' | 'facts')
    })
  })

  const related = searchCatalog('', entry.category).filter((x) => x.id !== entry.id).slice(0, 3)
  const relatedBlock = content.querySelector<HTMLElement>('#related-block')!
  if (related.length > 0) {
    const h = el('h2', 'related-title', '🔗 相关天体')
    relatedBlock.appendChild(h)
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
    relatedBlock.appendChild(rGrid)
  }

  const canvas = viewerCol.querySelector<HTMLElement>('#viewer-canvas')!
  const viewer = new Viewer(canvas)
  viewer.load(buildSceneFor(entry))
  viewer.start()
  registerCleanup(() => viewer.dispose())

  const autoBtn = viewerCol.querySelector<HTMLButtonElement>('#auto-btn')!
  autoBtn.textContent = viewer.isAutoRotate() ? '⏸ 自动旋转' : '▶ 自动旋转'
  autoBtn.addEventListener('click', () => {
    const next = !viewer.isAutoRotate()
    viewer.setAutoRotate(next)
    autoBtn.textContent = next ? '⏸ 自动旋转' : '▶ 自动旋转'
  })
  viewerCol.querySelector<HTMLButtonElement>('#reset-btn')!.addEventListener('click', () => viewer.resetView())

  renderTab('intro')
}