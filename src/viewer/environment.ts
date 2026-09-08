/**
 * 程序化环境光照（IBL）—— 第三轮迭代 · 真实感渲染。
 *
 * 场景背景是透明的（要让 HUD 背景层透出来），没有可采样的真实环境贴图。
 * 这里用一个极小的「天空盒」场景（深空渐变球 + 几处高亮星光）经
 * PMREMGenerator 预卷积成辐照度贴图，交给 scene.environment：
 *
 * - MeshStandardMaterial 从此有了方向性环境光，低粗糙度表面能反射出
 *   星空与地平渐变，不再是一盏平行光打出来的「塑料感」；
 * - 反射的强度与方向由亮度分布决定，金属/冰面会自然出现环境高光；
 * - 整张图只在第一次需要时生成并缓存，约几毫秒，之后所有场景复用。
 *
 * 之所以不引入 HDR 贴图：项目零外部资源依赖（无网络请求、无二进制素材），
 * 程序化生成既保证离线可用，也便于随主题调整色温。
 */
import * as THREE from 'three'

let cached: THREE.Texture | null = null

/** 生成（或取回缓存的）环境贴图。渲染器销毁后需要重新调用。 */
export function getEnvironmentTexture(renderer: THREE.WebGLRenderer): THREE.Texture | null {
  if (cached) return cached

  let pmrem: THREE.PMREMGenerator | null = null
  try {
    pmrem = new THREE.PMREMGenerator(renderer)

    const scene = new THREE.Scene()

    // 深空底色：天顶偏冷蓝紫，地平偏暗，另加一条偏暖的「银河带」方向光
    const skyGeo = new THREE.SphereGeometry(40, 32, 16)
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uZenith: { value: new THREE.Color(0x0b1430) },
        uHorizon: { value: new THREE.Color(0x03060f) },
        uWarm: { value: new THREE.Color(0x241a2e) }
      },
      vertexShader: [
        'varying vec3 vDir;',
        'void main() {',
        '  vDir = normalize(position);',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uZenith;',
        'uniform vec3 uHorizon;',
        'uniform vec3 uWarm;',
        'varying vec3 vDir;',
        'void main() {',
        '  float up = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);',
        '  vec3 col = mix(uHorizon, uZenith, pow(up, 0.85));',
        '  float band = exp(-pow(vDir.y * 2.6, 2.0));',
        '  float slant = smoothstep(0.15, 1.0, abs(dot(normalize(vDir), vec3(0.55, 0.08, -0.83))));',
        '  col += uWarm * band * (0.35 + 0.65 * slant);',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n')
    })
    scene.add(new THREE.Mesh(skyGeo, skyMat))

    // 几处高亮星：给低粗糙度表面提供有方向的高光来源
    const starGeo = new THREE.PlaneGeometry(1, 1)
    const stars: { dir: [number, number, number]; size: number; color: number; intensity: number }[] = [
      { dir: [0.72, 0.42, 0.55], size: 5.5, color: 0xfff4e0, intensity: 7 },
      { dir: [-0.65, 0.28, 0.7], size: 4.0, color: 0xcfe0ff, intensity: 4 },
      { dir: [0.1, -0.55, 0.83], size: 3.4, color: 0xffd9b0, intensity: 2.5 },
      { dir: [-0.2, 0.9, -0.4], size: 6.5, color: 0xdfe8ff, intensity: 3 }
    ]
    for (const s of stars) {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(s.color).multiplyScalar(s.intensity),
        side: THREE.DoubleSide,
        depthWrite: false
      })
      const mesh = new THREE.Mesh(starGeo, mat)
      const dir = new THREE.Vector3(s.dir[0], s.dir[1], s.dir[2]).normalize()
      mesh.position.copy(dir).multiplyScalar(24)
      mesh.scale.setScalar(s.size)
      mesh.lookAt(0, 0, 0)
      scene.add(mesh)
    }

    cached = pmrem.fromScene(scene, 0.04, 1, 60).texture

    skyGeo.dispose()
    skyMat.dispose()
    starGeo.dispose()
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.material && mesh.material !== skyMat) {
        const m = mesh.material as THREE.Material
        m.dispose()
      }
    })
  } catch {
    cached = null
  } finally {
    pmrem?.dispose()
  }

  return cached
}
