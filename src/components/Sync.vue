<script setup>
import { ref, watch } from 'vue'
import { syncDownload } from '@/composables/sync'
import { FirebaseEnums, getCurrentUser } from '@/configs/firebase'
import ModalLogin from '@/components/ModalLogin.vue'

let syncFlagState = ref(true)
let isSyncing = ref(false)
const showModalLogin = ref(false)

const emit = defineEmits(['setDefaultSettingFromLocalStorage', 'setPlayerSource'])
defineExpose({ setDefaultSettingFromLocalStorage, onShowModalLogin, syncFlagState })

async function sync() {
  isSyncing.value = true
  try {
    await syncDownload()
    await emit('setDefaultSettingFromLocalStorage')
    await emit('setPlayerSource')
  } catch (error) {
    if (error.message === FirebaseEnums.permission_denied) {
      onShowModalLogin()
    }
  }

  setTimeout(() => {
    isSyncing.value = false
  }, 500)
}

function handleAfterLogin() {
  let user = getCurrentUser()
  if (user) {
    sync()
  } else {
    syncFlagState.value = false
  }
}

function onShowModalLogin() {
  showModalLogin.value = true
}

function setDefaultSettingFromLocalStorage() {
  if (localStorage['syncFlagState']) {
    syncFlagState.value = localStorage['syncFlagState'] == 'true'
  }
}

watch(syncFlagState, async (value) => {
  localStorage.syncFlagState = value
  if (value) {
    let user = getCurrentUser()
    if (!user) {
      onShowModalLogin()
    }
  }
})
</script>

<template>
  <fieldset class="flex justify-between items-center my-1 fieldset-border">
    <legend>Sync</legend>
    <div>
      <p class="text-base">
        Auto Sync
        <label class="switch ml-2">
          <input type="checkbox" v-model="syncFlagState" />
          <span class="slider round"></span>
        </label>
      </p>
    </div>
    <div class="flex flex-col">
      <button class="btn" :class="{ disabled: isSyncing }" @click="sync">
        <svg
          :class="{ 'animate-spin !inline-block': isSyncing }"
          class="-ml-1 mr-3 h-5 w-5 text-white hidden"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Sync Now
      </button>
    </div>
  </fieldset>
  <modal-login v-model="showModalLogin" @handleAfterLogin="handleAfterLogin" @sync="sync" />
</template>
