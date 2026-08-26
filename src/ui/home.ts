import { Viewer } from '../viewer'
import { buildStarfieldScene } from '../scenes'
import { catalog } from '../catalog'
import { el, clear } from './dom'
import { registerCleanup } from './router'
import { renderSiteHeader } from './header'

const halls = [
  ['01', '太阳系厅', '行星轨道与真实公转', '#/browse?cat=太阳系'],
  ['02', '行星厅', '八大行星与矮行星', '#/browse?cat=行星'],
  ['03', '卫星厅', '月球与潮汐锁定', '#/browse?cat=卫星'],
  ['04', '矮行星厅', '柯伊伯带与冥王星', '#/browse?cat=矮行星'],
  ['05', '深空厅', '黑洞、星云与星系', '#/browse?cat=深空天体'],
  ['06', '奇观现象厅', '彗星、日食、极光、超新星', '#/browse?cat=天文现象'],
  ['07', '天文史', '人类认识宇宙的历程', '#/timeline'],
  ['08', '展品总目录', '按顺序浏览 20 个展项', '#/browse']
]

export function renderHome(root: HTMLElement) {
  document.title = '知天易 · 天文博物馆'
  clear(root)

  root.appendChild(renderSiteHeader())

  const landing = el('main', 'landing')
  landing.innerHTML = `
    <div id="landing-bg" class="landing-bg"></div>
    <div class="landing-inner">
      <div class="landing-copy">
        <p class="kicker">知天易 · 天文博物馆</p>
        <h1>看见宇宙<br>的运行</h1>
        <p class="sub">20 个可旋转、可缩放、可交互的 3D 天文展项，附科学原理与历史时间轴。</p>
        <div class="landing-actions">
          <a href="#/browse" class="btn-primary">从目录开始</a>
          <a href="#/timeline" class="btn-ghost">天文史</a>
          <button class="btn-ghost" id="random-btn">随机看一个</button>
        </div>
      </div>
      <nav class="hall-panel">
        ${halls.map(([num, title, desc, href]) => `
          <a class="hall-card" href="${href}">
            <span class="hall-num">${num}</span>
            <span class="hall-title">${title}</span>
            <span class="hall-desc">${desc}</span>
          </a>
        `).join('')}
      </nav>
    </div>
  `
  root.appendChild(landing)

  const bg = landing.querySelector<HTMLElement>('#landing-bg')!
  const viewer = new Viewer(bg, false)
  viewer.load(buildStarfieldScene())
  viewer.start()
  registerCleanup(() => viewer.dispose())

  landing.querySelector<HTMLButtonElement>('#random-btn')!.addEventListener('click', () => {
    const item = catalog[Math.floor(Math.random() * catalog.length)]
    location.hash = '#/p/' + item.id
  })
}
