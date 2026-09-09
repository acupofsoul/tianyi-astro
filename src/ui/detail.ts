/**
 * 详情页信息架构（工作流 C）。
 *
 * 布局：桌面端「3D 主视图 + 右侧 HUD 侧栏」；≤900px 变为「3D 上方 + 底部可拖拽抽屉」。
 * 深链：#/p/<id>?tab=intro|science|facts|history
 * 键盘：←/→ 上/下一条目，1~4 切标签，空格暂停，R 重置视角，Esc 关卡片。
 */
import type { Viewer } from '../viewer'
import { getEntry, catalog } from '../catalog'
import type { CatalogEntry } from '../types'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { renderSiteHeader } from './header'
import type { VizHandle } from '../viz/types'
import { createDock, type DockHandle } from './detail/dock'
import { createPickCard, type PickCardHandle } from './detail/pickCard'
import { createTabs, type TabsHandle } from './detail/tabs'
import { createLoading, type LoadingHandle } from './detail/loading'
import { createRelated } from './detail/related'
import { setupDrawer, type DrawerHandle } from './detail/drawer'
import { bindDetailKeys } from './detail/keys'
import { renderPanel, TAB_LIST, isDetailTab, type DetailTab } from './detail/panels'

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
  supernova: '示意核坍缩抛射物，中心遗留中子星遗迹。',
  pulsar: '中子星直径按真实量级示意（约 20 km）；射束与磁力线为艺术化表现，自转与脉冲节奏已放慢到肉眼可读。',
  asteroid: '轨道半径与倾角按真实分布抽样，小行星直径与间距非真实比例（真实平均间距约 100 万千米）。',
  exoplanet: '以 TRAPPIST-1 为原型：恒星与七颗行星的相对大小按真实比例，行星间距为便于观看做了压缩。'
}

const TAB_KEY_TO_ID: readonly DetailTab[] = TAB_LIST.map((t) => t.id)
const MOBILE_QUERY = '(max-width: 900px)'

/** router 本轮只读，且 #/p/<id> 会把查询串一起传进来，因此在详情页内部兼容解析。 */
function parseDetailId(raw: string): { id: string; tab: DetailTab } {
  const q = raw.indexOf('?')
  const rawId = q >= 0 ? raw.slice(0, q) : raw
  const qs = q >= 0 ? raw.slice(q + 1) : ''
  let id = rawId
  try {
    id = decodeURIComponent(rawId)
  } catch {
    id = rawId
  }
  const tab = new URLSearchParams(qs).get('tab')
  return { id, tab: isDetailTab(tab) ? tab : 'intro' }
}

function hashFor(id: string, tab: DetailTab): string {
  return '#/p/' + id + (tab === 'intro' ? '' : '?tab=' + tab)
}

function isMobile(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches
}

