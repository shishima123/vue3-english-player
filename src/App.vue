<script setup>
import { formatTimer } from './helpers/timer'
import { threatSongs } from '@/helpers/utils'
import songMocks from '@/mocks/songs'
import { computed, onMounted, ref, watch } from 'vue'
import NavMobile from '@/components/NavMobile.vue'
import Playlist from '@/components/Playlist.vue'
import Lyric from '@/components/Lyric.vue'

let loopsState = ref(10)
let loopsCountState = ref(0)
let playFromState = ref(1)
let playToState = ref(10)
let currentSongState = ref({})
let songIndexState = ref(0)
let isPlayingState = ref(false)
let currentlyTimerState = ref('00:00')
let songsState = ref(songMocks)
let playerState = ref(new Audio())
let seekSliderState = ref(0)
let seekSliderFormatState = ref((v) => `${formatTimer(currentSongState.value.seconds * (v / 100))}`)
let volumeSliderState = ref(100)
let playFromToFlagState = ref(false)
let playFromToCustomFlagState = ref(true)
let playFromToMappingState = ref({
  1: {
    text: '1-10',
    from: 1,
    to: 10
  },
  2: {
    text: '11-20',
    from: 11,
    to: 20
  },
  3: {
    text: '21-30',
    from: 21,
    to: 30
  },
  4: {
    text: '31-40',
    from: 31,
    to: 40
  },
  other: {
    text: 'Other'
  }
})

// refs
let lyricRef = ref(null)
let playlistRef = ref(null)

