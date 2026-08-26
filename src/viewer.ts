import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { SceneHandle } from './scenes'

export class Viewer {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls | null
  private clock = new THREE.Clock()
  private handle: SceneHandle | null = null
  private raf = 0
  private container: HTMLElement
  private ro: ResizeObserver

  constructor(container: HTMLElement, interactive = true) {
    this.container = container
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth || 1, container.clientHeight || 1)
    container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(
      55,
      (container.clientWidth || 1) / (container.clientHeight || 1),
      0.1,
      800
    )
    this.camera.position.set(0, 1, 5)

    if (interactive) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.08
      this.controls.minDistance = 0.5
      this.controls.maxDistance = 200
    } else {
      this.controls = null
    }

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const dir = new THREE.DirectionalLight(0xffffff, 1.4)
    dir.position.set(6, 9, 7)
    this.scene.add(dir)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)
  }

  load(handle: SceneHandle) {
    if (this.handle) {
      this.scene.remove(this.handle.group)
      this.handle.dispose?.()
    }
    this.handle = handle
    this.scene.add(handle.group)
    const pos = handle.camera?.position ?? [0, 1, 5]
    const target = handle.camera?.target ?? [0, 0, 0]
    this.camera.position.set(pos[0], pos[1], pos[2])
    this.camera.lookAt(target[0], target[1], target[2])
    if (this.controls) {
      this.controls.target.set(target[0], target[1], target[2])
      this.controls.autoRotate = !!handle.autoRotate
      if (handle.autoRotateSpeed) this.controls.autoRotateSpeed = handle.autoRotateSpeed
      if (handle.minDistance) this.controls.minDistance = handle.minDistance
      if (handle.maxDistance) this.controls.maxDistance = handle.maxDistance
      this.controls.update()
    }
  }

  setAutoRotate(on: boolean) {
    if (this.controls) {
      this.controls.autoRotate = on
      this.controls.update()
    }
  }

  isAutoRotate(): boolean {
    return !!this.controls?.autoRotate
  }

  resetView() {
    if (!this.handle) return
    const pos = this.handle.camera?.position ?? [0, 1, 5]
    const target = this.handle.camera?.target ?? [0, 0, 0]
    this.camera.position.set(pos[0], pos[1], pos[2])
    this.camera.lookAt(target[0], target[1], target[2])
    if (this.controls) {
      this.controls.target.set(target[0], target[1], target[2])
      this.controls.update()
    }
  }

  start() {
    this.clock.start()
    const loop = () => {
      const dt = Math.min(this.clock.getDelta(), 0.1)
      const t = this.clock.elapsedTime
      this.handle?.update?.(t, dt)
      this.controls?.update()
      this.renderer.render(this.scene, this.camera)
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    cancelAnimationFrame(this.raf)
  }

  resize() {
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  dispose() {
    this.stop()
    this.ro.disconnect()
    this.renderer.dispose()
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement)
    }
  }
}
