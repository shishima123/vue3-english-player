<script setup>
import { formatTimer } from './helpers/timer'
import { onMounted, ref, watch } from 'vue'
import NavMobile from '@/components/NavMobile.vue'
import Playlist from '@/components/Playlist.vue'
import Lyric from '@/components/Lyric.vue'
import SleepTimer from '@/components/SleepTimer.vue'
import Sync from '@/components/Sync.vue'
import Repeat from '@/components/Repeat.vue'
import Replay from '@/components/Replay.vue'
import { FirebaseEnums } from '@/configs/firebase'
import { useNavMobileStore } from '@/stores/navMobile'
import { useSyncStore } from '@/stores/sync'
import { useSleepTimerStore } from '@/stores/sleepTimer'
import { useRepeatStore } from '@/stores/repeat'
import { useReplayStore } from '@/stores/replay'
import { useLyricStore } from '@/stores/lyric'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'

// icons
import { PlayIcon, PauseIcon } from '@heroicons/vue/24/solid'
import {
  BackwardIcon,
  ForwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  AdjustmentsVerticalIcon,
  ArrowPathIcon,
  ClockIcon,
  CloudArrowDownIcon
} from '@heroicons/vue/24/outline'

const navMobileStore = useNavMobileStore()
const syncStore = useSyncStore()
const sleepTimerStore = useSleepTimerStore()
const repeatStore = useRepeatStore()
const replayStore = useReplayStore()
const lyricStore = useLyricStore()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()

let songIndexState = ref(0)
let isPlayingState = ref(false)
let currentlyTimerState = ref('00:00')
let playerState = ref(new Audio())
let seekSliderState = ref(0)
let seekSliderFormatState = ref(
  (v) => `${formatTimer(playerStore.currentSongState.seconds * (v / 100))}`
)
let volumeSliderState = ref(100)

let activeTab = ref('1')

// using for prevent sync in first load page
let isAppMounted = false

// computed

function calcCurrentSongIndex(newSongIndex) {
  if (
    !replayStore.replayFlagState ||
    (!replayStore.replayFromState && !replayStore.replayToState)
  ) {
    return newSongIndex
  }

  if (newSongIndex === playerStore.songsState.length - 1) {
    return replayStore.replayToState - 1
  }

  if (newSongIndex === 0) {
    return replayStore.replayFromState - 1
  }

  let from = Number(replayStore.replayFromState ? replayStore.replayFromState : 0)
  let to = Number(
    replayStore.replayToState ? replayStore.replayToState : playerStore.songsState.length - 1
  )
  let range = to - from + 1
  let normalizedIndex = (newSongIndex - from + 1) % range
  newSongIndex = from + normalizedIndex - 1

  if (replayStore.replayFromState <= newSongIndex && newSongIndex <= replayStore.replayToState) {
    return newSongIndex
  }
  return replayStore.replayFromState - 1
}

function setCurrentSong() {
  playerStore.currentSongState = playerStore.songsState[songIndexState.value]
}

function setPlayerSource() {
  playerState.value.src = playerStore.currentSongState.src
}

function setCurrentlyTimer(startTime, endTime) {
  if (!startTime) {
    return false
  }
  playerState.value.currentTime = startTime + 0.1

  repeatStore.setTimeWhenClickLyric(startTime, endTime)
}

