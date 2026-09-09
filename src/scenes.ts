import * as THREE from 'three'
import {
  fbm,
  mulberry32,
  rockyTexture,
  gasTexture,
  venusTexture,
  earthTexture,
  moonTexture,
  sunTexture,
  cloudTexture,
  ringTexture,
  glowTexture,
  circleTexture,
  particleTexture
} from './textures'
import type { CatalogEntry, SceneKind } from './types'
import { earthRoughnessTexture, rockyNormalTexture } from './textures/relief'
import type { SceneLabelAnchor, SceneMeta, SceneOverlays, SceneScaleRef } from './scenes/types'
import {
  disposeObject3D,
  makeCraterTexture,
  makeLabelOverlay,
  makePickProxy,
  makeScaleOverlay,
  makeSurfaceSpot,
  markPick,
  normalFromLatLon,
  normalFromUv,
  placeSurfaceSpot
} from './scenes/props'

export interface SceneHandle {
  group: THREE.Group
  update?: (t: number, dt: number) => void
  dispose?: () => void
  camera?: { position: [number, number, number]; target?: [number, number, number] }
  autoRotate?: boolean
  autoRotateSpeed?: number
  minDistance?: number
  maxDistance?: number
  /** 场景类型，用于视角预设微调（工作流 B 新增可选字段）。 */
  kind?: SceneKind
  /** 主体半径（世界单位），用于"近观"机位与拾取阈值。 */
  subjectRadius?: number
  /** 场景整体半径（世界单位），用于俯视 / 侧视取景。 */
  boundsRadius?: number
  /** 主体中心（世界坐标），默认 [0,0,0]。 */
  subjectCenter?: [number, number, number]
  /**
   * 建议曝光（ACES 影调映射的 toneMappingExposure 倍数）。
   * 亮表面天体（月球、太阳）需要压暗，暗弱天体（星云、彗尾）需要提亮。
   * 未设置时用 Viewer 的默认值。
   */
  exposure?: number
  /** 比例尺参考球。 */
  scaleRef?: SceneScaleRef
  /** 天体标签锚点。 */
  labelAnchors?: SceneLabelAnchor[]
  /** 可开关的可视化辅助层。 */
  overlays?: SceneOverlays
}

export interface PlanetParams {
  kind: 'rocky' | 'gas' | 'earth' | 'ice' | 'venus'
  radius?: number
  seed?: number
  axialTilt?: number
  rotationSpeed?: number
  rings?: { inner: number; outer: number; seed?: number; tilt?: number; colors: string[]; gaps?: [number, number][] }
  atmosphere?: string
  atmosphereOpacity?: number
  cloud?: boolean
  land?: string[]
  ocean?: string
  polar?: boolean
  craters?: number
  darkPatches?: number
  darkColor?: string
  brightPatches?: number
  brightColor?: string
  gasColors?: string[]
  gasSpot?: { x: number; y: number; rx: number; ry: number; color: string }
  /** 拾取 / 标签用的中文名（由 buildSceneFor 注入）。 */
  name?: string
  /** 比例尺参考球说明（真实直径，含单位与近似程度）。 */
  scaleLabel?: string
  /** 环的拾取名，例如"土星环"。 */
  ringName?: string
  /** 表面斑点的拾取名，例如"大红斑"。 */
  spotName?: string
  /** 让斑点初始朝向相机的自转相位（弧度），用于预设截图时可见。 */
  spotFacing?: number
}

// ------------------------------------------------------------------ shared
// 拾取标记统一用 markPick()（内部写入 userData.pickName，见 src/scenes/props.ts）。
// 各 build*Scene 里共 39 处标记，覆盖太阳光球/日冕、行星特征、土星环、黑洞吸积盘/光子环/事件视界、
// 彗核/离子尾/尘埃尾、月球陨石坑、流星雨辐射点、极光分层等。

export function makeStarfield(count = 1400): THREE.Points {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)
  // 恒星颜色按光谱型抽样（黑体色近似），亮度按星等幂律分布：
  // 绝大多数是暗星、极少数是亮星，夜空才有真实的层次感，
  // 而不是一片亮度均匀的白点。约三成恒星聚集在银河带附近。
  const SPECTRAL: { w: number; r: number; g: number; b: number }[] = [
    { w: 0.03, r: 0.62, g: 0.74, b: 1.0 }, // B 型：蓝白
    { w: 0.06, r: 0.8, g: 0.86, b: 1.0 }, // A 型：白
    { w: 0.13, r: 0.96, g: 0.97, b: 1.0 }, // F 型：黄白
    { w: 0.22, r: 1.0, g: 0.95, b: 0.84 }, // G 型：黄
    { w: 0.25, r: 1.0, g: 0.82, b: 0.63 }, // K 型：橙
    { w: 0.31, r: 1.0, g: 0.68, b: 0.52 } // M 型：红
  ]
  const rng = mulberry32(20240915)
  const dir = new THREE.Vector3()
  const bandNormal = new THREE.Vector3(0.34, 0.82, -0.46).normalize()
  for (let i = 0; i < count; i++) {
    const inBand = rng() < 0.3
    dir.randomDirection()
    if (inBand) {
      // 去掉沿银河带法线的分量 → 落到大圆上，再加一点厚度
      dir.addScaledVector(bandNormal, -dir.dot(bandNormal))
      if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0)
      dir.normalize()
      dir.addScaledVector(bandNormal, (rng() - 0.5) * 0.22).normalize()
    }
    const dist = 140 + rng() * 120
    positions[i * 3] = dir.x * dist
    positions[i * 3 + 1] = dir.y * dist
    positions[i * 3 + 2] = dir.z * dist

    let pick = rng()
    let c = SPECTRAL[SPECTRAL.length - 1]
    for (const s of SPECTRAL) {
      pick -= s.w
      if (pick <= 0) {
        c = s
        break
      }
    }
    const mag = Math.pow(rng(), 2.6)
    const b = 0.18 + mag * 0.95
    colors[i * 3] = c.r * b
    colors[i * 3 + 1] = c.g * b
    colors[i * 3 + 2] = c.b * b
    sizes[i] = 0.45 + Math.pow(rng(), 2.0) * 2.4
    phases[i] = rng()
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1))

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMap: { value: particleTexture() }
    },
    vertexShader: `
      attribute float size;
      attribute float phase;
      uniform float uTime;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vColor = color;
        vTwinkle = 0.5 + 0.5 * sin(uTime * (0.6 + phase * 2.2) + phase * 6.2831);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (180.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        gl_FragColor = vec4(vColor, tex.a * (0.55 + 0.45 * vTwinkle));
      }
    `,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  })
  ;(mat as unknown as { userData: Record<string, unknown> }).userData.twinkle = true
  return new THREE.Points(geo, mat)
}

