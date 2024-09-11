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
import {  setTimeout } from 'worker-timers';

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

  function play() {
    playerState.value.play()
    isPlayingState.value = true
  }

  async function changeSong(songIndexInput = null) {
    if (songIndexState.value === songIndexInput) {
      return true
    }

    await repeatStore.resetSeekSlider()
    replayStore.setLoopsCount(0)
    songIndexState.value = calcCurrentSongIndex(songIndexInput)
    await setCurrentSong()
    await setPlayerSource()
    lyricStore.scrollToTopInLyrics()
    playlistStore.scrollToActive()
    await repeatStore.updateSeekSlider()
    repeatStore.disableRepeat()

    if (isPlayingState.value) {
      play()
    }
  }

  function pause() {
    playerState.value.pause()
    isPlayingState.value = false
  }

  async function next() {
    let newSongIndex = (songIndexState.value + 1) % songsState.value.length
    await changeSong(newSongIndex)
  }

  async function prev() {
    let newSongIndex =
      (songIndexState.value - 1 + songsState.value.length) % songsState.value.length
    await changeSong(newSongIndex)
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
    playerState.value.currentTime = startTime

    repeatStore.setTimeWhenClickLyric(startTime, endTime)
  }

  function setCurrentSong() {
    currentSongState.value = songsState.value[songIndexState.value]
  }

  function registerListener() {
    playerState.value.addEventListener('timeupdate', () => {
      let playerTimer = playerState.value.currentTime
      seekSliderState.value = Math.round(playerState.value.currentTime)
      // repeat
      if (repeatStore.isRepeatActiveState) {
        if (playerTimer < repeatStore.startTimeComputed) {
          playerState.value.currentTime = repeatStore.startTimeComputed
        } else if (playerTimer > repeatStore.endTimeComputed) {
          playerState.value.currentTime = repeatStore.startTimeComputed

          // sleep
          if (repeatStore.isSleepActiveState) {
            playerState.value.pause()
            repeatStore.playAfterSleepState = setTimeout(() => {
              playerState.value.play()
            }, repeatStore.sleepTimeState * 1000)
          }
        }
      }
      lyricStore.changeCurrentLyricState(playerTimer)
      currentlyTimerState.value = formatTimer(playerTimer)
      lyricStore.scrollToActiveInLyrics()
    })

    playerState.value.addEventListener('ended', () => {
      resetSeekSlider()
      lyricStore.scrollToTopInLyrics()
      if (replayStore.replayFlagState) {
        replayStore.setLoopsCount(++replayStore.loopsCountState)
        if (replayStore.loopsCountState >= replayStore.loopsState) {
          next()
        } else {
          play()
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

  function resetSeekSlider() {
    seekSliderState.value = 0
  }

  watch(songIndexState, async (value) => {
    localStorage.songIndexState = value
    await syncStore.syncUpload()
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
    changeSong,
    setCurrentlyTimer,
    setCurrentSong,
    setDefaultSettingFromLocalStorage,
    setPlayerSource,
    registerListener
  }
})
