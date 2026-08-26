import { searchCatalog } from '../catalog'
import { el } from './dom'

export function mountSearch(container: HTMLElement, opts?: { query?: string; onInput?: (q: string) => void }) {
  container.innerHTML = `
    <input id="global-search" type="search" placeholder="搜索：黑洞、土星、哈雷彗星、极光…" autocomplete="off" />
    <div class="suggest" id="search-suggest"></div>
  `
  const input = container.querySelector<HTMLInputElement>('#global-search')!
  const suggest = container.querySelector<HTMLElement>('#search-suggest')!
  let q = ''

  function renderSuggest() {
    if (!q.trim()) {
      suggest.classList.remove('open')
      suggest.replaceChildren()
      return
    }
    const items = searchCatalog(q, '全部').slice(0, 6)
    if (items.length === 0) {
      suggest.classList.remove('open')
      suggest.replaceChildren()
      return
    }
    suggest.classList.add('open')
    suggest.replaceChildren()
    for (const item of items) {
      const a = el('a', 'suggest-item')
      a.href = '#/p/' + item.id
      a.innerHTML = `<span class="s-emoji">${item.emoji}</span><span class="s-name">${item.name}</span><span class="s-en">${item.enName}</span>`
      a.addEventListener('mousedown', (e) => {
        e.preventDefault()
        location.hash = '#/p/' + item.id
      })
      suggest.appendChild(a)
    }
  }

  input.addEventListener('input', () => {
    q = input.value
    renderSuggest()
    opts?.onInput?.(q)
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = searchCatalog(q, '全部')[0]
      if (first) location.hash = '#/p/' + first.id
    }
    if (e.key === 'Escape') {
      input.value = ''
      q = ''
      renderSuggest()
      input.blur()
    }
  })
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target as Node)) {
      suggest.classList.remove('open')
      suggest.replaceChildren()
    }
  })

  input.value = opts?.query ?? ''
  q = input.value
  renderSuggest()
}

export function focusGlobalSearch() {
  document.querySelector<HTMLInputElement>('#global-search')?.focus()
}
