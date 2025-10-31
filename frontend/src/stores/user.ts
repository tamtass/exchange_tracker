import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserProfile, saveUserProfile } from '../services/firebase'

export const useUserStore = defineStore('user', () => {
  const uid = ref<string | null>(null)
  const email = ref<string | null>(null)
  const tracked = ref<string[]>(['USD', 'EUR', 'HUF'])
  const alerts = ref<any[]>([])

  function setUser(u: { uid: string; email: string } | null) {
    if (u) {
      uid.value = u.uid
      email.value = u.email
    } else {
      uid.value = null
      email.value = null
      tracked.value = ['USD', 'EUR', 'HUF']
      alerts.value = []
    }
  }

  async function loadProfile() {
    if (!uid.value) return
    const data = await getUserProfile(uid.value)
    if (!data) return
    if (Array.isArray(data.tracked)) tracked.value = data.tracked
    if (Array.isArray(data.alerts)) alerts.value = data.alerts
  }

  async function saveTracked(newTracked: string[]) {
    if (!uid.value) return
    tracked.value = newTracked
    await saveUserProfile(uid.value, { tracked: newTracked })
  }

  async function saveAlerts(newAlerts: any[]) {
    if (!uid.value) return
    alerts.value = newAlerts
    await saveUserProfile(uid.value, { alerts: newAlerts })
  }

  return { uid, email, tracked, alerts, setUser, loadProfile, saveTracked, saveAlerts }
})
