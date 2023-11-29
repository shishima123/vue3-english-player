import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNavMobileStore = defineStore('navMobile', () => {
  // ref
  let showPlaylistState = ref(false)
  let showLyricsState = ref(false)

  function activeNavMobile(type = null) {
    switch (type) {
      case 'playlist':
        showLyricsState.value = false
        showPlaylistState.value = !showPlaylistState.value
        break
      case 'lyrics':
        showLyricsState.value = !showLyricsState.value
        showPlaylistState.value = false
        break
      default:
        showLyricsState.value = false
        showPlaylistState.value = false
    }
  }

  return { showPlaylistState, showLyricsState, activeNavMobile }
})
