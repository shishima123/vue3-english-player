<script setup>
import { ref } from 'vue'
import { FirebaseEnums, getCurrentUser, signInFirebase } from '@/configs/firebase'
import { useSyncStore } from '@/stores/sync'
// icons
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

const syncStore = useSyncStore()
const emit = defineEmits(['setDefaultSettingFromLocalStorage', 'setPlayerSource'])

let isSyncing = ref(false)
async function sync() {
  isSyncing.value = true
  try {
    await syncStore.syncDownload(true)
    await emit('setDefaultSettingFromLocalStorage')
    await emit('setPlayerSource')
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
    // syncStore.onHideModalLogin()
  } catch (err) {
    error.value = err.message
  } finally {
    isLoggingIn.value = false
  }
}

function onClosed() {
  let user = getCurrentUser()
  if (user) {
    sync()
  } else {
    syncStore.onTurnOffSync()
  }
}
</script>

<template>
  <fieldset class="flex justify-between items-center my-1 fieldset-border">
    <legend>Sync</legend>
    <div>
      <div class="flex items-center text-base">
        <a-switch v-model:checked="syncStore.syncFlagState" />
        <span class="ml-2">Auto Sync</span>
      </div>
    </div>
    <div class="flex flex-col">
      <button class="btn" :class="{ disabled: isSyncing }" @click="sync">
        Sync Now
        <span class="flex justify-center ml-2" :class="{ 'animate-spin': isSyncing }">
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
        <span class="block text-xl uppercase font-bold mb-4 text-center">Login</span>
        <div class="mb-4">
          <label for="email" class="block text-xs mb-1">Email</label>
          <input
            class="w-full border rounded p-2 outline-none focus:outline-none focus:border-green-600"
            type="email"
            name="email"
            id="email"
            placeholder="Username or Email"
            v-model="email"
          />
        </div>
        <div class="mb-6 md:w-full">
          <label for="password" class="block text-xs mb-1">Password</label>
          <input
            class="w-full border rounded p-2 outline-none focus:outline-none focus:border-green-600"
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            v-model="password"
          />
        </div>
        <span v-if="error" class="block text-red-500 text-sm mb-4">{{ error }}</span>
        <div class="w-full text-center mb-1">
          <button type="submit" :class="{ disabled: isLoggingIn }" class="btn">Login</button>
        </div>
      </form>
    </a-modal>
  </Teleport>
</template>
