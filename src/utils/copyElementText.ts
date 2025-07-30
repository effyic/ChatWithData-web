export type CopyCallback = (success: boolean) => void

export function copyElementText(el: HTMLElement | null, callback?: CopyCallback): boolean {
  if (!el) {
    callback?.(false)
    return false
  }

  const range = document.createRange()
  range.selectNodeContents(el)

  const selection = window.getSelection()
  if (!selection) {
    callback?.(false)
    return false
  }

  selection.removeAllRanges()
  selection.addRange(range)

  let success = false
  try {
    success = document.execCommand('copy')
  } catch (err) {
    console.error('复制失败:', err)
  }

  selection.removeAllRanges()
  callback?.(success)
  return success
}
