import { asBlob } from 'html-docx-js-typescript'
import generateReportService from '@/api/generateReport'

export async function exportElementToWord(elementId: string, fileName = 'document', isPdf?: boolean) {
  const el = document.getElementById(elementId)
  console.log(el,'获取元素');
  if (!el) {
    console.warn(`[导出失败] 未找到元素 #${elementId}`)
    return
  }

  const clonedEl = el.cloneNode(true) as HTMLElement
  // const imgList =  Array.from(clonedEl.querySelectorAll('img'))
  const imgList = Array.from(clonedEl.querySelectorAll('img')).filter(img => {
    const src = img.getAttribute('src')
    return !(src && src.startsWith('/src'))
  })

  // 处理所有图片转 base64
  await Promise.allSettled(Array.from(imgList).map(async (img) => {
    try {
      const base64 = await convertImageToBase64(img.src)
      img.src = base64
      img.setAttribute('width', '500')
      img.style.maxWidth = '100%'
    } catch (e) {
      console.warn(`图片转换失败: ${img.src}`, e)
    }
  }))

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h1, h2, h3 { font-weight: bold; }
          table { border-collapse: collapse; width: 100%; }
          table, th, td { border: 1px solid #ccc; padding: 8px; }
        </style>
      </head>
      <body>${clonedEl.innerHTML}</body>
    </html>
  `

  let result = await asBlob(htmlContent)

  // 确保是 Blob 实例
  const wordBlob = result instanceof Blob
    ? result
    : new Blob([result as unknown as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

  if (isPdf) {
    try {
      const file = new File([wordBlob], `${fileName}.docx`, { type: wordBlob.type })
      const res = await generateReportService.uploadWordToPdf({ file })

      const pdfBlob = new Blob([res as any], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      downloadBlob(pdfBlob, `${fileName}.pdf`)
    } catch (e) {
      console.error('PDF 生成失败：', e)
    }
  } else {
    downloadBlob(wordBlob, `${fileName}.docx`)
  }
}

/**
 * 下载 Blob 为文件
 */
function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 图片 URL 转 base64（带跨域支持）
 */
async function convertImageToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject('Canvas context is null')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = url
  })
}
