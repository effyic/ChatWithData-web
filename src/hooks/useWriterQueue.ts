interface ListItem {
  [key: string]: any
}

export function useWriterQueue() {
  const taskQueue: Function[] = []
  let running = false

  const regex = /!\[\]\([^)]*\)/ // Markdown 图片语法的正则

  function createWriterTask(text: string, item: ListItem, fieldName = 'text', delay = 20): () => Promise<void> {
    if (!text || text == '') {
      // 空字符串或空白，不执行任务
      return () =>
        new Promise<void>((resolve) => {
          resolve()
        })
    }
    if (regex.test(text)) {
      // 图片语法直接插入
      return () =>
        new Promise<void>((resolve) => {
          item[fieldName] += text
          resolve()
        })
    }

    return () =>
      new Promise<void>((resolve) => {
        let i = 0

        const step = () => {
          if (document.visibilityState !== 'visible') {
            // 如果页面不可见，直接输出剩余内容
            item[fieldName] += text.slice(i)
            resolve()
            return
          }

          item[fieldName] += text[i++]

          if (i < text.length) {
            setTimeout(step, delay)
          } else {
            resolve()
          }
        }

        step()
      })
  }

  async function enqueue(task: Function) {
    taskQueue.push(task)
    if (running) return

    running = true
    while (taskQueue.length > 0) {
      const task = taskQueue.shift()!
      await task()
    }
    running = false
  }

  function clearTaskQueue() {
    taskQueue.splice(0)
  }

  return {
    enqueue,
    clearTaskQueue,
    createWriterTask
  }
}
