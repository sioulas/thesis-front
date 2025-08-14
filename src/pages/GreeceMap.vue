<template>
  <PageContainer class="bg-backgroundDark">
    <div class="row full-height">
      <q-card class="bg-backgroundDark p-4 shadow-none border-r border-zinc-800 " style="width: 20rem">
        <div class="text-h6 text-white mb-4 border-b border-zinc-700 pb-2">
          Map Filtering
        </div>
        <q-form @submit.prevent="onSubmit" ref="filterForm" class="grid grid-cols-1 gap-3">
          <q-select
            v-model="region"
            :options="regions"
            label="Region"
            label-color="black"
            class="region-select"
            dense
            clearable
            borderless
            emit-value
            map-options
            lazy-rules
            :rules="[val => !!val || 'Region is required']"
          />

          <q-input
            v-model="date"
            label="Date"
            dense
            label-color="black"
            class="date-input"
            borderless
            lazy-rules
            :rules="[val => !!val || 'Date is required']"
          >
            <template #append>
              <q-icon name="mdi-calendar-range" class="cursor-pointer text-primaryBlue">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="date" :options="optionsFn" mask="YYYY-MM-DD" dark>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" class="bg-primaryBlue"/>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-select
            v-model="pollutant"
            :options="pollutants"
            label="Pollutant"
            label-color="black"
            class="pollutant-select"
            multiple
            clearable
            dense
            borderless
            emit-value
            map-options
          />

          <q-btn
            label="Search"
            icon="mdi-map-search-outline"
            class="bg-primaryBlue text-white mt-5 transition-all duration-300"
            type="submit"
            unelevated
          />
        </q-form>
      </q-card>

      <div class="col full-height p-4">
        <div id="map" class="full-height w-full" />
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import L from 'leaflet'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { Feature, Point } from 'geojson'
import { useMeasurementsStore } from 'src/stores/pollution-store'
import { notify } from 'src/utils/notify'
import { QForm } from 'quasar'
import PageContainer from 'src/components/PageContainer.vue'

const measurementStore = useMeasurementsStore()

const router = useRouter()

const regions = computed(() => measurementStore.regions)
const pollutants = computed(() => measurementStore.pollutants)

const region = ref('')
const pollutant = ref<string[]>([])

const date = ref('2022-01-01')

let map: L.Map
let markerLayer: L.GeoJSON | null = null

const optionsFn = (dateStr: string) => {
  const date = new Date(dateStr)
  const min = new Date('2021-12-31')
  const max = new Date('2024-12-31')
  return date >= min && date <= max
}

onMounted(async () => {
  await measurementStore.fetchRegions()
  await measurementStore.fetchPollutants()

  map = L.map('map').setView([37.9838, 23.7275], 7)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)
})

function getColorByPollutant(pollutant: string, concentration: number): string {
  switch (pollutant) {
    case 'Particulate Matter 2.5 µg/m³':
      return concentration >= 15 ? '#e74c3c' : '#2ecc71'
    case 'Particulate Matter 10 µg/m³':
      return concentration >= 45 ? '#e74c3c' : '#2ecc71'
    case 'Nitrogen Dioxide (NO₂) µg/m³':
      return concentration >= 15 ? '#e74c3c' : '#2ecc71'
    case 'Sulphur Dioxide (SO₂) µg/m³':
      return concentration >= 40 ? '#e74c3c' : '#2ecc71'
    case 'Ozone (O₃) µg/m³':
      return concentration >= 100 ? '#e74c3c' : '#2ecc71'
    default:
      return '#95a5a6'
  }
}

