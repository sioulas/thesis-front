<template>
  <PageContainer class="bg-backgroundDark">
    <div class="row full-height">
      <q-card class="bg-backgroundDark p-4 shadow-none border-r border-zinc-800 " style="width: 20rem">
        <div class="text-h6 text-white mb-4 border-b border-zinc-700 pb-2">
          Pollution Forecasting
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
        <ForecastChart :forecast="forecastData" :historical="pollutionData" class="full-height w-full"/>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMeasurementsStore } from 'src/stores/pollution-store'
import { notify } from 'src/utils/notify'
import { QForm } from 'quasar'
import PageContainer from 'src/components/PageContainer.vue'
import ForecastChart from 'src/components/ForecastChart.vue'

const measurementStore = useMeasurementsStore()

const regions = computed(() => measurementStore.regions)
const pollutants = computed(() => measurementStore.pollutants)

const region = ref<string | null>(null)
const pollutant = ref<string[]>([])
const date = ref('2025-01-27')

const optionsFn = (dateStr: string) => {
  const date = new Date(dateStr)
  const min = new Date('2024-12-31')
  return date >= min
}


const forecastData = computed(() => measurementStore.forecastData.data)
const pollutionData = computed(() => measurementStore.pollutionData.data)

onMounted(async () => {
  await measurementStore.fetchRegions()
  await measurementStore.fetchPollutants()
})

const filterForm = ref<QForm>()

const onSubmit = async () => {
  const valid = await filterForm.value?.validate()
  if (!valid) {
    notify({ message: 'Please fill in all required fields.', color: 'negative' })
    return
  }

  const params = {
    region: region.value!,
    date: date.value,
    pollutant: pollutant.value.length ? pollutant.value : undefined
  }

  // Fetch forecast with the selected date
  await measurementStore.fetchForecast(params)

  // Force date to 2023 for measurements
  const date2023 = params.date.replace(/^\d{4}/, '2024')
  await measurementStore.fetchPollution({
    ...params,
    date: date2023
  })
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

