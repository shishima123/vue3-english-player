import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

export const useSleepTimerStore = defineStore('sleepTimer', () => {
  // ref
  let isSleepTimerActive = ref(false)
  let sleepRemainingTimeState = ref(0)
  let sleepTimeState = useStorage('sleepTimeState', 30)

  return {
    isSleepTimerActive,
    sleepRemainingTimeState,
    sleepTimeState
  }
})
