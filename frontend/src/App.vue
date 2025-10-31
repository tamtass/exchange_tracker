<template>
  <div class="min-h-screen bg-dark-grey text-gray-100">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'App'
})
</script>

<style>
html, body, #app { height: 100%; }
</style>
