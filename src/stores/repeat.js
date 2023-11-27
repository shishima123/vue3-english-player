import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRepeatStore = defineStore('repeat', () => {
  let isRepeatActiveState = ref(false)
  let startTimeState = ref()
  let endTimeState = ref()
  let showTimeStringLyricState = ref(false)
  let repeatTypeState = ref('time')
  let seekSliderState = ref([0, 100])
  let isSleepActiveState = ref(true)
  let playAfterSleepState = ref()
  let sleepTimeState = ref(5)

  function setTimeWhenClickLyric(startTime, endTime, currentSongState) {
    if (isRepeatActiveState.value && repeatTypeState.value === 'lyric') {
      let startSeek = Math.round((startTime * 100) / currentSongState.value.seconds)
      let endSeek = Math.round((endTime * 100) / currentSongState.value.seconds)
      seekSliderState.value = [startSeek, endSeek]
      startTimeState.value = startTime
      endTimeState.value = endTime
    }
  }

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
    setTimeWhenClickLyric
  }
})
