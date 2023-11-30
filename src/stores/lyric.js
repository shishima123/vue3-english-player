import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { timeStringToSecond } from '@/helpers/timer'
import { scrollToActiveElement } from '@/helpers/utils'
import { usePlayerStore } from '@/stores/player'

export const useLyricStore = defineStore('lyric', () => {
  // store
  const playerStore = usePlayerStore()

  // ref
  let currentLyricState = ref({})
  let selectedLyricTypeState = ref('lyric1')
  let lyricRef = ref()

  let convertLyricComputed = computed(() => {
    if (typeof playerStore.currentSongState[selectedLyricTypeState.value] === 'undefined') {
      return []
    }

    let lyricConverted = []
    let split = playerStore.currentSongState[selectedLyricTypeState.value].split(/\n\s*\n/)
    for (let i = 0; i < split.length; i++) {
      let subtitle = split[i]

      let [idLine, timeLine, ...textLines] = subtitle.split('\n')
      let id = parseInt(idLine.trim())
      // type sub has no time
      if (isNaN(id)) {
        return [idLine, timeLine, ...textLines].map((subtitle, id) => ({
          id,
          text: subtitle
        }))
      }

      // type sub has time
      let timeString = timeLine.trim()
      let text = textLines.join('\n').trim()
      let timeSplit = timeLine.trim().split('-->')
      let [startString, endString] = timeSplit
      let start = timeStringToSecond(timeSplit[0])
      let end = timeStringToSecond(timeSplit[1])
      lyricConverted.push({ id, timeString, text, start, end, startString, endString, over: false })
    }
    return lyricConverted
  })

  function changeCurrentLyricState(playerTimer) {
    currentLyricState.value = convertLyricComputed.value.find(
      (el) => playerTimer >= el.start && playerTimer <= el.end
    )
  }

  function scrollToActiveInLyrics() {
    scrollToActiveElement(lyricRef.value, '.active')
  }

  function scrollToTopInLyrics() {
    lyricRef.value.scrollTo({ top: 0 })
  }

  watch(currentLyricState, async (value) => {
    if (value) {
      convertLyricComputed.value.map((el) => {
        if (el.id <= value.id) {
          return (el.over = true)
        }
        return (el.over = false)
      })
    }
    scrollToActiveInLyrics()
  })

  return {
    currentLyricState,
    selectedLyricTypeState,
    lyricRef,
    convertLyricComputed,
    changeCurrentLyricState,
    scrollToActiveInLyrics,
    scrollToTopInLyrics
  }
})
