<template>
  <div ref="container" class="w-full" :style="{ height: `${contentHeight}px` }">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const container = ref<HTMLElement | null>(null)
const contentHeight = ref(window.innerHeight)

function updateHeight() {
  const header = document.querySelector('.q-header')
  const headerHeight = header ? header.clientHeight : 0
  contentHeight.value = window.innerHeight - headerHeight
}

onMounted(() => {
  updateHeight()
  window.addEventListener('resize', updateHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHeight)
})
</script>

<style scoped>
/* optional: for debugging or consistent layout */
</style>
