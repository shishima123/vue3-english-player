import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useStorage } from '@vueuse/core'
import { clearTimeout } from 'worker-timers'

export const useRepeatStore = defineStore('repeat', () => {
  // store
  const playerStore = usePlayerStore()

  // ref
  let isRepeatActiveState = ref(false)
  let startTimeState = ref()
  let endTimeState = ref()
  let showTimeStringLyricState = ref(false)
  let repeatTypeState = ref('time')
  let seekSliderState = ref([0, 0])
  let isSleepActiveState = ref(true)
  let playAfterSleepState = ref()
  let sleepTimeState = useStorage('repeatSleepTimeState', 5)

  let syncStartActiveState = ref(true)
  let syncEndActiveState = ref(true)
  let syncStartValueState = ref(0)
  let syncEndValueState = ref(0)
  let syncValueStep = 0.05

  // a computed ref
  const startTimeComputed = computed(() => {
    return Math.round((startTimeState.value + syncStartValueState.value) * 100) / 100
  })

  const endTimeComputed = computed(() => {
    return Math.round((endTimeState.value + syncEndValueState.value) * 100) / 100
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
    resetSyncValueState,
    clearTimeOutRepeat
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
    clearTimeOutRepeat()
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

  function clearTimeOutRepeat() {
    clearTimeout(playAfterSleepState.value)
  }
})