function makeGlowSprite(color: string, size: number, opacity = 1): THREE.Sprite {
  const mat = new THREE.SpriteMaterial({
    map: glowTexture(color),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  const s = new THREE.Sprite(mat)
  s.scale.setScalar(size)
  return s
}

function makeCircleSprite(color: string, size: number, opacity = 1): THREE.Sprite {
  const mat = new THREE.SpriteMaterial({
    map: circleTexture(color),
    transparent: true,
    opacity,
    depthWrite: false
  })
  const s = new THREE.Sprite(mat)
  s.scale.setScalar(size)
  return s
}

function makeAtmosphere(radius: number, color: string, intensity = 0.5): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, 48, 48)
  const mat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = pow(1.0 - abs(dot(vNormal, vView)), 2.6);
        gl_FragColor = vec4(uColor, rim * uIntensity);
      }
    `,
    uniforms: { uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity } },
    transparent: true,
    depthWrite: false
  })
  return new THREE.Mesh(geo, mat)
}

function makeRings(
  inner: number,
  outer: number,
  seed: number,
  colors: string[],
  tiltDeg = 0,
  gaps: [number, number][] = [],
  texSize = 512
): THREE.Mesh {
  const geo = new THREE.RingGeometry(inner, outer, 128, 1)
  const mat = new THREE.MeshBasicMaterial({
    map: ringTexture(inner, outer, seed, colors, gaps, texSize),
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.rotation.x = -Math.PI / 2 + THREE.MathUtils.degToRad(tiltDeg)
  return mesh
}

function defaultCamera(r: number): SceneHandle['camera'] {
  return { position: [r * 2.2, r * 0.9, r * 2.7], target: [0, 0, 0] }
}

/**
 * 收尾装饰（可重复调用）：
 * 设置场景类型与默认尺度字段、用真实条目数据覆盖比例尺说明、
 * 按 labelAnchors / scaleRef 重建标签与参考球层，并挂上 dispose。
 */
export function decorateScene(handle: SceneHandle, kind?: SceneKind, meta?: SceneMeta): SceneHandle {
  if (kind) handle.kind = kind
  if (meta?.scaleLabel && handle.scaleRef) handle.scaleRef.label = meta.scaleLabel
  if (meta?.labelAnchors) handle.labelAnchors = meta.labelAnchors
  if (!handle.subjectCenter) handle.subjectCenter = [0, 0, 0]
  if (!handle.subjectRadius) handle.subjectRadius = handle.boundsRadius ?? 1
  if (!handle.boundsRadius) handle.boundsRadius = handle.subjectRadius * 3

  const previous = handle.overlays
  const overlays: SceneOverlays = {}
  if (previous?.orbits) overlays.orbits = previous.orbits
  if (previous?.labels) {
    handle.group.remove(previous.labels)
    disposeObject3D(previous.labels)
  }
  if (previous?.scale) {
    handle.group.remove(previous.scale)
    disposeObject3D(previous.scale)
  }
  if (handle.labelAnchors && handle.labelAnchors.length > 0) {
    const labels = makeLabelOverlay(handle.labelAnchors)
    handle.group.add(labels)
    overlays.labels = labels
  }
  if (handle.scaleRef) {
    const scale = makeScaleOverlay(handle.scaleRef)
    handle.group.add(scale)
    overlays.scale = scale
  }
  handle.overlays = overlays
  if (!handle.dispose) handle.dispose = () => disposeObject3D(handle.group)
  return handle
}

// ------------------------------------------------------------------- scene builders

export function buildStarfieldScene(): SceneHandle {
  const group = new THREE.Group()
  group.add(makeStarfield(1400))
  return decorateScene({
    group,
    update: (_t, dt) => {
      group.rotation.y += dt * 0.012
      group.rotation.x += dt * 0.004
    },
    camera: { position: [0, 1.5, 6] },
    autoRotate: false,
    subjectRadius: 3,
    boundsRadius: 10
  })
}

export function buildPlanetScene(p: PlanetParams): SceneHandle {
  const radius = p.radius ?? 1
  const seed = p.seed ?? 1
  const group = new THREE.Group()
  const tilt = new THREE.Group()
  tilt.rotation.z = THREE.MathUtils.degToRad(p.axialTilt ?? 0)
  group.add(tilt)

  let map: THREE.Texture
  if (p.kind === 'venus') {
    map = venusTexture(seed)
  } else if (p.kind === 'earth') {
    map = earthTexture(seed)
  } else if (p.kind === 'gas') {
    map = gasTexture(seed, p.gasColors ?? ['#e6c9a0', '#c08a5e', '#a86b4a', '#f0e2c8'], { spot: p.gasSpot })
  } else if (p.kind === 'ice') {
    map = gasTexture(seed, p.gasColors ?? ['#9ad9e8', '#7ec8dd', '#cdeef5'], { spot: p.gasSpot })
  } else {
    map = rockyTexture(seed, {
      land: p.land ?? ['#a89070', '#8a7358', '#c0a88a', '#7a5f45', '#d8c8ac'],
      ocean: p.ocean,
      polar: p.polar ?? false,
      craters: p.craters ?? 0,
      darkPatches: p.darkPatches,
      darkColor: p.darkColor,
      brightPatches: p.brightPatches,
      brightColor: p.brightColor
    })
  }
  // 岩石 / 地球：与反照率同源的法线贴图（频率与种子对齐），斜射光下有真实起伏；
  // 地球另加粗糙度贴图，让海洋出现太阳镜面反射。
  const solid = p.kind !== 'gas' && p.kind !== 'ice' && p.kind !== 'venus'
  const normalMap = solid
    ? rockyNormalTexture({
        seed,
        size: 256,
        strength: p.kind === 'earth' ? 2.6 : 3.4,
        craters: p.craters ?? 0,
        frequency: 5
      })
    : null
  const mat = new THREE.MeshStandardMaterial({
    map,
    roughness: p.kind === 'earth' ? 0.92 : solid ? 1 : 0.58,
    metalness: 0,
    normalMap: normalMap ?? undefined,
    normalScale: normalMap ? new THREE.Vector2(1.25, 1.25) : undefined
  })
  if (p.kind === 'earth') mat.roughnessMap = earthRoughnessTexture(seed, 256)
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 64), mat)
  markPick(mesh, p.name ?? '行星')
  if (p.gasSpot) {
    // 让斑点初始朝向相机，否则默认机位可能看到的是背面。
    mesh.rotation.y = p.spotFacing ?? (seed === 55 ? 4.145 : seed === 88 ? 0.279 : 0)
  }
  tilt.add(mesh)

  if (p.gasSpot) {
    const spot = makeSurfaceSpot({
      radius,
      color: p.gasSpot.color,
      name: p.spotName ?? (p.kind === 'gas' ? '大红斑' : '大暗斑'),
      opacity: 0.88
    })
    const normal = normalFromUv(p.gasSpot.x, p.gasSpot.y, new THREE.Vector3())
    placeSurfaceSpot(
      spot,
      radius,
      normal,
      p.gasSpot.rx * Math.PI * 2 * radius,
      p.gasSpot.ry * Math.PI * radius
    )
    mesh.add(spot)
  }
  if (p.cloud) {
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture(seed + 5),
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    })
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.015, 48, 48), cloudMat)
    markPick(clouds, '云层')
    tilt.add(clouds)
  }
  if (p.atmosphere) {
    const atmosphere = makeAtmosphere(radius * 1.05, p.atmosphere, p.atmosphereOpacity ?? 0.55)
    markPick(atmosphere, '大气层')
    tilt.add(atmosphere)
  }
  if (p.rings) {
    const rings = makeRings(p.rings.inner, p.rings.outer, p.rings.seed ?? seed, p.rings.colors, p.rings.tilt ?? 0, p.rings.gaps)
    markPick(rings, p.ringName ?? '行星环')
    group.add(rings)
  }
  group.add(makeStarfield(900))

  const rot = p.rotationSpeed ?? 0.12
  const subjectRadius = p.rings ? p.rings.outer : radius
  return decorateScene({
    group,
    update: (_t, dt) => {
      mesh.rotation.y += dt * rot
    },
    camera: defaultCamera(radius),
    minDistance: radius * 1.5,
    maxDistance: radius * 8,
    subjectRadius,
    boundsRadius: p.rings ? p.rings.outer * 2.4 : radius * 3.2,
    labelAnchors: [{ name: p.name ?? '行星', position: [0, radius * 1.5, 0] }],
    scaleRef: {
      radius,
      label: p.scaleLabel ?? '参考球：球径 = 场景主体半径（真实直径见数据面板，形状与比例示意）',
      position: [subjectRadius * 1.8, -radius * 1.2, 0]
    }
  }, 'planet')
}
export function buildSunScene(): SceneHandle {
  const group = new THREE.Group()
  const mat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.1;
          a *= 0.5;
        }
        return v;
      }
      void main() {
        // 太阳光球：米粒组织（对流胞）叠加多尺度湍流
        vec2 uv = vUv * 10.0;
        float gran = fbm(uv + vec2(uTime * 0.06, uTime * 0.03));
        float gran2 = fbm(uv * 2.4 - vec2(uTime * 0.05, 0.0) + gran * 1.4);
        vec3 cold = vec3(0.85, 0.30, 0.05);
        vec3 warm = vec3(1.0, 0.58, 0.16);
        vec3 hot = vec3(1.0, 0.88, 0.50);
        vec3 col = mix(cold, warm, smoothstep(0.30, 0.68, gran));
        col = mix(col, hot, smoothstep(0.62, 0.92, gran2));

        // 黑子：较冷（暗）的强磁区，缓慢演化
        vec2 sp = vec2(0.30 + 0.20 * sin(uTime * 0.05), 0.58 + 0.08 * cos(uTime * 0.07));
        float sd = length((vUv - sp) * vec2(3.2, 7.0));
        float penumbra = 1.0 - smoothstep(0.02, 0.35, sd);
        col *= 1.0 - 0.55 * penumbra;

        // 临边昏暗：光球边缘比中心暗（真实太阳的重要特征）
        float r = length(vUv - 0.5) * 2.0;
        float limb = 1.0 - 0.62 * pow(r, 2.8);
        col *= limb;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    uniforms: { uTime: { value: 0 } }
  })
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.4, 64, 64), mat)
  markPick(sun, '光球层')
  group.add(sun)

  const corona = new THREE.Points(
    new THREE.SphereGeometry(1.62, 48, 24),
    new THREE.PointsMaterial({
      size: 0.2,
      map: particleTexture(),
      color: 0xffa040,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  )
  markPick(corona, '日冕')
  group.add(corona)

  const glow1 = makeGlowSprite('#ff8c1a', 5.2, 0.5)
  const glow2 = makeGlowSprite('#ffb84d', 9, 0.2)
  markPick(glow1, '日冕辉光')
  markPick(glow2, '日冕辉光')
  group.add(glow1, glow2)

  // 太阳黑子：位置与着色器里的 sp 同步演化，作为可拾取的实体标记。
  const sunspot = makeSurfaceSpot({ radius: 1.4, color: '#3a1a08', name: '太阳黑子', opacity: 0.72 })
  const sunspotNormal = new THREE.Vector3()
  const sunspotHalfW = 0.109 * Math.PI * 2 * 1.4
  const sunspotHalfH = 0.05 * Math.PI * 1.4
  sun.add(sunspot)

  group.add(makeStarfield(900))

  return decorateScene({
    group,
    update: (t, dt) => {
      mat.uniforms.uTime.value = t
      sun.rotation.y += dt * 0.06
      corona.rotation.y += dt * 0.02
      corona.rotation.x += dt * 0.008
      glow1.scale.setScalar(5.2 * (1 + 0.04 * Math.sin(t * 1.6)))
      const su = 0.3 + 0.2 * Math.sin(t * 0.05)
      const sv = 0.58 + 0.08 * Math.cos(t * 0.07)
      normalFromUv(su, sv, sunspotNormal)
      placeSurfaceSpot(sunspot, 1.4, sunspotNormal, sunspotHalfW, sunspotHalfH)
    },
    camera: { position: [0, 1.2, 5.8] },
    minDistance: 2,
    maxDistance: 14,
    subjectRadius: 1.4,
    boundsRadius: 6,
    labelAnchors: [
      { name: '光球层', position: [0, 0, 0] },
      { name: '日冕', position: [0, 2.1, 0] },
      { name: '太阳黑子', position: [0.9, 0.7, 1.1] }
    ],
    scaleRef: {
      radius: 1.4,
      label: '参考球：太阳半径约 69.6 万 km（光球层，形状与比例示意）',
      position: [3.4, -1.4, 0]
    }
  }, 'sun')
}
export function buildMoonScene(): SceneHandle {
  const group = new THREE.Group()
  // 月面法线贴图：与 moonTexture(9) 同种子、同频率、同陨石坑随机序列，
  // 环形山的凹陷与颜色变暗落在同一处。
  const mat = new THREE.MeshStandardMaterial({
    map: moonTexture(9),
    roughness: 1,
    metalness: 0,
    normalMap: rockyNormalTexture({
      seed: 9,
      size: 256,
      strength: 4.2,
      craters: 90,
      frequency: 6,
      craterSeed: 9 * 104729 + 7,
      craterRadius: [0.015, 0.1]
    }),
    normalScale: new THREE.Vector2(1.35, 1.35)
  })
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), mat)
  // 让月球正面（经度约 0° 的一侧）初始朝向相机，便于看到并点击主要地貌。
  moon.rotation.y = -Math.PI / 2
  markPick(moon, '月球')
  group.add(moon)

  // 陨石坑 / 月海标记：位置参考真实经纬度，大小与形状为示意（已放大以便拾取）。
  const craterTex = makeCraterTexture()
  const features: { lat: number; lon: number; size: number; name: string; mare: boolean }[] = [
    { lat: -43.3, lon: -11.4, size: 0.085, name: '第谷环形山', mare: false },
    { lat: 9.6, lon: -20.1, size: 0.07, name: '哥白尼环形山', mare: false },
    { lat: 8.1, lon: -38.0, size: 0.055, name: '开普勒环形山', mare: false },
    { lat: 8.5, lon: 31.4, size: 0.16, name: '静海', mare: true },
    { lat: 18.4, lon: -57.4, size: 0.22, name: '风暴洋', mare: true },
    { lat: 17.0, lon: 59.1, size: 0.12, name: '危海', mare: true }
  ]
  const anchors: SceneLabelAnchor[] = [{ name: '月球', position: [0, 1.35, 0] }]
  const normal = new THREE.Vector3()
  for (const f of features) {
    const spot = makeSurfaceSpot({
      radius: 1,
      color: f.mare ? '#8f949c' : '#c9ccd4',
      name: f.name,
      opacity: f.mare ? 0.72 : 0.85,
      map: craterTex
    })
    normalFromLatLon(f.lat, f.lon, normal)
    placeSurfaceSpot(spot, 1, normal, f.size, f.size)
    moon.add(spot)
    anchors.push({ name: f.name, position: [normal.x * 1.08, normal.y * 1.08, normal.z * 1.08] })
  }

  group.add(makeStarfield(1000))
  return decorateScene({
    group,
    update: (_t, dt) => {
      moon.rotation.y += dt * 0.05
    },
    camera: { position: [0, 0.9, 3.8] },
    minDistance: 1.6,
    maxDistance: 10,
    subjectRadius: 1,
    boundsRadius: 4,
    // 月面反照率偏高（约 0.12 但相对星空极亮），按场景压曝光，
    // 让向阳面保留灰阶层次而不是一片纯白
    exposure: 0.55,
    labelAnchors: anchors,
    scaleRef: {
      radius: 1,
      label: '参考球：月球半径约 1,737 km（直径 3,474 km，形状与比例示意）',
      position: [2.4, -1.1, 0]
    }
  }, 'moon')
}

export function buildBlackholeScene(): SceneHandle {
  const group = new THREE.Group()
  group.add(makeStarfield(1800))

  // 引力透镜光路：在始终朝向相机的平面上做带光线弯曲的步进。
  // 用史瓦西弯曲近似重现「星际穿越」式吸积盘：正面盘横贯身前，
  // 背面盘被引力弯到阴影上下方，形成一圈亮环（光子环贴住阴影边缘）。
  const lensMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec3 vWorldPos;
      uniform float uTime;

      #define RS 1.0
      #define R_IN 3.0
      #define R_OUT 12.0
      #define MAX_STEPS 240

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      vec3 diskColor(float r, vec2 xz, float dop) {
        float rad = clamp((r - R_IN) / (R_OUT - R_IN), 0.0, 1.0);
        vec3 inner = vec3(1.0, 0.94, 0.86);
        vec3 mid = vec3(1.0, 0.55, 0.15);
        vec3 outer = vec3(0.38, 0.06, 0.02);
        vec3 col = mix(inner, mid, smoothstep(0.0, 0.34, rad));
        col = mix(col, outer, smoothstep(0.34, 1.0, rad));
        float ang = atan(xz.y, xz.x);
        float n = noise(vec2(r * 4.5, ang * 6.0) + vec2(uTime * 0.22, uTime * 0.14));
        col *= 0.68 + 0.64 * n;
        col *= dop;
        return col;
      }

      void main() {
        vec3 ro = cameraPosition;
        vec3 rd = normalize(vWorldPos - ro);
        vec3 p = ro;
        vec3 dir = rd;
        float minDist = 1e9;
        vec3 col = vec3(0.0);
        float alpha = 0.0;

        for (int i = 0; i < MAX_STEPS; i++) {
          float d = length(p);
          if (d < RS) {
            gl_FragColor = vec4(vec3(0.0), 1.0);
            return;
          }
          if (d > 70.0) break;
          minDist = min(minDist, d);

          vec3 prev = p;
          float step = clamp(0.035 * d, 0.012, 0.4);
          vec3 rhat = p / d;
          vec3 acc = -0.5 * rhat / (d * d);
          dir = normalize(dir + acc * step * 1.6);
          p += dir * step;

          // 穿过吸积盘平面（y=0）时取样
          if (prev.y * p.y < 0.0) {
            float f = prev.y / (prev.y - p.y);
            vec3 cross = mix(prev, p, f);
            float r = length(cross.xz);
            if (r > R_IN && r < R_OUT) {
              vec3 tang = normalize(vec3(-cross.z, 0.0, cross.x));
              float dop = clamp(1.0 + 1.1 * dot(tang, -dir), 0.15, 2.1);
              col = diskColor(r, cross.xz, dop);
              alpha = 1.0;
              break;
            }
          }
        }

        // 光子环：贴着阴影边缘的一圈细亮环
        float ring = exp(-pow((minDist - 2.62) / 0.07, 2.0));
        col += vec3(1.0, 0.9, 0.75) * ring * 1.5;
        alpha = max(alpha, ring * 0.95);

        // 阴影外的微弱暖色晕
        float glow = exp(-pow(minDist / 7.0, 3.0)) * 0.06;
        col += vec3(1.0, 0.62, 0.3) * glow;
        alpha = max(alpha, glow);

        if (alpha <= 0.001) discard;
        gl_FragColor = vec4(col, alpha);
      }
    `,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  })

  const lens = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), lensMat)
  lens.onBeforeRender = (_renderer: THREE.WebGLRenderer, _scene: THREE.Scene, camera: THREE.Camera) => {
    lens.lookAt(camera.position)
  }
  group.add(lens)

  // ---- 拾取代理（visible=false 不参与绘制，但 Raycaster 仍能命中）----
  // 事件视界：半径 1 Rs 的球体，位于阴影中心。
  group.add(makePickProxy(new THREE.SphereGeometry(1, 24, 16), '事件视界'))
  // 阴影盘（约 2.6 Rs）与光子环做成 lens 的子物体，随 lens 一起朝向相机，贴合屏幕上的视觉环。
  lens.add(makePickProxy(new THREE.CircleGeometry(2.6, 64), '事件视界阴影'))
  lens.add(makePickProxy(new THREE.TorusGeometry(2.62, 0.1, 8, 96), '光子环'))
  // 吸积盘：世界坐标 y=0 平面上的环带，内缘 ISCO ≈ 3 Rs，外缘 12 Rs（示意）。
  group.add(makePickProxy(new THREE.RingGeometry(3, 12, 96), '吸积盘', undefined, [-Math.PI / 2, 0, 0]))

  return decorateScene({
    group,
    update: (t) => {
      lensMat.uniforms.uTime.value = t
    },
    camera: { position: [0, 4.6, 19], target: [0, 0, 0] },
    minDistance: 4,
    maxDistance: 60,
    subjectRadius: 12,
    boundsRadius: 26,
    labelAnchors: [
      { name: '事件视界', position: [0, 0, 0] },
      { name: '光子环', position: [2.62, 0, 0] },
      { name: '吸积盘', position: [7, 0, 0] }
    ],
    scaleRef: {
      radius: 1,
      label: '参考球：1 Rs（史瓦西半径；事件视界半径 = 2GM/c²，示意）',
      position: [0, -2.6, 0]
    }
  }, 'blackhole')
}

