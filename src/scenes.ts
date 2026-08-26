import * as THREE from 'three'
import {
  fbm,
  mulberry32,
  rockyTexture,
  gasTexture,
  earthTexture,
  moonTexture,
  sunTexture,
  cloudTexture,
  ringTexture,
  glowTexture,
  circleTexture
} from './textures'
import type { CatalogEntry } from './types'

export interface SceneHandle {
  group: THREE.Group
  update?: (t: number, dt: number) => void
  dispose?: () => void
  camera?: { position: [number, number, number]; target?: [number, number, number] }
  autoRotate?: boolean
  autoRotateSpeed?: number
  minDistance?: number
  maxDistance?: number
}

export interface PlanetParams {
  kind: 'rocky' | 'gas' | 'earth' | 'ice'
  radius?: number
  seed?: number
  axialTilt?: number
  rotationSpeed?: number
  rings?: { inner: number; outer: number; seed?: number; tilt?: number; colors: string[] }
  atmosphere?: string
  atmosphereOpacity?: number
  cloud?: boolean
  land?: string[]
  ocean?: string
  polar?: boolean
  craters?: number
  gasColors?: string[]
}

// ------------------------------------------------------------------ shared

export function makeStarfield(count = 1200): THREE.Points {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const pal: [number, number, number][] = [
    [255, 255, 255],
    [190, 215, 255],
    [255, 240, 200],
    [150, 190, 255]
  ]
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(140 + Math.random() * 120)
    positions[i * 3] = v.x
    positions[i * 3 + 1] = v.y
    positions[i * 3 + 2] = v.z
    const c = pal[Math.floor(Math.random() * pal.length)]
    const b = 0.55 + Math.random() * 0.45
    colors[i * 3] = (c[0] / 255) * b
    colors[i * 3 + 1] = (c[1] / 255) * b
    colors[i * 3 + 2] = (c[2] / 255) * b
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({
    size: 1.4,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
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

function makeRings(inner: number, outer: number, seed: number, colors: string[], tiltDeg = 0): THREE.Mesh {
  const geo = new THREE.RingGeometry(inner, outer, 128, 1)
  const mat = new THREE.MeshBasicMaterial({
    map: ringTexture(inner, outer, seed, colors),
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

// ------------------------------------------------------------------- scene builders

export function buildStarfieldScene(): SceneHandle {
  const group = new THREE.Group()
  group.add(makeStarfield(1400))
  return {
    group,
    update: (_t, dt) => {
      group.rotation.y += dt * 0.012
      group.rotation.x += dt * 0.004
    },
    camera: { position: [0, 1.5, 6] },
    autoRotate: false
  }
}

export function buildPlanetScene(p: PlanetParams): SceneHandle {
  const radius = p.radius ?? 1
  const seed = p.seed ?? 1
  const group = new THREE.Group()
  const tilt = new THREE.Group()
  tilt.rotation.z = THREE.MathUtils.degToRad(p.axialTilt ?? 0)
  group.add(tilt)

  let map: THREE.Texture
  if (p.kind === 'earth') {
    map = earthTexture(seed)
  } else if (p.kind === 'gas') {
    map = gasTexture(seed, p.gasColors ?? ['#e6c9a0', '#c08a5e', '#a86b4a', '#f0e2c8'])
  } else if (p.kind === 'ice') {
    map = gasTexture(seed, p.gasColors ?? ['#9ad9e8', '#7ec8dd', '#cdeef5'])
  } else {
    map = rockyTexture(seed, {
      land: p.land ?? ['#a89070', '#8a7358', '#c0a88a', '#7a5f45', '#d8c8ac'],
      ocean: p.ocean,
      polar: p.polar ?? false,
      craters: p.craters ?? 0
    })
  }
  const mat = new THREE.MeshStandardMaterial({ map, roughness: 1, metalness: 0 })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 64), mat)
  tilt.add(mesh)

  if (p.cloud) {
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture(seed + 5),
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    })
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.015, 48, 48), cloudMat)
    tilt.add(clouds)
  }
  if (p.atmosphere) {
    tilt.add(makeAtmosphere(radius * 1.05, p.atmosphere, p.atmosphereOpacity ?? 0.55))
  }
  if (p.rings) {
    group.add(makeRings(p.rings.inner, p.rings.outer, p.rings.seed ?? seed, p.rings.colors, p.rings.tilt ?? 0))
  }
  group.add(makeStarfield(900))

  const rot = p.rotationSpeed ?? 0.12
  return {
    group,
    update: (_t, dt) => {
      mesh.rotation.y += dt * rot
    },
    camera: defaultCamera(radius),
    minDistance: radius * 1.5,
    maxDistance: radius * 8
  }
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
          p *= 2.03;
          a *= 0.5;
        }
        return v;
      }
      void main() {
        vec2 uv = vUv * 5.0;
        float n = fbm(uv + vec2(uTime * 0.05, uTime * 0.03));
        float n2 = fbm(uv * 2.2 - vec2(uTime * 0.04, 0.0) + n * 1.6);
        vec3 c = mix(vec3(1.0, 0.42, 0.05), vec3(1.0, 0.78, 0.15), smoothstep(0.35, 0.75, n));
        c = mix(c, vec3(1.0, 0.95, 0.62), smoothstep(0.7, 0.95, n2));
        c += vec3(1.0, 0.5, 0.1) * 0.2 * pow(n, 3.0);
        gl_FragColor = vec4(c, 1.0);
      }
    `,
    uniforms: { uTime: { value: 0 } }
  })
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.4, 64, 64), mat)
  group.add(sun)

  const corona = new THREE.Points(
    new THREE.SphereGeometry(1.62, 48, 24),
    new THREE.PointsMaterial({
      size: 0.09,
      color: 0xffa040,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  )
  group.add(corona)

  const glow1 = makeGlowSprite('#ff8c1a', 5.2, 0.55)
  const glow2 = makeGlowSprite('#ffb84d', 9, 0.22)
  group.add(glow1, glow2)
  group.add(makeStarfield(900))

  return {
    group,
    update: (t, dt) => {
      mat.uniforms.uTime.value = t
      sun.rotation.y += dt * 0.06
      corona.rotation.y += dt * 0.02
      corona.rotation.x += dt * 0.008
      const pulse = 1 + 0.04 * Math.sin(t * 1.6)
      glow1.scale.setScalar(5.2 * pulse)
    },
    camera: { position: [0, 1.2, 5.8] },
    minDistance: 2,
    maxDistance: 14
  }
}

export function buildMoonScene(): SceneHandle {
  const group = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ map: moonTexture(9), roughness: 1 })
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), mat)
  group.add(moon)
  group.add(makeStarfield(1000))
  return {
    group,
    update: (_t, dt) => {
      moon.rotation.y += dt * 0.05
    },
    camera: { position: [0, 0.9, 3.8] },
    minDistance: 1.6,
    maxDistance: 10
  }
}

export function buildBlackholeScene(): SceneHandle {
  const group = new THREE.Group()
  group.add(makeStarfield(1600))

  const horizon = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  )
  group.add(horizon)

  const photonRing = new THREE.Mesh(
    new THREE.RingGeometry(1.02, 1.12, 128),
    new THREE.MeshBasicMaterial({
      color: 0xfff4d8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  )
  photonRing.rotation.x = Math.PI / 2 - 0.38
  group.add(photonRing)

  const diskMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vPos;
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
      void main() {
        vec2 p = vPos.xy;
        float r = length(p);
        float a = atan(p.y, p.x);
        float inR = 1.18;
        float outR = 3.4;
        float radial = clamp((r - inR) / (outR - inR), 0.0, 1.0);
        vec3 inner = vec3(1.0, 0.96, 0.86);
        vec3 mid = vec3(1.0, 0.55, 0.15);
        vec3 outer = vec3(0.45, 0.08, 0.02);
        vec3 col = mix(inner, mid, smoothstep(0.0, 0.35, radial));
        col = mix(col, outer, smoothstep(0.35, 1.0, radial));
        float n = noise(vec2(r * 8.0, a * 4.0) + vec2(uTime * 0.35, uTime * 0.2));
        col *= 0.72 + 0.55 * n;
        float beam = 1.0 + 0.5 * sin(a - uTime * 1.5);
        col *= beam;
        float alpha = smoothstep(0.0, 0.1, radial) * (1.0 - smoothstep(0.82, 1.0, radial));
        gl_FragColor = vec4(col, alpha * 0.95);
      }
    `,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const disk = new THREE.Mesh(new THREE.RingGeometry(1.18, 3.4, 128, 1), diskMat)
  const diskPivot = new THREE.Group()
  diskPivot.rotation.x = Math.PI / 2 - 0.38
  diskPivot.add(disk)
  group.add(diskPivot)

  const halo = makeGlowSprite('#ffaa55', 4.4, 0.28)
  group.add(halo)

  return {
    group,
    update: (t, dt) => {
      diskMat.uniforms.uTime.value = t
      disk.rotation.z += dt * 0.7
      halo.scale.setScalar(4.4 * (1 + 0.03 * Math.sin(t * 2)))
    },
    camera: { position: [0, 3.4, 8.2] },
    minDistance: 2.5,
    maxDistance: 20
  }
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
  group.add(nucleus)

  const coma = makeGlowSprite('#bff3ff', 3.2, 0.35)
  group.add(coma)

  const dustPos = new Float32Array(600 * 3)
  const dustCol = new Float32Array(600 * 3)
  for (let i = 0; i < 600; i++) {
    const t = Math.pow(rng(), 1.7)
    const x = -(0.7 + t * 13)
    const s = t * 3.4 * (0.25 + rng() * 0.75)
    dustPos[i * 3] = x
    dustPos[i * 3 + 1] = (rng() - 0.5) * s
    dustPos[i * 3 + 2] = (rng() - 0.5) * s
    const mix = t
    dustCol[i * 3] = 1
    dustCol[i * 3 + 1] = 0.95 - mix * 0.4
    dustCol[i * 3 + 2] = 0.88 - mix * 0.55
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  dustGeo.setAttribute('color', new THREE.BufferAttribute(dustCol, 3))
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  )
  group.add(dust)

  const ionPos = new Float32Array(420 * 3)
  const ionCol = new Float32Array(420 * 3)
  for (let i = 0; i < 420; i++) {
    const t = Math.pow(rng(), 1.9)
    const x = -(0.8 + t * 18)
    const s = t * 0.9
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
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  )
  group.add(ion)
  group.add(makeStarfield(900))

  return {
    group,
    update: (t, dt) => {
      nucleus.rotation.y += dt * 0.25
      nucleus.rotation.x += dt * 0.12
      coma.scale.setScalar(3.2 * (1 + 0.06 * Math.sin(t * 1.8)))
    },
    camera: { position: [0, 1.7, 7] },
    minDistance: 1.8,
    maxDistance: 18
  }
}

