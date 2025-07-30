import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportToPDF(elementId: string, fileName = 'document.pdf', margin = 10): Promise<void> {
  const el = document.getElementById(elementId)
  if (!el) {
    console.warn(`[导出失败] 未找到元素 #${elementId}`)
    return
  }

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
    })

    const imgWidthPx = canvas.width
    const imgHeightPx = canvas.height

    const imgData = canvas.toDataURL('image/jpeg', 1.0)
    const pdf = new jsPDF('p', 'mm', 'a4')

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const usableWidth = pageWidth - margin * 2
    const usableHeight = pageHeight - margin * 2

    // 像素与毫米的转换比例
    const pxPerMm = imgWidthPx / usableWidth
    const pageCanvasHeightPx = usableHeight * pxPerMm

    let remainingHeight = imgHeightPx
    let positionY = 0
    let pageNum = 0

    while (remainingHeight > 0) {
      const sliceHeightPx = Math.min(pageCanvasHeightPx, remainingHeight)

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = imgWidthPx
      pageCanvas.height = sliceHeightPx

      const pageCtx = pageCanvas.getContext('2d')
      if (pageCtx) {
        pageCtx.drawImage(
          canvas,
          0, positionY,
          imgWidthPx, sliceHeightPx,
          0, 0,
          imgWidthPx, sliceHeightPx
        )
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 1.0)
      if (pageNum > 0) pdf.addPage()

      const actualHeightMm = sliceHeightPx / pxPerMm
      pdf.addImage(pageImgData, 'JPEG', margin, margin, usableWidth, actualHeightMm)

      positionY += sliceHeightPx
      remainingHeight -= sliceHeightPx
      pageNum++
    }

    pdf.save(fileName)
  } catch (err) {
    console.error('exportToPDF 失败:', err)
  }
}