async function loadData() {
  if (!region.value || !date.value) {
    notify({ message: 'Region or Date fields are missing. Request failed.', color: 'negative' })
    return
  }

  try {
    const { data } = await api.get('/air-quality', {
      params: {
        region: region.value,
        date: date.value,
        ...(pollutant.value.length > 0 && {
          pollutant: pollutant.value
        })
      },
      paramsSerializer: params => {
        const searchParams = new URLSearchParams()
        for (const key in params) {
          const value = params[key]
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v))
          } else {
            searchParams.append(key, value)
          }
        }
        return searchParams.toString()
      }
    })

    if (markerLayer) {
      map.removeLayer(markerLayer)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupedData = new Map<string, any[]>()

    for (const feature of data.features) {
      const coords = feature.geometry.coordinates
      const key = coords.join(',')

      if (!groupedData.has(key)) {
        groupedData.set(key, [])
      }
      groupedData.get(key)!.push(feature.properties)
    }

    markerLayer = L.geoJSON([], {
      pointToLayer: (_, latlng) => {
        const key = `${latlng.lng},${latlng.lat}`
        const propertiesList = groupedData.get(key)

        const popupContent = `
          <div style="
            font-family: sans-serif;
            padding: 1rem 1.2rem;
          ">

            <div style="
              margin: 0 0 0.75rem;
              font-size: 1.3rem;
              font-weight: 700;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 0.5rem;
            ">

              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#ecf0f1"
                  height="20"
                  viewBox="0 0 24 24"
                  width="20"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                ${propertiesList![0].region}
              </div>

              <button
                id="popup-pollutant-btn"
                title="Detail analysis for each pollutant."
                style="
                  background: #0D5EA6;
                  color: white;
                  font-size: 0.75rem;
                  padding: 0.25rem 0.5rem;
                  border-radius: 4px;
                  border: none;
                  cursor: pointer;
                "
              >
                Pollutant analysis
              </button>
            </div>

            <table style="
              width: max-content;
              font-size: 0.9rem;
              padding: 1rem;
              border-collapse: collapse;
              border: 1px solid #0D5EA6;
            ">
              <thead>
                <tr style="
                  text-align: left;
                  border-bottom: 2px solid #0D5EA6;
                ">
                  <th style="padding: 0.3rem 0.5rem;">Pollutant</th>
                  <th style="padding: 0.3rem 0.5rem;">Conc.</th>
                  <th style="padding: 0.3rem 0.5rem;">Date</th>
                </tr>
              </thead>
              <tbody>
                ${propertiesList!
                  .map(p => {
                    if (pollutant.value.length && !pollutant.value.includes(p.pollutant)) return ''

                    const color = getColorByPollutant(p.pollutant, Number(p.concentration))
                    return `
                      <tr>
                        <td style="padding: 0.3rem 0.5rem;">${p.pollutant}</td>
                        <td style="color: ${color}; font-weight: bold; padding: 0.3rem 0.5rem;">${p.concentration}</td>
                        <td style="padding: 0.3rem 0.5rem;">${p.date}</td>
                      </tr>
                    `
                  }).join('')}
              </tbody>
            </table>
          </div>
        `

        const marker = L.marker(latlng).bindPopup(popupContent)

        marker.on('popupopen', () => {
          const btn = document.getElementById('popup-pollutant-btn')
          if (btn) {
            btn.onclick = async () => {
              // Use Vue router to navigate
              await router.push({ name: 'Air Quality' }) // Replace with your actual route name
            }
          }
        })

        return marker
      }
    })

    for (const [key] of groupedData) {
      const [lng, lat] = key.split(',').map(Number)

      const geoJsonFeature: Feature<Point> = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng!, lat!]
        },
        properties: {}
      }

      markerLayer.addData(geoJsonFeature)
    }

    markerLayer.addTo(map)

    if (data.features.length > 0) {
      const coords = data.features[0].geometry.coordinates
      map.setView([coords[1], coords[0]], 10)
    }
  } catch (err) {
    console.error('Failed to load data', err)
    alert('Failed to load measurement data.')
  }
}


const filterForm = ref<QForm | null>(null)

const onSubmit = async () => {
  if (await filterForm.value?.validate()) {
    await loadData()
  } else {
    notify({ message: 'Please fill in all required fields.', color: 'negative' })
  }
}
</script>

<style>
.region-select.q-field--auto-height.q-field--dense .q-field__control,
.pollutant-select.q-field--auto-height.q-field--dense .q-field__control {
  background-color: #FBFBFB;
  border-radius: 4px;
  padding-left: 0.4rem;
}

.date-input.q-field--borderless.q-field--dense .q-field__control {
  background-color: #FBFBFB;
  border-radius: 4px;
  padding-left: 0.4rem;
  padding-right: 0.4rem;
}
</style>
