<template>
  <div>
    <div class="mb-6">
      <label for="currency-select" class="text-sm text-gray-400 mb-2 block font-medium">Select Currency Pair</label>
      <select 
        id="currency-select"
        v-model="selectedCurrency" 
        @change="updateChart"
        class="w-full bg-dark-grey-100 text-gray-100 border-2 border-dark-grey-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pastel-green-400 transition-all duration-300 shadow-lg hover:shadow-pastel-green-400/30 cursor-pointer"
      >
        <option v-for="currency in trackedCurrencies" :key="currency" :value="currency">
          EUR/{{ currency }}
        </option>
      </select>
    </div>
    <div class="rounded-2xl overflow-hidden bg-dark-grey-100/30 p-4">
      <canvas ref="canvas" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUnmount, watch, PropType } from 'vue'
import { Chart, registerables } from 'chart.js'
import { db } from '../services/firebase'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'

Chart.register(...registerables)

export default defineComponent({
  name: 'RateChart',
  props: {
    trackedCurrencies: {
      type: Array as PropType<string[]>,
      required: true
    },
    dataLimit: {
      type: Number,
      default: 20
    }
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement | null>(null)
    const selectedCurrency = ref<string>('')
    let chart: Chart | null = null
    let unsubscribe: (() => void) | null = null
    let cachedData: any = {
      labels: []
    }

    watch(() => props.trackedCurrencies, (newCurrencies) => {
      if (newCurrencies.length > 0 && !selectedCurrency.value) {
        selectedCurrency.value = newCurrencies[0]
      }
      if (!newCurrencies.includes(selectedCurrency.value) && newCurrencies.length > 0) {
        selectedCurrency.value = newCurrencies[0]
        updateChart()
      }
    }, { immediate: true })

    watch(() => props.dataLimit, () => {
      if (unsubscribe) {
        unsubscribe()
      }
      setupFirestoreListener()
    })

    const getCurrencyColor = (currency: string) => {
      const colors: Record<string, string> = {
        HUF: '#98D8B1',
        USD: '#6CC891',
        GBP: '#B7E3C9',
        RON: '#44B572'
      }
      return colors[currency] || '#98D8B1'
    }

    const updateChart = () => {
      if (!chart) return
      
      const currency = selectedCurrency.value
      chart.data.labels = cachedData.labels
      chart.data.datasets[0].data = cachedData[currency]
      chart.data.datasets[0].label = `EUR/${currency}`
      chart.data.datasets[0].borderColor = getCurrencyColor(currency)
      chart.data.datasets[0].backgroundColor = getCurrencyColor(currency) + '20'
      chart.update()
    }

    const setupFirestoreListener = () => {
      const q = query(
        collection(db, 'exchangeRates'),
        orderBy('timestamp', 'desc'),
        limit(props.dataLimit)
      )

      unsubscribe = onSnapshot(q, (snapshot) => {
        const labels: string[] = []
        const dataByCurrency: Record<string, number[]> = {}

        props.trackedCurrencies.forEach(curr => {
          dataByCurrency[curr] = []
        })

        snapshot.docs.reverse().forEach((doc) => {
          const data = doc.data()
          const timestamp = data.timestamp?.toDate()
          
          if (timestamp) {
            labels.push(timestamp.toLocaleTimeString())
          }
          
          if (data.rates) {
            props.trackedCurrencies.forEach(curr => {
              dataByCurrency[curr].push(data.rates[curr] || 0)
            })
          }
        })

        cachedData = {
          labels,
          ...dataByCurrency
        }

        updateChart()
      }, (error) => {
        console.error('Error fetching chart data:', error)
      })
    }

    onMounted(() => {
      if (!canvas.value) return

      chart = new Chart(canvas.value, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            { 
              label: 'EUR/HUF', 
              data: [], 
              borderColor: getCurrencyColor('HUF'),
              backgroundColor: getCurrencyColor('HUF') + '20',
              tension: 0.1,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(40, 40, 40, 0.95)',
              titleColor: '#f3f4f6',
              bodyColor: '#f3f4f6',
              borderColor: '#98D8B1',
              borderWidth: 1,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || ''
                  if (label) {
                    label += ': '
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y.toFixed(4)
                  }
                  return label
                }
              }
            },
            legend: {
              display: true,
              labels: {
                color: '#f3f4f6'
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                color: '#9ca3af'
              },
              grid: {
                color: '#2D2D2D'
              }
            },
            x: {
              ticks: {
                color: '#9ca3af'
              },
              grid: {
                color: '#2D2D2D'
              }
            }
          }
        }
      })

      setupFirestoreListener()
    })

    onBeforeUnmount(() => {
      if (unsubscribe) {
        unsubscribe()
      }
      if (chart) {
        chart.destroy()
      }
    })

    return { 
      canvas,
      selectedCurrency,
      updateChart
    }
  }
})
</script>
