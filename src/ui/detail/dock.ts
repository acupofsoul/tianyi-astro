/**
 * 3D 控制栏（HUD 风格，工作流 C）。
 * 时间倍率滑块 + 暂停/播放 + 视角预设 4 键 + 自动旋转 + 重置视角 + 保存快照 + 面板开关。
 * 全部状态都向 Viewer 查询/写回，Viewer 为 null（WebGL 不可用）时按钮禁用而不是报错。
 */
import type { Viewer, OverlayId } from '../../viewer'
import { el } from '../dom'

/** 时间倍率档位（离散档位便于键盘与读屏播报，避免假精度）。 */
const SPEEDS: readonly number[] = [0.1, 0.25, 0.5, 1, 2, 4, 8, 16, 32]
const DEFAULT_SPEED_INDEX = 3

/** 可视化辅助层（工作流 B 提供 Viewer.setOverlay / isOverlay）。 */
const OVERLAY_SPECS: readonly { id: OverlayId; label: string; hint: string }[] = [
  { id: 'orbits', label: '轨道线', hint: '行星公转轨道线（半径对数压缩，非真实比例）' },
  { id: 'labels', label: '天体标签', hint: '场景内天体名称标注' },
  { id: 'scale', label: '比例尺', hint: '1 世界单位的线框参考球 + 真实直径读数' }
]

export interface DockOptions {
  entryName: string
  isPanelCollapsed: () => boolean
  onTogglePanel: () => void
}

export interface DockHandle {
  el: HTMLElement
  togglePause(): void
  setPaused(v: boolean): void
  dispose(): void
}

function fmtSpeed(k: number): string {
  return (k < 1 ? k.toFixed(2) : k.toFixed(k < 10 ? 1 : 0)) + '×'
}

