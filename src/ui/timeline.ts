import { astronomyTimeline } from '../history'
import { el, clear } from './dom'
import { renderSiteHeader } from './header'

export function renderTimeline(root: HTMLElement) {
  document.title = '天文史 · 知天易'
  clear(root)
  root.appendChild(renderSiteHeader())

  const main = el('main', 'timeline-wrap')
  main.innerHTML = `
    <div class="timeline-head">
      <h1>天文史</h1>
      <p>从最早的观象记录到韦布望远镜，一条人类认识宇宙的时间线。</p>
    </div>
  `

  for (const era of astronomyTimeline) {
    const section = el('section', 'era')
    section.style.setProperty('--era-color', era.color)
    section.innerHTML = `
      <div class="era-head">
        <span class="era-name">${era.era}</span>
        <span class="era-span">${era.span}</span>
      </div>
    `
    const events = el('div', 'era-events')
    for (const ev of era.events) {
      const node = el('div', 't-event')
      node.innerHTML = `
        <div class="t-year">${ev.year}</div>
        <div class="t-body">
          <h3>${ev.title}</h3>
          <p>${ev.text}</p>
        </div>
      `
      events.appendChild(node)
    }
    section.appendChild(events)
    main.appendChild(section)
  }

  root.appendChild(main)

  const footer = el('footer', undefined, '知天易 · 仰望星空，看懂宇宙')
  root.appendChild(footer)
}
