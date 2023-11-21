<script setup>
import { ref, watch } from 'vue'
import { createToast } from 'mosha-vue-toastify'
import { syncDownload } from '@/helpers/sync'

let syncFlagState = ref(true)

const emit = defineEmits(['setDefaultSettingFromLocalStorage'])
defineExpose({ setDefaultSettingFromLocalStorage, syncFlagState })

async function sync() {
  await syncDownload()
  await emit('setDefaultSettingFromLocalStorage')
  showSyncCompletedNotify()
}

function showSyncCompletedNotify() {
  createToast('Sync successfully', {
    hideProgressBar: false,
    transition: 'zoom',
    timeout: 2000
  })
}

function setDefaultSettingFromLocalStorage() {
  if (localStorage['syncFlagState']) {
    syncFlagState.value = localStorage['syncFlagState'] == 'true'
  }
}

watch(syncFlagState, async (value) => {
  localStorage.syncFlagState = value
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
      <button class="btn w-[90px]" @click="sync">Sync Now</button>
    </div>
  </fieldset>
</template>
