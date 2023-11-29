import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { threatSongs } from '@/helpers/utils'
import songMocks from '@/mocks/songs'
import { useReplayStore } from '@/stores/replay'
import { useLyricStore } from '@/stores/lyric'
import { usePlaylistStore } from '@/stores/playlist'
import { useRepeatStore } from '@/stores/repeat'
import { formatTimer } from '@/helpers/timer'
import { useSyncStore } from '@/stores/sync'

export const usePlayerStore = defineStore('player', () => {
  // store
  const replayStore = useReplayStore()
  const lyricStore = useLyricStore()
  const playlistStore = usePlaylistStore()
  const repeatStore = useRepeatStore()
  const syncStore = useSyncStore()

  // ref
  let currentSongState = ref({})
  let songsState = ref(threatSongs(songMocks))
  let songIndexState = ref(0)
  let playerState = ref(new Audio())
  let isPlayingState = ref(false)
  let currentlyTimerState = ref('00:00')
  let seekSliderState = ref(0)
  let volumeSliderState = ref(100)

  function play(songIndexInput = null, isClickFromList = false) {
    if (isClickFromList && songIndexInput === songIndexState.value && isPlayingState.value) {
      return true
    }

    if (songIndexState.value !== songIndexInput) {
      replayStore.setLoopsCount(0)
      songIndexState.value = calcCurrentSongIndex(songIndexInput)
      setCurrentSong()
      setPlayerSource()
      lyricStore.scrollToTopInLyrics()
      playlistStore.scrollToActive()
    }
    playerState.value.play()
    isPlayingState.value = true
  }

  function pause() {
    playerState.value.pause()
    isPlayingState.value = false
  }

  function next() {
    let newSongIndex = (songIndexState.value + 1) % songsState.value.length
    play(newSongIndex)
  }

  function prev() {
    let newSongIndex =
      (songIndexState.value - 1 + songsState.value.length) % songsState.value.length
    play(newSongIndex)
  }

  function calcCurrentSongIndex(newSongIndex) {
    if (
      !replayStore.replayFlagState ||
      (!replayStore.replayFromState && !replayStore.replayToState)
    ) {
      return newSongIndex
    }

    if (newSongIndex === songsState.value.length - 1) {
      return replayStore.replayToState - 1
    }

    if (newSongIndex === 0) {
      return replayStore.replayFromState - 1
    }

    let from = Number(replayStore.replayFromState ? replayStore.replayFromState : 0)
    let to = Number(
      replayStore.replayToState ? replayStore.replayToState : songsState.value.length - 1
    )
    let range = to - from + 1
    let normalizedIndex = (newSongIndex - from + 1) % range
    newSongIndex = from + normalizedIndex - 1

    if (replayStore.replayFromState <= newSongIndex && newSongIndex <= replayStore.replayToState) {
      return newSongIndex
    }
    return replayStore.replayFromState - 1
  }

  function setPlayerSource() {
    playerState.value.src = currentSongState.value.src
  }

  function setCurrentlyTimer(startTime, endTime) {
    if (!startTime) {
      return false
    }
    playerState.value.currentTime = startTime + 0.1

    repeatStore.setTimeWhenClickLyric(startTime, endTime)
  }

  function setCurrentSong() {
    currentSongState.value = songsState.value[songIndexState.value]
  }

  function registerListener() {
    playerState.value.addEventListener('timeupdate', () => {
      let playerTimer = playerState.value.currentTime

      // repeat
      if (repeatStore.isRepeatActiveState) {
        if (playerTimer < repeatStore.startTimeState) {
          playerState.value.currentTime = repeatStore.startTimeState
        } else if (playerTimer > repeatStore.endTimeState - 0.2) {
          playerState.value.currentTime = repeatStore.startTimeState

          // sleep
          if (repeatStore.isSleepActiveState) {
            pause()
            repeatStore.playAfterSleepState = setTimeout(() => {
              play()
            }, repeatStore.sleepTimeState)
          }
        }
      }
      lyricStore.changeCurrentLyricState(playerTimer)
      currentlyTimerState.value = formatTimer(playerTimer)
    })
    playerState.value.addEventListener('ended', () => {
      lyricStore.scrollToTopInLyrics()
      isPlayingState.value = false
      if (replayStore.replayFlagState) {
        replayStore.setLoopsCount(++replayStore.loopsCountState)
        if (replayStore.loopsCountState >= replayStore.loopsState) {
          next()
        } else {
          play(songIndexState.value)
        }
      } else {
        next()
      }
    })
  }

  function setDefaultSettingFromLocalStorage() {
    if (localStorage.volumeSliderState) {
      volumeSliderState.value = Number(localStorage.volumeSliderState)
    }

    if (localStorage.songIndexState) {
      songIndexState.value =
        Number(localStorage.songIndexState) > songsState.value.length - 1
          ? 0
          : Number(localStorage.songIndexState)
    }
  }

  watch(songIndexState, async (value) => {
    localStorage.songIndexState = value
    await syncStore.syncUpload()
  })
  watch(currentlyTimerState, async (value) => {
    if (value) {
      let percent = Math.round(
        (playerState.value.currentTime * 100) / currentSongState.value.seconds
      )
      seekSliderState.value = Math.min(percent, 100)
    }
    lyricStore.scrollToActiveInLyrics()
  })
  watch(volumeSliderState, async (value) => {
    localStorage.volumeSliderState = value
  })

  return {
    currentSongState,
    songsState,
    songIndexState,
    playerState,
    isPlayingState,
    currentlyTimerState,
    seekSliderState,
    volumeSliderState,
    play,
    pause,
    prev,
    next,
    setCurrentlyTimer,
    setCurrentSong,
    setDefaultSettingFromLocalStorage,
    setPlayerSource,
    registerListener
  }
})
