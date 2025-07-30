<script lang="ts" setup>
import * as echarts from 'echarts'
import generateReportService from '@/api/generateReport'
import { ElMessage } from 'element-plus'

// 数值格式化工具函数
const formatValue = (value: any): string | number => {
  // 异常处理：如果不是数字，原样返回
  if (typeof value !== 'number' || isNaN(value)) {
    return value
  }

  if (value >= 100000000) {
    return (value / 100000000) + '亿'
  } else if (value >= 10000000) {
    return (value / 10000000) + '千万'
  } else if (value >= 1000000) {
    return (value / 1000000) + '百万'
  } else if (value >= 10000) {
    return (value / 10000) + '万'
  } else {
    return value
  }
}

// 应用格式化器到图表选项
const applyValueFormatter = (options: any): (() => void) => {
  let cleanupFunctions: (() => void)[] = []

  if (options.yAxis && options.tooltip) {
    // 保存原始formatter（如果存在）
    const originalYAxisFormatter = options.yAxis.axisLabel?.formatter
    const originalTooltipFormatter = options.tooltip.valueFormatter

    // 应用新的formatter
    if (!options.yAxis.axisLabel) {
      options.yAxis.axisLabel = {}
    }

    if (!originalYAxisFormatter) {
      options.yAxis.axisLabel.formatter = formatValue
      options.tooltip.valueFormatter = formatValue
    }

    // 返回清理函数
    cleanupFunctions.push(() => {
      if (originalYAxisFormatter) {
        options.yAxis.axisLabel.formatter = originalYAxisFormatter
      } else {
        delete options.yAxis.axisLabel.formatter
      }

      if (originalTooltipFormatter) {
        options.tooltip.valueFormatter = originalTooltipFormatter
      } else {
        delete options.tooltip.valueFormatter
      }
    })
  }

  // 返回清理函数
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup())
  }
}

const setChart = async (id: number, options: any, oldUrl?: string): Promise<string> => {
  const oldChart = echarts.getInstanceByDom(document.getElementById('myChart')!)
  if (oldChart) {
    oldChart.dispose()
  }
  try {
    const chartDom = document.getElementById('myChart')
    if (!chartDom) {
      ElMessage.error('图表容器不存在')
      return ''
    }
    const chart = echarts.init(chartDom)
    options.title.show = false
    options.series.map((item: any) => {
      item.label = { show: true, fontSize: 16 }
      return item
    })

    // 应用格式化器并获取清理函数
    const cleanup = applyValueFormatter(options)

    // 设置图表选项
    chart.setOption({ ...options, animation: false })

    // 清理格式化器
    cleanup()

    const res = await generateReportService.uploadCharts(id, {
      chart_image: await exportChartAsFile(chart),
      chart_data: JSON.stringify(options),
      old_url: oldUrl
    })

    return res.data.url
  } catch (error) {
    ElMessage.error('图表初始化失败')
    return ''
  }
}

const exportChartAsFile = (chart: echarts.ECharts): File => {
  const base64 = chart.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })

  // 将 base64 转成 Blob
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1])
  const u8arr = new Uint8Array(bstr.length)
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }

  // 返回 File 对象
  return new File([u8arr], 'chart.png', { type: mime })
}
defineExpose({ setChart })
</script>

<template>
  <div style="position: relative;overflow: hidden;">
    <div id="myChart" style="width: 900px; height: 600px;position: absolute;"></div>
  </div>
</template>