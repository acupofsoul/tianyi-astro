/**
 * 详情页快捷键（工作流 C）。
 * ←/→ 上一条目/下一条目，1~4 切标签，空格暂停，R 重置视角，Esc 关卡片/收抽屉。
 * 输入框、文本域、下拉框、可编辑区域聚焦时不劫持。
 */
export interface KeyHandlers {
  onPrev: () => void
  onNext: () => void
  onTab: (index: number) => void
  onTogglePause: () => void
  onReset: () => void
  onEscape: () => void
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable
}

function isActivationTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'BUTTON' || tag === 'A'
}

export function bindDetailKeys(handlers: KeyHandlers): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented) return
    if (isTypingTarget(e.target)) return

    switch (e.key) {
      case 'ArrowLeft':
        if (e.repeat) return
        e.preventDefault()
        handlers.onPrev()
        return
      case 'ArrowRight':
        if (e.repeat) return
        e.preventDefault()
        handlers.onNext()
        return
      case '1':
      case '2':
      case '3':
      case '4':
        e.preventDefault()
        handlers.onTab(Number(e.key) - 1)
        return
      case 'r':
      case 'R':
        e.preventDefault()
        handlers.onReset()
        return
      case 'Escape':
        handlers.onEscape()
        return
      case ' ':
      case 'Spacebar':
        // 聚焦在按钮/链接上时把空格留给原生激活行为
        if (isActivationTarget(e.target)) return
        e.preventDefault()
        handlers.onTogglePause()
        return
      default:
        return
    }
  }

  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}