export function buildCometScene(): SceneHandle {
  const group = new THREE.Group()
  const rng = mulberry32(2024)
  const nucleusGeo = new THREE.IcosahedronGeometry(0.5, 3)
  const npos = nucleusGeo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < npos.count; i++) {
    const v = new THREE.Vector3(npos.getX(i), npos.getY(i), npos.getZ(i))
    v.normalize().multiplyScalar(0.5 + rng() * 0.09)
    npos.setXYZ(i, v.x, v.y, v.z)
  }
  nucleusGeo.computeVertexNormals()
  const nucleus = new THREE.Mesh(
    nucleusGeo,
    new THREE.MeshStandardMaterial({ color: 0x9a9aa2, roughness: 1 })
  )
  markPick(nucleus, '彗核')
  group.add(nucleus)

  const coma = makeGlowSprite('#bff3ff', 3.2, 0.35)
  markPick(coma, '彗发')
  group.add(coma)

  // 尘埃尾：宽、黄白、沿轨道向后弯曲（太阳风/辐射压作用下滞后）
  const dustPos = new Float32Array(700 * 3)
  const dustCol = new Float32Array(700 * 3)
  for (let i = 0; i < 700; i++) {
    const t = Math.pow(rng(), 1.7)
    const x = -(0.7 + t * 14)
    const s = t * 3.4 * (0.25 + rng() * 0.75)
    const lag = 0.045 * x * x
    dustPos[i * 3] = x
    dustPos[i * 3 + 1] = (rng() - 0.5) * s + lag
    dustPos[i * 3 + 2] = (rng() - 0.5) * s
    const mix = t
    dustCol[i * 3] = 1
    dustCol[i * 3 + 1] = 0.94 - mix * 0.4
    dustCol[i * 3 + 2] = 0.86 - mix * 0.55
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  dustGeo.setAttribute('color', new THREE.BufferAttribute(dustCol, 3))
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      size: 0.18,
      map: particleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  )
  markPick(dust, '尘埃尾')
  group.add(dust)

  // 离子尾：窄、偏蓝、沿太阳风方向几乎笔直背离太阳（此处太阳在 +X 方向）
  const ionPos = new Float32Array(460 * 3)
  const ionCol = new Float32Array(460 * 3)
  for (let i = 0; i < 460; i++) {
    const t = Math.pow(rng(), 1.9)
    const x = -(0.8 + t * 19)
    const s = t * 0.85
    ionPos[i * 3] = x
    ionPos[i * 3 + 1] = (rng() - 0.5) * s * 1.6
    ionPos[i * 3 + 2] = (rng() - 0.5) * s
    ionCol[i * 3] = 0.55 + t * 0.3
    ionCol[i * 3 + 1] = 0.75 + t * 0.2
    ionCol[i * 3 + 2] = 1
  }
  const ionGeo = new THREE.BufferGeometry()
  ionGeo.setAttribute('position', new THREE.BufferAttribute(ionPos, 3))
  ionGeo.setAttribute('color', new THREE.BufferAttribute(ionCol, 3))
  const ion = new THREE.Points(
    ionGeo,
    new THREE.PointsMaterial({
      size: 0.13,
      map: particleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  )
  markPick(ion, '离子尾')
  group.add(ion)

  // 太阳方向指示（示意光源方向）
  const sunLight = makeGlowSprite('#fff2c8', 2.4, 0.5)
  sunLight.position.x = 9
  markPick(sunLight, '太阳方向（示意）')
  group.add(sunLight)
  group.add(makeStarfield(900))

  return decorateScene({
    group,
    update: (t, dt) => {
      nucleus.rotation.y += dt * 0.25
      nucleus.rotation.x += dt * 0.12
      coma.scale.setScalar(3.2 * (1 + 0.06 * Math.sin(t * 1.8)))
    },
    camera: { position: [0, 2.2, 7.5] },
    minDistance: 1.8,
    maxDistance: 22,
    subjectRadius: 12,
    boundsRadius: 26,
    labelAnchors: [
      { name: '彗核', position: [0, 0, 0] },
      { name: '彗发', position: [0, 0.8, 0] },
      { name: '尘埃尾', position: [-8, 1.6, 0] },
      { name: '离子尾', position: [-9, 0, 0] },
      { name: '太阳方向', position: [9, 0.6, 0] }
    ],
    scaleRef: {
      radius: 0.5,
      label: '参考球：彗核半径约 7.5 km（哈雷彗核约 15×8×8 km，形状不规则，示意）',
      position: [2.8, -1.5, 0]
    }
  }, 'comet')
}

export interface NebulaCloud {
  color: string
  pos: [number, number, number]
  scale: [number, number]
  opacity: number
  rot: number
}

export interface NebulaParams {
  seed?: number
  count?: number
  /** 气体粒子配色（发射线近似色） */
  palette?: [number, number, number][]
  /** 三轴半径，用于改变星云整体形态 */
  extent?: [number, number, number]
  /** 弥散气体层（正常混合的柔和光斑） */
  clouds?: NebulaCloud[]
  coreColor?: string
  hiiColor?: string
  pointSize?: number
  pointOpacity?: number
  exposure?: number
  subjectRadius?: number
  boundsRadius?: number
  camera?: [number, number, number]
  scaleLabel?: string
  anchors?: SceneLabelAnchor[]
}

const DEFAULT_NEBULA_PALETTE: [number, number, number][] = [
  [255, 107, 157],
  [123, 107, 255],
  [62, 198, 255],
  [255, 209, 102],
  [255, 255, 255],
  [200, 120, 255]
]

const DEFAULT_NEBULA_CLOUDS: NebulaCloud[] = [
  { color: '#a82b52', pos: [0.2, 0.1, 0], scale: [13, 7.8], opacity: 0.55, rot: 0.18 },
  { color: '#4a3a9e', pos: [1.9, 0.8, -1.0], scale: [9.5, 5.8], opacity: 0.45, rot: -0.42 },
  { color: '#1f6e8c', pos: [-2.3, -0.7, 0.8], scale: [8.2, 4.9], opacity: 0.4, rot: 0.55 },
  { color: '#8a5a1e', pos: [0.8, -1.2, 1.5], scale: [6, 3.6], opacity: 0.32, rot: -0.2 },
  { color: '#6a3a9e', pos: [-1.4, 1.3, -1.6], scale: [6.8, 4], opacity: 0.36, rot: 0.9 }
]

export function buildNebulaScene(p: NebulaParams = {}): SceneHandle {
  const group = new THREE.Group()
  const count = p.count ?? 2600
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const rng = mulberry32(p.seed ?? 777)
  const pal = p.palette ?? DEFAULT_NEBULA_PALETTE
  const [extX, extY, extZ] = p.extent ?? [8, 4.5, 5.5]
  for (let i = 0; i < count; i++) {
    // 方向由 rng 生成（而不是 Math.random），保证同一展项每次加载形态一致
    const theta = rng() * Math.PI * 2
    const z = rng() * 2 - 1
    const s = Math.sqrt(1 - z * z)
    const r = Math.pow(rng(), 0.55)
    positions[i * 3] = Math.cos(theta) * s * r * extX
    positions[i * 3 + 1] = z * r * extY
    positions[i * 3 + 2] = Math.sin(theta) * s * r * extZ
    const c = pal[Math.floor(rng() * pal.length)]
    // 亮度整体压低：加性混合下密集区域很容易被 ACES 压成纯白
    const b = 0.2 + rng() * 0.45
    colors[i * 3] = (c[0] / 255) * b
    colors[i * 3 + 1] = (c[1] / 255) * b
    colors[i * 3 + 2] = (c[2] / 255) * b
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: p.pointSize ?? 0.3,
      map: particleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: p.pointOpacity ?? 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  )
  markPick(points, '星云气体')
  group.add(points)
  const nebulaCore = makeGlowSprite(p.coreColor ?? '#a8c8ff', 7, 0.2)
  const nebulaHii = makeGlowSprite(p.hiiColor ?? '#ff9dd2', 4, 0.16)
  markPick(nebulaCore, '星云核心')
  markPick(nebulaHii, '恒星形成区')
  group.add(nebulaCore, nebulaHii)

  // 弥散气体层：几片大尺度柔和光斑，把「一堆点」变成有层次的云雾。
  // 颜色对应真实发射线：Hα 红、O III 青、反射星云蓝紫。
  const clouds = p.clouds ?? DEFAULT_NEBULA_CLOUDS
  for (const c of clouds) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(c.color),
        transparent: true,
        opacity: c.opacity,
        // 正常混合而非加性：叠加只会在最亮处趋于上限，不会无限堆爆
        blending: THREE.NormalBlending,
        depthWrite: false
      })
    )
    sprite.position.set(c.pos[0], c.pos[1], c.pos[2])
    sprite.scale.set(c.scale[0], c.scale[1], 1)
    sprite.material.rotation = c.rot
    group.add(sprite)
  }
  group.add(makeStarfield(900))

  return decorateScene({
    group,
    update: (_t, dt) => {
      group.rotation.y += dt * 0.018
      group.rotation.x += dt * 0.006
    },
    camera: { position: p.camera ?? [0, 1.7, 12.5] },
    autoRotate: true,
    autoRotateSpeed: 0.5,
    minDistance: 3,
    maxDistance: 30,
    subjectRadius: p.subjectRadius ?? 5,
    boundsRadius: p.boundsRadius ?? 14,
    labelAnchors: p.anchors ?? [
      { name: '星云核心', position: [0, 0, 0] },
      { name: '分子云', position: [3.2, 1.2, 2.0] }
    ],
    scaleRef: {
      radius: 1,
      label: p.scaleLabel ?? '参考球：1 世界单位（猎户座星云直径约 24 光年，形态为艺术化示意）',
      position: [0, -2.6, 0]
    },
    // 星云整体偏暗，且加性混合容易在核心堆积，略降曝光保住层次
    exposure: p.exposure ?? 0.92
  }, 'nebula')
}

