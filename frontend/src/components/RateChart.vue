<template>
  <div>
    <canvas ref="canvas" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default defineComponent({
  name: 'RateChart',
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null)

    onMounted(() => {
      if (!canvas.value) return
      new Chart(canvas.value, {
        type: 'line',
        data: {
          labels: ['Day 1', 'Day 2', 'Day 3'],
          datasets: [
            { label: 'EUR/HUF', data: [360, 370, 365], borderColor: '#3b82f6' }
          ]
        }
      })
    })

    return { canvas }
  }
})
</script>
