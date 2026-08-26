import { Viewer } from '../viewer'
import { buildStarfieldScene } from '../scenes'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { renderSiteHeader } from './header'

export function renderHome(root: HTMLElement) {
  document.title = '知天易'
  clear(root)

  root.appendChild(renderSiteHeader())

  const opening = el('main', 'opening')
  opening.innerHTML = `
    <div id="opening-bg" class="opening-bg"></div>
    <div class="opening-inner">
      <h1 class="opening-title"><span>知</span><span>天</span><span>易</span></h1>
      <div class="opening-line"></div>
      <a href="#/p/solar-system" class="btn-primary opening-btn">开始观影</a>
    </div>
  `
  root.appendChild(opening)

  const bg = opening.querySelector<HTMLElement>('#opening-bg')!
  const viewer = new Viewer(bg, false)
  viewer.load(buildStarfieldScene())
  viewer.start()
  registerCleanup(() => viewer.dispose())
}
