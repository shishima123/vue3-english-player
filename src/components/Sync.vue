<script setup>
import { ref } from 'vue'
import { FirebaseEnums, getCurrentUser, signInFirebase } from '@/configs/firebase'
import { useSyncStore } from '@/stores/sync'
import { setTimeout } from 'worker-timers'
// icons
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { usePlayerStore } from '@/stores/player'
import { useRepeatStore } from '@/stores/repeat'

// store
const syncStore = useSyncStore()
const playerStore = usePlayerStore()
const repeatStore = useRepeatStore()

// ref
let isSyncing = ref(false)

async function onSync() {
  isSyncing.value = true
  try {
    await syncStore.syncDownload(true)
    repeatStore.resetSeekSlider()
    await playerStore.setCurrentSong()
    await playerStore.setPlayerSource()
  } catch (error) {
    if (error.message === FirebaseEnums.permission_denied) {
      syncStore.onShowModalLogin()
    }
  }

  setTimeout(() => {
    isSyncing.value = false
  }, 1000)
}

// Modal
let email = ref('shishima21@gmail.com')
let password = ref('')
let error = ref(null)
let isLoggingIn = ref(false)

async function onSubmit() {
  isLoggingIn.value = true
  error.value = null
  try {
    await signInFirebase(email.value, password.value)
    syncStore.onHideModalLogin()
  } catch (err) {
    error.value = err.message
  } finally {
    isLoggingIn.value = false
  }
}

function onClosed() {
  let user = getCurrentUser()
  if (user) {
    onSync()
  } else {
    syncStore.onTurnOffSync()
  }
}
</script>

<template>
  <fieldset class="fieldset-border my-1 flex items-center justify-between">
    <legend>Sync</legend>
    <div>
      <div class="flex items-center text-base">
        <a-switch v-model:checked="syncStore.syncFlagState" />
        <span class="ml-2">Auto Sync</span>
      </div>
    </div>
    <div class="flex flex-col">
      <button class="btn" :class="{ disabled: isSyncing }" @click="onSync">
        Sync Now
        <span class="ml-2 flex justify-center" :class="{ 'animate-spin': isSyncing }">
          <ArrowPathIcon class="h-5 w-5" />
        </span>
      </button>
    </div>
  </fieldset>
  <Teleport to="body">
    <a-modal
      v-model:open="syncStore.modalLoginState"
      title=" "
      :footer="null"
      width="300px"
      :afterClose="onClosed"
      centered
    >
      <form @submit.prevent="onSubmit">
        <span class="mb-4 block text-center text-xl font-bold uppercase">Login</span>
        <div class="mb-4">
          <label for="email" class="mb-1 block text-xs">Email</label>
          <input
            class="w-full rounded border p-2 outline-none focus:border-green-600 focus:outline-none"
            type="email"
            name="email"
            id="email"
            placeholder="Username or Email"
            v-model="email"
          />
        </div>
        <div class="mb-6 md:w-full">
          <label for="password" class="mb-1 block text-xs">Password</label>
          <input
            class="w-full rounded border p-2 outline-none focus:border-green-600 focus:outline-none"
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            v-model="password"
          />
        </div>
        <span v-if="error" class="mb-4 block text-sm text-red-500">{{ error }}</span>
        <div class="mb-1 w-full text-center">
          <button type="submit" :class="{ disabled: isLoggingIn }" class="btn">Login</button>
        </div>
      </form>
    </a-modal>
  </Teleport>
</template>
