/**
 * 展项链接预取（第三轮迭代 · 加载优化）。
 *
 * 详情页是唯一依赖 three.js 的路由，其 chunk 约数百 KB。用户从首页 / 目录页
 * 悬停或聚焦某个展项卡片时，说明大概率要进详情页 —— 此时提前把三维引擎与
 * 场景模块拉进 HTTP 缓存，点击后基本是「已经就绪」的观感。
 *
 * 约束：
 * - 只在真的指向详情页的链接上触发（a[href^="#/p/"]）；
 * - 每次只预取一次，失败静默（真正进入详情页时还会再加载一次）；
 * - 延迟 120ms，快速划过卡片不会触发下载。
 */
let warmed = false
let timer = 0

function warm(): void {
  if (warmed) return
  warmed = true
  // 失败无需处理：详情页自己有错误兜底
  void import('../viewer').catch(() => {})
  void import('../scenes').catch(() => {})
}

function scheduleWarm(delay: number): void {
  if (warmed) return
  window.clearTimeout(timer)
  timer = window.setTimeout(warm, delay)
}

function onPointerOver(event: Event): void {
  const target = event.target
  if (!(target instanceof Element)) return
  if (!target.closest('a[href^="#/p/"]')) return
  scheduleWarm(120)
}

function onPointerOut(): void {
  window.clearTimeout(timer)
}

function onFocusIn(event: Event): void {
  const target = event.target
  if (!(target instanceof Element)) return
  if (!target.closest('a[href^="#/p/"]')) return
  scheduleWarm(0)
}

export function installDetailPrefetch(): void {
  document.addEventListener('pointerover', onPointerOver, { passive: true })
  document.addEventListener('pointerout', onPointerOut, { passive: true })
  document.addEventListener('focusin', onFocusIn, { passive: true })
  document.addEventListener('touchstart', onPointerOver, { passive: true })
}
