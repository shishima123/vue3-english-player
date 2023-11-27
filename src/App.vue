<script setup>
import { formatTimer } from './helpers/timer'
import { threatSongs } from '@/helpers/utils'
import songMocks from '@/mocks/songs'
import { computed, onMounted, ref, watch } from 'vue'
import NavMobile from '@/components/NavMobile.vue'
import Playlist from '@/components/Playlist.vue'
import Lyric from '@/components/Lyric.vue'
import SleepTimer from '@/components/SleepTimer.vue'
import Sync from '@/components/Sync.vue'
import Repeat from '@/components/Repeat.vue'
import { syncDownload, syncUpload } from '@/composables/sync'
import { FirebaseEnums } from '@/configs/firebase'

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
  WifiIcon
} from '@heroicons/vue/24/outline'

import { useNavMobileStore } from '@/stores/navMobile'
const navMobileStore = useNavMobileStore()

let loopsState = ref(10)
let loopsCountState = ref(0)
let currentSongState = ref({})
let songIndexState = ref(0)
let isPlayingState = ref(false)
let currentlyTimerState = ref('00:00')
let songsState = ref(threatSongs(songMocks))
let playerState = ref(new Audio())
let seekSliderState = ref(0)
let seekSliderFormatState = ref((v) => `${formatTimer(currentSongState.value.seconds * (v / 100))}`)
let volumeSliderState = ref(100)

let playFromToFlagState = ref(true)
let playFromState = ref(1)
let playToState = ref(10)
let playFromToCustomFlagState = ref(true)
let playFromToMappingState = ref({
  1: {
    text: '1-10',
    from: 1,
    to: 10,
    shouldDisableSelect: true
  },
  2: {
    text: '11-20',
    from: 11,
    to: 20,
    shouldDisableSelect: true
  },
  3: {
    text: '21-30',
    from: 21,
    to: 30,
    shouldDisableSelect: true
  },
  4: {
    text: '31-40',
    from: 31,
    to: 40,
    shouldDisableSelect: true
  },
  5: {
    text: 'Other',
    from: 1,
    to: 40,
    shouldDisableSelect: false
  }
})

let activeTab = ref('1')
// refs
let lyricRef = ref(null)
let playlistRef = ref(null)
let sleepTimerRef = ref(null)
let syncRef = ref(null)
let repeatRef = ref(null)

// using for prevent sync in first load page
let isAppMounted = false

// computed
function createObjectFromNumber(number) {
  const obj = []
  for (let i = 1; i <= number; i++) {
    obj.push({
      value: i,
      label: i
    })
  }
  return obj
}
let songIndexOptionsComputed = computed(() => {
  return createObjectFromNumber(songsState.value.length)
})

let showTimeStringLyricComputed = computed(() => {
  if (repeatRef.value) {
    return repeatRef.value.showTimeStringLyricState
  }
  return false
})

function calcCurrentSongIndex(newSongIndex) {
  if (!playFromToFlagState.value || (!playFromState.value && !playToState.value)) {
    return newSongIndex
  }

  if (newSongIndex === songsState.value.length - 1) {
    return playToState.value - 1
  }

  if (newSongIndex === 0) {
    return playFromState.value - 1
  }

  let from = Number(playFromState.value ? playFromState.value : 0)
  let to = Number(playToState.value ? playToState.value : songsState.value.length - 1)
  let range = to - from + 1
  let normalizedIndex = (newSongIndex - from + 1) % range
  newSongIndex = from + normalizedIndex - 1

  if (playFromState.value <= newSongIndex && newSongIndex <= playToState.value) {
    return newSongIndex
  }
  return playFromState.value - 1
}

function setCurrentSong() {
  currentSongState.value = songsState.value[songIndexState.value]
}

function setPlayerSource() {
  playerState.value.src = currentSongState.value.src
}

function setCurrentlyTimer(startTime, endTime) {
  if (!startTime) {
    return false
  }
  playerState.value.currentTime = startTime + 0.1

  repeatRef.value.setTimeWhenClickLyric(startTime, endTime)
}

