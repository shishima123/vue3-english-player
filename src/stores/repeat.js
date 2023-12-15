import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useSyncStore } from '@/stores/sync'

export const useRepeatStore = defineStore('repeat', () => {
  // store
  const playerStore = usePlayerStore()
  const syncStore = useSyncStore()

  // ref
  let isRepeatActiveState = ref(false)
  let startTimeState = ref()
  let endTimeState = ref()
  let showTimeStringLyricState = ref(false)
  let repeatTypeState = ref('time')
  let seekSliderState = ref([0, 0])
  let isSleepActiveState = ref(true)
  let playAfterSleepState = ref()
  let sleepTimeState = ref(5)

  let syncStartActiveState = ref(true)
  let syncEndActiveState = ref(true)
  let syncStartValueState = ref(0)
  let syncEndValueState = ref(0)
  let syncValueStep = 0.05

  // a computed ref
  const startTimeComputed = computed(() => {
    if (syncStartActiveState.value) {
      return startTimeState.value + syncStartValueState.value
    }
    return startTimeState.value
  })

  const endTimeComputed = computed(() => {
    if (syncEndActiveState.value) {
      return endTimeState.value + syncEndValueState.value
    }
    return endTimeState.value
  })

  watch(sleepTimeState, async (value) => {
    localStorage.sleepTimeState = value
    await syncStore.syncUpload()
  })

  return {
    isRepeatActiveState,
    startTimeState,
    endTimeState,
    showTimeStringLyricState,
    repeatTypeState,
    seekSliderState,
    isSleepActiveState,
    playAfterSleepState,
    sleepTimeState,
    syncStartActiveState,
    syncEndActiveState,
    syncStartValueState,
    syncEndValueState,
    startTimeComputed,
    endTimeComputed,
    setTimeWhenClickLyric,
    updateSeekSlider,
    resetSeekSlider,
    disableRepeat,
    changeSyncValue,
    resetSyncValueState
  }

  function setTimeWhenClickLyric(startTime, endTime) {
    if (isRepeatActiveState.value && repeatTypeState.value === 'lyric') {
      let startSeek = Math.round(startTime)
      let endSeek = Math.round(endTime)
      seekSliderState.value = [startSeek, endSeek]
      startTimeState.value = startTime
      endTimeState.value = endTime
    }
  }

  function updateSeekSlider() {
    seekSliderState.value = [0, playerStore.currentSongState.seconds]
  }

  function resetSeekSlider() {
    seekSliderState.value = [0, 0]
  }

  function disableRepeat() {
    isRepeatActiveState.value = false
    clearTimeout(playAfterSleepState.value)
  }

  function changeSyncValue(syncState, type) {
    let newValue = eval(syncState).value
    if (type === '+') {
      newValue = Math.round((newValue + syncValueStep) * 100) / 100
    } else {
      newValue = Math.round((newValue - syncValueStep) * 100) / 100
    }
    eval(syncState).value = newValue
  }

  function resetSyncValueState(syncState) {
    eval(syncState).value = 0
  }
})
