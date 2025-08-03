<template>
  <q-page class="q-pa-none bg-backgroundDark overflow-hidden flex items-center justify-center relative">
    <div
      id="air-lottie"
      class="absolute top-0 left-0 w-full z-0 pointer-events-none"
    />

    <div class="relative z-10 flex flex-col items-center justify-center gap-6 text-center">
      <router-link to="/greece-map">
        <q-img
          src="/Greece-3d.jpg"
          height="300px"
          width="300px"
          class="rounded-full shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
          spinner-color="primary"
        />
      </router-link>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import lottie from 'lottie-web'

onMounted(() => {
  lottie.loadAnimation({
    container: document.getElementById('air-lottie')!,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/animations/index-wave.json',
  })
})
</script>