export function buildNebulaScene(): SceneHandle {
  const group = new THREE.Group()
  const count = 2600
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const rng = mulberry32(777)
  const pal: [number, number, number][] = [
    [255, 107, 157],
    [123, 107, 255],
    [62, 198, 255],
    [255, 209, 102],
    [255, 255, 255],
    [200, 120, 255]
  ]
  for (let i = 0; i < count; i++) {
    const dir = new THREE.Vector3().randomDirection()
    const r = Math.pow(rng(), 0.55) * 1
    positions[i * 3] = dir.x * r * 8
    positions[i * 3 + 1] = dir.y * r * 4.5
    positions[i * 3 + 2] = dir.z * r * 5.5
    const c = pal[Math.floor(rng() * pal.length)]
    const b = 0.35 + rng() * 0.65
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
      size: 0.34,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  )
  group.add(points)
  group.add(makeGlowSprite('#a8c8ff', 7, 0.4))
  group.add(makeGlowSprite('#ff9dd2', 4, 0.3))
  group.add(makeStarfield(900))

  return {
    group,
    update: (_t, dt) => {
      group.rotation.y += dt * 0.018
      group.rotation.x += dt * 0.006
    },
    camera: { position: [0, 1.7, 12.5] },
    autoRotate: true,
    autoRotateSpeed: 0.5,
    minDistance: 3,
    maxDistance: 30
  }
}

