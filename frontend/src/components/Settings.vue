<template>
  <div class="p-4 bg-dark-grey-50 rounded shadow">
    <h3 class="font-medium mb-2 text-pastel-green-300">Settings</h3>
    <label class="block mb-2 text-gray-300">
      Tracked currencies (comma-separated)
      <input v-model="tracked" class="w-full bg-dark-grey-100 border border-dark-grey-200 text-gray-100 rounded p-2 focus:border-pastel-green-400 focus:outline-none focus:ring-1 focus:ring-pastel-green-400" />
    </label>
    <button @click="save" class="py-2 px-4 bg-pastel-green-500 hover:bg-pastel-green-600 text-dark-grey-300 font-medium rounded transition-colors">Save</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useUserStore } from '../stores/user'

export default defineComponent({
  name: 'Settings',
  setup() {
    const user = useUserStore()
    const tracked = ref<string>((() => {
      const t: any = (user as any).tracked
      if (Array.isArray(t)) return t.join(',')
      if (t && Array.isArray(t.value)) return t.value.join(',')
      return 'USD,EUR,HUF'
    })())

    async function save() {
  const newTracked = tracked.value.split(',').map((s: string) => s.trim().toUpperCase())
      // persist to store (and Firestore when signed in)
      await user.saveTracked(newTracked)
    }

    return { tracked, save }
  }
})
</script>
