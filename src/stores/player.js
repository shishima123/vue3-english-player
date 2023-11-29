import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  let currentSongState = ref({})

  return { currentSongState }
})