export function buildGalaxyScene(): SceneHandle {
  const group = new THREE.Group()
  const count = 9000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const rng = mulberry32(314)
  for (let i = 0; i < count; i++) {
    const arm = i % 4
    const t = i / count
    const r = 0.6 + 4.6 * Math.pow(t, 0.75)
    const theta = r * 1.15 + arm * (Math.PI / 2) + (rng() - 0.5) * 0.32
    const spread = 0.25 * (0.25 + r * 0.3)
    positions[i * 3] = Math.cos(theta) * r + (rng() - 0.5) * spread
    positions[i * 3 + 1] = (rng() - 0.5) * (0.16 + r * 0.14)
    positions[i * 3 + 2] = Math.sin(theta) * r + (rng() - 0.5) * spread
    const b = 0.5 + rng() * 0.5
    if (r < 1.3) {
      colors[i * 3] = 1 * b
      colors[i * 3 + 1] = 0.92 * b
      colors[i * 3 + 2] = 0.75 * b
    } else {
      const blue = 0.55 + rng() * 0.45
      colors[i * 3] = 0.55 * b
      colors[i * 3 + 1] = 0.68 * b
      colors[i * 3 + 2] = blue * b
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  )
  group.add(points)
  group.add(makeGlowSprite('#ffe9b0', 3.2, 0.6))
  group.add(makeStarfield(800))

  return {
    group,
    update: (_t, dt) => {
      group.rotation.y += dt * 0.05
    },
    camera: { position: [0, 7.5, 11] },
    autoRotate: true,
    autoRotateSpeed: 0.6,
    minDistance: 3,
    maxDistance: 30
  }
}

export function buildMeteorScene(): SceneHandle {
  const group = new THREE.Group()
  group.add(makeStarfield(1000))
  const N = 40
  interface Meteor {
    pos: THREE.Vector3
    dir: THREE.Vector3
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

  function spawn(m: Meteor) {
    m.dir = new THREE.Vector3().randomDirection()
    m.pos.copy(m.dir).multiplyScalar(38 + Math.random() * 26)
    m.speed = 18 + Math.random() * 16
    m.age = 0
    m.life = 1.6 + Math.random() * 1.6
  }

  for (let i = 0; i < N; i++) {
    const headMat = new THREE.SpriteMaterial({
      map: headTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const head = new THREE.Sprite(headMat)
    head.scale.setScalar(0.55)
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
    const m: Meteor = { pos: new THREE.Vector3(), dir: new THREE.Vector3(), speed: 20, age: 0, life: 2, head, line, lineMat, headMat }
    spawn(m)
    meteors.push(m)
    group.add(head, line)
  }

  return {
    group,
    update: (_t, dt) => {
      for (const m of meteors) {
        m.pos.addScaledVector(m.dir, m.speed * dt)
        m.age += dt
        const fade = 1 - m.age / m.life
        const len = 1.4 + m.speed * 0.05
        const p0 = m.pos
        const p1 = m.pos.clone().addScaledVector(m.dir, -len)
        const attr = m.line.geometry.attributes.position as THREE.BufferAttribute
        attr.setXYZ(0, p0.x, p0.y, p0.z)
        attr.setXYZ(1, p1.x, p1.y, p1.z)
        attr.needsUpdate = true
        m.head.position.copy(m.pos)
        m.headMat.opacity = Math.max(0, fade)
        m.lineMat.opacity = Math.max(0, fade * 0.9)
        if (m.age > m.life || m.pos.length() < 7) spawn(m)
      }
    },
    camera: { position: [0, 2.2, 13] },
    minDistance: 4,
    maxDistance: 30
  }
}

export function buildEclipseScene(): SceneHandle {
  const group = new THREE.Group()
  group.add(makeStarfield(900))

  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd27a })
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.1, 48, 48), sunMat)
  sun.position.x = -9
  group.add(sun)
  const sunGlow = makeGlowSprite('#ffc46b', 6, 0.7)
  sunGlow.position.x = -9
  group.add(sunGlow)

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 48, 48),
    new THREE.MeshStandardMaterial({ map: earthTexture(5), roughness: 1 })
  )
  group.add(earth)
  group.add(makeAtmosphere(0.63, '#4a9df8', 0.5))

  const moonPivot = new THREE.Group()
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 32, 32),
    new THREE.MeshStandardMaterial({ map: moonTexture(3), roughness: 1 })
  )
  moon.position.x = 1.8
  moonPivot.add(moon)
  group.add(moonPivot)

  const shadow = makeCircleSprite('#000000', 0.3, 0)
  group.add(shadow)

  const light = new THREE.DirectionalLight(0xfff2d0, 2)
  light.position.set(-9, 1.5, 1)
  group.add(light)

  let angle = 0
  return {
    group,
    update: (t, dt) => {
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
      shadow.position.set(0.28, 0, 0)
      shadow.material.opacity = amt * 0.9
      if (t > 0 && alignment < 0.02) {
        // nothing — keep animation looping
      }
    },
    camera: { position: [4.6, 3.4, 8.6] },
    minDistance: 2,
    maxDistance: 24
  }
}

