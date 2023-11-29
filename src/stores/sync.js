import { defineStore } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { getCurrentUser, getDatabaseList, setDatabaseList } from '@/configs/firebase'
import { usePlayerStore } from '@/stores/player'
import { useReplayStore } from '@/stores/replay'
import { useRepeatStore } from '@/stores/repeat'
export const useSyncStore = defineStore('sync', () => {
  // store
  const playerStore = usePlayerStore()
  const replayStore = useReplayStore()
  const repeatStore = useRepeatStore()

  // ref
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

  async function syncUpload() {
    if (!syncFlagState.value || !isAppMounted) {
      return
    }
    let data = {}
    data.loopsState = Number(replayStore.loopsState)
    data.loopsCountState = Number(replayStore.loopsCountState)
    data.songIndexState = Number(playerStore.songIndexState)
    data.replayFromState = Number(replayStore.replayFromState)
    data.replayToState = Number(replayStore.replayToState)
    data.replayToState = Number(replayStore.replayToState)
    data.replayPickedState = replayStore.replayPickedState
    data.sleepTimeState = Number(repeatStore.sleepTimeState)

    await setDatabaseList('sync', data)
  }

  function setLocalStorage(dataSync) {
    Object.keys(dataSync).forEach(function (state) {
      localStorage[state] = dataSync[state]
    })
  }

  // using for prevent sync in first load page
  let isAppMounted = false
  onMounted(async () => {
    isAppMounted = true
  })

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
