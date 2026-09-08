import { astronomyTimeline } from '../history'
import { el, clear } from './dom'
import { renderSiteHeader } from './header'
import { registerCleanup } from './router'
import { prefersReducedMotion } from './ux/html'
import { readPrefs, updatePrefs } from './ux/storage'

export function renderTimeline(root: HTMLElement) {
  document.title = '天文史 · 知天易'
  clear(root)
  root.appendChild(renderSiteHeader())

  const totalEvents = astronomyTimeline.reduce((sum, era) => sum + era.events.length, 0)
  const collapsed = new Set(readPrefs().timelineCollapsed)

  const main = el('main', 'timeline-wrap')
  main.innerHTML = `
    <div class="timeline-head">
      <p class="ux-kicker">CHRONICLE · ${totalEvents} EVENTS</p>
      <h1>天文史</h1>
      <p>从最早的观象记录到韦布望远镜，一条人类认识宇宙的时间线。</p>
    </div>
    <nav class="era-jump" id="era-jump" aria-label="年代快速跳转">
      <span class="hud-label era-jump-label">JUMP</span>
      <div class="era-jump-track"></div>
    </nav>
    <div class="era-list" id="era-list"></div>
  `
  root.appendChild(main)

  const jumpTrack = main.querySelector<HTMLElement>('.era-jump-track')!
  const list = main.querySelector<HTMLElement>('#era-list')!
  const sections: HTMLElement[] = []
  const jumpButtons: HTMLButtonElement[] = []
  const toggleButtons: HTMLButtonElement[] = []
  let currentIndex = -1

  function setCurrent(index: number): void {
    if (index === currentIndex) return
    currentIndex = index
    sections.forEach((section, sectionIndex) => {
      const active = sectionIndex === index
      section.classList.toggle('current', active)
      const button = jumpButtons[sectionIndex]
      if (!button) return
      button.classList.toggle('active', active)
      if (active) button.setAttribute('aria-current', 'true')
      else button.removeAttribute('aria-current')
    })
  }

  astronomyTimeline.forEach((era, index) => {
    const isCollapsed = collapsed.has(era.era)
    const section = el('section', 'era' + (isCollapsed ? ' collapsed' : ''))
    section.id = `era-${index}`
    section.style.setProperty('--era-color', era.color)
    section.dataset.era = era.era

    const heading = el('h2', 'era-heading')
    heading.innerHTML = `
      <button type="button" class="era-head era-toggle" aria-expanded="${isCollapsed ? 'false' : 'true'}" aria-controls="era-${index}-body">
        <span class="era-name">${era.era}</span>
        <span class="era-span">${era.span}</span>
        <span class="era-count hud-label">${era.events.length} EVENTS</span>
        <span class="era-chev" aria-hidden="true">⌄</span>
      </button>
    `
    const toggleButton = heading.querySelector<HTMLButtonElement>('.era-toggle')!

    const body = el('div', 'era-body')
    body.id = `era-${index}-body`
    if (isCollapsed) body.hidden = true

    const events = el('div', 'era-events')
    for (const event of era.events) {
      const node = el('div', 't-event')
      node.innerHTML = `
        <div class="t-year">${event.year}</div>
        <div class="t-body">
          <h3>${event.title}</h3>
          <p>${event.text}</p>
        </div>
      `
      events.appendChild(node)
    }
    body.appendChild(events)
    section.append(heading, body)
    list.appendChild(section)
    sections.push(section)
    toggleButtons.push(toggleButton)

    toggleButton.addEventListener('click', () => {
      const nextCollapsed = !body.hidden
      body.hidden = nextCollapsed
      section.classList.toggle('collapsed', nextCollapsed)
      toggleButton.setAttribute('aria-expanded', nextCollapsed ? 'false' : 'true')
      if (nextCollapsed) collapsed.add(era.era)
      else collapsed.delete(era.era)
      updatePrefs({ timelineCollapsed: [...collapsed] })
    })

    const jumpButton = el('button', 'era-jump-btn')
    jumpButton.type = 'button'
    jumpButton.dataset.index = String(index)
    jumpButton.innerHTML = `
      <span class="era-jump-dot" aria-hidden="true"></span>
      <span class="era-jump-name">${era.era}</span>
      <span class="era-jump-span">${era.span}</span>
    `
    jumpButton.addEventListener('click', () => {
      if (body.hidden) toggleButton.click()
      setCurrent(index)
      section.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    })
    jumpTrack.appendChild(jumpButton)
    jumpButtons.push(jumpButton)
  })

  // 滚动时高亮当前年代；优先使用 IntersectionObserver，失败时退回 scroll 计算。
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry
        }
        if (!best) return
        const index = sections.indexOf(best.target as HTMLElement)
        if (index >= 0) setCurrent(index)
      },
      { root: main, rootMargin: '-16% 0px -64% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    sections.forEach((section) => observer.observe(section))
    registerCleanup(() => observer.disconnect())
  } else {
    const onScroll = (): void => {
      const top = main.getBoundingClientRect().top
      let nearest = 0
      let nearestDistance = Number.POSITIVE_INFINITY
      sections.forEach((section, index) => {
        const distance = Math.abs(section.getBoundingClientRect().top - top)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearest = index
        }
      })
      setCurrent(nearest)
    }
    main.addEventListener('scroll', onScroll, { passive: true })
    registerCleanup(() => main.removeEventListener('scroll', onScroll))
    onScroll()
  }

  setCurrent(0)

  const footer = el('footer', undefined, '知天易 · 仰望星空，看懂宇宙')
  root.appendChild(footer)
}
