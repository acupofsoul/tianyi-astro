import { SpacetimeCanvas } from '../fx/spacetime'
import { catalog } from '../catalog'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { renderSiteHeader } from './header'
import { mountSearch } from './search'

export function renderHome(root: HTMLElement) {
  document.title = '知天易'
  clear(root)

  root.appendChild(renderSiteHeader())

  const home = el('main', 'home')
  home.innerHTML = `
    <div id="spacetime-bg" class="spacetime-bg"></div>
    <div class="home-content">
      <h1 class="home-title">知天易</h1>
      <div class="home-search" id="home-search"></div>
      <div class="home-actions">
        <a href="#/p/solar-system" class="btn-primary">开始观影</a>
        <a href="#/browse" class="btn-ghost">打开目录</a>
        <button class="btn-ghost" id="random-btn">随机一件</button>
      </div>
    </div>
  `
  root.appendChild(home)

  const bg = home.querySelector<HTMLElement>('#spacetime-bg')!
  const fx = new SpacetimeCanvas(bg)
  fx.start()
  registerCleanup(() => fx.dispose())

  mountSearch(home.querySelector<HTMLElement>('#home-search')!, { inputId: 'home-search' })

  home.querySelector<HTMLButtonElement>('#random-btn')!.addEventListener('click', () => {
    const item = catalog[Math.floor(Math.random() * catalog.length)]
    location.hash = '#/p/' + item.id
  })
}
