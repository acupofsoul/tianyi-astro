/**
 * 相关天体推荐（工作流 C）：同分类或同场景的 3 个条目。
 * 只读 catalog，不新增数据。
 */
import { catalog } from '../../catalog'
import type { CatalogEntry } from '../../types'
import { el } from '../dom'

export function pickRelated(entry: CatalogEntry, count = 3): CatalogEntry[] {
  const scored = catalog
    .filter((x) => x.id !== entry.id)
    .map((x) => {
      let score = 0
      if (x.category === entry.category) score += 2
      if (x.scene === entry.scene) score += 3
      return { x, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, count).map((s) => s.x)
}

export function createRelated(entry: CatalogEntry): HTMLElement | null {
  const items = pickRelated(entry)
  if (items.length === 0) return null

  const wrap = el('section', 'dt-related')
  const head = el('div', 'dt-related-head')
  head.appendChild(el('h3', 'dt-related-title', '相关天体'))
  head.appendChild(el('span', 'hud-label dt-related-tag', 'NEARBY'))
  wrap.appendChild(head)

  const list = el('div', 'dt-related-list')
  for (const item of items) {
    const a = el('a', 'dt-rel-card')
    a.href = '#/p/' + item.id
    a.setAttribute('aria-label', item.name + '，' + item.category)
    const emoji = el('span', 'dt-rel-emoji', item.emoji)
    emoji.setAttribute('aria-hidden', 'true')
    const body = el('span', 'dt-rel-body')
    body.appendChild(el('span', 'dt-rel-name', item.name))
    body.appendChild(el('span', 'dt-rel-meta', item.category + ' · ' + item.enName))
    const arrow = el('span', 'dt-rel-arrow', '›')
    arrow.setAttribute('aria-hidden', 'true')
    a.appendChild(emoji)
    a.appendChild(body)
    a.appendChild(arrow)
    list.appendChild(a)
  }
  wrap.appendChild(list)
  return wrap
}
