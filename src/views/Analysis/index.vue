<template>
  <div class="analysis-container">
    <div class="header">
      <div style="display: flex; align-items: center;">
        <img src="@/assets/images/barLogo.png" alt="logo" style="height: 40px;margin-right: 10px;" />
        <h2 class="title">中铁十四局集团大盾构工程有限公司成本分析平台</h2>
      </div>
      <el-select style="width: 200px" v-model="selectedProject" placeholder="请选择项目" @change="handleProjectChange">
        <el-option v-for="item in projectList" :key="item" :label="item" :value="item" />
      </el-select>
    </div>

    <!-- 数据卡片 -->
    <div class="data-cards">
      <div class="data-card income">
        <div class="card-content">
          <div class="card-title">清单收入每延米收入</div>
          <div class="card-value">
            {{ projectData?.tb_shield_project?.unit_price_list || 0 }}万元/米
          </div>
        </div>
        <div class="card-icon">
          <el-icon>
            <TrendCharts />
          </el-icon>
        </div>
      </div>

      <div class="data-card expense">
        <div class="card-content">
          <div class="card-title">责任预算每延米收入</div>
          <div class="card-value">
            {{ projectData?.tb_shield_project?.unit_price_budget || 0 }}万元/米
          </div>
        </div>
        <div class="card-icon">
          <el-icon>
            <Money />
          </el-icon>
        </div>
      </div>

      <div class="data-card profit">
        <div class="card-content">
          <div class="card-title">掘进长度</div>
          <div class="card-value">
            {{ projectData?.tb_shield_project?.excavation_length || 0 }}米
          </div>
        </div>
        <div class="card-icon">
          <el-icon>
            <Odometer />
          </el-icon>
        </div>
      </div>

      <div class="data-card flow">
        <div class="card-content">
          <div class="card-title">日进尺</div>
          <div class="card-value">
            {{ projectData?.tb_shield_project?.daily_progress || 0 }}米/天
          </div>
        </div>
        <div class="card-icon">
          <el-icon>
            <Timer />
          </el-icon>
        </div>
      </div>
    </div>

    <div class="charts-container">
      <!-- 成本构成分析图表 -->
      <div class="chart-item wide">
        <div class="chart-header">
          <span class="chart-title">成本构成分析</span>
        </div>
        <div class="chart" ref="costStructureChart"></div>
      </div>

      <!-- 成本分类占比图表 -->
      <div class="chart-item">
        <div class="chart-header">
          <span class="chart-title">成本分类占比</span>
        </div>
        <div class="chart" ref="costTypeChart"></div>
      </div>

      <!-- 掘进盈亏平衡分析图表 -->
      <div class="chart-item wide">
        <div class="chart-header">
          <span class="chart-title">掘进盈亏平衡分析</span>
        </div>
        <div class="chart" ref="balanceChart"></div>
      </div>

      <!-- 成本要素占比图表 -->
      <div class="chart-item">
        <div class="chart-header">
          <span class="chart-title">成本要素占比</span>
        </div>
        <div class="chart" ref="costElementChart"></div>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { TrendCharts, Money, Odometer, Timer } from "@element-plus/icons-vue";
import AnalysisService from "@/api/analysis";

const selectedProject = ref("京滨铁路3-4");
const projectList = ref([
  "京滨铁路3-4",
  "芜湖长江隧道右线",
  "芜湖长江隧道左线",
  "海珠湾隧道西线",
  "上海南汇支线右线",
  "海珠湾隧道东线（带压刀盘）",
  "通苏嘉甬铁路一分部",
  "广湛铁路",
  "苏州桐泾路",
  "南京和燕路",
  "南京建宁西路",
  "长沙湘雅路",
  "杭州秦望",
  "济南穿黄北延",
  "武汉和平大道",
  "江阴靖江长江隧道",
  "杭州艮山左线",
  "杭州艮山右线",
  "杭州下沙右线(租赁)",
  "杭州下沙左线",
  "上海南汇支线左线",
  "上海桃浦项目",
  "深江铁路",
  "济南航天大道",
  "深江铁路延长段",
  "绍兴群贤路",
  "杭州萧山机场线",
  "宁芜铁路",
  "济南黄岗路项目",
  "武汉地铁12号线",
  "渝黔铁路",
  "海太长江隧道项目",
  "甬舟铁路",
  "胶州湾二隧5标服务隧道",
  "胶州湾二隧5标主线隧道",
  "昌九铁路",
  "广澳港铁路",
  "京滨铁路5-6",
  "南京地铁四号线",
  "汕汕铁路",
]);
const projectData = ref<any>(null);

// 图表实例
const costTypeChart = ref(null);
const costElementChart = ref(null);
const balanceChart = ref(null);
const costStructureChart = ref(null);

let costTypeChartInstance: any = null;
let costElementChartInstance: any = null;
let balanceChartInstance: any = null;
let costStructureChartInstance: any = null;

// 获取项目分析数据
const getProjectAnalysis = async (projectName: string) => {
  try {
    const response = await AnalysisService.getProjectAnalysis(projectName);
    projectData.value = response.data;
    if (projectData.value) {
      updateCharts();
    }
  } catch (error) {
    ElMessage.error("获取项目分析数据失败");
  }
};

// 初始化图表
const initCharts = () => {
  costTypeChartInstance = echarts.init(costTypeChart.value);
  costElementChartInstance = echarts.init(costElementChart.value);
  balanceChartInstance = echarts.init(balanceChart.value);
  costStructureChartInstance = echarts.init(costStructureChart.value);
};

