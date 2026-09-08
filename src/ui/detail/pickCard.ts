/**
 * 拾取信息卡（工作流 C）。
 * viewer.onPick 命中时显示名称 + 场景坐标，点空白或按 Esc 隐藏。
 */
import type { PickInfo } from '../../viewer'
import { el } from '../dom'

export interface PickCardHandle {
  el: HTMLElement
  show(info: PickInfo): void
  hide(): void
  isOpen(): boolean
  dispose(): void
}

export function createPickCard(): PickCardHandle {
  const card = el('div', 'dt-pick hud hud-frame')
  card.hidden = true
  card.setAttribute('role', 'status')
  card.setAttribute('aria-live', 'polite')

  const head = el('div', 'dt-pick-head')
  const kicker = el('span', 'hud-label', 'PICK / 拾取目标')
  const close = el('button', 'dt-pick-close')
  close.type = 'button'
  close.setAttribute('aria-label', '关闭拾取信息')
  close.textContent = '×'
  head.appendChild(kicker)
  head.appendChild(close)

  const name = el('div', 'dt-pick-name')
  const coordLabel = el('div', 'hud-label dt-pick-coord-label', '场景坐标 · 世界单位（示意）')
  const coord = el('div', 'hud-num dt-pick-coord')

  card.appendChild(head)
  card.appendChild(name)
  card.appendChild(coordLabel)
  card.appendChild(coord)

  function hide() {
    card.hidden = true
    card.classList.remove('dt-pick-in')
  }

  close.addEventListener('click', hide)

  return {
    el: card,
    show(info: PickInfo) {
      name.textContent = info.name
      coord.textContent = 'x ' + fmt(info.point[0]) + '  y ' + fmt(info.point[1]) + '  z ' + fmt(info.point[2])
      card.hidden = false
      // 触发一次重排后再加类，保证淡入动画生效
      void card.offsetWidth
      card.classList.add('dt-pick-in')
    },
    hide,
    isOpen: () => !card.hidden,
    dispose() {
      hide()
    }
  }
}

/** 世界坐标为场景示意单位，保留两位小数。 */
function fmt(v: number): string {
  return Number.isFinite(v) ? v.toFixed(2) : '—'
}
