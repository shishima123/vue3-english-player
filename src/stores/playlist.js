import { defineStore } from 'pinia'
import { ref } from 'vue'
import { scrollToActiveElement } from '@/helpers/utils'

export const usePlaylistStore = defineStore('playlist', () => {
  const playlistRef = ref()

  function scrollToActive() {
    scrollToActiveElement(playlistRef.value, '.active', 'instant', 'start')
  }

  return { playlistRef, scrollToActive }
})
