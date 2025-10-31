<template>
  <div class="p-4 bg-dark-grey-50 rounded shadow">
    <h3 class="font-medium mb-2 text-pastel-green-300">Create Alert</h3>
    <form @submit.prevent="save">
      <label class="block mb-2 text-gray-300">
        Currency pair (e.g. EUR/HUF)
        <input v-model="pair" class="w-full bg-dark-grey-100 border border-dark-grey-200 text-gray-100 rounded p-2 focus:border-pastel-green-400 focus:outline-none focus:ring-1 focus:ring-pastel-green-400" />
      </label>
      <label class="block mb-2 text-gray-300">
        Threshold
        <input v-model.number="threshold" type="number" class="w-full bg-dark-grey-100 border border-dark-grey-200 text-gray-100 rounded p-2 focus:border-pastel-green-400 focus:outline-none focus:ring-1 focus:ring-pastel-green-400" />
      </label>
      <button type="submit" class="py-2 px-4 bg-pastel-green-500 hover:bg-pastel-green-600 text-dark-grey-300 font-medium rounded transition-colors">Save</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useUserStore } from '../stores/user'

export default defineComponent({
  name: 'AlertSetup',
  setup() {
    const pair = ref('EUR/HUF')
    const threshold = ref<number | null>(null)
    const user = useUserStore()

    function save() {
      user.alerts.push({ pair: pair.value, threshold: threshold.value })
      // TODO: persist to Firestore
      pair.value = 'EUR/HUF'
      threshold.value = null
    }

    return { pair, threshold, save }
  }
})
</script>
