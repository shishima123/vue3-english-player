import { timeStringToSecond } from '@/helpers/timer'
import { scrollToActiveElement } from '@/helpers/utils'
import { usePlayerStore } from '@/stores/player'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export const useLyricStore = defineStore('lyric', () => {
  // store
  const playerStore = usePlayerStore()

  // ref
  let currentLyricState = ref({})
  let selectedLyricTypeState = ref('lyric1')
  let isShowIPAState = useStorage('isShowIPAState', false)
  let lyricRef = ref()

  let convertLyricComputed = computed(() => {
    if (typeof playerStore.currentSongState[selectedLyricTypeState.value] === 'undefined') {
      return []
    }

    let rawLyric = playerStore.currentSongState[selectedLyricTypeState.value]
    if (selectedLyricTypeState.value !== 'lyric1') {
      return rawLyric.split('\n').map((lyric, id) => ({
        id,
        lyric
      }))
    }

    let lyricConverted = []
    rawLyric.split(/\n\s*\n/).forEach((subtitle) => {
      let [idLine, timeString, lyric, ipa] = subtitle.split('\n')
      let id = parseInt(idLine.trim())
      let timeSplit = timeString.trim().split('-->')
      let [startString, endString] = timeSplit
      let start = timeStringToSecond(timeSplit[0])
      let end = timeStringToSecond(timeSplit[1])
      lyricConverted.push({
        id,
        timeString: timeString.trim(),
        lyric: lyric.trim(),
        ipa: ipa ? ipa : '',
        start,
        end,
        startString,
        endString,
        over: false
      })
    })
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
    isShowIPAState,
    convertLyricComputed,
    changeCurrentLyricState,
    scrollToActiveInLyrics,
    scrollToTopInLyrics
  }
})
