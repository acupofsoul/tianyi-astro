import { categories, catalog, searchCatalog } from '../catalog'
import type { CatalogEntry } from '../types'
import { escapeHtml, highlight } from './ux/html'

export interface SearchOptions {
  /** 初始关键词（目录页从 URL 传入） */
  query?: string
  /** 关键词变化回调（目录页用来实时过滤） */
  onInput?: (q: string) => void
  /** 输入框 id，默认 global-search */
  inputId?: string
  /** 建议面板 id，默认 `${inputId}-suggest` */
  suggestId?: string
  /** 选中某条结果时回调，便于外部记录来源 */
  onSelect?: (id: string) => void
  /** 挂载后自动聚焦 */
  autoFocus?: boolean
  /** 是否在建议面板中显示分类 chips，默认 true */
  showCategories?: boolean
}

const RECOMMEND_WORDS = ['黑洞', '土星', '哈勃', '极光', '超新星', '引力波']
const MAX_RESULTS = 8

let globalKeyBound = false

function bindGlobalSearchKey(): void {
  if (globalKeyBound) return
  globalKeyBound = true
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.defaultPrevented) return
    if ((event.ctrlKey || event.metaKey) && (event.key === 'k' || event.key === 'K')) {
      event.preventDefault()
      focusGlobalSearch()
    }
  })
}

function isVisible(input: HTMLInputElement): boolean {
  return input.getClientRects().length > 0 && input.offsetParent !== null
}

