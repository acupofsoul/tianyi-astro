/**
 * 真实比例对比页（#/scale，第三轮迭代 · 数字化视角）。
 *
 * 把 15 个天体按真实直径排在同一条基线上：太阳直径约 139 万千米，
 * 地球约 1.27 万千米，中子星只有 20 千米 —— 同一比例尺下它们根本不在
 * 一个量级。因此提供两种映射：
 *   - 对数比例：半径按 log₁₀(直径) 映射，极大与极小可同框；
 *   - 真实比例：严格按真实直径等比，太阳会吞掉整行，小天体只剩几个像素。
 *
 * 三维引擎与场景模块按需加载，页面骨架与数据列表先同步渲染。
 */
import { SCALE_LINEUP, sortedLineup } from '../data/scaleLineup'
import { renderSiteHeader } from './header'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { createLoading, type LoadingHandle } from './detail/loading'
import { createPickCard, type PickCardHandle } from './detail/pickCard'
import type { Viewer } from '../viewer'
import type { ScaleLineupMode } from '../scenes'

const MODE_LABEL: Record<ScaleLineupMode, string> = {
  log: '对数比例',
  true: '真实比例'
}

export function renderScalePage(root: HTMLElement) {
  document.title = '真实比例对比 · 知天易'
  clear(root)
  root.appendChild(renderSiteHeader())

  const film = el('main', 'film dt-film scale-page film-enter')
  const canvas = el('div', 'film-canvas')
  canvas.id = 'film-canvas'
  film.appendChild(canvas)
  film.appendChild(el('div', 'film-vignette'))

  const loading: LoadingHandle = createLoading('尺度对比', 'TRUE SCALE LINEUP')
  film.appendChild(loading.el)

  const pickCard: PickCardHandle = createPickCard()
  film.appendChild(pickCard.el)

  // ------------------------------------------------------------ HUD 面板
  const panel = el('aside', 'film-panel dt-side scale-side')
  panel.id = 'film-panel'
  panel.setAttribute('aria-label', '尺度对比说明与比例切换')

  const head = el('div', 'dt-side-head')
  head.appendChild(el('span', 'hud-label dt-side-kicker', 'SCALE / 真实比例'))
  panel.appendChild(head)

  const scroll = el('div', 'panel-scroll dt-scroll')
  const body = el('div', 'dt-panel-body')
  body.appendChild(el('h1', 'scale-title', '同一把尺子'))
  body.appendChild(
    el(
      'p',
      'tab-text',
      '太阳直径约 139.3 万千米，地球约 1.27 万千米，相差约 109 倍；而中子星只有约 20 千米。下面这排天体用同一条基线排列，两种映射各有各的用处。'
    )
  )

  const toggle = el('div', 'scale-toggle')
  toggle.setAttribute('role', 'group')
  toggle.setAttribute('aria-label', '比例映射方式')
  const modeButtons: Record<ScaleLineupMode, HTMLButtonElement> = {
    log: el('button', 'ctrl-btn scale-mode active', MODE_LABEL.log),
    true: el('button', 'ctrl-btn scale-mode', MODE_LABEL.true)
  }
  for (const key of ['log', 'true'] as ScaleLineupMode[]) {
    const btn = modeButtons[key]
    btn.type = 'button'
    btn.dataset.mode = key
    btn.setAttribute('aria-pressed', key === 'log' ? 'true' : 'false')
    btn.addEventListener('click', () => setMode(key))
    toggle.appendChild(btn)
  }
  body.appendChild(toggle)
  body.appendChild(
    el(
      'p',
      'scale-hint',
      '对数比例把 20 km 到 139 万 km 压缩到同一视野；真实比例严格等比，切换后请滚动缩放观察小天体。'
    )
  )
  body.appendChild(
    el('p', 'scale-hint', '点击任意天体可弹出名称与坐标；下方色点与球体颜色一一对应，便于对照。')
  )

  // 数据列表（同步渲染，不依赖三维引擎）
  const list = el('div', 'scale-list')
  list.appendChild(el('div', 'hud-label dt-tab-kicker', '按真实直径排序'))
  for (const item of sortedLineup()) {
    const row = el('div', 'scale-row')
    const dot = el('span', 'scale-dot')
    dot.style.background = item.color
    row.appendChild(dot)
    const main = el('span', 'scale-row-main')
    main.appendChild(el('span', 'scale-row-name', item.name))
    main.appendChild(el('span', 'scale-row-en', item.enName))
    row.appendChild(main)
    const value = el('span', 'scale-row-value hud-num')
    value.textContent =
      item.diameterKm >= 1000
        ? Math.round(item.diameterKm).toLocaleString('en-US') + ' km'
        : item.diameterKm + ' km'
    row.appendChild(value)
    list.appendChild(row)
  }
  body.appendChild(list)

  scroll.appendChild(body)
  panel.appendChild(scroll)
  film.appendChild(panel)
  root.appendChild(film)

  // ---------------------------------------------------------------- 运行时
  let viewer: Viewer | null = null
  let mode: ScaleLineupMode = 'log'
  let disposed = false

  function setMode(next: ScaleLineupMode): void {
    if (next === mode) return
    mode = next
    for (const key of ['log', 'true'] as ScaleLineupMode[]) {
      const active = key === mode
      modeButtons[key].classList.toggle('active', active)
      modeButtons[key].setAttribute('aria-pressed', active ? 'true' : 'false')
    }
    rebuild()
  }

  function rebuild(): void {
    if (!viewer || disposed) return
    viewer.load(buildScene(SCALE_LINEUP, mode))
    viewer.playIntro(1.6)
    pickCard.hide()
  }

  let buildScene: typeof import('../scenes')['buildScaleLineupScene'] = () => {
    throw new Error('scene module not loaded')
  }

  function degrade(message: string): void {
    film.classList.add('dt-no-webgl')
    loading.fail(message)
  }

  void (async () => {
    type ViewerCtor = typeof import('../viewer')['Viewer']
    let ViewerCtor: ViewerCtor
    try {
      const [viewerMod, sceneMod] = await Promise.all([import('../viewer'), import('../scenes')])
      ViewerCtor = viewerMod.Viewer
      buildScene = sceneMod.buildScaleLineupScene
    } catch (err) {
      if (disposed) return
      console.error('[scale] 三维引擎加载失败', err)
      degrade('三维引擎加载失败（可能是网络中断）；右侧数据列表仍可正常浏览。')
      return
    }
    if (disposed) return
    loading.stage('正在构建对比场景')

    try {
      viewer = new ViewerCtor(canvas)
    } catch {
      viewer = null
      degrade('当前浏览器或设备不支持 WebGL；右侧数据列表仍可正常浏览。')
      return
    }
    const v = viewer
    v.load(buildScene(SCALE_LINEUP, mode))
    v.setPickEnabled(true)
    v.onPick((info) => {
      if (info) pickCard.show(info)
      else pickCard.hide()
    })
    v.start()
    v.playIntro(2.4)

    const ready = () => {
      if (disposed || film.classList.contains('dt-ready')) return
      loading.ready()
      film.classList.add('dt-ready')
    }
    requestAnimationFrame(() => requestAnimationFrame(ready))
    window.setTimeout(ready, 1800)
  })()

  registerCleanup(() => {
    disposed = true
    pickCard.dispose()
    loading.dispose()
    viewer?.dispose()
    viewer = null
  })
}
