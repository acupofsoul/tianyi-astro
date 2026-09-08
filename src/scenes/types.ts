import type * as THREE from 'three'
import type { SceneKind } from '../types'

/**
 * 3D 层可选辅助字段（工作流 B）。
 * SceneHandle 只新增可选字段，不改变既有字段语义。
 */

/** 天体标签锚点：世界坐标 + 名称 + 可选副标题。 */
export interface SceneLabelAnchor {
  /** 标签主文本（中文名） */
  name: string
  /** 世界坐标 */
  position: [number, number, number]
  /** 可选副标题（英文名 / 数值） */
  sub?: string
  /** 可选强调色（默认使用 HUD 青色） */
  color?: string
}

/**
 * 比例尺参考球：用场景世界单位半径 + 真实尺度说明构成。
 * 半径只用于屏幕投影与 3D 线框球，真实数值写在 label 里，不假装场景是等比模型。
 */
export interface SceneScaleRef {
  /** 参考球半径（场景世界单位） */
  radius: number
  /** 真实尺度说明（必须含单位与近似程度） */
  label: string
  /** 参考球在场景中的中心位置（默认 [0,0,0]） */
  position?: [number, number, number]
  /** 线框颜色（默认 HUD 青色） */
  color?: string
}

/** 可开关的可视化辅助层。 */
export interface SceneOverlays {
  /** 轨道线（太阳系等） */
  orbits?: THREE.Object3D
  /** 天体标签（sprite 文字，替代 CSS2D） */
  labels?: THREE.Object3D
  /** 比例尺参考球（3D 线框球 + 屏幕 HUD 读数） */
  scale?: THREE.Object3D
}

/** buildSceneFor 向场景注入的条目元信息（名称 / 真实尺度说明 / 标签）。 */
export interface SceneMeta {
  /** 条目中文名 */
  name?: string
  /** 比例尺参考球说明；为空时保留场景默认文案 */
  scaleLabel?: string
  /** 追加 / 覆盖标签锚点 */
  labelAnchors?: SceneLabelAnchor[]
}

/** 场景类型别名（来自 src/types.ts，避免各文件重复 import）。 */
export type { SceneKind }