export interface GalaxyParams {
  seed?: number
  count?: number
  /** 旋臂数量（银河系为 2 条主旋臂） */
  arms?: number
  /** 中央棒半长轴与厚度 */
  bar?: { length: number; thickness: number }
  /** 盘面半径缩放 */
  radiusScale?: number
  /** 旋臂缠绕紧密度 */
  winding?: number
  /** 旋臂配色（年轻蓝星 / 老年黄白星）；省略时用银河系的蓝白旋臂 */
  armColors?: { young: [number, number, number]; old: [number, number, number] }
  /** 核球亮度基数 */
  coreBrightness?: number
  coreColor?: string
  coreGlow?: { scale: number; opacity: number }
  /** 盘面倾角（弧度），用于呈现倾斜视角 */
  tilt?: number
  exposure?: number
  subjectRadius?: number
  boundsRadius?: number
  scaleLabel?: string
  anchors?: SceneLabelAnchor[]
}

export function buildGalaxyScene(p: GalaxyParams = {}): SceneHandle {
  const group = new THREE.Group()
  const count = p.count ?? 9500
  const arms = p.arms ?? 2
  const radiusScale = p.radiusScale ?? 1
  const barLength = p.bar?.length ?? 2.6
  const barThickness = p.bar?.thickness ?? 0.38
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const rng = mulberry32(p.seed ?? 314)

  for (let i = 0; i < count; i++) {
    // 中央棒结构：银河系是棒旋星系，核心为延展的棒
    if (i < count * 0.28) {
      const bx = (rng() - 0.5) * barLength
      const by = (rng() - 0.5) * barThickness
      const bz = (rng() - 0.5) * barThickness
      positions[i * 3] = bx
      positions[i * 3 + 1] = by
      positions[i * 3 + 2] = bz
      // 核球粒子最密集，亮度压低才不会在加性混合下糊成一片纯白
      const b = (p.coreBrightness ?? 0.3) + rng() * 0.3
      colors[i * 3] = 1 * b
      colors[i * 3 + 1] = 0.88 * b
      colors[i * 3 + 2] = 0.68 * b
      continue
    }
    const arm = i % arms
    const t = i / count
    const r = (0.9 + 4.8 * Math.pow(t, 0.75)) * radiusScale
    const theta = r * (p.winding ?? 1.05) + (arm / arms) * Math.PI * 2 + (rng() - 0.5) * 0.3
    const spread = 0.22 * (0.25 + r * 0.3)
    positions[i * 3] = Math.cos(theta) * r + (rng() - 0.5) * spread
    positions[i * 3 + 1] = (rng() - 0.5) * (0.16 + r * 0.12)
    positions[i * 3 + 2] = Math.sin(theta) * r + (rng() - 0.5) * spread

    const b = 0.5 + rng() * 0.5
    if (p.armColors) {
      // 按年轻/老年星族比例混合（仙女座旋臂偏白，恒星形成活动较弱）
      const w = rng()
      const young = p.armColors.young
      const old = p.armColors.old
      colors[i * 3] = (old[0] + (young[0] - old[0]) * w) * b
      colors[i * 3 + 1] = (old[1] + (young[1] - old[1]) * w) * b
      colors[i * 3 + 2] = (old[2] + (young[2] - old[2]) * w) * b
    } else if (r < 1.4) {
      colors[i * 3] = 1 * b
      colors[i * 3 + 1] = 0.9 * b
      colors[i * 3 + 2] = 0.72 * b
    } else {
      // 旋臂以年轻蓝色恒星为主，外缘含粉红恒星形成区
      const blue = 0.6 + rng() * 0.4
      colors[i * 3] = 0.45 + rng() * 0.25
      colors[i * 3 + 1] = 0.6 * b
      colors[i * 3 + 2] = blue * b
    }
  }
  // 倾斜视角：绕 x 轴倾斜盘面，配合自转得到斜看星系的效果
  group.rotation.x = p.tilt ?? 0
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.2,
      map: particleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  )
  markPick(points, '银河系盘面')
  group.add(points)
  // 银心：加性光斑叠在上万粒子上极易糊成白团，因此压到很低的强度
  const galacticCore = makeGlowSprite(
    p.coreColor ?? '#ffe9b0',
    p.coreGlow?.scale ?? 2.6,
    p.coreGlow?.opacity ?? 0.24
  )
  markPick(galacticCore, '银心')
  group.add(galacticCore)
  group.add(makeStarfield(800))

  return decorateScene({
    group,
    update: (_t, dt) => {
      group.rotation.y += dt * 0.05
    },
    camera: { position: [0, 7.5, 11] },
    autoRotate: true,
    autoRotateSpeed: 0.6,
    minDistance: 3,
    maxDistance: 30,
    subjectRadius: p.subjectRadius ?? 5.7,
    boundsRadius: p.boundsRadius ?? 16,
    labelAnchors: p.anchors ?? [
      { name: '银心', position: [0, 0, 0] },
      { name: '旋臂', position: [4.2, 0, 0] },
      { name: '棒状核心', position: [1.4, 0, 0] }
    ],
    scaleRef: {
      radius: 1,
      label: p.scaleLabel ?? '参考球：1 世界单位（盘面半径约 5.7 单位；银河系直径约 10~18 万光年，非等比示意）',
      position: [0, -2.2, 0]
    },
    // 上万粒子叠加，核心最密处需要压曝光才不糊成白团
    exposure: p.exposure ?? 0.82
  }, 'galaxy')
}