function play(songIndexInput = null, isClickFromList = false) {
  if (isClickFromList && songIndexInput === songIndexState.value && isPlayingState.value) {
    return true
  }

  if (songIndexState.value !== songIndexInput) {
    setLoopsCount(0)
    songIndexState.value = calcCurrentSongIndex(songIndexInput)
    setPlayerSource()
    lyricRef.value.scrollToTopInLyrics()
    playlistRef.value.scrollToActive()
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
  let newSongIndex = (songIndexState.value - 1 + songsState.value.length) % songsState.value.length
  play(newSongIndex)
}

function setLoopsCount($count) {
  loopsCountState.value = $count
}

let playAfterDelay = null

function registerListener() {
  playerState.value.addEventListener('timeupdate', () => {
    let playerTimer = playerState.value.currentTime

    if (repeatRef.value.isRepeatActiveState) {
      if (playerTimer < repeatRef.value.startTimeState) {
        playerState.value.currentTime = repeatRef.value.startTimeState
      } else if (playerTimer > repeatRef.value.endTimeState - 0.2) {
        playerState.value.currentTime = repeatRef.value.startTimeState
        pause()
        playAfterDelay = setTimeout(() => {
          play()
        }, 5000)
      }
    }
    lyricRef.value.changeCurrentLyricState(playerTimer)
    currentlyTimerState.value = formatTimer(playerTimer)
  })
  playerState.value.addEventListener('ended', () => {
    lyricRef.value.scrollToTopInLyrics()
    isPlayingState.value = false
    if (playFromToFlagState.value) {
      setLoopsCount(++loopsCountState.value)
      if (loopsCountState.value >= loopsState.value) {
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
  playerState.value.currentTime = currentSongState.value.seconds * (seekSliderState.value / 100)
}

function setVolume() {
  playerState.value.volume = volumeSliderState.value / 100
}

function setDefaultSettingFromLocalStorage() {
  pause()
  let attributes = [
    'volumeSliderState',
    'loopsState',
    'loopsCountState',
    'playFromState',
    'playToState',
    'playFromToPickedState'
  ]
  attributes.forEach((el) => {
    if (localStorage[el]) {
      eval(el).value = Number(localStorage[el])
    }
  })

  if (localStorage.playFromToPickedState) {
    playFromToPickedState.value =
      localStorage.playFromToPickedState === 'null' ? '1' : localStorage.playFromToPickedState
  }

  if (localStorage.songIndexState) {
    songIndexState.value =
      Number(localStorage.songIndexState) > songsState.value.length - 1
        ? 0
        : Number(localStorage.songIndexState)
  }

  if (localStorage.playFromState) {
    playFromState.value =
      localStorage.playFromState === 'null' ? 1 : Number(localStorage.playFromState)
  }

  if (localStorage.playToState) {
    playToState.value =
      localStorage.playToState === 'null'
        ? songsState.value.length
        : Number(localStorage.playToState)
  }

  sleepTimerRef.value.setDefaultSettingFromLocalStorage()
}

onMounted(async () => {
  await syncRef.value.setDefaultSettingFromLocalStorage()
  try {
    await syncDownload(syncRef.value.syncFlagState)
  } catch (error) {
    if (error.message === FirebaseEnums.permission_denied) {
      syncRef.value.onShowModalLogin()
    }
  }
  await setDefaultSettingFromLocalStorage()
  await setCurrentSong()
  await setPlayerSource()
  await registerListener()
  isAppMounted = true
})

function onSyncUpload() {
  if (!syncRef.value.syncFlagState || !isAppMounted) {
    return
  }
  let data = {}
  data.loopsState = Number(loopsState.value)
  data.loopsCountState = Number(loopsCountState.value)
  data.songIndexState = Number(songIndexState.value)
  data.playFromState = Number(playFromState.value)
  data.playToState = Number(playToState.value)
  data.playFromToPickedState = playFromToPickedState.value

  syncUpload(data)
}

watch(volumeSliderState, async (value) => {
  localStorage.volumeSliderState = value
})
watch(loopsState, async (value, old) => {
  value = isNaN(value) ? old : value
  loopsState.value = value
  localStorage.loopsState = value
  onSyncUpload()
})
watch(loopsCountState, async (value) => {
  localStorage.loopsCountState = value
  onSyncUpload()
})
watch(songIndexState, async (value) => {
  localStorage.songIndexState = value
  setCurrentSong()
  onSyncUpload()
})
watch(playFromState, async (value) => {
  localStorage.playFromState = value
  onSyncUpload()
})
watch(playToState, async (value) => {
  localStorage.playToState = value
  onSyncUpload()
})
watch(currentlyTimerState, async (value) => {
  if (value) {
    let percent = Math.round((playerState.value.currentTime * 100) / currentSongState.value.seconds)
    seekSliderState.value = Math.min(percent, 100)
  }
  lyricRef.value.scrollToActiveInLyrics()
})

let playFromToPickedState = ref(null)
watch(playFromToPickedState, async (value) => {
  localStorage.playFromToPickedState = value
  onSyncUpload()

  if (value in playFromToMappingState.value) {
    playFromState.value = playFromToMappingState.value[value].from
    playToState.value = playFromToMappingState.value[value].to
    playFromToCustomFlagState.value = playFromToMappingState.value[value].shouldDisableSelect
  }
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
          {{ currentSongState.title }}
        </h2>
        <div class="mb-5">
          <div class="flex justify-between px-1 w-full text-xs">
            <p>{{ currentlyTimerState }}</p>
            <p>{{ currentSongState.totalTimer }}</p>
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
              v-if="songsState.length > 1"
            >
              <span><BackwardIcon class="h-6 w-6" /></span>
            </button>
            <button
              class="flex justify-center items-center border-0 rounded-full text-xl w-[25px] h-[25px] cursor-pointer text-gray-400 relative py-5 px-7 hover:scale-125 transition bg-transparent"
              @click="next"
              v-if="songsState.length > 1"
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
          <!-- begin:: Loop -->
          <fieldset class="flex justify-between items-center my-1 fieldset-border">
            <legend>Loops</legend>
            <div>
              <p class="text-base">
                Played
                <span class="text-red-600">{{ loopsCountState }}</span>
                times
              </p>
              <p class="text-base">
                <label for="loops_input">Loop for</label>
                <input
                  id="loops_input"
                  class="p-0.5 mx-0.5 w-[30px] text-center text-base border-b border-solid border-gray-600 outline-0"
                  v-model="loopsState"
                  type="text"
                  name="loops-input"
                />
                <label for="loops_input">times</label>
              </p>
            </div>
            <div>
              <button class="btn" @click="setLoopsCount(0)">Reset</button>
            </div>
          </fieldset>
          <!-- end:: Loop -->
          <!-- begin:: Play from to -->
          <fieldset class="flex justify-between items-center my-1 fieldset-border">
            <legend>Play from to</legend>
            <div class="w-full">
              <a-radio-group
                v-model:value="playFromToPickedState"
                name="playFromTo"
                class="grid grid-cols-3"
              >
                <a-radio
                  v-for="(radio, index) in playFromToMappingState"
                  :key="index"
                  :value="index"
                  :disabled="playFromToFlagState"
                  class="mb-2"
                  >{{ radio.text }}</a-radio
                >
              </a-radio-group>
              <div class="flex justify-between">
                <div class="flex items-center">
                  <a-select
                    v-model:value="playFromState"
                    class="w-[65px]"
                    :options="songIndexOptionsComputed"
                    :disabled="playFromToFlagState || playFromToCustomFlagState"
                  ></a-select>
                  <label class="mx-3">to</label>
                  <a-select
                    v-model:value="playToState"
                    class="w-[65px]"
                    :options="songIndexOptionsComputed"
                    :disabled="playFromToFlagState || playFromToCustomFlagState"
                  ></a-select>
                </div>
                <div>
                  <button
                    class="btn"
                    :class="{ active: playFromToFlagState }"
                    @click="playFromToFlagState = !playFromToFlagState"
                  >
                    {{ playFromToFlagState ? 'Cancel' : 'Set' }}
                  </button>
                </div>
              </div>
            </div>
          </fieldset>
          <!-- end:: Play from to -->
        </a-tab-pane>
        <a-tab-pane key="2" force-render>
          <template #tab>
            <ArrowPathIcon class="h-6 w-6" />
          </template>
          <repeat ref="repeatRef" :current-song-state="currentSongState"></repeat>
        </a-tab-pane>
        <a-tab-pane key="3" force-render>
          <template #tab>
            <span class="flex justify-center"><ClockIcon class="h-6 w-6" /></span>
          </template>
          <sleep-timer @pause="pause" ref="sleepTimerRef"></sleep-timer>
        </a-tab-pane>
        <a-tab-pane key="4" force-render>
          <template #tab>
            <WifiIcon class="h-6 w-6" />
          </template>
          <sync
            @set-default-setting-from-local-storage="setDefaultSettingFromLocalStorage"
            @set-player-source="setPlayerSource"
            ref="syncRef"
          ></sync>
        </a-tab-pane>
      </a-tabs>
    </section>
    <!-- end:: Player Section -->
    <lyric
      :current-song-state="currentSongState"
      :show-lyrics-state="navMobileStore.showLyricsState"
      :show-time-string-lyric-state="showTimeStringLyricComputed"
      @set-currently-timer="setCurrentlyTimer"
      ref="lyricRef"
    />
    <!-- begin:: Playlist Section -->
    <playlist
      :current-song-state="currentSongState"
      :songs-state="songsState"
      :show-playlist-state="navMobileStore.showPlaylistState"
      @play="play"
      ref="playlistRef"
    />
    <!-- end:: Playlist Section -->

    <!-- begin:: Nav mobile -->
    <nav-mobile />
    <!-- end:: Nav mobile -->
  </a-config-provider>
</template>

<style scoped></style>
