<script setup>
import { ref, watch } from 'vue'
import { syncDownload } from '@/composables/sync'
import { FirebaseEnums, getCurrentUser } from '@/configs/firebase'
import ModalLogin from '@/components/ModalLogin.vue'

// icons
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

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
        <label class="switch mr-2">
          <input type="checkbox" v-model="syncFlagState" />
          <span class="slider round"></span>
        </label>
        Auto Sync
      </p>
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
  <modal-login v-model="showModalLogin" @handleAfterLogin="handleAfterLogin" @sync="sync" />
</template>