export function mountSearch(container: HTMLElement, opts?: SearchOptions): void {
  bindGlobalSearchKey()

  const inputId = opts?.inputId ?? 'global-search'
  const suggestId = opts?.suggestId ?? inputId + '-suggest'
  const showCategories = opts?.showCategories !== false
  const safeInputId = escapeHtml(inputId)
  const safeSuggestId = escapeHtml(suggestId)

  container.innerHTML = `
    <div class="ux-search" role="search">
      <input
        id="${safeInputId}"
        type="search"
        placeholder="搜索：黑洞、土星、哈雷彗星、极光…"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="false"
        aria-controls="${safeSuggestId}"
        aria-label="搜索天文展项"
      />
      <div class="suggest" id="${safeSuggestId}" role="listbox" aria-label="搜索建议">
        <div class="suggest-cats" role="group" aria-label="按分类筛选"></div>
        <div class="suggest-list"></div>
        <div class="suggest-empty" hidden></div>
      </div>
    </div>
  `

  const input = container.querySelector<HTMLInputElement>('#' + inputId)!
  const suggest = container.querySelector<HTMLElement>('#' + suggestId)!
  const catsEl = container.querySelector<HTMLElement>('.suggest-cats')!
  const listEl = container.querySelector<HTMLElement>('.suggest-list')!
  const emptyEl = container.querySelector<HTMLElement>('.suggest-empty')!

  let query = opts?.query ?? ''
  let category = '全部'
  let items: CatalogEntry[] = []
  let activeIndex = -1
  let focused = false

  function openSuggest(): void {
    suggest.classList.add('open')
    input.setAttribute('aria-expanded', 'true')
  }

  function closeSuggest(): void {
    suggest.classList.remove('open')
    input.setAttribute('aria-expanded', 'false')
    activeIndex = -1
    input.removeAttribute('aria-activedescendant')
    listEl.querySelectorAll<HTMLElement>('.suggest-item.active').forEach((node) => node.classList.remove('active'))
  }

  function updateActive(): void {
    const options = listEl.querySelectorAll<HTMLAnchorElement>('.suggest-item')
    options.forEach((option, index) => {
      const active = index === activeIndex
      option.classList.toggle('active', active)
      option.setAttribute('aria-selected', active ? 'true' : 'false')
    })
    if (activeIndex >= 0 && options[activeIndex]) {
      const active = options[activeIndex]
      input.setAttribute('aria-activedescendant', active.id)
      active.scrollIntoView({ block: 'nearest' })
    } else {
      input.removeAttribute('aria-activedescendant')
    }
  }

  function renderCats(): void {
    catsEl.replaceChildren()
    if (!showCategories) {
      catsEl.hidden = true
      return
    }
    catsEl.hidden = false
    const all = ['全部', ...categories]
    for (const value of all) {
      const count = value === '全部' ? catalog.length : catalog.filter((item) => item.category === value).length
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 's-cat-chip' + (value === category ? ' active' : '')
      chip.setAttribute('aria-pressed', value === category ? 'true' : 'false')
      chip.innerHTML = `${escapeHtml(value)}<span class="s-cat-count">${count}</span>`
      chip.addEventListener('mousedown', (event) => event.preventDefault())
      chip.addEventListener('click', () => {
        category = value
        activeIndex = -1
        renderSuggest()
        input.focus()
      })
      catsEl.appendChild(chip)
    }
  }

  function renderEmpty(): void {
    emptyEl.hidden = false
    emptyEl.replaceChildren()
    const title = document.createElement('p')
    title.className = 'suggest-empty-title'
    title.textContent = query.trim() ? `没有找到「${query.trim()}」` : '没有匹配的展项'
    const text = document.createElement('p')
    text.className = 'suggest-empty-text'
    text.textContent = '换个更短的关键词，或试试这些：'
    const words = document.createElement('div')
    words.className = 'suggest-empty-words'
    for (const word of RECOMMEND_WORDS) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 's-word'
      button.textContent = word
      button.addEventListener('mousedown', (event) => event.preventDefault())
      button.addEventListener('click', () => {
        query = word
        input.value = word
        category = '全部'
        activeIndex = -1
        renderSuggest()
        opts?.onInput?.(query)
        input.focus()
      })
      words.appendChild(button)
    }
    emptyEl.append(title, text, words)
  }

  function renderResults(): void {
    listEl.replaceChildren()
    if (items.length === 0) {
      renderEmpty()
      return
    }
    emptyEl.hidden = true
    emptyEl.replaceChildren()
    items.forEach((item, index) => {
      const link = document.createElement('a')
      link.className = 'suggest-item'
      link.id = `${suggestId}-option-${index}`
      link.href = '#/p/' + item.id
      link.setAttribute('role', 'option')
      link.setAttribute('aria-selected', 'false')
      link.innerHTML = `
        <span class="s-emoji" aria-hidden="true">${item.emoji}</span>
        <span class="s-main">
          <span class="s-name">${highlight(item.name, query)}<span class="s-en">${highlight(item.enName, query)}</span></span>
          <span class="s-desc">${highlight(item.summary, query)}</span>
        </span>
        <span class="s-cat">${escapeHtml(item.category)}</span>
      `
      link.addEventListener('click', (event) => {
        event.preventDefault()
        openItem(index)
      })
      listEl.appendChild(link)
    })
  }

  function renderSuggest(): void {
    items = searchCatalog(query, category).slice(0, MAX_RESULTS)
    const shouldOpen = focused || query.trim().length > 0 || category !== '全部'
    if (!shouldOpen) {
      closeSuggest()
      return
    }
    openSuggest()
    renderCats()
    renderResults()
    updateActive()
  }

  function openItem(index: number): void {
    const item = items[index]
    if (!item) return
    opts?.onSelect?.(item.id)
    closeSuggest()
    location.hash = '#/p/' + item.id
  }

  input.addEventListener('input', () => {
    query = input.value
    activeIndex = -1
    renderSuggest()
    opts?.onInput?.(query)
  })

  input.addEventListener('focus', () => {
    focused = true
    renderSuggest()
  })

  input.addEventListener('blur', () => {
    focused = false
  })

  input.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!suggest.classList.contains('open')) renderSuggest()
      if (items.length === 0) return
      activeIndex = activeIndex < 0 ? 0 : (activeIndex + 1) % items.length
      updateActive()
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!suggest.classList.contains('open')) renderSuggest()
      if (items.length === 0) return
      activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1
      updateActive()
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      openItem(activeIndex >= 0 ? activeIndex : 0)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      if (suggest.classList.contains('open')) {
        closeSuggest()
      } else {
        input.value = ''
        query = ''
        renderSuggest()
        input.blur()
      }
      return
    }
    if (event.key === 'Tab') {
      closeSuggest()
    }
  })

  document.addEventListener('click', (event: MouseEvent) => {
    if (!container.isConnected) return
    if (event.target instanceof Node && container.contains(event.target)) return
    closeSuggest()
  })

  input.value = opts?.query ?? ''
  query = input.value
  if (opts?.autoFocus) {
    window.requestAnimationFrame(() => input.focus())
  }
}

/** 聚焦当前可见的搜索框：优先全局搜索，其次首页搜索。 */
export function focusGlobalSearch(): void {
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('.ux-search input'))
  const visible = inputs.find(isVisible)
  const fallback = document.querySelector<HTMLInputElement>('#global-search') ?? document.querySelector<HTMLInputElement>('#home-search')
  const target = visible ?? fallback
  if (!target) return
  target.focus()
  target.select()
}
