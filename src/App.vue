<script setup>
import { formatTimer, timeStringToSecond } from './helpers/timer'
import { threatSongs } from './helpers/utils'
import songMocks from './mocks/songs'
import { computed, onMounted, ref, watch } from 'vue'
import { TransitionFade } from '@morev/vue-transitions'

let loopsState = ref(10)
let countLoopsState = ref(0)
let playFromState = ref(1)
let playToState = ref(10)
let currentState = ref({})
let indexState = ref(0)
let isPlayingState = ref(false)
let currentlyTimerState = ref('00:00')
let songsState = ref(songMocks)
let playerState = ref(new Audio())
let seekSliderState = ref(0)
let seekSliderFormatState = ref((v) => `${formatTimer(currentState.value.seconds * (v / 100))}`)
let volumeSliderState = ref(100)
let activePlaylistState = ref(false)
let activeLyricsState = ref(false)
let currentLyricState = ref({})
let lyricTypesOptionsState = ref([
  { id: 'lyric1', name: 'Lyric 1' },
  { id: 'lyric2', name: 'Lyric 2' }
])

let selectedLyricTypeState = ref({ id: 'lyric1', name: 'Lyric 1' })
let playFromToFlagState = ref(false)
let playFromToCustomFlagState = ref(true)
let playFromToPickedState = ref(1)

let songPlaylistState = ref(null)
let lyricRefState = ref(null)

