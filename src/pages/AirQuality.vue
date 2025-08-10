<template>
  <q-page class="bg-backgroundDark text-lightText column p-2">
    <div class="flex items-center justify-center my-auto">
      <q-btn
        round
        flat
        icon="mdi-arrow-left"
        class="text-xl text-center mr-10"
        @click="previousPollutant"
        :disable="selectedIndex === 0"
      />
    <q-card
      v-if="selectedPollutant"
      class="q-mb-xl bg-dark text-base p-2 text-lightText border-primaryBlue rounded-borders w-[50%]"
    >
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-h5 text-lightText">
            {{ selectedPollutant.pollutant }}
          </div>
          <q-badge class="bg-primaryBlue text-lightText" align="top">
            {{ selectedPollutant.period }}
          </q-badge>
        </div>

        <q-separator spaced color="primaryBlue" />

        <!-- WHO Guideline -->
        <div class="q-mt-sm">
          <q-icon name="science" class="q-mr-sm text-blue" />
          <span class="text-subtitle2">WHO Guideline:</span>
          <span class="text-bold q-ml-xs">{{ selectedPollutant.guideline }}</span>
        </div>

        <!-- Health Effects -->
        <div class="q-mt-sm">
          <q-icon name="healing" class="q-mr-sm text-red" />
          <span class="text-subtitle2">Health Effects:</span>
          <div class="q-ml-lg">{{ selectedPollutant.health }}</div>
        </div>

        <!-- At-Risk Groups -->
        <div class="q-mt-sm">
          <q-icon name="groups" class="q-mr-sm text-orange" />
          <span class="text-subtitle2">At-Risk Groups:</span>
          <div class="q-ml-lg">{{ selectedPollutant.groups }}</div>
        </div>

        <!-- Scientific Description -->
        <div class="q-mt-sm">
          <q-icon name="info" class="q-mr-sm text-teal" />
          <span class="text-subtitle2">Description:</span>
          <div class="q-ml-lg">{{ pollutantDescription }}</div>
        </div>
      </q-card-section>
    </q-card>

    <q-btn
    round
    dense
    flat
    icon="mdi-arrow-right"
    class="text-xl text-center ml-10"
    @click="nextPollutant"
    :disable="selectedIndex === rows.length - 1"
  />
</div>


  <q-table
    title="Pollution Table"
    :rows="rows"
    :columns="columns"
    row-key="pollutant"
    :filter="search"
    :pagination="{ rowsPerPage: 5 }"
    :rows-per-page-options="[5, 10, 20]"
    :row-class="getRowClass"
    separator="vertical"
    dark
    class="border bg-backgroundDark text-lightText shadow-none"
    @row-click="selectPollutant"
  >
    <template #top-right>
      <q-input
        v-model="search"
        label="Search pollutants..."
        dense
        borderless
        debounce="300"
        clearable
        class="w-[13rem] bg-gray-200 rounded-sm px-2"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>

    <template #header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.label }}
          <q-tooltip v-if="tooltipMap[col.name]" class="bg-accent text-black">
            {{ tooltipMap[col.name] }}
          </q-tooltip>
        </q-th>
      </q-tr>
    </template>
  </q-table>
</q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { QTableProps } from 'quasar'
import { pollutantDescriptions } from 'src/utils/descriptions'

const search = ref('')

const pollutantDescription = computed(() =>
  pollutantDescriptions[selectedPollutant.value!.pollutant] || ''
)

const tooltipMap: Record<string, string> = {
  guideline: 'μg/m³ = micrograms per cubic meter',
  period: 'Averaging time for the measurement',
  health: 'Known health effects from exposure',
  groups: 'Vulnerable populations affected',
}

const getRowClass = (row: typeof rows[0]) => {
  const value = parseInt(row.guideline)
  return !isNaN(value) && value > 40 ? 'bg-red-2 text-red-10' : ''
}

const columns: QTableProps['columns'] = [
  { name: 'pollutant', align: 'center', label: 'Pollutant', field: 'pollutant' },
  { name: 'guideline', align: 'center', label: 'WHO Guideline', field: 'guideline' },
  { name: 'period', align: 'center', label: 'Averaging Period', field: 'period' },
  { name: 'health', align: 'center', label: 'Health Effects', field: 'health' },
  { name: 'groups', align: 'center', label: 'At-Risk Groups', field: 'groups' },
]

const rows = [
  {
    pollutant: 'Particulate Matter 2.5 (PM₂.₅)',
    guideline: '15 μg/m³',
    period: '24-hour',
    health: 'Lung inflammation, cardiovascular issues',
    groups: 'Children, elderly, people with heart/lung disease'
  },
  {
    pollutant: 'Particulate Matter 10 (PM₁₀)',
    guideline: '45 μg/m³',
    period: '24-hour',
    health: 'Respiratory symptoms, reduced lung function',
    groups: 'Children, elderly, people with heart/lung disease'
  },
  {
    pollutant: 'Nitrogen Dioxide (NO₂)',
    guideline: '25 μg/m³',
    period: '24-hour',
    health: 'Airway inflammation, asthma aggravation',
    groups: 'People with asthma or COPD'
  },
  {
    pollutant: 'Sulphur Dioxide (SO₂)',
    guideline: '40 μg/m³',
    period: '24-hour',
    health: 'Bronchoconstriction, respiratory symptoms',
    groups: 'Asthmatics, elderly'
  },
  {
    pollutant: 'Ozone (O₃)',
    guideline: '100 μg/m³',
    period: '8-hour',
    health: 'Reduced lung function, respiratory irritation',
    groups: 'Children, outdoor workers, people with asthma'
  },
]

const selectedPollutant = ref(rows[0])

function selectPollutant(_evt: Event, row: typeof rows[0]) {
  selectedPollutant.value = row
}

const selectedIndex = computed(() =>
  rows.findIndex(r => r.pollutant === selectedPollutant.value?.pollutant)
)

function previousPollutant() {
  if (selectedIndex.value > 0) {
    selectedPollutant.value = rows[selectedIndex.value - 1]
  }
}

function nextPollutant() {
  if (selectedIndex.value < rows.length - 1) {
    selectedPollutant.value = rows[selectedIndex.value + 1]
  }
}

</script>