// 更新所有图表
const updateCharts = () => {
  const { project_analysis, tunneling_cost_analysis } = projectData.value;

  // 更新成本分类占比图表
  costTypeChartInstance.setOption({
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}元 ({d}%)",
      position: function (point: any, params: any, dom: any, rect: any, size: any) {
        const centerX = size.viewSize[0] / 2; // 图表中心 x 坐标
        const tooltipWidth = dom.offsetWidth || 100;
        if (point[0] < centerX) {
          return [point[0] - tooltipWidth - 40, point[1]];
        } else {
          return [point[0] + 40, point[1]];
        }
      }
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        type: "pie",
        radius: "50%",
        data: [
          {
            value: project_analysis.variable_cost_amount,
            name: "可变成本",
            itemStyle: { color: "#1890ff" },
          },
          {
            value: project_analysis.fixed_cost_amount,
            name: "固定成本",
            itemStyle: { color: "#52c41a" },
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  });

  // 更新成本要素占比图表
  costElementChartInstance.setOption({
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}元 ({d}%)",
      position: function (point: any, params: any, dom: any, rect: any, size: any) {
        const centerX = size.viewSize[0] / 2; // 图表中心 x 坐标
        const tooltipWidth = dom.offsetWidth || 100;
        if (point[0] < centerX) {
          return [point[0] - tooltipWidth - 40, point[1]];
        } else {
          return [point[0] + 40, point[1]];
        }
      }
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        type: "pie",
        radius: "50%",
        data: [
          {
            value: project_analysis.labor_amount,
            name: "工",
            itemStyle: { color: "#1890ff" },
          },
          {
            value: project_analysis.material_amount,
            name: "料",
            itemStyle: { color: "#52c41a" },
          },
          {
            value: project_analysis.machine_amount,
            name: "机",
            itemStyle: { color: "#fa8c16" },
          },
          {
            value: project_analysis.measure_amount,
            name: "措施",
            itemStyle: { color: "#722ed1" },
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  });

  // 更新掘进盈亏平衡分析图表
  balanceChartInstance.setOption({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["清单收入", "责任预算"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "米/天",
    },
    yAxis: {
      type: "category",
      data: ["平衡点", "进度差"],
    },
    series: [
      {
        name: "清单收入",
        type: "bar",
        data: [
          project_analysis.planned_point,
          project_analysis.entry_difference,
        ],
        itemStyle: { color: "#1890ff" },
      },
      {
        name: "责任预算",
        type: "bar",
        data: [
          project_analysis.planned_average,
          project_analysis.progress_difference,
        ],
        itemStyle: { color: "#52c41a" },
      },
    ],
  });

  // 更新成本构成分析图表
  costStructureChartInstance.setOption({
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}元/米",
      position: function (point: any, params: any, dom: any, rect: any, size: any) {
        const centerX = size.viewSize[0] / 2; // 图表中心 x 坐标
        const tooltipWidth = dom.offsetWidth || 100;
        if (point[0] < centerX) {
          return [point[0] - tooltipWidth - 40, point[1]];
        } else {
          return [point[0] + 40, point[1]];
        }
      }
    },
    legend: {
      type: "scroll",
      orient: "vertical",
      right: 10,
      top: 20,
      bottom: 20,
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            value: tunneling_cost_analysis.shield_machine_amortization,
            name: "盾构机摊销",
          },
          { value: tunneling_cost_analysis.slag_disposal, name: "渣土处理" },
          {
            value: tunneling_cost_analysis.internal_structure,
            name: "内部结构",
          },
          { value: tunneling_cost_analysis.grouting, name: "注浆" },
          { value: tunneling_cost_analysis.waterproofing, name: "防水" },
          {
            value: tunneling_cost_analysis.segment_culvert_connection,
            name: "管片箱涵连接",
          },
          {
            value: tunneling_cost_analysis.turnover_materials,
            name: "周转材料",
          },
          {
            value: tunneling_cost_analysis.shield_construction_measures,
            name: "盾构施工措施费",
          },
        ],
      },
    ],
  });
};

// 项目切换处理
const handleProjectChange = (value: string) => {
  if (value) {
    getProjectAnalysis(value);
  }
};

// 监听窗口大小变化
const handleResize = () => {
  costTypeChartInstance?.resize();
  costElementChartInstance?.resize();
  balanceChartInstance?.resize();
  costStructureChartInstance?.resize();
};

onMounted(async () => {
  initCharts();
  handleProjectChange(selectedProject.value);
  window.addEventListener("resize", handleResize);
});
</script>

<style lang="scss" scoped>
.analysis-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.data-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-card.income {
  background: linear-gradient(135deg, #1890ff, #52c41a);
}

.data-card.expense {
  background: linear-gradient(135deg, #52c41a, #13c2c2);
}

.data-card.profit {
  background: linear-gradient(135deg, #722ed1, #eb2f96);
}

.data-card.flow {
  background: linear-gradient(135deg, #fa8c16, #fa541c);
}

.card-content {
  color: #fff;
}

.card-title {
  font-size: 14px;
  margin-bottom: 8px;
  opacity: 0.85;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
}

.card-icon {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.85);
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.chart-item {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.chart-item.wide {
  grid-column: span 2;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.chart {
  height: 300px;
}
</style>