let playToMappingState = ref({
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

function setCurrentSong() {
  currentState.value = songsState.value[indexState.value]
  playerState.value.src = currentState.value.src
}

function setCurrentlyTimer(time) {
  if (!time) {
    return false
  }
  playerState.value.currentTime = time + 0.1
}

function play(indexInput, isClickFromList = false) {
  if (isClickFromList && indexInput === indexState.value && isPlayingState.value) {
    return true
  }

  if (indexState.value !== indexInput) {
    setLoopsCount(0)
    indexState.value = calcCurrentIndex(indexInput)
    setCurrentSong()
    scrollToActiveInPlaylist()
  }
  playerState.value.play()
  isPlayingState.value = true
}

function pause() {
  playerState.value.pause()
  isPlayingState.value = false
}

function next() {
  let newIndex = (indexState.value + 1) % songsState.value.length
  play(newIndex)
}

function prev() {
  let newIndex = (indexState.value - 1 + songsState.value.length) % songsState.value.length
  play(newIndex)
}

function setLoopsCount($count) {
  countLoopsState.value = $count
}

function registerListener() {
  playerState.value.addEventListener('timeupdate', () => {
    let playerTimer = playerState.value.currentTime
    currentLyricState.value = convertLyric.value.find(
      (el) => playerTimer >= el.start - 0.4 && playerTimer <= el.end
    )
    currentlyTimerState.value = formatTimer(playerTimer)
  })
  playerState.value.addEventListener('ended', () => {
    setLoopsCount(++countLoopsState.value)
    if (countLoopsState.value >= loopsState.value) {
      next()
    }
    isPlayingState.value = false
    convertLyric.value.map((el) => {
      el.over = false
    })
    if (playFromToFlagState.value) {
      play(indexState.value)
    } else {
      next()
    }
  })
}

function seekTo() {
  playerState.value.currentTime = currentState.value.seconds * (seekSliderState.value / 100)
}

function setVolume() {
  playerState.value.volume = volumeSliderState.value / 100
}

function activeNavMobile(type = null) {
  switch (type) {
    case 'playlist':
      activeLyricsState.value = false
      activePlaylistState.value = !activePlaylistState.value
      break
    case 'lyrics':
      activeLyricsState.value = !activeLyricsState.value
      activePlaylistState.value = false
      break
    default:
      activeLyricsState.value = false
      activePlaylistState.value = false
  }
}

function scrollToActiveInPlaylist(behavior = 'smooth') {
  setTimeout(() => {
    let list = songPlaylistState.value
    let active = list.querySelector('.active')
    if (!active) {
      return
    }
    active.scrollIntoView({ behavior: behavior, block: 'center' })
  })
}

function scrollToActiveInLyrics() {
  setTimeout(() => {
    let list = lyricRefState.value
    let active = list.querySelector('.active')
    if (!active) {
      return
    }
    active.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function setDefaultSettingFromLocalStorage() {
  let attributes = [
    'volumeSliderState',
    'loopsState',
    'countLoopsState',
    'playFromState',
    'playToState',
    'playFromToPickedState'
  ]
  attributes.forEach((el) => {
    if (localStorage[el]) {
      eval(el).value = Number(localStorage[el])
    }
  })
  if (localStorage.indexState) {
    indexState.value =
      Number(localStorage.indexState) > songsState.value.length - 1
        ? 0
        : Number(localStorage.indexState)
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

function handleScrollLyric(evt, el) {
  if (el.scrollTop > 0) {
    el.previousSibling.classList.add('scrolled')
  } else {
    el.previousSibling.classList.remove('scrolled')
  }
}

function calcCurrentIndex(newIndex) {
  if (!playFromToFlagState.value || (!playFromState.value && !playToState.value)) {
    return newIndex
  }

  if (newIndex === songsState.value.length - 1) {
    return playToState.value - 1
  }

  if (newIndex === 0) {
    return playFromState.value - 1
  }

  let from = Number(playFromState.value ? playFromState.value : 0)
  let to = Number(playToState.value ? playToState.value : songsState.value.length - 1)
  let range = to - from + 1
  let normalizedIndex = (newIndex - from + 1) % range
  newIndex = from + normalizedIndex - 1

  if (playFromState.value <= newIndex && newIndex <= playToState.value) {
    return newIndex
  }
  return playFromState.value - 1
}

onMounted(() => {
  songsState.value = threatSongs(songMocks)
  setDefaultSettingFromLocalStorage()
  setCurrentSong()
  scrollToActiveInPlaylist('auto')
  registerListener()
})

let convertLyric = computed(() => {
  if (typeof currentState.value[selectedLyricTypeState.value.id] === 'undefined') {
    return []
  }

  let lyricConverted = []
  let split = currentState.value[selectedLyricTypeState.value.id].split(/\n\s*\n/)
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
    let [start, end] = timeLine.trim().split('-->').map(timeStringToSecond)
    lyricConverted.push({ id, timeString, text, start, end, over: false })
  }
  return lyricConverted
})

let songIndexOptions = computed(() => {
  return [...Array(songsState.value.length).keys()].map((el) => el + 1)
})

watch(volumeSliderState, async (value) => {
  localStorage.volumeSliderState = value
})
watch(loopsState, async (value, old) => {
  value = isNaN(value) ? old : value
  loopsState.value = value
  localStorage.loopsState = value
})
watch(countLoopsState, async (value) => {
  localStorage.countLoopsState = value
})
watch(indexState, async (value) => {
  localStorage.indexState = value
})
watch(playFromState, async (value) => {
  localStorage.playFromState = value
})
watch(playToState, async (value) => {
  localStorage.playToState = value
})
watch(currentLyricState, async (value) => {
  if (value) {
    convertLyric.value.map((el) => {
      if (el.id <= value.id) {
        return (el.over = true)
      }
      return (el.over = false)
    })
  }
  scrollToActiveInLyrics()
})
watch(currentlyTimerState, async (value) => {
  if (value) {
    let percent = Math.round((playerState.value.currentTime * 100) / currentState.value.seconds)
    seekSliderState.value = Math.min(percent, 100)
  }
  scrollToActiveInLyrics()
})
watch(playFromToPickedState, async (value) => {
  localStorage.playFromToPickedState = value
  if (value === 'other') {
    playFromToCustomFlagState.value = false
    return true
  }

  if (value in playToMappingState.value) {
    playFromState.value = playToMappingState.value[value].from
    playToState.value = playToMappingState.value[value].to
    playFromToCustomFlagState.value = true
  }
})
</script>

<template>
  <section
    class="flex flex-col flex-nowrap order-3 w-full h-full mx-auto px-[15px] md:p-[10px] bg-white text-base rounded-none md:rounded shadow-none md:shadow-md row-start-1 row-end-3 col-start-1 col-end-2 md:order-1"
    :class="{ '!h-[420px]': activeLyricsState || activePlaylistState }"
  >
    <h2 class="w-full text-xl font-bold text-center py-4 px-1">
      {{ currentState.title }}
    </h2>
    <div class="mb-5">
      <div class="flex justify-between px-1 w-full text-xs">
        <p>{{ currentlyTimerState }}</p>
        <p>{{ currentState.totalTimer }}</p>
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
          class="flex justify-center items-center border-0 rounded-full text-xl w-[25px] h-[25px] cursor-pointer text-gray-300 relative py-5 px-7 hover:scale-125"
          @click="prev"
          v-if="songsState.length > 1"
        >
          <font-awesome-icon icon="step-backward" />
        </button>
        <button
          class="flex justify-center items-center border-0 rounded-full text-xl w-[25px] h-[25px] cursor-pointer text-gray-300 relative py-5 px-7 hover:scale-125"
          @click="next"
          v-if="songsState.length > 1"
        >
          <font-awesome-icon icon="step-forward" />
        </button>
      </div>

      <div class="absolute">
        <button
          class="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-[60px] h-[60px] shadow-2xl cursor-pointer text-2xl text-white hover:scale-110"
          v-if="!isPlayingState"
          @click="play(indexState)"
        >
          <font-awesome-icon icon="play" />
        </button>
        <button
          class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[60px] h-[60px] shadow-2xl cursor-pointer text-2xl text-white hover:scale-110"
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
          <span class="text-red-600">{{ countLoopsState }}</span>
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
    <transition-fade>
      <div
        :class="{ '!hidden': activeLyricsState || activePlaylistState }"
        v-show="!activeLyricsState && !activePlaylistState"
      >
        <fieldset class="flex justify-between items-center my-1 fieldset-border">
          <legend>Play from to</legend>
          <div class="w-full">
            <div class="grid grid-cols-3">
              <label
                v-for="(radio, index) in playToMappingState"
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
                  :options="songIndexOptions"
                  :searchable="false"
                  :show-labels="false"
                  :disabled="playFromToFlagState || playFromToCustomFlagState"
                  placeholder=""
                ></multi-select>
                <label class="mx-3">to</label>
                <multi-select
                  class="!w-[80px]"
                  v-model="playToState"
                  :options="songIndexOptions"
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
    </transition-fade>
  </section>

  <section
    class="lyrics-section1 flex flex-col flex-nowrap w-full mx-auto bg-white overflow-auto relative md:rounded md:shadow-md row-start-1 row-end-2 col-start-2 col-end-3 h-0 md:h-[calc(100vh-var(--playlist-height)-var(--gap-app)-var(--padding-app)*2)] transition-all duration-300 ease-in"
    :class="{ 'playlist-lyrics-section-active': activeLyricsState }"
  >
    <multi-select
      class="!w-[110px] !absolute top-[10px] left-[10px] z-10"
      v-model="selectedLyricTypeState"
      :options="lyricTypesOptionsState"
      :allow-empty="false"
      :searchable="false"
      label="name"
      track-by="id"
      :show-labels="false"
    ></multi-select>
    <h3 class="text-lg text-center py-5 font-bold">Lyrics</h3>
    <div
      class="py-5 px-7 text-center overflow-auto hover:overflow-auto scrollbar"
      ref="lyricRefState"
      v-scroll-element="handleScrollLyric"
    >
      <p
        v-html="lyric.text"
        v-for="(lyric, index) in convertLyric"
        :key="index"
        class="text-dimgray transition-all cursor-pointer text-lg hover:text-blue-400 first-letter:capitalize lyrics [&:not(:last-child)]:mb-3"
        :class="{
          '!text-blue-500 scale-110': lyric.id === currentLyricState?.id,
          'text-left': selectedLyricTypeState.id === 'lyric2',
          'text-slate-300': lyric.over
        }"
        @click="setCurrentlyTimer(lyric.start || 0)"
      ></p>
    </div>
  </section>

  <section
    class="flex flex-col flex-nowrap w-full mx-auto bg-white overflow-auto relative h-0 md:h-[var(--playlist-height)] md:rounded md:shadow-md row-start-2 row-end-3 col-start-2 col-end-3 transition-all duration-300 ease-in"
    :class="{ 'playlist-lyrics-section-active': activePlaylistState }"
  >
    <ul class="overflow-auto hover:overflow-auto scrollbar h-full" ref="songPlaylistState">
      <li
        v-for="(song, key) in songsState"
        :key="song.id"
        class="grid grid-cols-1 py-[10px] px-4 cursor-pointer border-b border-solid border-slate-200 hover:bg-sky-100 transition"
        @click="play(key, true)"
        :class="{ 'bg-sky-200 !border-sky-200': song.id === currentState.id }"
      >
        <p class="ml-1 text-base">
          {{ song.title }}
        </p>
      </li>
    </ul>
  </section>
  <div
    class="flex items-center fixed bottom-0 left-0 text-2xl text-gray-600 w-full shadow-[0px_3px_8px_rgba(0,0,0,0.24)] bg-white md:hidden"
  >
    <div
      class="px-5 py-2 w-1/2 text-center border-b-4 border-b-white border-solid transition-all duration-300"
      :class="{ 'text-blue-500 border-b-blue-500': activePlaylistState }"
      @click="activeNavMobile('playlist')"
    >
      <font-awesome-icon :icon="['fas', 'list']" />
    </div>
    <div
      class="px-5 py-2 w-1/2 text-center border-b-4 border-b-white border-solid transition-all duration-300"
      :class="{ 'text-blue-500 border-b-blue-500': activeLyricsState }"
      @click="activeNavMobile('lyrics')"
    >
      <font-awesome-icon :icon="['fas', 'music']" />
    </div>
  </div>
</template>

<style scoped></style>
