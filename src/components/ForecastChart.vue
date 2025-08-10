<template>
  <q-card class="bg-backgroundDark p-4 shadow-none border-l border-zinc-800" style="width: 25rem; min-height: 320px;">
    <div class="text-h6 text-white mb-4 border-b border-zinc-700 pb-2">Forecast Chart</div>
    <Bar
      :data="chartData"
      :options="chartOptions"
      :key="chartKey"
    />
  </q-card>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bar } from 'vue-chartjs'
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js'
import { watch, computed, ref } from 'vue'
import { Forecast } from 'src/models/Forecast'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

// Props: forecast data array
const props = defineProps<{ forecast: Forecast[] }>()

const chartKey = ref(0) // force re-render on data change

const chartData = computed(() => {
  // Extract pollutant names as labels
  const labels = props.forecast.map(item => item.pollutant)

  // Extract concentrations for data
  const dataValues = props.forecast.map(item => Number(item.concentration.toFixed(2)))

  return {
    labels,
    datasets: [
      {
        label: 'Concentration (µg/m³)',
        data: dataValues,
        backgroundColor: '#00bcd4',
        borderRadius: 4,
        barPercentage: 0.6
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Concentration (µg/m³)'
      }
    },
    x: {
      ticks: {
        maxRotation: 90,
        minRotation: 45,
        autoSkip: false
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: '#fff'
      }
    },
    title: {
      display: false,
      text: ''
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (ctx: any) => `${ctx.parsed.y} µg/m³`
      }
    }
  }
}

// Watch props to force chart update (Chart.js sometimes caches data)
watch(() => props.forecast, () => {
  chartKey.value++
})
</script>

<style scoped>
.q-card {
  color: white;
}
</style>
