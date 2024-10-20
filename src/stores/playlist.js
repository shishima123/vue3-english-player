import { scrollToActiveElement } from '@/helpers/utils'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlaylistStore = defineStore('playlist', () => {
  // ref
  const playlistRef = ref()
  const selectPlaylistState = useStorage('selectPlaylist', 'LPTD1_1')
  const playlistOptions = [
    { value: 'LPTD1_1', label: 'LPTD1.1' },
    { value: 'LPTD1_2', label: 'LPTD1.2' },
    { value: 'LPTD1_3', label: 'LPTD1.3' },
    { value: 'LPTD1_4', label: 'LPTD1.4' }
  ]

  const defaultSelect = 'LPTD1_1'

  function scrollToActive() {
    scrollToActiveElement(playlistRef.value, '.active', 'instant', 'start')
  }

  return { playlistRef, selectPlaylistState, playlistOptions, defaultSelect, scrollToActive }
})
