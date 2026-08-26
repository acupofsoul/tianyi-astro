import { catalog, categories, searchCatalog } from '../catalog'
import { el, clear } from './dom'
import { renderSiteHeader } from './header'

export function renderBrowse(root: HTMLElement, initial: { q: string; cat: string } = { q: '', cat: '' }) {
  document.title = '展品目录 · 知天易'
  clear(root)

  const state = { q: initial.q, cat: initial.cat || '全部' }

  const header = renderSiteHeader({
    query: state.q,
    onInput: (q) => {
      state.q = q
      renderList()
    }
  })
  root.appendChild(header)

  const main = el('main', 'browse-wrap')
  main.innerHTML = `
    <div class="browse-head">
      <h1>展品目录</h1>
      <p>按顺序或按展厅浏览全部 20 个天文展项。</p>
    </div>
  `
  const chips = el('div', 'chips')
  main.appendChild(chips)
  const list = el('ol', 'browse-list')
  main.appendChild(list)
  root.appendChild(main)

  function renderChips() {
    clear(chips)
    const all = ['全部', ...categories]
    for (const c of all) {
      const chip = el('button', 'chip' + (c === state.cat ? ' active' : ''), c)
      chip.addEventListener('click', () => {
        state.cat = c
        renderChips()
        renderList()
      })
      chips.appendChild(chip)
    }
  }

  function renderList() {
    clear(list)
    const items = searchCatalog(state.q, state.cat)
    if (items.length === 0) {
      const empty = el('li', 'browse-empty', '未找到相关展项，换个关键词试试')
      list.appendChild(empty)
      return
    }
    items.forEach((item) => {
      const order = catalog.findIndex((x) => x.id === item.id)
      const li = el('li', 'browse-item')
      li.style.setProperty('--accent', item.accent)
      const a = el('a')
      a.href = '#/p/' + item.id
      a.innerHTML = `
        <span class="b-num">${String(order + 1).padStart(2, '0')}</span>
        <span class="b-emoji">${item.emoji}</span>
        <span class="b-main">
          <span class="b-name">${item.name}</span>
          <span class="b-en">${item.enName}</span>
        </span>
        <span class="b-cat">${item.category}</span>
        <span class="b-summary">${item.summary}</span>
        <span class="b-go">查看 →</span>
      `
      li.appendChild(a)
      list.appendChild(li)
    })
  }

  renderChips()
  renderList()
}
