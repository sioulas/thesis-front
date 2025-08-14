<template>
  <q-dialog ref="dialogRef">
    <q-card class="bg-dark text-lightText">
      <q-card-section class="bg-primary p-3">
        <div class="text-lg">Protective measure for {{ pollutantName }} </div>
      </q-card-section>

      <q-separator color="primaryBlue" />

      <q-card-section v-if="measures.length">

      <q-list separator padding class="rounded-borders">
        <q-item
          v-for="(item, idx) in measures"
          :key="idx"
          dense
          class="hover:bg-primaryBlue/10 transition-all rounded-borders"
        >
          <q-item-section avatar>
            <q-icon name="mdi-check-circle-outline" class="text-primaryBlue" />
          </q-item-section>
            <q-item-section>
              <div class="text-lightText">{{ item }}</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" @click="onDialogHide" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { protectiveMeasures } from 'src/utils/protectiveMeasures'
import { computed } from 'vue'


const measures = computed(() => protectiveMeasures[props.pollutantName] || [])

const props = defineProps<{
  pollutantName: string
}>()

const { dialogRef,  onDialogHide } = useDialogPluginComponent()

</script>
