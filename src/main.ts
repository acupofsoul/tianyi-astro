import './style.css'
import './styles/tokens.css'
import './styles/hud.css'
import './styles/viz.css'
import './styles/viewer.css'
import './styles/detail.css'
import './styles/ux.css'
import { startRouter } from './ui/router'
import { attachHudBackground } from './fx/hudBackground'

const app = document.getElementById('app')
if (!app) throw new Error('#app not found')

// 全局 HUD 背景层（工作流 E 交付）：fixed 宿主 + Canvas 2D，
// 位于全屏 3D canvas 之上、正文之下，pointer-events:none，不参与交互。
const hudBg = attachHudBackground({ opacity: 0.55 })

// HMR 时先卸载旧实例，避免多层 Canvas 叠加。
if (import.meta.hot) {
  import.meta.hot.dispose(() => hudBg.dispose())
}

startRouter(app)