export function buildMeteorScene(): SceneHandle {
  const group = new THREE.Group()
  group.add(makeStarfield(1000))
  const N = 42
  interface Meteor {
    pos: THREE.Vector3
    dir: THREE.Vector3
    tail: THREE.Vector3
    speed: number
    age: number
    life: number
    head: THREE.Sprite
    line: THREE.Line
    lineMat: THREE.LineBasicMaterial
    headMat: THREE.SpriteMaterial
  }
  const meteors: Meteor[] = []
  const headTex = glowTexture('#fff3c0')
  // 辐射点：所有流星的轨迹反向延长后交汇于此。
  // 方向经过调整，使默认机位（0,2.2,13）能把辐射点收进视野，便于点击。
  const radiant = new THREE.Vector3(0.35, 0.15, -0.25).normalize()
  const radPos = radiant.clone().multiplyScalar(30)
  const spawnOffset = new THREE.Vector3()
  const spawnJitter = new THREE.Vector3()

  function spawn(m: Meteor) {
    m.pos.copy(radPos).add(spawnOffset.randomDirection().multiplyScalar(4.5))
    m.dir
      .copy(radiant)
      .multiplyScalar(-1)
      .add(spawnJitter.randomDirection().multiplyScalar(0.16))
      .normalize()
    m.speed = 20 + Math.random() * 14
    m.age = 0
    m.life = 1.5 + Math.random() * 1.6
  }

  for (let i = 0; i < N; i++) {
    const headMat = new THREE.SpriteMaterial({
      map: headTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const head = new THREE.Sprite(headMat)
    head.scale.setScalar(0.5)
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xfff3c0,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const line = new THREE.Line(lineGeo, lineMat)
    const m: Meteor = {
      pos: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      tail: new THREE.Vector3(),
      speed: 20,
      age: 0,
      life: 2,
      head,
      line,
      lineMat,
      headMat
    }
    spawn(m)
    meteors.push(m)
    group.add(head, line)
  }

  // 辐射点标记：可见的小光点 + 拾取名，方便在场景里定位。
  const radiantMarker = makeGlowSprite('#ffd166', 2.4, 0.8)
  radiantMarker.position.copy(radPos)
  markPick(radiantMarker, '辐射点')
  group.add(radiantMarker)

  return decorateScene({
    group,
    update: (_t, dt) => {
      for (const m of meteors) {
        m.pos.addScaledVector(m.dir, m.speed * dt)
        m.age += dt
        const fade = 1 - m.age / m.life
        const len = 1.3 + m.speed * 0.05
        m.tail.copy(m.pos).addScaledVector(m.dir, -len)
        const attr = m.line.geometry.attributes.position as THREE.BufferAttribute
        attr.setXYZ(0, m.pos.x, m.pos.y, m.pos.z)
        attr.setXYZ(1, m.tail.x, m.tail.y, m.tail.z)
        attr.needsUpdate = true
        m.head.position.copy(m.pos)
        m.headMat.opacity = Math.max(0, fade)
        m.lineMat.opacity = Math.max(0, fade * 0.9)
        if (m.age > m.life || m.pos.length() < 6) spawn(m)
      }
    },
    camera: { position: [0, 2.2, 13] },
    minDistance: 4,
    maxDistance: 30,
    subjectRadius: 6,
    boundsRadius: 24,
    labelAnchors: [{ name: '辐射点', position: [radPos.x, radPos.y, radPos.z] }],
    scaleRef: {
      radius: 1,
      label: '参考球：1 世界单位（流星典型高度约 80~120 km，场景为示意）',
      position: [0, -2.2, 0]
    }
  }, 'meteor')
}

export function buildEclipseScene(): SceneHandle {
  const group = new THREE.Group()
  group.add(makeStarfield(900))

  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd27a })
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.1, 48, 48), sunMat)
  sun.position.x = -9
  markPick(sun, '太阳光球')
  group.add(sun)
  const sunGlow = makeGlowSprite('#ffc46b', 6, 0.7)
  sunGlow.position.x = -9
  markPick(sunGlow, '日冕辉光')
  group.add(sunGlow)

  // 日冕：全食时太阳光球被遮挡，日冕才清晰可见
  const corona = makeGlowSprite('#fff6e0', 4.4, 0.12)
  corona.position.x = -9
  markPick(corona, '日冕')
  group.add(corona)

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 48, 48),
    new THREE.MeshStandardMaterial({ map: earthTexture(5), roughness: 1 })
  )
  markPick(earth, '地球')
  group.add(earth)
  const earthAtmo = makeAtmosphere(0.63, '#4a9df8', 0.5)
  markPick(earthAtmo, '地球大气层')
  group.add(earthAtmo)

  const moonPivot = new THREE.Group()
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 32, 32),
    new THREE.MeshStandardMaterial({ map: moonTexture(3), roughness: 1 })
  )
  moon.position.x = 1.8
  markPick(moon, '月球')
  moonPivot.add(moon)
  group.add(moonPivot)

  // 地球表面的本影斑
  const shadow = makeCircleSprite('#000000', 0.3, 0)
  markPick(shadow, '月影斑')
  group.add(shadow)

  // 月球背后的本影锥：全食带由月影扫过地表形成
  const umbraMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide
  })
  const umbra = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.8, 32, 1, true), umbraMat)
  markPick(umbra, '月球本影锥')
  group.add(umbra)

  const light = new THREE.DirectionalLight(0xfff2d0, 2)
  light.position.set(-9, 1.5, 1)
  group.add(light)

  let angle = 0
  const moonPos = new THREE.Vector3()
  const dirToEarth = new THREE.Vector3()
  const upAxis = new THREE.Vector3(0, 1, 0)
  return decorateScene({
    group,
    update: (_t, dt) => {
      angle += dt * 0.42
      moonPivot.rotation.z = angle
      const moonX = Math.cos(angle) * 1.8
      const moonY = Math.sin(angle) * 1.8
      moon.position.set(moonX, moonY, 0)
      const alignment = Math.abs(Math.sin(angle))
      const inFront = Math.cos(angle) > 0
      const amt = inFront ? Math.max(0, 1 - alignment / 0.3) : 0

      sunMat.color.setHSL(0.09, 0.85, 0.62 - amt * 0.5)
      sunGlow.material.opacity = 0.7 - amt * 0.55
      corona.material.opacity = 0.12 + amt * 0.75
      shadow.position.set(0.28, 0, 0)
      shadow.material.opacity = amt * 0.9

      moonPos.set(moonX, moonY, 0)
      dirToEarth.copy(moonPos).negate().normalize()
      umbra.position.copy(moonPos).addScaledVector(dirToEarth, 0.9)
      umbra.quaternion.setFromUnitVectors(upAxis, dirToEarth)
      umbraMat.opacity = amt * 0.4
    },
    camera: { position: [4.6, 3.4, 8.6] },
    minDistance: 2,
    maxDistance: 24,
    subjectRadius: 4,
    boundsRadius: 16,
    labelAnchors: [
      { name: '太阳', position: [-9, 1.7, 0] },
      { name: '日冕', position: [-9, 0, 0] },
      { name: '地球', position: [0, 1.1, 0] },
      { name: '月球', position: [0, 0, 0] },
      { name: '本影锥', position: [0, 0, 0] }
    ],
    scaleRef: {
      radius: 1.1,
      label: '参考球：太阳半径约 69.6 万 km（日食几何为示意，非等比）',
      position: [0, -2.2, 0]
    }
  }, 'eclipse')
}

