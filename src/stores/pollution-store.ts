import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'
import { Pollution, PollutionGeoJSON } from 'src/models/Pollution'

export const useMeasurementsStore = defineStore('measurements', () => {
  const measurements = ref<Pollution[]>([])
  const regions = ref<string[]>()
  const pollutants = ref<string[]>()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMeasurements() {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get<PollutionGeoJSON>('/air-quality')
      measurements.value = data.features
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch measurements'
    } finally {
      loading.value = false
    }
  }

  async function fetchRegions() {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get<{ regions: string[] }>('/regions')
      regions.value = data.regions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch regions'
    } finally {
      loading.value = false
    }
  }

  async function fetchPollutants() {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get<{ pollutants: string[] }>('/pollutants')
      pollutants.value = data.pollutants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch pollutants'
    } finally {
      loading.value = false
    }
  }

  return {
    measurements,
    regions,
    pollutants ,
    loading,
    error,
    fetchMeasurements,
    fetchRegions,
    fetchPollutants
  }
})