// computed
let songIndexOptionsComputed = computed(() => {
  return [...Array(songsState.value.length).keys()].map((el) => el + 1)
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
  playerState.value.src = currentSongState.value.src
}

function setCurrentlyTimer(time) {
  if (!time) {
    return false
  }
  playerState.value.currentTime = time + 0.1
}

function play(songIndexInput, isClickFromList = false) {
  if (isClickFromList && songIndexInput === songIndexState.value && isPlayingState.value) {
    return true
  }

  if (songIndexState.value !== songIndexInput) {
    setLoopsCount(0)
    songIndexState.value = calcCurrentSongIndex(songIndexInput)
    setCurrentSong()
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

function registerListener() {
  playerState.value.addEventListener('timeupdate', () => {
    let playerTimer = playerState.value.currentTime
    lyricRef.value.changeCurrentLyricState(playerTimer)
    currentlyTimerState.value = formatTimer(playerTimer)
  })
  playerState.value.addEventListener('ended', () => {
    setLoopsCount(++loopsCountState.value)
    if (loopsCountState.value >= loopsState.value) {
      next()
    }
    isPlayingState.value = false
    lyricRef.value.resetLyricOver()
    if (playFromToFlagState.value) {
      play(songIndexState.value)
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

function setDefaultSettingFromLocalStorage() {
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
  if (localStorage.songIndexState) {
    songIndexState.value =
      Number(localStorage.songIndexState) > songsState.value.length - 1
        ? 0
        : Number(localStorage.songIndexState)
  }

  if (localStorage.playFromState) {
    playFromState.value =
      localStorage.playFromState === 'null' ? null : Number(localStorage.playFromState)
  }

  if (localStorage.playToState) {
    playToState.value =
      localStorage.playToState === 'null' ? null : Number(localStorage.playToState)
  }
}

onMounted(() => {
  songsState.value = threatSongs(songMocks)
  setDefaultSettingFromLocalStorage()
  setCurrentSong()
  registerListener()
})

watch(volumeSliderState, async (value) => {
  localStorage.volumeSliderState = value
})
watch(loopsState, async (value, old) => {
  value = isNaN(value) ? old : value
  loopsState.value = value
  localStorage.loopsState = value
})
watch(loopsCountState, async (value) => {
  localStorage.loopsCountState = value
})
watch(songIndexState, async (value) => {
  localStorage.songIndexState = value
})
watch(playFromState, async (value) => {
  localStorage.playFromState = value
})
watch(playToState, async (value) => {
  localStorage.playToState = value
})
watch(currentlyTimerState, async (value) => {
  if (value) {
    let percent = Math.round((playerState.value.currentTime * 100) / currentSongState.value.seconds)
    seekSliderState.value = Math.min(percent, 100)
  }
  lyricRef.value.scrollToActiveInLyrics()
})

let playFromToPickedState = ref(1)
watch(playFromToPickedState, async (value) => {
  localStorage.playFromToPickedState = value
  if (value === 'other') {
    playFromToCustomFlagState.value = false
    return true
  }

  if (value in playFromToMappingState.value) {
    playFromState.value = playFromToMappingState.value[value].from
    playToState.value = playFromToMappingState.value[value].to
    playFromToCustomFlagState.value = true
  }
})
</script>

<template>
  <!-- begin:: Player Section -->
  <section
    class="flex flex-col flex-nowrap order-3 w-full h-full mx-auto overflow-hidden px-[15px] md:p-[10px] bg-white text-base rounded-none md:rounded shadow-none md:shadow-md row-start-1 row-end-3 col-start-1 col-end-2 md:order-1 transition-[height] duration-[350ms] ease-linear"
    :class="{ '!h-[var(--player-mobile-height)]': showLyricsState || showPlaylistState }"
  >
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
        <font-awesome-icon icon="volume-down" />
      </span>

      <vue-slider
        v-model="volumeSliderState"
        :tooltip="'active'"
        @change="setVolume"
        :style="{ width: '100%' }"
      ></vue-slider>
      <span class="ml-4 inline-block">
        <font-awesome-icon icon="volume-up" />
      </span>
    </div>
    <div class="flex justify-center items-center py-5 px-4">
      <div class="flex justify-between border border-solid border-gray-200 w-3/5 rounded-[30px]">
        <button
          class="flex justify-center items-center border-0 rounded-full text-xl w-[25px] h-[25px] cursor-pointer text-gray-300 relative py-5 px-7 hover:scale-125 transition"
          @click="prev"
          v-if="songsState.length > 1"
        >
          <font-awesome-icon icon="step-backward" />
        </button>
        <button
          class="flex justify-center items-center border-0 rounded-full text-xl w-[25px] h-[25px] cursor-pointer text-gray-300 relative py-5 px-7 hover:scale-125 transition"
          @click="next"
          v-if="songsState.length > 1"
        >
          <font-awesome-icon icon="step-forward" />
        </button>
      </div>

      <div class="absolute">
        <button
          class="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-[60px] h-[60px] shadow-2xl cursor-pointer text-2xl text-white hover:scale-110 transition"
          v-if="!isPlayingState"
          @click="play(songIndexState)"
        >
          <font-awesome-icon icon="play" />
        </button>
        <button
          class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[60px] h-[60px] shadow-2xl cursor-pointer text-2xl text-white hover:scale-110 transition"
          v-else
          @click="pause"
        >
          <font-awesome-icon icon="pause" />
        </button>
      </div>
    </div>
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
          <span>times</span>
        </p>
      </div>
      <div>
        <button class="btn" @click="setLoopsCount(0)">Reset</button>
      </div>
    </fieldset>
    <div>
      <fieldset class="flex justify-between items-center my-1 fieldset-border">
        <legend>Play from to</legend>
        <div class="w-full">
          <div class="grid grid-cols-3">
            <label
              v-for="(radio, index) in playFromToMappingState"
              :key="index"
              class="radio-container"
            >
              {{ radio.text }}
              <input
                type="radio"
                name="playFromTo"
                :value="index"
                :disabled="playFromToFlagState"
                v-model="playFromToPickedState"
              />
              <span class="checkmark"></span>
            </label>
          </div>
          <div class="flex justify-between">
            <div class="flex items-center">
              <multi-select
                class="!w-[80px]"
                v-model="playFromState"
                :options="songIndexOptionsComputed"
                :searchable="false"
                :show-labels="false"
                :disabled="playFromToFlagState || playFromToCustomFlagState"
                placeholder=""
              ></multi-select>
              <label class="mx-3">to</label>
              <multi-select
                class="!w-[80px]"
                v-model="playToState"
                :options="songIndexOptionsComputed"
                :searchable="false"
                :show-labels="false"
                :disabled="playFromToFlagState || playFromToCustomFlagState"
                placeholder=""
              ></multi-select>
            </div>
            <button
              class="btn"
              :class="{ 'bg-zinc-100': playFromToFlagState }"
              @click="playFromToFlagState = !playFromToFlagState"
            >
              {{ playFromToFlagState ? 'Cancel' : 'Set' }}
            </button>
          </div>
        </div>
      </fieldset>
    </div>
  </section>
  <!-- end:: Player Section -->
  <lyric
    :current-song-state="currentSongState"
    :show-lyrics-state="showLyricsState"
    @set-currently-timer="setCurrentlyTimer"
    ref="lyricRef"
  />
  <!-- begin:: Playlist Section -->
  <playlist
    :current-song-state="currentSongState"
    :songs-state="songsState"
    :show-playlist-state="showPlaylistState"
    @play="play"
    ref="playlistRef"
  />
  <!-- end:: Playlist Section -->

  <!-- begin:: Nav mobile -->
  <nav-mobile
    @activeNavMobile="activeNavMobile"
    :show-lyrics-state="showLyricsState"
    :show-playlist-state="showPlaylistState"
  />
  <!-- end:: Nav mobile -->
</template>

<style scoped></style>
