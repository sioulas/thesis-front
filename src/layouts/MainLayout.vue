<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated>
      <q-toolbar
        class="bg-backgroundDark !shadow-none p-1">
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="text-primaryBlue ml-3"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="text-xl tracking-wide ml-2">
          <div class="row items-center">
            <q-icon name="mdi-map-marker-multiple-outline" class="q-mr-sm text-2xl text-primaryBlue" />
            <div class="column">
              <div class="text-primaryBlue">Greece</div>
              <div class="text-sm text-grey-4">Air Pollution</div>
            </div>
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      class="bg-primaryBlue text-lightText"
      :width="300"
      :breakpoint="500"
      :mini="!leftDrawerOpen|| miniState"
      @click.capture="drawerClick"
    >
      <q-scroll-area class="fit">
          <q-list>
            <template v-for="(drawerItem, index) in drawerItems" :key="index" >
              <q-item :to="drawerItem.to" active-class="bg-transparent/20" :exact="drawerItem.exact" router clickable>
                <q-item-section avatar>
                  <q-icon :name="drawerItem.icon" />
                </q-item-section>
                <q-item-section>
                  {{ drawerItem.label }}
                </q-item-section>
              </q-item>
              <q-separator dark :key="'sep' + index"  v-if="drawerItem.separator" />
            </template>
          </q-list>
        </q-scroll-area>

        <div class="q-mini-drawer-hide absolute" style="top: 5rem; right: -17px">
          <q-btn
            dense
            round
            unelevated
            class="bg-primaryBlue"
            icon="chevron_left"
            @click="miniState = true"
          />
        </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const leftDrawerOpen = ref(false)
const miniState = ref(false)

function drawerClick(e: Event) {
  if (miniState.value) {
    miniState.value = false
    e.stopPropagation()
  }
}

const drawerItems = [
  {
    icon: 'mdi-home',
    label: 'Home',
    to: '/',
    exact: true,
    separator: true
  },
  {
    icon: 'mdi-map-search',
    label: 'Air Quality Map',
    to: '/greece-map',
    exact: false,
    separator: false
  },
  {
    icon: 'mdi-air-filter',
    label: 'Air Quality Guideline',
    to: '/air-quality',
    exact: false,
    separator: true
  },
  {
    icon: 'mdi-cloud-arrow-right',
    label: 'Forecast Chart',
    to: '/future-predictions',
    exact: false,
    separator: false
  }
]

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
