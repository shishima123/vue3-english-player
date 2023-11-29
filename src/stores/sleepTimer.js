import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSleepTimerStore = defineStore('sleepTimer', () => {
  // ref
  let isSleepTimerActive = ref(false)
  let sleepRemainingTimeState = ref(0)
  let sleepTimeState = ref(30)

  function setDefaultSettingFromLocalStorage() {
    if (localStorage['sleepTimeState']) {
      sleepTimeState.value = Number(localStorage['sleepTimeState'])
    }
  }

  watch(sleepTimeState, async (value) => {
    localStorage.sleepTimeState = value
  })

  return {
    isSleepTimerActive,
    sleepRemainingTimeState,
    sleepTimeState,
    setDefaultSettingFromLocalStorage
  }
})