export function buildAuroraScene(): SceneHandle {
  const group = new THREE.Group()
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 48, 32),
    new THREE.MeshStandardMaterial({ color: 0x0c1a30, roughness: 0.6, emissive: 0x02060f })
  )
  planet.position.y = -1.9
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
        float mask = smoothstep(0.0, 0.22, uv.y) * (1.0 - smoothstep(0.55, 0.95, uv.y));
        float wavy = 0.6 + 0.4 * sin(uv.x * 6.0 + uTime * 0.9);
        float pick = fbm(vec2(uv.x * 2.0, uv.y * 3.0) + uTime * 0.12);
        vec3 green = vec3(0.2, 1.0, 0.55);
        vec3 purple = vec3(0.65, 0.35, 1.0);
        vec3 col = mix(green, purple, smoothstep(0.3, 0.85, pick));
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
  group.add(aurora)
  group.add(makeStarfield(1000))

  return {
    group,
    update: (t, _dt) => {
      auroraMat.uniforms.uTime.value = t
    },
    camera: { position: [0, 1.4, 8.8] },
    minDistance: 2.5,
    maxDistance: 26
  }
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
      color,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const pts = new THREE.Points(geo, mat)
    pts.scale.setScalar(0.5)
    group.add(pts)
    return { pts, mat, base: dirs.length }
  }

  const s1 = shell(dirs1, 0xffc48a, 0.16)
  const s2 = shell(dirs2, 0x8fb3ff, 0.12)

  const core = makeGlowSprite('#ffffff', 1.4, 1)
  group.add(core)
  const flash = makeGlowSprite('#ffe9c0', 5, 0.9)
  group.add(flash)
  group.add(makeStarfield(900))

  const T = 8
  return {
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
      core.material.opacity = Math.max(0, 1 - p * 1.2)
      flash.scale.setScalar(4 + p * 16)
      flash.material.opacity = p < 0.08 ? p / 0.08 : Math.max(0, 1 - p) * 0.7
    },
    camera: { position: [0, 0.4, 9.5] },
    minDistance: 2.5,
    maxDistance: 30
  }
}

