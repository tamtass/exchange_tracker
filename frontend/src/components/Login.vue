<template>
  <div class="min-h-screen flex items-center justify-center bg-dark-grey">
    <div class="w-full max-w-md p-8 bg-dark-grey-50 rounded shadow">
      <h1 class="text-2xl font-bold mb-4 text-pastel-green-300">Sign in</h1>
      <button @click="signInWithGoogle" class="w-full py-2 bg-pastel-green-500 hover:bg-pastel-green-600 text-dark-grey-300 font-medium rounded mb-4 transition-colors">Sign in with Google</button>
      <router-link to="/" class="text-pastel-green-300 hover:text-pastel-green-400 transition-colors">Continue as guest</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { auth, googleProvider, registerForPush } from '../services/firebase'
import { signInWithPopup } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter()
    const user = useUserStore()

    async function signInWithGoogle() {
      try {
        const res = await signInWithPopup(auth, googleProvider)
        const u = res.user
        user.setUser({ uid: u.uid, email: u.email || '' })
        // load user profile from Firestore into store
        await user.loadProfile()
        // register for push and save token to Firestore
        try { await registerForPush(u.uid) } catch (e) { console.warn('FCM register failed', e) }
        router.push('/')
      } catch (err) {
        console.error(err)
      }
    }

    return { signInWithGoogle }
  }
})
</script>
