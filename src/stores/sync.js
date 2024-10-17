import { getCurrentUser, getDatabaseList, setDatabaseList } from '@/configs/firebase'
import { useLyricStore } from '@/stores/lyric'
import { usePlayerStore } from '@/stores/player'
import { useRepeatStore } from '@/stores/repeat'
import { useReplayStore } from '@/stores/replay'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { onMounted, ref, watch } from 'vue'

export const useSyncStore = defineStore('sync', () => {
  // store
  const playerStore = usePlayerStore()
  const replayStore = useReplayStore()
  const repeatStore = useRepeatStore()
  const lyricStore = useLyricStore()

  // ref
  const syncFlagState = useStorage('syncFlagState', true)
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

  async function syncDownload(forceSync = false) {
    if (!syncFlagState.value && !forceSync) {
      return
    }
    let dataSync = await getDatabaseList('sync')
    setSyncDataToState(dataSync)
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
    data.replayPickedState = replayStore.replayPickedState
    data.sleepTimeState = Number(repeatStore.sleepTimeState)
    data.isShowIPAState = lyricStore.isShowIPAState
    await setDatabaseList('sync', data)
  }

  function setSyncDataToState(dataSync) {
    replayStore.loopsState = dataSync.loopsState
    replayStore.loopsCountState = dataSync.loopsCountState
    playerStore.songIndexState = dataSync.songIndexState
    replayStore.replayFromState = dataSync.replayFromState
    replayStore.replayToState = dataSync.replayToState
    replayStore.replayPickedState = dataSync.replayPickedState
    repeatStore.sleepTimeState = dataSync.sleepTimeState
    lyricStore.isShowIPAState = dataSync.isShowIPAState
  }

  // using for prevent sync in first load page
  let isAppMounted = false
  onMounted(async () => {
    isAppMounted = true
  })

  watch(syncFlagState, async (value) => {
    if (value) {
      let user = getCurrentUser()
      if (!user) {
        onShowModalLogin()
      }
    }
  })

  watch(
    [
      () => replayStore.loopsState,
      () => replayStore.loopsCountState,
      () => playerStore.songIndexState,
      () => replayStore.replayFromState,
      () => replayStore.replayToState,
      () => replayStore.replayPickedState,
      () => repeatStore.sleepTimeState,
      () => lyricStore.isShowIPAState
    ],
    async () => {
      await syncUpload()
    }
  )

  return {
    syncFlagState,
    modalLoginState,
    onShowModalLogin,
    onHideModalLogin,
    syncDownload,
    onTurnOffSync
  }
})
