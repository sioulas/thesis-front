<template>
  <div class="full-height">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, ChartOptions
} from 'chart.js'
import { computed } from 'vue'
import { Forecast } from 'src/models/Forecast'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const props = defineProps<{
  forecast: Forecast[]
  historical: Forecast[]
}>()

// Helpers
const isOzone = (p: string) => p.startsWith('Ozone')
const pad2 = (n: number) => n.toString().padStart(2, '0')

// Build a grouping key + display label per item
function makeGroup(item: Forecast) {
  const d = new Date(item.date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const ozone = isOzone(item.pollutant)

  const key = ozone
    ? `${item.pollutant}|${pad2(month)}-${pad2(day)} ${pad2(hour)}:00`
    : `${item.pollutant}|${pad2(month)}-${pad2(day)}`

  const label = ozone
    ? `${item.pollutant} (${pad2(month)}-${pad2(day)} ${pad2(hour)}:00)`
    : `${item.pollutant} (${pad2(month)}-${pad2(day)})`

  return { key, label, pollutant: item.pollutant, month, day, hour }
}


const chartData = computed(() => {
  const forecastItems = props.forecast ?? []
  const historicalItems = props.historical ?? []

  // 1) Collect unique groups from both arrays
  const groupMap = new Map<string, ReturnType<typeof makeGroup>>()

  for (const it of [...forecastItems, ...historicalItems]) {
    const g = makeGroup(it)
    if (!groupMap.has(g.key)) groupMap.set(g.key, g)
  }

  // 2) Sort: pollutant (alpha) -> date -> hour
  const groups = Array.from(groupMap.values()).sort((a, b) => {
    const byPoll = a.pollutant.localeCompare(b.pollutant, 'en', { numeric: true })
    if (byPoll !== 0) return byPoll
    // Sort by month/day, then hour (undefined goes last)
    const aNum = a.month * 100 + a.day
    const bNum = b.month * 100 + b.day
    if (aNum !== bNum) return aNum - bNum
    const ah = a.hour ?? 99
    const bh = b.hour ?? 99
    return ah - bh
  })

  // 3) Build labels (one per group)
  const labels = groups.map(g => g.label)

  // 4) Build aligned values for each dataset
  const forecastValues: number[] = []
  const historicalValues: number[] = []

  for (const g of groups) {
    const fItem = forecastItems.find(it => {
      const gi = makeGroup(it)
      return gi.key === g.key
    })
    const hItem = historicalItems.find(it => {
      const gi = makeGroup(it)
      return gi.key === g.key
    })
    forecastValues.push(fItem ? Number(fItem.concentration.toFixed(2)) : 0)
    historicalValues.push(hItem ? Number(hItem.concentration.toFixed(2)) : 0)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Forecast (2025)',
        data: forecastValues,
        backgroundColor: '#00bcd4',
        borderRadius: 4,
        categoryPercentage: 0.85,
        barPercentage: 0.85
      },
      {
        label: 'Historical (2024)',
        data: historicalValues,
        backgroundColor: '#ff9800',
        borderRadius: 4,
        categoryPercentage: 0.85,
        barPercentage: 0.85
      }
    ]
  }
})

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Concentration (µg/m³)',
        color: '#00bcd4',
        font: { size: 16, weight: 'bold' as const }
      },
      ticks: { color: '#ccc', font: { size: 14 } }
    },
    x: {
      stacked: false,
      grid: { display: false },
      ticks: {
        autoSkip: false,          // show every label
        maxRotation: 40,
        minRotation: 40,
        color: '#ccc',
        font: { size: 12, weight: 'bold' as const }
      }
    }
  },
  plugins: {
    legend: { labels: { color: '#fff' } },
    tooltip: {
      callbacks: {
        label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} µg/m³`
      }
    }
  }
}
</script>

<style scoped>
.full-height {
  width: 100%;
  height: 100%;
}
</style>