export function buildAuroraScene(): SceneHandle {
  const group = new THREE.Group()
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 48, 32),
    new THREE.MeshStandardMaterial({ color: 0x0c1a30, roughness: 0.6, emissive: 0x02060f })
  )
  planet.position.y = -1.9
  markPick(planet, '行星夜面')
  group.add(planet)

  const auroraMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.1;
          a *= 0.5;
        }
        return v;
      }
      void main() {
        vec2 uv = vUv;
        float n = fbm(vec2(uv.x * 3.0 + uTime * 0.18, uv.y * 5.0 + sin(uTime * 0.4) * 0.6));
        float curtain = smoothstep(0.4, 0.78, n);
        float mask = smoothstep(0.0, 0.22, uv.y) * (1.0 - smoothstep(0.82, 0.98, uv.y));
        float wavy = 0.6 + 0.4 * sin(uv.x * 6.0 + uTime * 0.9);

        // 极光颜色随高度分层：低层氮分子呈蓝/紫，中层氧原子呈绿，高层氧原子呈红
        float h = uv.y;
        vec3 blue = vec3(0.45, 0.50, 1.0);
        vec3 green = vec3(0.2, 1.0, 0.55);
        vec3 red = vec3(1.0, 0.22, 0.38);
        vec3 col = mix(blue, green, smoothstep(0.12, 0.42, h));
        col = mix(col, red, smoothstep(0.58, 0.88, h));
        float alpha = curtain * mask * wavy * 0.9;
        gl_FragColor = vec4(col, alpha);
      }
    `,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const aurora = new THREE.Mesh(new THREE.PlaneGeometry(30, 12, 96, 48), auroraMat)
  aurora.position.y = 2.1
  aurora.rotation.x = -0.12
  markPick(aurora, '极光帘幕')
  group.add(aurora)

  // 极光分层拾取代理：按 shader 里的高度色带切成三段薄盒，
  // visible=false 不参与绘制，但能按点击高度命中对应层。
  const layers: { y: number; h: number; name: string }[] = [
    { y: -0.1, h: 1.8, name: '极光·蓝紫层（氮）' },
    { y: 2.1, h: 1.8, name: '极光·绿色层（氧）' },
    { y: 4.6, h: 2.4, name: '极光·红色层（氧）' }
  ]
  for (const layer of layers) {
    group.add(makePickProxy(new THREE.BoxGeometry(30, layer.h, 0.3), layer.name, [0, layer.y, 0], [-0.12, 0, 0]))
  }
  group.add(makeStarfield(1000))

  return decorateScene({
    group,
    update: (t, _dt) => {
      auroraMat.uniforms.uTime.value = t
    },
    camera: { position: [0, 1.4, 8.8] },
    minDistance: 2.5,
    maxDistance: 26,
    subjectRadius: 6,
    boundsRadius: 18,
    labelAnchors: [
      { name: '极光·蓝紫层（氮）', position: [0, -0.1, 0] },
      { name: '极光·绿色层（氧）', position: [0, 2.1, 0] },
      { name: '极光·红色层（氧）', position: [0, 4.6, 0] }
    ],
    scaleRef: {
      radius: 1,
      label: '参考球：1 世界单位（极光高度约 100~300 km，场景为示意）',
      position: [0, -3.4, 0]
    }
  }, 'aurora')
}

export function buildSupernovaScene(): SceneHandle {
  const group = new THREE.Group()
  const rng = mulberry32(99)
  const dirs1: THREE.Vector3[] = []
  for (let i = 0; i < 900; i++) dirs1.push(new THREE.Vector3().randomDirection())
  const dirs2: THREE.Vector3[] = []
  for (let i = 0; i < 700; i++) dirs2.push(new THREE.Vector3().randomDirection())

  function shell(dirs: THREE.Vector3[], color: number, size: number) {
    const positions = new Float32Array(dirs.length * 3)
    dirs.forEach((d, i) => {
      positions[i * 3] = d.x
      positions[i * 3 + 1] = d.y
      positions[i * 3 + 2] = d.z
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      size,
      map: particleTexture(),
      color,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const pts = new THREE.Points(geo, mat)
    pts.scale.setScalar(0.5)
    group.add(pts)
    return { pts, mat }
  }

  const s1 = shell(dirs1, 0xffc48a, 0.16)
  const s2 = shell(dirs2, 0x8fb3ff, 0.12)
  markPick(s1.pts, '抛射物外壳（暖色）')
  markPick(s2.pts, '抛射物外壳（蓝色）')

  const core = makeGlowSprite('#ffffff', 1.4, 1)
  markPick(core, '前身星核心')
  group.add(core)
  const flash = makeGlowSprite('#ffe9c0', 5, 0.9)
  markPick(flash, '爆炸闪光')
  group.add(flash)

  // 爆后遗迹：中子星（脉冲星）留在中心
  const pulsar = makeGlowSprite('#bfe9ff', 0.5, 0)
  markPick(pulsar, '中子星遗迹')
  group.add(pulsar)
  group.add(makeStarfield(900))

  const T = 8
  return decorateScene({
    group,
    update: (t, _dt) => {
      const p = (t % T) / T
      const r1 = 0.4 + p * 7
      const r2 = 0.4 + p * 9
      s1.pts.scale.setScalar(r1)
      s2.pts.scale.setScalar(r2)
      s1.mat.opacity = p < 0.12 ? p / 0.12 : Math.max(0, 1 - (p - 0.12) / 0.88) * 0.85
      s2.mat.opacity = p < 0.22 ? 0 : Math.max(0, 1 - (p - 0.22) / 0.78) * 0.7
      core.scale.setScalar(1.2 + p * 2.4)
      core.material.opacity = Math.max(0, 1 - p * 1.6)
      flash.scale.setScalar(4 + p * 16)
      flash.material.opacity = p < 0.08 ? p / 0.08 : Math.max(0, 1 - p) * 0.7
      // 中子星在抛射物散开后显现，并快速脉冲
      const appear = Math.min(1, Math.max(0, (p - 0.55) / 0.15))
      pulsar.material.opacity = appear
      pulsar.scale.setScalar(0.5 + 0.12 * Math.sin(t * 22) * appear)
    },
    camera: { position: [0, 0.4, 9.5] },
    minDistance: 2.5,
    maxDistance: 30,
    subjectRadius: 4,
    boundsRadius: 16,
    labelAnchors: [
      { name: '爆炸抛射物', position: [0, 0, 0] },
      { name: '中子星遗迹', position: [0, 0, 0] }
    ],
    scaleRef: {
      radius: 1,
      label: '参考球：1 世界单位（抛射速度约 1 万 km/s，场景为示意）',
      position: [0, -2.2, 0]
    }
  }, 'supernova')
}

// ---------------------------------------------------------------- 脉冲星 --
/**
 * 脉冲星：快速自转、高度磁化的中子星。
 * 视觉要点：磁轴与自转轴不重合（约 28°），射束沿磁轴射出，
 * 自转时扫过视线方向 → 观测到周期性脉冲（灯塔效应）。
 */
export function buildPulsarScene(): SceneHandle {
  const group = new THREE.Group()
  group.add(makeStarfield(1500))

  const spin = new THREE.Group()
  const magnetic = new THREE.Group()
  magnetic.rotation.z = THREE.MathUtils.degToRad(28)
  spin.add(magnetic)
  group.add(spin)

  // 中子星：直径约 20 km，却有 1.4 倍太阳质量
  const starMat = new THREE.MeshBasicMaterial({ color: 0xdfefff })
  const star = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), starMat)
  markPick(star, '中子星')
  magnetic.add(star)
  const starGlow = makeGlowSprite('#cfe8ff', 1.5, 0.5)
  markPick(starGlow, '中子星辐射')
  magnetic.add(starGlow)

  // 磁轴（虚线）
  const axis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -2.1, 0), new THREE.Vector3(0, 2.1, 0)]),
    new THREE.LineDashedMaterial({
      color: 0x8fd0ff,
      dashSize: 0.1,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.55
    })
  )
  axis.computeLineDistances()
  markPick(axis, '磁轴')
  magnetic.add(axis)

  // 双极射束
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x8fe0ff,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  for (const sign of [1, -1]) {
    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.62, 3.4, 36, 1, true), beamMat)
    beam.position.y = sign * 1.7
    if (sign < 0) beam.rotation.z = Math.PI
    markPick(beam, sign > 0 ? '北极射束' : '南极射束')
    magnetic.add(beam)
  }

  // 磁力线：偶极场 r = r₀·sin²θ 的示意
  const fieldMat = new THREE.LineBasicMaterial({ color: 0x5fb8ff, transparent: true, opacity: 0.2 })
  for (let i = 0; i < 10; i++) {
    const lon = (i / 10) * Math.PI * 2
    const pts: THREE.Vector3[] = []
    for (let k = 0; k <= 28; k++) {
      const theta = 0.14 + (k / 28) * (Math.PI - 0.28)
      const r = 0.5 + 1.7 * Math.sin(theta) * Math.sin(theta)
      pts.push(
        new THREE.Vector3(
          Math.sin(theta) * Math.cos(lon) * r,
          Math.cos(theta) * r,
          Math.sin(theta) * Math.sin(lon) * r
        )
      )
    }
    magnetic.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), fieldMat))
  }

  // 自转轴（世界竖直，不随自转旋转）
  group.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -2.4, 0), new THREE.Vector3(0, 2.4, 0)]),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 })
    )
  )

  const bright = new THREE.Color(0xdfefff)
  const dim = new THREE.Color(0x5c7a97)
  const spinSpeed = 2.2

  return decorateScene(
    {
      group,
      update: (t, dt) => {
        spin.rotation.y += dt * spinSpeed
        // 真实脉冲周期 1.4 ms ~ 8.5 s，这里放慢到肉眼可读；
        // 指数让脉冲尖锐（射束扫过视线时才亮）
        const phase = (t * spinSpeed) % (Math.PI * 2)
        const pulse = Math.pow(Math.abs(Math.cos(phase * 0.5)), 8)
        starMat.color.copy(dim).lerp(bright, 0.3 + 0.7 * pulse)
        beamMat.opacity = 0.07 + 0.34 * pulse
        starGlow.material.opacity = 0.24 + 0.5 * pulse
      },
      camera: { position: [3.4, 2.6, 4.6] },
      minDistance: 1.4,
      maxDistance: 16,
      subjectRadius: 1.2,
      boundsRadius: 5,
      labelAnchors: [
        { name: '中子星', position: [0, 0, 0] },
        { name: '磁轴', position: [0.9, 1.9, 0] },
        { name: '射束', position: [1.1, 3.1, 0] },
        { name: '自转轴', position: [0, 2.5, 0] }
      ],
      scaleRef: {
        radius: 0.22,
        label: '参考球：中子星直径约 20 km（1.4 倍太阳质量压缩到一座城市大小）',
        position: [2.2, -1.6, 0]
      }
    },
    'pulsar'
  )
}

// -------------------------------------------------------------- 小行星带 --
/**
 * 小行星带：太阳 + 2.2~3.2 AU 之间的数百颗岩块 + 矮行星谷神星。
 * 用 InstancedMesh 一次性绘制全部小行星（1 个 draw call）。
 */
export function buildAsteroidScene(): SceneHandle {
  const group = new THREE.Group()
  group.add(makeStarfield(1200))

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd27a })
  )
  markPick(sun, '太阳')
  group.add(sun)
  group.add(makeGlowSprite('#ffc46b', 2.2, 0.5))

  // 轨道参考环（内缘 2.2 AU / 外缘 3.2 AU）
  const scale = 1.35 // 世界单位 / AU
  for (const au of [2.2, 3.2]) {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 180; i++) {
      const a = (i / 180) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * au * scale, 0, Math.sin(a) * au * scale))
    }
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })
      )
    )
  }

  // 小行星：不规则多面体 + 顶点扰动（共享几何体，只扰动一次）
  const COUNT = 560
  const geo = new THREE.IcosahedronGeometry(1, 0)
  const posAttr = geo.attributes.position as THREE.BufferAttribute
  const jitter = mulberry32(2200)
  for (let i = 0; i < posAttr.count; i++) {
    const j = 0.72 + jitter() * 0.56
    posAttr.setXYZ(i, posAttr.getX(i) * j, posAttr.getY(i) * j, posAttr.getZ(i) * j)
  }
  geo.computeVertexNormals()
  const inst = new THREE.InstancedMesh(
    geo,
    new THREE.MeshStandardMaterial({ color: 0x8a8073, roughness: 1, metalness: 0 }),
    COUNT
  )
  markPick(inst, '小行星')
  group.add(inst)

  const rng = mulberry32(20240)
  const rocks = Array.from({ length: COUNT }, () => ({
    au: 2.2 + rng() * 1.0,
    angle: rng() * Math.PI * 2,
    incl: (rng() - 0.5) * 0.22,
    size: 0.014 + Math.pow(rng(), 2.6) * 0.08,
    spin: (rng() - 0.5) * 1.8,
    phase: rng() * Math.PI * 2
  }))

  // 谷神星：小行星带中最大的天体，直径约 940 km
  const ceres = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 32, 32),
    new THREE.MeshStandardMaterial({
      map: rockyTexture(77, { land: ['#8e8878', '#a89e8c', '#6f6a5c', '#c0b6a2'], craters: 14 }),
      roughness: 1,
      metalness: 0
    })
  )
  markPick(ceres, '谷神星')
  group.add(ceres)

  const dummy = new THREE.Object3D()
  const ceresAu = 2.77

  return decorateScene(
    {
      group,
      update: (t, dt) => {
        for (let i = 0; i < COUNT; i++) {
          const rock = rocks[i]
          // 开普勒第三定律：周期 ∝ a^1.5
          const theta = rock.angle + (t * 0.55) / Math.pow(rock.au, 1.5)
          const dist = rock.au * scale
          dummy.position.set(
            Math.cos(theta) * dist,
            Math.sin(rock.incl) * dist * 0.1,
            Math.sin(theta) * dist
          )
          dummy.rotation.set(rock.phase + t * rock.spin * 0.4, rock.phase * 1.7 + t * rock.spin * 0.3, rock.phase * 0.6)
          dummy.scale.setScalar(rock.size)
          dummy.updateMatrix()
          inst.setMatrixAt(i, dummy.matrix)
        }
        inst.instanceMatrix.needsUpdate = true

        const cTheta = (t * 0.55) / Math.pow(ceresAu, 1.5)
        ceres.position.set(
          Math.cos(cTheta) * ceresAu * scale,
          0,
          Math.sin(cTheta) * ceresAu * scale
        )
        ceres.rotation.y += dt * 0.25
      },
      camera: { position: [0, 6.2, 10.5] },
      autoRotate: true,
      autoRotateSpeed: 0.25,
      minDistance: 3,
      maxDistance: 34,
      subjectRadius: 5.2,
      boundsRadius: 14,
      labelAnchors: [
        { name: '太阳', position: [0, 0.9, 0] },
        { name: '谷神星', position: [ceresAu * scale, 0.5, 0] },
        { name: '小行星带', position: [0, 1.2, 4.4] }
      ],
      scaleRef: {
        radius: 0.42,
        label: '参考球：太阳半径示意（小行星直径与间距非真实比例，真实平均间距约 100 万千米）',
        position: [0, -2.2, 0]
      }
    },
    'asteroid'
  )
}

// ---------------------------------------------------------- 系外行星系统 --
/**
 * 系外行星系：以 TRAPPIST-1 为原型 —— 一颗 M8V 红矮星 + 七颗地球大小的行星，
 * 轨道半径都小于水星轨道，行星被潮汐锁定（永远同一面朝向恒星）。
 */
export function buildExoplanetScene(): SceneHandle {
  const group = new THREE.Group()
  group.add(makeStarfield(1500))

  // TRAPPIST-1：半径约为太阳的 0.12 倍，表面温度约 2560 K
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xff6b3a })
  )
  markPick(star, 'TRAPPIST-1')
  group.add(star)
  group.add(makeGlowSprite('#ff7a45', 2.1, 0.5))

  // 红矮星是低质量恒星，行星必须靠得很近才可能有液态水
  const light = new THREE.PointLight(0xff9a5c, 9, 26, 2)
  group.add(light)

  const PLANETS: { name: string; r: number; dist: number; color: string; period: number }[] = [
    { name: 'TRAPPIST-1b', r: 1.12, dist: 1.15, color: '#d8663c', period: 1.51 },
    { name: 'TRAPPIST-1c', r: 1.1, dist: 1.5, color: '#c98a5a', period: 2.42 },
    { name: 'TRAPPIST-1d', r: 0.79, dist: 1.95, color: '#8fb4c8', period: 4.05 },
    { name: 'TRAPPIST-1e', r: 0.92, dist: 2.5, color: '#4f8fb8', period: 6.1 },
    { name: 'TRAPPIST-1f', r: 1.05, dist: 3.15, color: '#5aa6b8', period: 9.21 },
    { name: 'TRAPPIST-1g', r: 1.15, dist: 3.9, color: '#7f9ec4', period: 12.35 },
    { name: 'TRAPPIST-1h', r: 0.77, dist: 4.8, color: '#b8c8d8', period: 18.77 }
  ]
  const R = 0.24 // 1 地球半径 → 世界单位

  const bodies = PLANETS.map((p) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(p.r * R, 32, 32),
      new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.85, metalness: 0 })
    )
    markPick(mesh, p.name)
    group.add(mesh)

    // 轨道线
    const pts: THREE.Vector3[] = []
    const d = p.dist
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * d, 0, Math.sin(a) * d))
    }
    const orbit = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: p.color, transparent: true, opacity: 0.18 })
    )
    orbit.name = 'overlay-orbits'
    group.add(orbit)
    return { def: p, mesh, orbit }
  })

  return decorateScene(
    {
      group,
      update: (t) => {
        for (const b of bodies) {
          // 周期按真实值比例缩放（这里以 b 的 1.51 天为基准放大成可读节奏）
          const theta = (t * 0.5 * (1.51 / b.def.period)) % (Math.PI * 2)
          const d = b.def.dist
          b.mesh.position.set(Math.cos(theta) * d, 0, Math.sin(theta) * d)
          // 潮汐锁定：始终同一面朝向恒星
          b.mesh.lookAt(0, 0, 0)
        }
      },
      camera: { position: [0, 4.2, 8.6] },
      minDistance: 2,
      maxDistance: 24,
      subjectRadius: 3.4,
      boundsRadius: 11,
      labelAnchors: [
        { name: 'TRAPPIST-1', position: [0, 0.7, 0] },
        { name: 'e（宜居带）', position: [2.5, 0.45, 0] },
        { name: 'h（最外侧）', position: [4.8, 0.45, 0] }
      ],
      scaleRef: {
        radius: 0.3,
        label: '参考球：红矮星半径约为太阳的 0.12 倍；行星大小按地球半径等比，轨道间距已压缩',
        position: [0, -1.8, 0]
      }
    },
    'exoplanet'
  )
}

export function buildSolarSystemScene(): SceneHandle {
  const group = new THREE.Group()
  const rng = mulberry32(1234)

  interface SolarPlanet {
    name: string
    kind: 'rocky' | 'gas' | 'earth' | 'ice' | 'venus'
    r: number
    au: number
    period: number
    tilt: number
    retrograde?: boolean
    seed: number
    land?: string[]
    ocean?: string
    polar?: boolean
    craters?: number
    darkPatches?: number
    darkColor?: string
    gasColors?: string[]
    gasSpot?: { x: number; y: number; rx: number; ry: number; color: string }
    rings?: boolean
    ringTilt?: number
    ringGaps?: [number, number][]
  }

  const planets: SolarPlanet[] = [
    { name: '水星', kind: 'rocky', r: 0.24, au: 0.387, period: 0.241, tilt: 0.03, seed: 11, land: ['#a8a29a', '#8f887f', '#c4bcb2'], polar: true, craters: 70 },
    { name: '金星', kind: 'venus', r: 0.3, au: 0.723, period: 0.615, tilt: 177.4, retrograde: true, seed: 22 },
    { name: '地球', kind: 'earth', r: 0.32, au: 1.0, period: 1.0, tilt: 23.4, seed: 33 },
    { name: '火星', kind: 'rocky', r: 0.27, au: 1.524, period: 1.881, tilt: 25.2, seed: 44, land: ['#c1553b', '#a3432c', '#d97b5a', '#8f3a26'], polar: true, craters: 30, darkPatches: 14, darkColor: '#3a2f28' },
    { name: '木星', kind: 'gas', r: 0.62, au: 5.203, period: 11.86, tilt: 3.1, seed: 55, gasColors: ['#e6c9a0', '#c08a5e', '#a86b4a', '#f0e2c8'], gasSpot: { x: 0.7, y: 0.68, rx: 0.09, ry: 0.05, color: '#c85a3a' } },
    { name: '土星', kind: 'gas', r: 0.55, au: 9.537, period: 29.46, tilt: 26.7, seed: 66, gasColors: ['#e8d5a8', '#d4b57a', '#b98f4e'], rings: true, ringGaps: [[0.5, 0.58]] },
    { name: '天王星', kind: 'ice', r: 0.4, au: 19.19, period: 84.01, tilt: 97.8, retrograde: true, seed: 77, gasColors: ['#9ad9e8', '#7ec8dd', '#cdeef5'], rings: true, ringTilt: 82 },
    { name: '海王星', kind: 'ice', r: 0.38, au: 30.07, period: 164.8, tilt: 28.3, seed: 88, gasColors: ['#4f7fd6', '#3a66c4', '#7fa9e8'], gasSpot: { x: 0.32, y: 0.36, rx: 0.08, ry: 0.045, color: '#1e3a70' } }
  ]

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffd27a })
  )
  markPick(sun, '太阳')
  group.add(sun)
  const sunGlow = makeGlowSprite('#ffc46b', 3.4, 0.65)
  markPick(sunGlow, '太阳日冕')
  group.add(sunGlow)

  // 轨道线单独成组，便于 Viewer.setOverlay('orbits', …) 开关。
  const orbitGroup = new THREE.Group()
  orbitGroup.name = 'overlay-orbits'
  const orbits = planets.map((p) => {
    const dist = 3 + Math.log10(p.au / 0.387) * 5.6
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * dist, 0, Math.sin(a) * dist))
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14 }))
    orbitGroup.add(line)
    return line
  })
  group.add(orbitGroup)

  // 概览视角下每颗行星在屏幕上只有几十像素，256 宽纹理足够；
  // 单体展项（buildPlanetScene）仍用 512，保证近观时的细节。
  const OVERVIEW_TEX = 256
  const meshes = planets.map((p) => {
    const dist = 3 + Math.log10(p.au / 0.387) * 5.6
    let map: THREE.Texture
    if (p.kind === 'venus') map = venusTexture(p.seed, OVERVIEW_TEX)
    else if (p.kind === 'earth') map = earthTexture(p.seed, OVERVIEW_TEX)
    else if (p.kind === 'gas' || p.kind === 'ice') map = gasTexture(p.seed, p.gasColors!, { spot: p.gasSpot }, OVERVIEW_TEX)
    else map = rockyTexture(p.seed, { land: p.land!, ocean: p.ocean, polar: p.polar, craters: p.craters, darkPatches: p.darkPatches, darkColor: p.darkColor }, OVERVIEW_TEX)

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.r, 40, 40), new THREE.MeshStandardMaterial({ map, roughness: 1 }))
    markPick(mesh, p.name)
    if (p.gasSpot) {
      mesh.rotation.y = p.seed === 55 ? 4.145 : p.seed === 88 ? 0.279 : 0
      const spot = makeSurfaceSpot({
        radius: p.r,
        color: p.gasSpot.color,
        name: p.name === '木星' ? '大红斑' : '大暗斑',
        opacity: 0.88
      })
      const normal = normalFromUv(p.gasSpot.x, p.gasSpot.y, new THREE.Vector3())
      placeSurfaceSpot(spot, p.r, normal, p.gasSpot.rx * Math.PI * 2 * p.r, p.gasSpot.ry * Math.PI * p.r)
      mesh.add(spot)
    }
    const holder = new THREE.Group()
    holder.rotation.z = THREE.MathUtils.degToRad(p.tilt)
    holder.add(mesh)
    if (p.rings) {
      const rings = makeRings(p.r * 1.4, p.r * 2.3, p.seed + 1, ['#e8d5a8', '#d4b57a', '#b98f4e'], p.ringTilt ?? 0, p.ringGaps, 256)
      markPick(rings, p.name === '土星' ? '土星环' : '天王星环')
      holder.add(rings)
    }
    group.add(holder)
    return { mesh, holder, p, dist, angle: rng() * Math.PI * 2 }
  })

  group.add(makeStarfield(1200))

  return decorateScene({
    group,
    update: (_t, dt) => {
      for (const m of meshes) {
        // 角速度与真实公转周期成反比
        m.angle += dt * (0.28 / m.p.period) * (m.p.retrograde ? -1 : 1)
        m.holder.position.set(Math.cos(m.angle) * m.dist, 0, Math.sin(m.angle) * m.dist)
        m.mesh.rotation.y += dt * 0.5 * (m.p.retrograde ? -1 : 1)
      }
      sun.rotation.y += dt * 0.1
    },
    camera: { position: [0, 15, 24] },
    autoRotate: true,
    autoRotateSpeed: 0.4,
    minDistance: 7,
    maxDistance: 60,
    subjectRadius: 6,
    boundsRadius: 14,
    overlays: { orbits: orbitGroup },
    labelAnchors: [{ name: '太阳', position: [0, 0, 0] }],
    scaleRef: {
      radius: 1,
      label: '参考球：1 世界单位（轨道半径对数压缩，非真实比例；太阳半径约 69.6 万 km）',
      position: [0, -3.2, 0]
    }
  }, 'solarSystem')
}

/** 从条目 facts 里取真实直径，生成比例尺参考球说明。 */
function scaleLabelForEntry(entry: CatalogEntry): string | undefined {
  if (entry.scene === 'planet' || entry.scene === 'sun' || entry.scene === 'moon') {
    const d = entry.facts.find((f) => f.label === '直径')?.value
    if (d) return '参考球：直径 ' + d + '（球径 = 场景主体半径，形状与比例示意）'
  }
  if (entry.scene === 'comet') {
    const d = entry.facts.find((f) => f.label === '核心直径')?.value
    if (d) return '参考球：' + d + '（哈雷彗核实测约 15×8×8 km，形状不规则，示意）'
  }
  return undefined
}

function metaForEntry(entry: CatalogEntry): SceneMeta {
  const meta: SceneMeta = { name: entry.name }
  const scaleLabel = scaleLabelForEntry(entry)
  if (scaleLabel) meta.scaleLabel = scaleLabel
  return meta
}

export function buildSceneFor(entry: CatalogEntry): SceneHandle {
  switch (entry.scene) {
    case 'solarSystem':
      return decorateScene(buildSolarSystemScene(), 'solarSystem', metaForEntry(entry))
    case 'planet': {
      const params = { ...(entry.sceneParams ?? {}) } as unknown as PlanetParams
      params.name = entry.name
      params.scaleLabel = scaleLabelForEntry(entry) ?? params.scaleLabel
      if (entry.id === 'saturn') params.ringName = '土星环'
      if (entry.id === 'uranus') params.ringName = '天王星环'
      if (entry.id === 'jupiter') params.spotName = '大红斑'
      if (entry.id === 'neptune') params.spotName = '大暗斑'
      return decorateScene(buildPlanetScene(params), 'planet', metaForEntry(entry))
    }
    case 'sun':
      return decorateScene(buildSunScene(), 'sun', metaForEntry(entry))
    case 'moon':
      return decorateScene(buildMoonScene(), 'moon', metaForEntry(entry))
    case 'blackhole':
      return decorateScene(buildBlackholeScene(), 'blackhole', metaForEntry(entry))
    case 'comet':
      return decorateScene(buildCometScene(), 'comet', metaForEntry(entry))
    case 'nebula':
      return decorateScene(
        buildNebulaScene((entry.sceneParams ?? {}) as unknown as NebulaParams),
        'nebula',
        metaForEntry(entry)
      )
    case 'galaxy':
      return decorateScene(
        buildGalaxyScene((entry.sceneParams ?? {}) as unknown as GalaxyParams),
        'galaxy',
        metaForEntry(entry)
      )
    case 'meteor':
      return decorateScene(buildMeteorScene(), 'meteor', metaForEntry(entry))
    case 'eclipse':
      return decorateScene(buildEclipseScene(), 'eclipse', metaForEntry(entry))
    case 'aurora':
      return decorateScene(buildAuroraScene(), 'aurora', metaForEntry(entry))
    case 'supernova':
      return decorateScene(buildSupernovaScene(), 'supernova', metaForEntry(entry))
    case 'pulsar':
      return decorateScene(buildPulsarScene(), 'pulsar', metaForEntry(entry))
    case 'asteroid':
      return decorateScene(buildAsteroidScene(), 'asteroid', metaForEntry(entry))
    case 'exoplanet':
      return decorateScene(buildExoplanetScene(), 'exoplanet', metaForEntry(entry))
    default:
      throw new Error('unknown scene: ' + entry.scene)
  }
}