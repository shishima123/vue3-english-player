import { defineStore } from 'pinia'
import { ref } from 'vue'
import { scrollToActiveElement } from '@/helpers/utils'
import { useStorage } from '@vueuse/core'

export const usePlaylistStore = defineStore('playlist', () => {
  // ref
  const playlistRef = ref()
  const selectPlaylistState = useStorage('selectPlaylist', 'playlist_1')
  const playlistOptions = [
    { value: 'playlist_1', label: 'Playlist 1' },
    { value: 'playlist_2', label: 'Playlist 2' },
    { value: 'playlist_3', label: 'Playlist 3' },
    { value: 'playlist_4', label: 'Playlist 4' }
  ]

  function scrollToActive() {
    scrollToActiveElement(playlistRef.value, '.active', 'instant', 'start')
  }

  return { playlistRef, selectPlaylistState, playlistOptions, scrollToActive }
})