export function createDock(viewer: Viewer | null, opts: DockOptions): DockHandle {
  const dock = el('div', 'dt-dock hud hud-frame')
  dock.setAttribute('role', 'group')
  dock.setAttribute('aria-label', '三维视图控制')

  // ---------------------------------------------------------------- 第一行
  const row1 = el('div', 'dt-dock-row')

  const pauseBtn = el('button', 'dt-btn dt-btn-icon')
  pauseBtn.type = 'button'
  pauseBtn.title = '暂停 / 播放（空格）'
  pauseBtn.setAttribute('aria-pressed', 'false')
  pauseBtn.addEventListener('click', () => togglePause())

  const sliderWrap = el('label', 'dt-slider')
  const sliderLabel = el('span', 'hud-label dt-slider-label', '时间倍率')
  const slider = el('input', 'dt-range')
  slider.type = 'range'
  slider.min = '0'
  slider.max = String(SPEEDS.length - 1)
  slider.step = '1'
  slider.value = String(DEFAULT_SPEED_INDEX)
  slider.setAttribute('aria-label', '时间倍率')
  const speedOut = el('span', 'hud-num dt-speed', fmtSpeed(SPEEDS[DEFAULT_SPEED_INDEX] ?? 1))
  sliderWrap.appendChild(sliderLabel)
  sliderWrap.appendChild(slider)
  sliderWrap.appendChild(speedOut)

  row1.appendChild(pauseBtn)
  row1.appendChild(sliderWrap)
  dock.appendChild(row1)

  // ---------------------------------------------------------------- 第二行
  const row2 = el('div', 'dt-dock-row dt-dock-row-wrap')

  const presetBtns: HTMLButtonElement[] = []
  const presets = viewer ? viewer.presets() : []
  if (presets.length > 0) {
    const presetGroup = el('div', 'dt-preset-group')
    presetGroup.setAttribute('role', 'group')
    presetGroup.setAttribute('aria-label', '视角预设')
    for (const p of presets) {
      const b = el('button', 'dt-btn dt-btn-preset', p.label)
      b.type = 'button'
      b.setAttribute('aria-pressed', 'false')
      b.addEventListener('click', () => {
        viewer?.applyPreset(p.id)
        for (const other of presetBtns) other.setAttribute('aria-pressed', 'false')
        b.setAttribute('aria-pressed', 'true')
      })
      presetBtns.push(b)
      presetGroup.appendChild(b)
    }
    row2.appendChild(presetGroup)
  }

  const autoBtn = el('button', 'dt-btn', '自动旋转')
  autoBtn.type = 'button'
  autoBtn.title = '自动旋转视角'
  autoBtn.setAttribute('aria-pressed', 'false')
  autoBtn.addEventListener('click', () => {
    if (!viewer) return
    const next = !viewer.isAutoRotate()
    viewer.setAutoRotate(next)
    paintAuto(next)
  })

  const resetBtn = el('button', 'dt-btn', '重置视角')
  resetBtn.type = 'button'
  resetBtn.title = '回到场景默认机位（R）'
  resetBtn.addEventListener('click', () => viewer?.resetView())

  const shotBtn = el('button', 'dt-btn', '保存快照')
  shotBtn.type = 'button'
  shotBtn.title = '把当前画面导出为 PNG'
  shotBtn.addEventListener('click', () => {
    if (!viewer) return
    try {
      const url = viewer.capture()
      const a = el('a')
      a.href = url
      a.download = '知天易-' + opts.entryName + '-' + stamp() + '.png'
      document.body.appendChild(a)
      a.click()
      a.remove()
      toast('快照已保存到下载目录')
    } catch {
      toast('快照导出失败：当前环境不支持画布导出')
    }
  })

  const panelBtn = el('button', 'dt-btn', '收起面板')
  panelBtn.type = 'button'
  panelBtn.addEventListener('click', () => {
    opts.onTogglePanel()
    paintPanel()
  })

  row2.appendChild(autoBtn)
  row2.appendChild(resetBtn)
  row2.appendChild(shotBtn)
  row2.appendChild(panelBtn)
  dock.appendChild(row2)

  // ---------------------------------------------------------------- 第三行
  // 可视化辅助层开关（工作流 B 的 Viewer.setOverlay）：轨道线 / 天体标签 / 比例尺
  const overlayRow = el('div', 'dt-dock-row dt-overlay-row')
  overlayRow.setAttribute('role', 'group')
  overlayRow.setAttribute('aria-label', '三维可视化辅助层')
  overlayRow.appendChild(el('span', 'hud-label dt-dock-sub', '图层'))

  for (const spec of OVERLAY_SPECS) {
    const btn = el('button', 'dt-btn dt-btn-overlay')
    btn.type = 'button'
    const dot = el('span', 'dt-overlay-dot', '○')
    dot.setAttribute('aria-hidden', 'true')
    btn.appendChild(dot)
    btn.appendChild(el('span', 'dt-overlay-text', spec.label))

    const available = !!viewer?.getHandle()?.overlays?.[spec.id]
    const on = !!viewer?.isOverlay(spec.id)
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
    dot.textContent = on ? '◉' : '○'
    btn.disabled = !available
    btn.title = available
      ? spec.hint + '（点击开关）'
      : spec.hint + '（当前场景没有该图层）'
    btn.setAttribute('aria-label', spec.label + (available ? '' : '（当前场景不可用）'))

    btn.addEventListener('click', () => {
      if (!viewer || !available) return
      const next = !viewer.isOverlay(spec.id)
      viewer.setOverlay(spec.id, next)
      btn.setAttribute('aria-pressed', next ? 'true' : 'false')
      dot.textContent = next ? '◉' : '○'
      toast(spec.label + (next ? ' 已开启' : ' 已关闭'))
    })

    overlayRow.appendChild(btn)
  }
  dock.appendChild(overlayRow)

  const status = el('div', 'dt-dock-status hud-label')
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  dock.appendChild(status)

  // ------------------------------------------------------------------ 逻辑
  function paintPause() {
    const paused = viewer ? viewer.isPaused() : true
    pauseBtn.textContent = paused ? '▶ 播放' : '⏸ 暂停'
    pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false')
    pauseBtn.setAttribute('aria-label', paused ? '继续播放动画' : '暂停动画')
  }

  function paintAuto(on: boolean) {
    autoBtn.setAttribute('aria-pressed', on ? 'true' : 'false')
    autoBtn.textContent = on ? '旋转中' : '自动旋转'
  }

  function paintPanel() {
    const collapsed = opts.isPanelCollapsed()
    panelBtn.textContent = collapsed ? '展开面板' : '收起面板'
    panelBtn.setAttribute('aria-pressed', collapsed ? 'true' : 'false')
  }

  function setPaused(v: boolean) {
    viewer?.setPaused(v)
    paintPause()
  }

  function togglePause() {
    setPaused(!(viewer ? viewer.isPaused() : false))
  }

  slider.addEventListener('input', () => {
    const k = SPEEDS[Number(slider.value)] ?? 1
    viewer?.setTimeScale(k)
    speedOut.textContent = fmtSpeed(k)
    slider.setAttribute('aria-valuetext', fmtSpeed(k) + '速')
    toast('时间倍率 ' + fmtSpeed(k))
  })

  let toastTimer = 0
  function toast(msg: string) {
    status.textContent = msg
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
      status.textContent = ''
    }, 2400)
  }

  if (!viewer) {
    dock.classList.add('dt-dock-disabled')
    for (const b of dock.querySelectorAll('button')) b.disabled = true
    slider.disabled = true
    status.textContent = '三维渲染不可用'
  } else {
    viewer.setTimeScale(SPEEDS[DEFAULT_SPEED_INDEX] ?? 1)
    slider.setAttribute('aria-valuetext', fmtSpeed(SPEEDS[DEFAULT_SPEED_INDEX] ?? 1) + '速')
    paintPause()
    paintAuto(viewer.isAutoRotate())
  }
  paintPanel()

  return {
    el: dock,
    togglePause,
    setPaused,
    dispose() {
      window.clearTimeout(toastTimer)
    }
  }
}

function stamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds())
}
