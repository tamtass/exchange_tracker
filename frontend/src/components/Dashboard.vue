<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-pastel-green-300">Exchange Tracker Dashboard</h2>
      <div>
        <router-link to="/alerts" class="mr-4 text-pastel-green-300 hover:text-pastel-green-400 transition-colors">Alerts</router-link>
        <router-link to="/settings" class="text-pastel-green-300 hover:text-pastel-green-400 transition-colors">Settings</router-link>
      </div>
    </div>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-dark-grey-50 p-4 rounded shadow">
        <h3 class="font-medium mb-2 text-pastel-green-300">Current Rates</h3>
        <!-- placeholder -->
        <p class="text-gray-300">Rates will appear here.</p>
      </div>
      <div class="bg-dark-grey-50 p-4 rounded shadow">
        <h3 class="font-medium mb-2 text-pastel-green-300">Historical</h3>
        <RateChart />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import RateChart from './RateChart.vue'

export default defineComponent({
  name: 'Dashboard',
  components: { RateChart }
})
</script>