function play(songIndexInput = null, isClickFromList = false) {
  if (isClickFromList && songIndexInput === songIndexState.value && isPlayingState.value) {
    return true
  }

  if (songIndexState.value !== songIndexInput) {
    replayStore.setLoopsCount(0)
    songIndexState.value = calcCurrentSongIndex(songIndexInput)
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
  let newSongIndex = (songIndexState.value + 1) % playerStore.songsState.length
  play(newSongIndex)
}

function prev() {
  let newSongIndex =
    (songIndexState.value - 1 + playerStore.songsState.length) % playerStore.songsState.length
  play(newSongIndex)
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

function seekTo() {
  playerState.value.currentTime =
    playerStore.currentSongState.seconds * (seekSliderState.value / 100)
}

function setVolume() {
  playerState.value.volume = volumeSliderState.value / 100
}

function setDefaultSettingFromLocalStorage() {
  pause()
  let attributes = ['volumeSliderState']
  attributes.forEach((el) => {
    if (localStorage[el]) {
      eval(el).value = Number(localStorage[el])
    }
  })

  if (localStorage.songIndexState) {
    songIndexState.value =
      Number(localStorage.songIndexState) > playerStore.songsState.length - 1
        ? 0
        : Number(localStorage.songIndexState)
  }

  if (localStorage.replayFromState) {
    replayStore.replayFromState =
      localStorage.replayFromState === 'null' ? 1 : Number(localStorage.replayFromState)
  }

  if (localStorage.replayToState) {
    replayStore.replayToState =
      localStorage.replayToState === 'null'
        ? playerStore.songsState.length
        : Number(localStorage.replayToState)
  }

  sleepTimerStore.setDefaultSettingFromLocalStorage()
  syncStore.setDefaultSettingFromLocalStorage()
  replayStore.setDefaultSettingFromLocalStorage()
}

onMounted(async () => {
  await setDefaultSettingFromLocalStorage()
  try {
    await syncStore.syncDownload()
  } catch (error) {
    if (error.message === FirebaseEnums.permission_denied) {
      syncStore.onShowModalLogin()
    }
  }

  await setCurrentSong()
  await setPlayerSource()
  await registerListener()
  isAppMounted = true
})

function onSyncUpload() {
  if (!syncStore.syncFlagState || !isAppMounted) {
    return
  }
  let data = {}
  data.loopsState = Number(replayStore.loopsState)
  data.loopsCountState = Number(replayStore.loopsCountState)
  data.songIndexState = Number(songIndexState.value)
  data.replayFromState = Number(replayStore.replayFromState)
  data.replayToState = Number(replayStore.replayToState)
  data.replayPickedState = replayStore.replayPickedState

  syncStore.syncUpload(data)
}

watch(volumeSliderState, async (value) => {
  localStorage.volumeSliderState = value
})

watch(songIndexState, async (value) => {
  localStorage.songIndexState = value
  setCurrentSong()
  onSyncUpload()
})
watch(currentlyTimerState, async (value) => {
  if (value) {
    let percent = Math.round(
      (playerState.value.currentTime * 100) / playerStore.currentSongState.seconds
    )
    seekSliderState.value = Math.min(percent, 100)
  }
  lyricStore.scrollToActiveInLyrics()
})
</script>

<template>
  <a-config-provider
    :theme="{
      token: {
        fontFamily: 'Nunito, sans-serif',
        colorTextBase: '#1f2937',
        fontSize: 16
      }
    }"
  >
    <!-- begin:: Player Section -->
    <section
      class="flex flex-col flex-nowrap order-3 w-full h-full mx-auto overflow-hidden px-[15px] md:p-[10px] bg-white text-base rounded-none md:rounded shadow-none md:shadow-md row-start-1 row-end-3 col-start-1 col-end-2 md:order-1 transition-[height] duration-[350ms] ease-linear"
      :class="{
        '!h-[var(--player-mobile-height)]':
          navMobileStore.showLyricsState || navMobileStore.showPlaylistState
      }"
    >
      <!-- begin:: Player -->
      <div>
        <h2 class="w-full text-xl font-bold text-center py-4 px-1 text-ellipsis whitespace-nowrap">
          {{ playerStore.currentSongState.title }}
        </h2>
        <div class="mb-5">
          <div class="flex justify-between px-1 w-full text-xs">
            <p>{{ currentlyTimerState }}</p>
            <p>{{ playerStore.currentSongState.totalTimer }}</p>
          </div>
          <vue-slider
            v-model="seekSliderState"
            :tooltip="'active'"
            :tooltip-formatter="seekSliderFormatState"
            @drag-end="seekTo"
          ></vue-slider>
        </div>

        <div class="flex items-center justify-center w-3/5 mx-auto">
          <span class="mr-2 inline-block">
            <SpeakerXMarkIcon class="h-5 w-5" />
          </span>

          <vue-slider
            v-model="volumeSliderState"
            :tooltip="'active'"
            @change="setVolume"
            :style="{ width: '100%' }"
          ></vue-slider>
          <span class="ml-4 inline-block">
            <SpeakerWaveIcon class="h-5 w-5" />
          </span>
        </div>
        <div class="flex justify-center items-center py-5 px-4">
          <div
            class="flex justify-between border border-solid border-gray-300 w-3/5 rounded-[30px]"
          >
            <button
              class="flex justify-center items-center border-0 rounded-full text-xl w-[25px] h-[25px] cursor-pointer text-gray-400 relative py-5 px-7 hover:scale-125 transition bg-transparent"
              @click="prev"
            >
              <span><BackwardIcon class="h-6 w-6" /></span>
            </button>
            <button
              class="flex justify-center items-center border-0 rounded-full text-xl w-[25px] h-[25px] cursor-pointer text-gray-400 relative py-5 px-7 hover:scale-125 transition bg-transparent"
              @click="next"
            >
              <span><ForwardIcon class="h-6 w-6" /></span>
            </button>
          </div>

          <div class="absolute">
            <button
              class="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-full w-[60px] h-[60px] shadow-2xl cursor-pointer text-2xl text-white hover:scale-110 transition"
              v-if="!isPlayingState"
              @click="play(songIndexState)"
            >
              <span class="flex justify-center"><PlayIcon class="h-7 w-7" /></span>
            </button>
            <button
              class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[60px] h-[60px] shadow-2xl cursor-pointer text-2xl text-white hover:scale-110 transition"
              v-else
              @click="pause"
            >
              <span class="flex justify-center"><PauseIcon class="h-7 w-7" /></span>
            </button>
          </div>
        </div>
      </div>
      <!-- end:: Player -->

      <a-tabs v-model:activeKey="activeTab" centered class="custom-padding" animated>
        <a-tab-pane key="1" force-render>
          <template #tab>
            <AdjustmentsVerticalIcon class="h-6 w-6" />
          </template>
          <replay />
        </a-tab-pane>
        <a-tab-pane key="2" force-render>
          <template #tab>
            <ArrowPathIcon class="h-6 w-6" />
          </template>
          <repeat :current-song-state="playerStore.currentSongState"></repeat>
        </a-tab-pane>
        <a-tab-pane key="3" force-render>
          <template #tab>
            <span class="flex justify-center"><ClockIcon class="h-6 w-6" /></span>
            <span
              v-if="sleepTimerStore.isSleepTimerActive"
              class="absolute flex h-3 w-3 top-[5px] right-[0px] text-2xs text-emerald-500"
            >
              {{ sleepTimerStore.sleepRemainingTimeState }}
            </span>
          </template>
          <sleep-timer @pause="pause"></sleep-timer>
        </a-tab-pane>
        <a-tab-pane key="4" force-render>
          <template #tab>
            <CloudArrowDownIcon class="h-6 w-6" />
          </template>
          <sync
            @set-default-setting-from-local-storage="setDefaultSettingFromLocalStorage"
            @set-player-source="setPlayerSource"
          ></sync>
        </a-tab-pane>
      </a-tabs>
    </section>
    <!-- end:: Player Section -->
    <lyric @set-currently-timer="setCurrentlyTimer" />
    <!-- begin:: Playlist Section -->
    <playlist
      :current-song-state="playerStore.currentSongState"
      :show-playlist-state="navMobileStore.showPlaylistState"
      @play="play"
    />
    <!-- end:: Playlist Section -->

    <!-- begin:: Nav mobile -->
    <nav-mobile />
    <!-- end:: Nav mobile -->
  </a-config-provider>
</template>