export function buildSolarSystemScene(): SceneHandle {
  const group = new THREE.Group()
  const rng = mulberry32(1234)
  interface PlanetSpec {
    name: string
    r: number
    dist: number
    speed: number
    kind: 'rocky' | 'gas' | 'earth' | 'ice'
    seed: number
    land?: string[]
    ocean?: string
    polar?: boolean
    craters?: number
    gasColors?: string[]
    rings?: boolean
    tilt?: number
  }
  const planets: PlanetSpec[] = [
    { name: '水星', r: 0.2, dist: 3.2, speed: 1.6, kind: 'rocky' as const, seed: 11, land: ['#b5a99a', '#968b7e', '#cfc4b2'], polar: true, craters: 40 },
    { name: '金星', r: 0.28, dist: 4.2, speed: 1.17, kind: 'rocky' as const, seed: 22, land: ['#e8c87e', '#d9b05f', '#f2ddab'], ocean: '#d9a94f' },
    { name: '地球', r: 0.3, dist: 5.4, speed: 1, kind: 'earth' as const, seed: 33 },
    { name: '火星', r: 0.24, dist: 6.6, speed: 0.8, kind: 'rocky' as const, seed: 44, land: ['#c1553b', '#a3432c', '#d97b5a'], polar: true, craters: 20 },
    { name: '木星', r: 0.62, dist: 8.8, speed: 0.44, kind: 'gas' as const, seed: 55, gasColors: ['#e6c9a0', '#c08a5e', '#a86b4a', '#f0e2c8'] },
    { name: '土星', r: 0.55, dist: 11, speed: 0.32, kind: 'gas' as const, seed: 66, gasColors: ['#e8d5a8', '#d4b57a', '#b98f4e'], rings: true },
    { name: '天王星', r: 0.38, dist: 13.4, speed: 0.23, kind: 'ice' as const, seed: 77, gasColors: ['#9ad9e8', '#7ec8dd', '#cdeef5'], rings: true, tilt: 82 },
    { name: '海王星', r: 0.36, dist: 15.6, speed: 0.18, kind: 'ice' as const, seed: 88, gasColors: ['#4f7fd6', '#3a66c4', '#7fa9e8'] }
  ]

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffd27a })
  )
  group.add(sun)
  group.add(makeGlowSprite('#ffc46b', 3.4, 0.65))

  const orbits = planets.map((p) => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist))
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14 }))
    group.add(line)
    return line
  })

  const meshes = planets.map((p) => {
    let map: THREE.Texture
    if (p.kind === 'earth') map = earthTexture(p.seed)
    else if (p.kind === 'gas') map = gasTexture(p.seed, p.gasColors!)
    else if (p.kind === 'ice') map = gasTexture(p.seed, p.gasColors!)
    else map = rockyTexture(p.seed, { land: p.land ?? ['#a89070'], ocean: p.ocean, polar: p.polar, craters: p.craters })
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.r, 40, 40), new THREE.MeshStandardMaterial({ map, roughness: 1 }))
    const holder = new THREE.Group()
    holder.add(mesh)
    if (p.rings) {
      const tilt = p.tilt ?? 0
      holder.add(makeRings(p.r * 1.4, p.r * 2.3, p.seed + 1, ['#e8d5a8', '#d4b57a', '#b98f4e'], tilt))
    }
    group.add(holder)
    return { mesh, holder, p, angle: rng() * Math.PI * 2 }
  })

  group.add(makeStarfield(1200))

  return {
    group,
    update: (_t, dt) => {
      for (const m of meshes) {
        m.angle += dt * m.p.speed * 0.14
        m.holder.position.set(Math.cos(m.angle) * m.p.dist, 0, Math.sin(m.angle) * m.p.dist)
        m.mesh.rotation.y += dt * 0.5
      }
      sun.rotation.y += dt * 0.1
    },
    camera: { position: [0, 15, 24] },
    autoRotate: true,
    autoRotateSpeed: 0.4,
    minDistance: 7,
    maxDistance: 60
  }
}

export function buildSceneFor(entry: CatalogEntry): SceneHandle {
  switch (entry.scene) {
    case 'solarSystem':
      return buildSolarSystemScene()
    case 'planet':
      return buildPlanetScene((entry.sceneParams ?? {}) as unknown as PlanetParams)
    case 'sun':
      return buildSunScene()
    case 'moon':
      return buildMoonScene()
    case 'blackhole':
      return buildBlackholeScene()
    case 'comet':
      return buildCometScene()
    case 'nebula':
      return buildNebulaScene()
    case 'galaxy':
      return buildGalaxyScene()
    case 'meteor':
      return buildMeteorScene()
    case 'eclipse':
      return buildEclipseScene()
    case 'aurora':
      return buildAuroraScene()
    case 'supernova':
      return buildSupernovaScene()
    default:
      throw new Error('unknown scene: ' + entry.scene)
  }
}