import { catalog, categories, searchCatalog } from '../catalog'
import type { CatalogEntry } from '../types'
import { el, clear } from './dom'
import { renderSiteHeader } from './header'
import { escapeHtml, highlight } from './ux/html'
import { readPrefs, updatePrefs } from './ux/storage'
import type { BrowseSort } from './ux/storage'

interface SortOption {
  id: BrowseSort
  label: string
  note: string
}

const SORT_OPTIONS: SortOption[] = [
  { id: 'order', label: '序号', note: '按目录顺序' },
  { id: 'name', label: '名称', note: '按中文名称排序' },
  { id: 'category', label: '分类', note: '按展厅分类排序' }
]

const EMPTY_WORDS = ['黑洞', '土星', '极光', '超新星', '哈勃']

export function renderBrowse(root: HTMLElement, initial: { q: string; cat: string } = { q: '', cat: '' }) {
  document.title = '展品目录 · 知天易'
  clear(root)

  const prefs = readPrefs()
  const validCats = ['全部', ...categories]
  const initialCat = initial.cat || prefs.browseCat || '全部'
  const state: { q: string; cat: string; sort: BrowseSort } = {
    q: initial.q,
    cat: validCats.includes(initialCat) ? initialCat : '全部',
    sort: prefs.browseSort
  }
  updatePrefs({ browseCat: state.cat, browseSort: state.sort })

  const header = renderSiteHeader({
    query: state.q,
    onInput: (q) => {
      state.q = q
      renderList()
      syncUrl()
    }
  })
  root.appendChild(header)

  const main = el('main', 'browse-wrap')
  main.innerHTML = `
    <div class="browse-head">
      <p class="ux-kicker">CATALOG · ${catalog.length} ENTRIES</p>
      <h1>展品目录</h1>
      <p>按序号、名称或分类浏览全部 ${catalog.length} 个天文展项。</p>
    </div>
    <div class="ux-browse-tools">
      <div class="chips" id="browse-chips" role="group" aria-label="按分类筛选"></div>
      <div class="ux-sort" role="group" aria-label="排序方式">
        <span class="hud-label">SORT</span>
        ${SORT_OPTIONS.map(
          (option) =>
            `<button type="button" class="ux-sort-btn" data-sort="${option.id}" aria-pressed="false" title="${option.note}">${option.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="ux-browse-status" id="browse-status" role="status" aria-live="polite"></div>
    <ol class="browse-list" id="browse-list" aria-label="展项列表"></ol>
  `
  root.appendChild(main)

  const chips = main.querySelector<HTMLElement>('#browse-chips')!
  const list = main.querySelector<HTMLOListElement>('#browse-list')!
  const status = main.querySelector<HTMLElement>('#browse-status')!
  const sortButtons = Array.from(main.querySelectorAll<HTMLButtonElement>('.ux-sort-btn'))
  const orderMap = new Map(catalog.map((item, index) => [item.id, index]))

  function syncUrl(): void {
    const params = new URLSearchParams()
    if (state.q.trim()) params.set('q', state.q)
    if (state.cat !== '全部') params.set('cat', state.cat)
    const query = params.toString()
    const next = '#/browse' + (query ? '?' + query : '')
    if (location.hash !== next) window.history.replaceState(null, '', next)
  }

  function setQuery(next: string): void {
    state.q = next
    const input = header.querySelector<HTMLInputElement>('#global-search')
    if (input) {
      input.value = next
      input.dispatchEvent(new Event('input', { bubbles: true }))
    } else {
      renderList()
      syncUrl()
    }
  }

  function sortItems(items: CatalogEntry[]): CatalogEntry[] {
    const copy = [...items]
    if (state.sort === 'name') {
      copy.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
    } else if (state.sort === 'category') {
      copy.sort((a, b) => {
        const categoryDiff = categories.indexOf(a.category) - categories.indexOf(b.category)
        if (categoryDiff !== 0) return categoryDiff
        return (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
      })
    } else {
      copy.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
    }
    return copy
  }

  function renderChips(): void {
    clear(chips)
    const all = ['全部', ...categories]
    for (const value of all) {
      const count = value === '全部' ? catalog.length : catalog.filter((item) => item.category === value).length
      const chip = el('button', 'chip' + (value === state.cat ? ' active' : ''))
      chip.type = 'button'
      chip.setAttribute('aria-pressed', value === state.cat ? 'true' : 'false')
      chip.textContent = value
      const badge = el('span', 'chip-count', String(count))
      chip.appendChild(badge)
      chip.addEventListener('click', () => {
        state.cat = value
        updatePrefs({ browseCat: value })
        renderChips()
        renderList()
        syncUrl()
      })
      chips.appendChild(chip)
    }
  }

  function renderSort(): void {
    for (const button of sortButtons) {
      const active = button.dataset.sort === state.sort
      button.classList.toggle('active', active)
      button.setAttribute('aria-pressed', active ? 'true' : 'false')
    }
  }

  function renderEmpty(): void {
    const empty = el('li', 'browse-empty ux-empty')
    const hasQuery = state.q.trim().length > 0
    empty.innerHTML = `
      <div class="ux-empty-icon" aria-hidden="true">🔭</div>
      <p class="ux-empty-title">${hasQuery ? `没有找到「${escapeHtml(state.q.trim())}」` : '这个分类下暂时没有展项'}</p>
      <p class="ux-empty-text">试试更短的关键词，或清除分类筛选后重新浏览。</p>
      <div class="ux-empty-actions"><button type="button" class="chip" id="empty-clear">清除筛选</button></div>
      <div class="ux-empty-words" aria-label="推荐关键词"></div>
    `
    const clearButton = empty.querySelector<HTMLButtonElement>('#empty-clear')!
    clearButton.addEventListener('click', () => {
      state.cat = '全部'
      updatePrefs({ browseCat: '全部' })
      renderChips()
      setQuery('')
      syncUrl()
    })
    const words = empty.querySelector<HTMLElement>('.ux-empty-words')!
    for (const word of EMPTY_WORDS) {
      const button = el('button', 'chip', word)
      button.type = 'button'
      button.addEventListener('click', () => {
        state.cat = '全部'
        updatePrefs({ browseCat: '全部' })
        renderChips()
        setQuery(word)
        syncUrl()
      })
      words.appendChild(button)
    }
    list.appendChild(empty)
  }

  function renderList(): void {
    clear(list)
    const found = searchCatalog(state.q, state.cat)
    const items = sortItems(found)
    const sortLabel = SORT_OPTIONS.find((option) => option.id === state.sort)?.label ?? '序号'
    const filterLabel = state.cat === '全部' ? '全部分类' : state.cat
    status.textContent = state.q.trim()
      ? `找到 ${items.length} 个展项 · ${filterLabel} · 按${sortLabel}`
      : `共 ${items.length} 个展项 · ${filterLabel} · 按${sortLabel}`

    if (items.length === 0) {
      renderEmpty()
      return
    }

    items.forEach((item) => {
      const order = (orderMap.get(item.id) ?? 0) + 1
      const li = el('li', 'browse-item')
      li.style.setProperty('--accent', item.accent)
      const link = el('a')
      link.href = '#/p/' + item.id
      link.setAttribute('aria-label', `打开 ${item.name}（${item.category}）`)
      link.innerHTML = `
        <span class="b-num hud-num">${String(order).padStart(2, '0')}</span>
        <span class="b-emoji" aria-hidden="true">${item.emoji}</span>
        <span class="b-main">
          <span class="b-name">${highlight(item.name, state.q)}</span>
          <span class="b-en">${highlight(item.enName, state.q)}</span>
        </span>
        <span class="b-cat">${item.category}</span>
        <span class="b-summary">${highlight(item.summary, state.q)}</span>
        <span class="b-go">查看 →</span>
      `
      li.appendChild(link)
      list.appendChild(li)
    })
  }

  for (const button of sortButtons) {
    button.addEventListener('click', () => {
      const sort = button.dataset.sort
      if (sort !== 'order' && sort !== 'name' && sort !== 'category') return
      state.sort = sort
      updatePrefs({ browseSort: sort })
      renderSort()
      renderList()
    })
  }

  list.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') return
    const target = event.target
    if (!(target instanceof HTMLAnchorElement)) return
    const links = Array.from(list.querySelectorAll<HTMLAnchorElement>('.browse-item a'))
    const index = links.indexOf(target)
    if (index < 0 || links.length === 0) return
    event.preventDefault()
    let nextIndex = index
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % links.length
    else if (event.key === 'ArrowUp') nextIndex = (index - 1 + links.length) % links.length
    else if (event.key === 'Home') nextIndex = 0
    else nextIndex = links.length - 1
    links[nextIndex].focus()
  })

  renderChips()
  renderSort()
  renderList()
}
