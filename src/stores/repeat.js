import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
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
    setTimeWhenClickLyric,
    updateSeekSlider,
    resetSeekSlider,
    disableRepeat
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
})
