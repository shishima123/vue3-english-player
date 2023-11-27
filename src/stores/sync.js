import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { getCurrentUser, getDatabaseList, setDatabaseList } from '@/configs/firebase'
export const useSyncStore = defineStore('sync', () => {
  let syncFlagState = ref(true)

  let modalLoginState = ref(false)

  function onShowModalLogin() {
    modalLoginState.value = true
  }
  function onHideModalLogin() {
    modalLoginState.value = false
  }

  function onTurnOffSync() {
    syncFlagState.value = false
  }

  function setDefaultSettingFromLocalStorage() {
    syncFlagState.value = localStorage.getItem('syncFlagState') === 'true'
  }

  async function syncDownload(forceSync = false) {
    if (!syncFlagState.value && !forceSync) {
      return
    }
    let dataSync = await getDatabaseList('sync')
    await setLocalStorage(dataSync)
  }

  async function syncUpload(data) {
    await setDatabaseList('sync', data)
  }

  function setLocalStorage(dataSync) {
    Object.keys(dataSync).forEach(function (state) {
      localStorage[state] = dataSync[state]
    })
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

  return {
    syncFlagState,
    modalLoginState,
    onShowModalLogin,
    onHideModalLogin,
    setDefaultSettingFromLocalStorage,
    syncDownload,
    syncUpload,
    onTurnOffSync
  }
})