export function renderDetail(root: HTMLElement, rawId: string) {
  const { id, tab: initialTab } = parseDetailId(rawId)
  const entry = getEntry(id)
  if (!entry) {
    location.hash = '#/'
    return
  }

  clear(root)
  document.title = entry.name + ' · 知天易'
  const item: CatalogEntry = entry
  const idx = catalog.findIndex((x) => x.id === item.id)
  const prev = idx > 0 ? catalog[idx - 1] : null
  const next = idx < catalog.length - 1 ? catalog[idx + 1] : null

  root.appendChild(renderSiteHeader())

  const film = el('main', 'film dt-film film-enter')
  film.dataset.dtId = item.id

  // ---------------------------------------------------------------- 3D 层
  const canvas = el('div', 'film-canvas')
  canvas.id = 'film-canvas'
  film.appendChild(canvas)
  film.appendChild(el('div', 'film-vignette'))

  const loading: LoadingHandle = createLoading(item.name, item.enName)
  film.appendChild(loading.el)

  // ---------------------------------------------------------- 左栏（叙事 + 控制）
  const leftCol = el('div', 'dt-left-col')

  const chapter = el('div', 'chapter-card dt-chapter')
  const chapterNo = el('span', 'chapter-no')
  chapterNo.textContent = '第 ' + String(idx + 1).padStart(2, '0') + ' 幕'
  const chapterName = el('h1')
  chapterName.textContent = item.name
  const chapterEn = el('span', 'chapter-en')
  chapterEn.textContent = item.enName
  const chapterMeta = el('div', 'dt-chapter-meta hud-label')
  chapterMeta.textContent = item.category + ' · ' + item.scene.toUpperCase()
  chapter.appendChild(chapterNo)
  chapter.appendChild(chapterName)
  chapter.appendChild(chapterEn)
  chapter.appendChild(chapterMeta)
  leftCol.appendChild(chapter)

  const pickCard: PickCardHandle = createPickCard()
  leftCol.appendChild(pickCard.el)

  const subtitle = el('div', 'film-subtitle dt-subtitle')
  subtitle.textContent = item.summary

  // -------------------------------------------------------------- 右侧面板
  const panel = el('aside', 'film-panel dt-side')
  panel.id = 'film-panel'
  panel.setAttribute('aria-label', item.name + ' 展项信息面板')

  const grip = el('button', 'dt-grip')
  grip.type = 'button'
  grip.setAttribute('aria-label', '拖动或点击展开 / 收起信息面板')
  grip.setAttribute('aria-expanded', 'true')
  grip.appendChild(el('span', 'dt-grip-bar'))

  const sideHead = el('div', 'dt-side-head')
  sideHead.appendChild(el('span', 'hud-label dt-side-kicker', 'ENTRY / 展项档案'))
  const closeBtn = el('button', 'dt-side-close')
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', '收起信息面板')
  closeBtn.textContent = '×'
  sideHead.appendChild(closeBtn)

  const tabs: TabsHandle = createTabs(
    (tab) => applyTab(tab),
    'dt-tabpanel',
    (tab) => hashFor(item.id, tab)
  )

  const scroll = el('div', 'panel-scroll dt-scroll')
  const panelBody = el('div', 'dt-panel-body')
  panelBody.id = 'dt-tabpanel'
  panelBody.setAttribute('role', 'tabpanel')
  panelBody.tabIndex = 0
  scroll.appendChild(panelBody)

  const related = createRelated(item)
  if (related) scroll.appendChild(related)

  const note = el('div', 'scale-note dt-note')
  note.textContent = sceneNotes[item.scene] ?? '三维场景为示意，真实数值请见「数据」标签页。'

  panel.appendChild(grip)
  panel.appendChild(sideHead)
  panel.appendChild(tabs.el)
  panel.appendChild(scroll)
  panel.appendChild(note)

  // ---------------------------------------------------------------- 进度条
  const progress = el('div', 'film-progress dt-progress')
  const track = el('div', 'progress-track')
  catalog.forEach((c, i) => {
    const a = el('a', 'p-seg' + (c.id === item.id ? ' active' : ''))
    a.href = '#/p/' + c.id
    a.title = c.name
    a.setAttribute('aria-label', '第 ' + (i + 1) + ' 幕：' + c.name)
    if (c.id === item.id) a.setAttribute('aria-current', 'true')
    track.appendChild(a)
  })
  const count = el('span', 'progress-count hud-num')
  count.textContent = String(idx + 1).padStart(2, '0') + ' / ' + catalog.length
  progress.appendChild(prev ? arrowLink('←', prev, 'dt-prev') : disabledArrow('←'))
  progress.appendChild(track)
  progress.appendChild(count)
  progress.appendChild(next ? arrowLink('→', next, 'dt-next') : disabledArrow('→'))

  // -------------------------------------------------------------- 右上角开关
  const filmControls = el('div', 'film-controls dt-film-controls')
  const panelToggle = el('button', 'ctrl-btn dt-panel-toggle', '面板')
  panelToggle.type = 'button'
  panelToggle.setAttribute('aria-label', '展开或收起信息面板')
  panelToggle.addEventListener('click', () => {
    if (isMobile()) {
      drawer?.expand()
      return
    }
    setPanelCollapsed(!panel.classList.contains('collapsed'))
  })
  filmControls.appendChild(panelToggle)

  film.appendChild(leftCol)
  film.appendChild(subtitle)
  film.appendChild(panel)
  film.appendChild(progress)
  film.appendChild(filmControls)
  root.appendChild(film)

  // ------------------------------------------------------------ 运行时状态
  let viewer: Viewer | null = null
  let dock: DockHandle | null = null
  let drawer: DrawerHandle | null = null
  let unbindKeys: (() => void) | null = null
  let vizHandles: VizHandle[] = []
  let panelCancel: (() => void) | null = null
  let readyTimer = 0
  let disposed = false

  // ------------------------------------------------------------ 标签页渲染
  function applyTab(tab: DetailTab) {
    // 先取消上一个页签尚未完成的异步渲染，再卸载它的可视化实例
    panelCancel?.()
    panelCancel = null
    for (const h of vizHandles) {
      try {
        h.dispose()
      } catch {
        /* 可视化层卸载异常不应影响页面 */
      }
    }
    vizHandles = []
    clear(panelBody)
    const result = renderPanel(tab, item)
    panelBody.appendChild(result.el)
    vizHandles = result.handles
    panelCancel = result.cancel ?? null
    panelBody.setAttribute('aria-label', item.name + ' · ' + labelOf(tab))
    scroll.scrollTop = 0
    if (!disposed) {
      try {
        history.replaceState(null, '', hashFor(item.id, tab))
      } catch {
        /* file:// 等不支持 replaceState 的环境忽略即可 */
      }
    }
  }

  function labelOf(tab: DetailTab): string {
    return TAB_LIST.find((t) => t.id === tab)?.label ?? '介绍'
  }

  // -------------------------------------------------------------- 面板开合
  function setPanelCollapsed(collapsed: boolean) {
    panel.classList.toggle('collapsed', collapsed)
    closeBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true')
    panelToggle.textContent = collapsed ? '面板' : '收起'
  }

  closeBtn.addEventListener('click', () => {
    if (isMobile()) drawer?.peek()
    else setPanelCollapsed(true)
  })

  // ---------------------------------------------------------------- 生命周期
  registerCleanup(() => {
    disposed = true
    window.clearTimeout(readyTimer)
    panelCancel?.()
    panelCancel = null
    for (const h of vizHandles) {
      try {
        h.dispose()
      } catch {
        /* 忽略 */
      }
    }
    vizHandles = []
    unbindKeys?.()
    unbindKeys = null
    drawer?.dispose()
    drawer = null
    dock?.dispose()
    dock = null
    pickCard.dispose()
    loading.dispose()
    viewer?.dispose()
    viewer = null
  })

  // 抽屉与快捷键不依赖 WebGL，先于场景构建挂载，降级时也能用
  drawer = setupDrawer(panel, grip)
  unbindKeys = bindDetailKeys({
    onPrev: () => {
      if (prev) location.hash = '#/p/' + prev.id
    },
    onNext: () => {
      if (next) location.hash = '#/p/' + next.id
    },
    onTab: (i) => {
      const target = TAB_KEY_TO_ID[i]
      if (target) tabs.select(target, { focus: true })
    },
    onTogglePause: () => dock?.togglePause(),
    onReset: () => {
      viewer?.resetView()
      pickCard.hide()
    },
    onEscape: () => {
      if (pickCard.isOpen()) {
        pickCard.hide()
        return
      }
      if (isMobile()) drawer?.peek()
      else setPanelCollapsed(true)
    }
  })

  // 先让骨架/加载态有机会上屏，再异步加载三维引擎并构建场景
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      void boot()
    })
  })

  /**
   * 三维引擎（three.js + 场景模块）不在详情页的关键路径上：外壳、文字、
   * 数据表先渲染，这里再按需拉取。引擎到达前加载态已经在屏上，用户不会看到空白。
   */
  async function boot(): Promise<void> {
    if (disposed) return
    type ViewerCtor = typeof import('../viewer')['Viewer']
    type BuildScene = typeof import('../scenes')['buildSceneFor']

    let ViewerCtor: ViewerCtor
    let buildSceneFor: BuildScene
    const engineStart = performance.now()
    try {
      const [viewerMod, sceneMod] = await Promise.all([import('../viewer'), import('../scenes')])
      ViewerCtor = viewerMod.Viewer
      buildSceneFor = sceneMod.buildSceneFor
    } catch (err) {
      if (disposed) return
      console.error('[detail] 三维引擎加载失败', err)
      degrade('三维引擎加载失败（可能是网络中断）；文字与数据内容仍可正常浏览。')
      return
    }
    if (disposed) return
    // 引擎 chunk 到达耗时（含网络 / 解析 / 求值），供 perf 脚本读取
    performance.measure('tianyi:engine-load', { start: engineStart })
    loading.stage('正在构建三维场景')

    try {
      viewer = new ViewerCtor(canvas)
    } catch {
      viewer = null
      degrade('当前浏览器或设备不支持 WebGL，三维视图不可用；文字与数据内容仍可正常浏览。')
      return
    }
    const v = viewer
    const sceneStart = performance.now()
    try {
      v.load(buildSceneFor(item))
    } catch {
      v.dispose()
      viewer = null
      degrade('三维场景构建失败；文字与数据内容仍可正常浏览。')
      return
    }

    // 场景构建（程序化纹理 + 几何）耗时：这是三维页最重的一段同步工作
    performance.measure('tianyi:scene-build', { start: sceneStart })

    v.onPick((info) => {
      if (info) pickCard.show(info)
      else pickCard.hide()
    })
    v.setPickEnabled(true)
    v.start()
    v.playIntro(3.2)

    dock = createDock(v, {
      entryName: item.name,
      isPanelCollapsed: () => panel.classList.contains('collapsed'),
      onTogglePanel: () => {
        if (isMobile()) drawer?.expand()
        else setPanelCollapsed(!panel.classList.contains('collapsed'))
      }
    })
    leftCol.appendChild(dock.el)

    // 首帧就绪：连续两帧渲染完成后淡出加载态并淡入画面；
    // 若 rAF 被节流（后台标签页 / 低端设备），用定时器兜底，避免画面一直藏着
    const markReady = () => {
      if (disposed || film.classList.contains('dt-ready')) return
      window.clearTimeout(readyTimer)
      loading.ready()
      film.classList.add('dt-ready')
      film.dataset.dtReady = '1'
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(markReady)
    })
    readyTimer = window.setTimeout(markReady, 1800)
  }

  /** WebGL 不可用时的降级：隐藏 3D 相关控件，保留面板与数据。 */
  function degrade(message: string) {
    film.classList.add('dt-no-webgl')
    loading.fail(message)
  }

  // 首次渲染
  tabs.select(initialTab)
}

function arrowLink(symbol: string, target: CatalogEntry, className: string): HTMLElement {
  const a = el('a', 'progress-arrow ' + className, symbol)
  a.href = '#/p/' + target.id
  a.setAttribute('aria-label', (symbol === '←' ? '上一个展项：' : '下一个展项：') + target.name)
  a.title = target.name
  return a
}

function disabledArrow(symbol: string): HTMLElement {
  const span = el('span', 'progress-arrow disabled', symbol)
  span.setAttribute('aria-hidden', 'true')
  return span
}
