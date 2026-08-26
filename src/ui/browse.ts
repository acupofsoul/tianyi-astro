import { catalog } from '../catalog'
import { el, clear } from './dom'
import { renderSiteHeader } from './header'

export function renderBrowse(root: HTMLElement) {
  document.title = '目录 · 知天易'
  clear(root)
  root.appendChild(renderSiteHeader())

  const main = el('main', 'browse-wrap')
  main.innerHTML = `
    <div class="browse-head">
      <h1>目录</h1>
      <p>按顺序浏览 20 个天体与天文现象；点击任意条目进入对应 3D 场景。</p>
    </div>
  `

  const list = el('ol', 'browse-list')
  catalog.forEach((item, i) => {
    const li = el('li', 'browse-item')
    li.style.setProperty('--accent', item.accent)
    const a = el('a')
    a.href = '#/p/' + item.id
    a.innerHTML = `
      <span class="b-num">${String(i + 1).padStart(2, '0')}</span>
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

  main.appendChild(list)
  root.appendChild(main)

  const footer = el('footer', undefined, '知天易 · 仰望星空，看懂宇宙')
  root.appendChild(footer)
}
