export type SceneKind =
  | 'solarSystem'
  | 'planet'
  | 'sun'
  | 'moon'
  | 'blackhole'
  | 'comet'
  | 'nebula'
  | 'galaxy'
  | 'meteor'
  | 'eclipse'
  | 'aurora'
  | 'supernova'

export type Category =
  | '太阳系'
  | '行星'
  | '恒星'
  | '卫星'
  | '矮行星'
  | '深空天体'
  | '天文现象'

export interface Fact {
  label: string
  value: string
}

export interface CatalogEntry {
  id: string
  name: string
  enName: string
  emoji: string
  category: Category
  scene: SceneKind
  sceneParams?: Record<string, unknown>
  accent: string
  summary: string
  intro: string
  science: string
  facts: Fact[]
  tags: string[]
}
