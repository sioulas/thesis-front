/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Pollution, PollutionGeoJSON } from 'src/models/Pollution'
import { Forecast } from 'src/models/Forecast'

export const useMeasurementsStore = defineStore('measurements', {
  state: () => ({
    forecastData: {
      data: [] as Forecast[],
      loading: false
    },
    measurementsData: {
      data: [] as Pollution[],
      loading: false
    },
    pollutionData: {
      data: [] as Forecast[],
      loading: false
    },
    regions: [] as string[],
    pollutants: [] as string[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchForecast(params: { region: string; date: string; pollutant?: string[] | undefined }) {
      try {
        this.forecastData.loading = true
        const response = await api.get('/forecast', {
          params: {
            region: params.region,
            date: params.date,
            pollutant: params.pollutant // backend should accept list for multiple
          }
        })
        this.forecastData.data = response.data
      } catch (err) {
        console.error('Error fetching forecast', err)
      } finally {
        this.forecastData.loading = false
      }
    },

    async fetchMeasurements(params: { region: string; date: string; pollutant?: string[] | undefined }) {
      try {
        this.measurementsData.loading = true
        const response = await api.get<PollutionGeoJSON>('/air-quality', {
          params: {
            region: params.region,
            date: params.date,
            pollutant: params.pollutant
          }
        })
        this.measurementsData.data = response.data.features
      } catch (err) {
        console.error('Error fetching measurements', err)
      } finally {
        this.measurementsData.loading = false
      }
    },

    async fetchPollution(params: { region: string; date: string; pollutant?: string[] | undefined }) {
      try {
        this.pollutionData.loading = true
        const response = await api.get('/pollution', {
          params: {
            region: params.region,
            date: params.date,
            pollutant: params.pollutant
          }
        })
        this.pollutionData.data = response.data
      } catch (err) {
        console.error('Error fetching forecast', err)
      } finally {
        this.pollutionData.loading = false
      }
    },

    async fetchRegions() {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get<{ regions: string[] }>('/regions')
        this.regions = data.regions
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch regions'
      } finally {
        this.loading = false
      }
    },

    async fetchPollutants() {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get<{ pollutants: string[] }>('/pollutants')
        this.pollutants = data.pollutants
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch pollutants'
      } finally {
        this.loading = false
      }
    }
  }
})
