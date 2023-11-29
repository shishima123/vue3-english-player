import { defineStore } from 'pinia'
import { ref } from 'vue'
import { threatSongs } from '@/helpers/utils'
import songMocks from '@/mocks/songs'

export const usePlayerStore = defineStore('player', () => {
  let currentSongState = ref({})
  let songsState = ref(threatSongs(songMocks))

  return { currentSongState, songsState }
})
