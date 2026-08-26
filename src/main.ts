import './style.css'
import { startRouter } from './ui/router'

const app = document.getElementById('app')
if (!app) throw new Error('#app not found')
startRouter(app)
