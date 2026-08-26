import { Viewer } from '../viewer'
import { buildSceneFor } from '../scenes'
import { getEntry, catalog } from '../catalog'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { renderSiteHeader } from './header'
import { entryHistory } from '../history'

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
  const idx = catalog.findIndex((x) => x.id === item.id)
  const prev = idx > 0 ? catalog[idx - 1] : null
  const next = idx < catalog.length - 1 ? catalog[idx + 1] : null

  root.appendChild(renderSiteHeader())

  const film = el('main', 'film film-enter')
  const prevArrow = prev ? '<a class="progress-arrow" href="#/p/' + prev.id + '">←</a>' : '<span class="progress-arrow disabled">←</span>'
  const nextArrow = next ? '<a class="progress-arrow" href="#/p/' + next.id + '">→</a>' : '<span class="progress-arrow disabled">→</span>'
  const segments = catalog.map((c, i) => {
    const cls = 'p-seg' + (c.id === item.id ? ' active' : '')
    return '<a class="' + cls + '" href="#/p/' + c.id + '" title="' + c.name + '"></a>'
  }).join('')

  film.innerHTML = `
    <div id="film-canvas" class="film-canvas"></div>
    <div class="film-vignette"></div>

    <div class="chapter-card">
      <span class="chapter-no">第 ${String(idx + 1).padStart(2, '0')} 幕</span>
      <h2>${item.name}</h2>
      <span class="chapter-en">${item.enName}</span>
    </div>

    <div class="film-controls">
      <button id="toggle-panel" class="ctrl-btn">详情</button>
      <button id="auto-btn" class="ctrl-btn">⏸ 自动旋转</button>
      <button id="reset-btn" class="ctrl-btn">⟳ 重置视角</button>
    </div>

    <div class="film-subtitle">${item.summary}</div>

    <aside class="film-panel" id="film-panel">
      <nav class="tabs">
        <button class="tab active" data-tab="intro">介绍</button>
        <button class="tab" data-tab="science">原理</button>
        <button class="tab" data-tab="facts">数据</button>
        <button class="tab" data-tab="history">历史</button>
      </nav>
      <div class="panel-scroll"><div id="tab-panel"></div></div>
      <div class="scale-note">${sceneNotes[item.scene] ?? '三维场景为示意，真实数值请见数据。'}</div>
    </aside>

    <div class="film-progress">
      ${prevArrow}
      <div class="progress-track">${segments}</div>
      <span class="progress-count">${String(idx + 1).padStart(2, '0')} / ${catalog.length}</span>
      ${nextArrow}
    </div>
  `
  root.appendChild(film)

  const canvas = film.querySelector<HTMLElement>('#film-canvas')!
  const viewer = new Viewer(canvas)
  viewer.load(buildSceneFor(item))
  viewer.start()
  viewer.playIntro(3.2)
  registerCleanup(() => viewer.dispose())

  const panel = film.querySelector<HTMLElement>('#film-panel')!
  const toggle = film.querySelector<HTMLButtonElement>('#toggle-panel')!
  if (window.innerWidth < 900) panel.classList.add('collapsed')
  toggle.addEventListener('click', () => panel.classList.toggle('collapsed'))

  const panelBody = film.querySelector<HTMLElement>('#tab-panel')!
  function renderTab(tab: 'intro' | 'science' | 'facts' | 'history') {
    clear(panelBody)
    if (tab === 'intro') {
      const p = el('p', 'tab-text')
      p.textContent = item.intro
      panelBody.appendChild(p)
    } else if (tab === 'science') {
      const p = el('p', 'tab-text')
      p.textContent = item.science
      panelBody.appendChild(p)
    } else if (tab === 'facts') {
      const table = el('table')
      for (const f of item.facts) {
        const tr = el('tr')
        tr.appendChild(el('td', undefined, f.label))
        tr.appendChild(el('td', undefined, f.value))
        table.appendChild(tr)
      }
      panelBody.appendChild(table)
    } else {
      const events = entryHistory[item.id] ?? []
      if (events.length === 0) {
        panelBody.appendChild(el('p', 'tab-text', '暂无历史条目。'))
      } else {
        const tl = el('div', 'local-timeline')
        for (const ev of events) {
          const node = el('div', 't-event')
          node.innerHTML = `
            <div class="t-year">${ev.year}</div>
            <div class="t-body">
              <h3>${ev.title}</h3>
              <p>${ev.text}</p>
            </div>
          `
          tl.appendChild(node)
        }
        panelBody.appendChild(tl)
      }
    }
  }

  const tabs = film.querySelectorAll<HTMLButtonElement>('.tab')
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      renderTab(btn.dataset.tab as 'intro' | 'science' | 'facts' | 'history')
    })
  })

  const autoBtn = film.querySelector<HTMLButtonElement>('#auto-btn')!
  autoBtn.textContent = viewer.isAutoRotate() ? '⏸ 自动旋转' : '▶ 自动旋转'
  autoBtn.addEventListener('click', () => {
    const nextOn = !viewer.isAutoRotate()
    viewer.setAutoRotate(nextOn)
    autoBtn.textContent = nextOn ? '⏸ 自动旋转' : '▶ 自动旋转'
  })
  film.querySelector<HTMLButtonElement>('#reset-btn')!.addEventListener('click', () => viewer.resetView())

  renderTab('intro')
}
