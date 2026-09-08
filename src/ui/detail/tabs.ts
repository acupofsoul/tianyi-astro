/**
 * 详情页标签栏（工作流 C）。
 * 用 <a> 承载深链，但点击时阻止默认跳转（避免整页重渲染），改用 replaceState 同步 URL。
 */
import { el } from '../dom'
import { TAB_LIST, type DetailTab } from './panels'

export interface TabsHandle {
  el: HTMLElement
  select(tab: DetailTab, opts?: { focus?: boolean }): void
  current(): DetailTab
}

export function createTabs(
  onSelect: (tab: DetailTab) => void,
  panelId: string,
  hrefFor: (tab: DetailTab) => string
): TabsHandle {
  const nav = el('nav', 'tabs dt-tabs')
  nav.setAttribute('role', 'tablist')
  nav.setAttribute('aria-label', '展项信息分类')

  const buttons = new Map<DetailTab, HTMLAnchorElement>()
  let active: DetailTab = 'intro'

  for (const item of TAB_LIST) {
    const a = el('a', 'tab dt-tab')
    a.setAttribute('role', 'tab')
    a.setAttribute('aria-controls', panelId)
    a.href = hrefFor(item.id)
    a.dataset.tab = item.id
    const label = el('span', 'dt-tab-label', item.label)
    const key = el('span', 'dt-tab-key', item.key)
    key.setAttribute('aria-hidden', 'true')
    a.appendChild(label)
    a.appendChild(key)
    a.addEventListener('click', (e) => {
      // 允许中键 / 修饰键走浏览器默认行为（新标签打开深链）
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      select(item.id)
    })
    buttons.set(item.id, a)
    nav.appendChild(a)
  }

  function paint() {
    for (const [id, a] of buttons) {
      const on = id === active
      a.classList.toggle('active', on)
      a.setAttribute('aria-selected', on ? 'true' : 'false')
      a.tabIndex = on ? 0 : -1
    }
  }

  function select(tab: DetailTab, opts?: { focus?: boolean }) {
    active = tab
    paint()
    onSelect(tab)
    if (opts?.focus) buttons.get(tab)?.focus()
  }

  return {
    el: nav,
    select,
    current: () => active
  }
}
