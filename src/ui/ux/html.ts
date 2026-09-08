/** 工作流 D 的小型 HTML 工具：转义 + 搜索关键词高亮。 */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const REGEXP_SPECIALS = '.*+?^${}()|[]' + String.fromCharCode(92)
const BACKSLASH = String.fromCharCode(92)

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char)
}

function escapeRegExp(value: string): string {
  let escaped = ''
  for (const char of value) {
    escaped += REGEXP_SPECIALS.includes(char) ? BACKSLASH + char : char
  }
  return escaped
}

/**
 * 在纯文本中高亮 query 的所有关键词，返回已转义的 HTML 片段。
 * 支持空格分隔的多个关键词，大小写不敏感。
 */
export function highlight(text: string, query: string): string {
  const keyword = query.trim()
  if (!keyword) return escapeHtml(text)
  const parts = keyword
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp)
  if (parts.length === 0) return escapeHtml(text)

  const pattern = new RegExp(`(${parts.join('|')})`, 'gi')
  let result = ''
  let lastIndex = 0
  let match = pattern.exec(text)
  while (match !== null) {
    result += escapeHtml(text.slice(lastIndex, match.index))
    result += `<mark class="s-hit">${escapeHtml(match[0])}</mark>`
    lastIndex = match.index + match[0].length
    if (pattern.lastIndex === match.index) pattern.lastIndex += 1
    match = pattern.exec(text)
  }
  result += escapeHtml(text.slice(lastIndex))
  return result
}

export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
