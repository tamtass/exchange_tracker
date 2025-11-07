<template>
  <div class="p-8 bg-dark-grey min-h-screen">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold text-pastel-green-300 tracking-tight">Exchange Tracker</h2>
      <div class="flex gap-4">
        <button
          @click="showAlerts = true"
          class="px-4 py-2 rounded-full bg-dark-grey-50 text-pastel-green-400 hover:bg-pastel-green-400 hover:text-dark-grey transition-all duration-300 font-medium shadow-lg hover:shadow-pastel-green-400/50"
        >
          Alerts
        </button>
        <button
          @click="showSettings = true"
          class="px-4 py-2 rounded-full bg-dark-grey-50 text-pastel-green-400 hover:bg-pastel-green-400 hover:text-dark-grey transition-all duration-300 font-medium shadow-lg hover:shadow-pastel-green-400/50"
        >
          Settings
        </button>
      </div>
    </div>

    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-dark-grey-50 p-8 rounded-3xl shadow-2xl border border-dark-grey-100 hover:shadow-pastel-green-400/20 transition-all duration-300">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-pastel-green-300 text-xl flex items-center gap-2">
            <span class="w-2 h-2 bg-pastel-green-400 rounded-full animate-pulse"></span>
            Current Rates
          </h3>
          <button
            @click="showAddCurrency = true"
            class="px-3 py-1.5 rounded-full bg-pastel-green-400 text-dark-grey hover:bg-pastel-green-300 transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-pastel-green-400/50"
          >
            + Add Currency
          </button>
        </div>
        
        <div v-if="loading" class="text-gray-300 flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-pastel-green-400 border-t-transparent rounded-full animate-spin"></div>
          Loading rates...
        </div>
        <div v-else-if="error" class="text-red-400 px-4 py-3 bg-red-900/20 rounded-xl border border-red-500/30">{{ error }}</div>
        <div v-else-if="rates" class="space-y-4">
          <div 
            v-for="(rate, currency) in displayedRates" 
            :key="currency" 
            class="flex justify-between items-center text-gray-100 p-4 rounded-2xl bg-dark-grey-100/50 hover:bg-dark-grey-100 transition-all duration-200 border border-transparent hover:border-pastel-green-400/30 group"
          >
            <span class="font-bold text-pastel-green-300">{{ rates.base }}/{{ currency }}</span>
            <div class="flex items-center gap-3">
              <span class="text-gray-300 font-mono text-lg">{{ typeof rate === 'number' ? rate.toFixed(4) : rate }}</span>
              <button
                @click="removeCurrency(currency)"
                class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-200 text-sm"
                title="Remove currency"
              >
                ✕
              </button>
            </div>
          </div>
          <div class="text-xs text-gray-400 mt-6 pt-4 border-t border-dark-grey-100 flex items-center gap-2">
            <div class="w-1.5 h-1.5 bg-pastel-green-400 rounded-full"></div>
            Last updated: {{ lastUpdate }}
          </div>
        </div>
        <p v-else class="text-gray-300">Rates will appear here.</p>
      </div>
      
      <div class="bg-dark-grey-50 p-8 rounded-3xl shadow-2xl border border-dark-grey-100 hover:shadow-pastel-green-400/20 transition-all duration-300">
        <h3 class="font-bold mb-6 text-pastel-green-300 text-xl flex items-center gap-2">
          <span class="w-2 h-2 bg-pastel-green-400 rounded-full"></span>
          Historical Data
        </h3>
        <RateChart :tracked-currencies="trackedCurrencies" :data-limit="chartDataLimit" />
      </div>
    </section>

    <!-- Settings Modal -->
    <div 
      v-if="showSettings"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showSettings = false"
    >
      <div class="bg-dark-grey-50 p-8 rounded-3xl shadow-2xl border border-pastel-green-400/30 max-w-md w-full mx-4">
        <h3 class="text-2xl font-bold text-pastel-green-300 mb-6">Settings</h3>
        
        <div class="space-y-6">
          <!-- Refresh Rate Setting -->
          <div>
            <label class="block text-gray-300 mb-3 font-medium">Refresh Rate</label>
            <div class="space-y-2">
              <label v-for="option in refreshRateOptions" :key="option.value" class="flex items-center gap-3 p-3 rounded-xl bg-dark-grey-100/50 hover:bg-dark-grey-100 transition-all cursor-pointer">
                <input 
                  type="radio" 
                  :value="option.value" 
                  v-model="tempRefreshRate"
                  class="w-4 h-4 text-pastel-green-400 focus:ring-pastel-green-400 focus:ring-2"
                />
                <span class="text-gray-100">{{ option.label }}</span>
              </label>
            </div>
          </div>

          <!-- Chart Data Points Setting -->
          <div>
            <label class="block text-gray-300 mb-3 font-medium">Historical Data Points</label>
            <div class="space-y-2">
              <label v-for="option in dataPointOptions" :key="option.value" class="flex items-center gap-3 p-3 rounded-xl bg-dark-grey-100/50 hover:bg-dark-grey-100 transition-all cursor-pointer">
                <input 
                  type="radio" 
                  :value="option.value" 
                  v-model="tempDataLimit"
                  class="w-4 h-4 text-pastel-green-400 focus:ring-pastel-green-400 focus:ring-2"
                />
                <span class="text-gray-100">{{ option.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button
            @click="saveSettings"
            class="flex-1 px-4 py-3 rounded-xl bg-pastel-green-400 text-dark-grey hover:bg-pastel-green-300 transition-all duration-300 font-bold shadow-lg hover:shadow-pastel-green-400/50"
          >
            Save Settings
          </button>
          <button
            @click="cancelSettings"
            class="flex-1 px-4 py-3 rounded-xl bg-dark-grey-100 text-gray-300 hover:bg-dark-grey-200 transition-all duration-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Add Currency Modal -->
    <div 
      v-if="showAddCurrency"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddCurrency = false"
    >
      <div class="bg-dark-grey-50 p-8 rounded-3xl shadow-2xl border border-pastel-green-400/30 max-w-md w-full mx-4">
        <h3 class="text-2xl font-bold text-pastel-green-300 mb-6">Add Currency to Track</h3>
        
        <div class="mb-6">
          <label class="block text-gray-300 mb-2 font-medium">Select Currency</label>
          <select 
            v-model="selectedNewCurrency"
            class="w-full bg-dark-grey-100 text-gray-100 border-2 border-dark-grey-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pastel-green-400 transition-all duration-300"
          >
            <option value="">Choose a currency...</option>
            <option v-for="curr in availableCurrencies" :key="curr.code" :value="curr.code">
              {{ curr.code }} - {{ curr.name }}
            </option>
          </select>
        </div>

        <div class="flex gap-3">
          <button
            @click="addCurrency"
            :disabled="!selectedNewCurrency"
            class="flex-1 px-4 py-3 rounded-xl bg-pastel-green-400 text-dark-grey hover:bg-pastel-green-300 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pastel-green-400/50"
          >
            Add Currency
          </button>
          <button
            @click="showAddCurrency = false"
            class="flex-1 px-4 py-3 rounded-xl bg-dark-grey-100 text-gray-300 hover:bg-dark-grey-200 transition-all duration-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Alerts Modal -->
    <div 
      v-if="showAlerts"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAlerts = false"
    >
      <div class="bg-dark-grey-50 p-8 rounded-3xl shadow-2xl border border-pastel-green-400/30 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-2xl font-bold text-pastel-green-300 mb-6">Price Alerts</h3>
        
        <!-- Existing Alerts List -->
        <div v-if="alerts.length > 0" class="mb-6 space-y-3">
          <h4 class="text-lg font-semibold text-gray-300 mb-3">Active Alerts</h4>
          <div v-for="alert in alerts" :key="alert.id" class="flex items-center justify-between p-4 rounded-xl bg-dark-grey-100 border border-dark-grey-200">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-pastel-green-300">EUR/{{ alert.currency }}</span>
                <span class="text-xs px-2 py-1 rounded-full" :class="alert.type === 'above' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'">
                  {{ alert.type === 'above' ? '▲ Above' : '▼ Below' }}
                </span>
              </div>
              <div class="text-gray-300 text-sm">
                Alert when rate {{ alert.type === 'above' ? 'rises above' : 'drops below' }} <span class="font-mono font-bold text-pastel-green-400">{{ alert.value }}</span>
              </div>
            </div>
            <button
              @click="removeAlert(alert.id)"
              class="ml-4 p-2 rounded-lg text-red-400 hover:bg-red-900/20 transition-all"
              title="Delete alert"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Add New Alert -->
        <div class="border-t border-dark-grey-100 pt-6">
          <h4 class="text-lg font-semibold text-gray-300 mb-4">Create New Alert</h4>
          
          <div class="space-y-4">
            <!-- Currency Selection -->
            <div>
              <label class="block text-gray-300 mb-2 font-medium">Currency Pair</label>
              <select 
                v-model="newAlert.currency"
                class="w-full bg-dark-grey-100 text-gray-100 border-2 border-dark-grey-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pastel-green-400 transition-all duration-300"
              >
                <option value="">Select currency...</option>
                <option v-for="currency in trackedCurrencies" :key="currency" :value="currency">
                  EUR/{{ currency }}
                </option>
              </select>
            </div>

            <!-- Alert Type -->
            <div>
              <label class="block text-gray-300 mb-2 font-medium">Alert Type</label>
              <div class="grid grid-cols-2 gap-3">
                <label class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all" :class="newAlert.type === 'above' ? 'bg-green-900/30 border-2 border-green-400' : 'bg-dark-grey-100 border-2 border-transparent hover:border-dark-grey-200'">
                  <input 
                    type="radio" 
                    value="above" 
                    v-model="newAlert.type"
                    class="w-4 h-4"
                  />
                  <span class="text-gray-100">▲ Above Value</span>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all" :class="newAlert.type === 'below' ? 'bg-red-900/30 border-2 border-red-400' : 'bg-dark-grey-100 border-2 border-transparent hover:border-dark-grey-200'">
                  <input 
                    type="radio" 
                    value="below" 
                    v-model="newAlert.type"
                    class="w-4 h-4"
                  />
                  <span class="text-gray-100">▼ Below Value</span>
                </label>
              </div>
            </div>

            <!-- Target Value -->
            <div>
              <label class="block text-gray-300 mb-2 font-medium">Target Rate</label>
              <input 
                type="number"
                step="0.0001"
                v-model="newAlert.value"
                placeholder="e.g., 385.5000"
                class="w-full bg-dark-grey-100 text-gray-100 border-2 border-dark-grey-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pastel-green-400 transition-all duration-300 font-mono"
              />
            </div>

            <!-- Current Rate Display -->
            <div v-if="newAlert.currency && rates" class="p-3 rounded-xl bg-dark-grey-100/50 border border-pastel-green-400/20">
              <div class="text-xs text-gray-400 mb-1">Current Rate</div>
              <div class="text-lg font-mono font-bold text-pastel-green-300">
                {{ rates.rates[newAlert.currency] ? rates.rates[newAlert.currency].toFixed(4) : 'N/A' }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="addAlert"
            :disabled="!newAlert.currency || !newAlert.type || !newAlert.value"
            class="flex-1 px-4 py-3 rounded-xl bg-pastel-green-400 text-dark-grey hover:bg-pastel-green-300 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pastel-green-400/50"
          >
            Create Alert
          </button>
          <button
            @click="showAlerts = false"
            class="flex-1 px-4 py-3 rounded-xl bg-dark-grey-100 text-gray-300 hover:bg-dark-grey-200 transition-all duration-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, computed } from 'vue'
import RateChart from './RateChart.vue'
import { fetchLatest } from '../services/api'
import { db } from '../services/firebase'
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore'

export default defineComponent({
  name: 'Dashboard',
  components: { RateChart },
  setup() {
    const rates = ref<any>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const lastUpdate = ref<string>('')
    const showAddCurrency = ref(false)
    const selectedNewCurrency = ref('')
    const trackedCurrencies = ref<string[]>(['HUF', 'USD', 'GBP', 'RON'])
    const showSettings = ref(false)
    const showAlerts = ref(false)
    const refreshRate = ref(30000) // Default 30 seconds
    const tempRefreshRate = ref(30000)
    const chartDataLimit = ref(20) // Default 20 data points
    const tempDataLimit = ref(20)
    
    // Alerts state
    const alerts = ref<Array<{id: number, currency: string, type: 'above' | 'below', value: number}>>([])
    const newAlert = ref({
      currency: '',
      type: '' as 'above' | 'below' | '',
      value: null as number | null
    })
    let alertIdCounter = 1
    
    let intervalId: number | null = null

    const refreshRateOptions = [
      { label: '5 seconds', value: 5000 },
      { label: '10 seconds', value: 10000 },
      { label: '30 seconds', value: 30000 },
      { label: '1 minute', value: 60000 },
      { label: '5 minutes', value: 300000 }
    ]

    const dataPointOptions = [
      { label: '10 points', value: 10 },
      { label: '20 points', value: 20 },
      { label: '50 points', value: 50 },
      { label: '100 points', value: 100 },
      { label: '200 points', value: 200 }
    ]

    // Computed property to filter rates based on tracked currencies
    const displayedRates = computed(() => {
      if (!rates.value || !rates.value.rates) return {}
      
      const filtered: Record<string, number> = {}
      trackedCurrencies.value.forEach(currency => {
        if (rates.value.rates[currency] !== undefined) {
          filtered[currency] = rates.value.rates[currency]
        }
      })
      return filtered
    })

    // List of popular currencies to add
    const allCurrencies = [
      { code: 'HUF', name: 'Hungarian Forint' },
      { code: 'USD', name: 'US Dollar' },
      { code: 'GBP', name: 'British Pound' },
      { code: 'RON', name: 'Romanian Leu' },
      { code: 'CHF', name: 'Swiss Franc' },
      { code: 'JPY', name: 'Japanese Yen' },
      { code: 'CAD', name: 'Canadian Dollar' },
      { code: 'AUD', name: 'Australian Dollar' },
      { code: 'CNY', name: 'Chinese Yuan' },
      { code: 'SEK', name: 'Swedish Krona' },
      { code: 'NOK', name: 'Norwegian Krone' },
      { code: 'DKK', name: 'Danish Krone' },
      { code: 'PLN', name: 'Polish Zloty' },
      { code: 'CZK', name: 'Czech Koruna' },
      { code: 'BGN', name: 'Bulgarian Lev' },
      { code: 'TRY', name: 'Turkish Lira' },
      { code: 'INR', name: 'Indian Rupee' },
      { code: 'BRL', name: 'Brazilian Real' },
      { code: 'ZAR', name: 'South African Rand' },
      { code: 'MXN', name: 'Mexican Peso' }
    ]

    const availableCurrencies = computed(() => {
      return allCurrencies.filter(curr => !trackedCurrencies.value.includes(curr.code))
    })

    const loadRates = async () => {
      try {
        loading.value = true
        error.value = null
        
        console.log('Fetching rates from API...')
        const data = await fetchLatest('EUR', trackedCurrencies.value)
        console.log('API response:', data)
        console.log('API response structure:', JSON.stringify(data, null, 2))
        
        rates.value = data
        lastUpdate.value = new Date().toLocaleTimeString()

        // Check alerts
        checkAlerts(data)

        // Save to Firestore - handle the actual API structure
        try {
          console.log('Attempting to save to Firestore...')
          
          const rateData = {
            base: data.base || 'EUR',
            rates: data.rates || data,
            timestamp: serverTimestamp(),
            date: new Date().toISOString().split('T')[0]
          }
          
          console.log('Prepared data for Firestore:', rateData)
          
          const docRef = await addDoc(collection(db, 'exchangeRates'), rateData)
          
          console.log('✅ Rates saved successfully! Document ID:', docRef.id)
        } catch (dbErr: any) {
          console.error('❌ Firestore save error:', dbErr)
          console.error('Error code:', dbErr.code)
          console.error('Error message:', dbErr.message)
          
          if (dbErr.code === 'permission-denied') {
            console.error('🔒 Permission denied! Check Firestore security rules.')
          } else if (dbErr.code === 'unavailable') {
            console.error('🌐 Firestore unavailable. Check internet connection.')
          }
        }
      } catch (err: any) {
        console.error('Error fetching rates:', err)
        error.value = err.message || 'Failed to fetch rates'
      } finally {
        loading.value = false
      }
    }

    const addCurrency = () => {
      if (selectedNewCurrency.value && !trackedCurrencies.value.includes(selectedNewCurrency.value)) {
        trackedCurrencies.value.push(selectedNewCurrency.value)
        selectedNewCurrency.value = ''
        showAddCurrency.value = false
        saveUserPreferences() // Save to Firestore
        loadRates() // Reload rates with new currency
      }
    }

    const removeCurrency = (currency: string) => {
      if (trackedCurrencies.value.length > 1) {
        trackedCurrencies.value = trackedCurrencies.value.filter(c => c !== currency)
        saveUserPreferences() // Save to Firestore
        loadRates() // Reload rates without removed currency
      } else {
        alert('You must track at least one currency!')
      }
    }

    const saveSettings = () => {
      refreshRate.value = tempRefreshRate.value
      chartDataLimit.value = tempDataLimit.value
      showSettings.value = false
      
      // Restart interval with new refresh rate
      if (intervalId !== null) {
        clearInterval(intervalId)
      }
      intervalId = window.setInterval(loadRates, refreshRate.value)
      
      console.log(`Settings saved: Refresh rate=${refreshRate.value}ms, Data points=${chartDataLimit.value}`)
    }

    const cancelSettings = () => {
      // Reset temp values to current values
      tempRefreshRate.value = refreshRate.value
      tempDataLimit.value = chartDataLimit.value
      showSettings.value = false
    }

    const addAlert = () => {
      if (newAlert.value.currency && newAlert.value.type && newAlert.value.value) {
        alerts.value.push({
          id: alertIdCounter++,
          currency: newAlert.value.currency,
          type: newAlert.value.type,
          value: newAlert.value.value
        })
        
        // Reset form
        newAlert.value = {
          currency: '',
          type: '',
          value: null
        }
        
        saveUserPreferences() // Save to Firestore
        console.log('Alert created:', alerts.value[alerts.value.length - 1])
      }
    }

    const removeAlert = (id: number) => {
      alerts.value = alerts.value.filter(alert => alert.id !== id)
      saveUserPreferences() // Save to Firestore
      console.log('Alert removed:', id)
    }

    const checkAlerts = (data: any) => {
      if (!data.rates) return
      
      alerts.value.forEach(alertItem => {
        const currentRate = data.rates[alertItem.currency]
        if (!currentRate) return
        
        let triggered = false
        if (alertItem.type === 'above' && currentRate > alertItem.value) {
          triggered = true
        } else if (alertItem.type === 'below' && currentRate < alertItem.value) {
          triggered = true
        }
        
        if (triggered) {
          const message = `🔔 Alert: EUR/${alertItem.currency} is ${alertItem.type} ${alertItem.value}! Current rate: ${currentRate.toFixed(4)}`
          console.log(message)
          
          // Show browser notification if available
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Exchange Rate Alert', {
              body: message,
              icon: '/favicon.svg'
            })
          } else {
            // Fallback to window.alert
            window.alert(message)
          }
        }
      })
    }

    const saveUserPreferences = async () => {
      try {
        await setDoc(doc(db, 'userPreferences', 'default'), {
          trackedCurrencies: trackedCurrencies.value,
          alerts: alerts.value,
          refreshRate: refreshRate.value,
          chartDataLimit: chartDataLimit.value,
          updatedAt: serverTimestamp()
        })
        console.log('✅ User preferences saved to Firestore')
      } catch (err) {
        console.error('❌ Error saving preferences:', err)
      }
    }

    const loadUserPreferences = async () => {
      try {
        const docRef = doc(db, 'userPreferences', 'default')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          console.log('📥 Loading user preferences from Firestore:', data)
          
          if (data.trackedCurrencies && data.trackedCurrencies.length > 0) {
            trackedCurrencies.value = data.trackedCurrencies
          }
          
          if (data.alerts) {
            alerts.value = data.alerts
            // Update alertIdCounter to avoid ID conflicts
            if (data.alerts.length > 0) {
              alertIdCounter = Math.max(...data.alerts.map((a: any) => a.id)) + 1
            }
          }
          
          if (data.refreshRate) {
            refreshRate.value = data.refreshRate
            tempRefreshRate.value = data.refreshRate
          }
          
          if (data.chartDataLimit) {
            chartDataLimit.value = data.chartDataLimit
            tempDataLimit.value = data.chartDataLimit
          }
          
          console.log('✅ User preferences loaded successfully')
        } else {
          console.log('ℹ️ No saved preferences found, using defaults')
        }
      } catch (err) {
        console.error('❌ Error loading preferences:', err)
      }
    }

    onMounted(async () => {
      console.log('Dashboard mounted. Loading user preferences...')
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
      }
      
      // Load user preferences before starting rate fetching
      await loadUserPreferences()
      
      console.log('Starting rate fetching...')
      await loadRates()
      intervalId = window.setInterval(loadRates, refreshRate.value)
    })

    onBeforeUnmount(() => {
      if (intervalId !== null) {
        clearInterval(intervalId)
        console.log('Dashboard unmounted. Stopped rate fetching.')
      }
    })

    return {
      rates,
      loading,
      error,
      lastUpdate,
      displayedRates,
      showAddCurrency,
      selectedNewCurrency,
      availableCurrencies,
      trackedCurrencies,
      addCurrency,
      removeCurrency,
      showSettings,
      tempRefreshRate,
      tempDataLimit,
      chartDataLimit,
      refreshRateOptions,
      dataPointOptions,
      saveSettings,
      cancelSettings,
      showAlerts,
      alerts,
      newAlert,
      addAlert,
      removeAlert
    }
  }
})
</script>
