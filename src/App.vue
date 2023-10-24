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
  let mapping = {
    1: {
      from: 1,
      to: 10
    },
    2: {
      from: 11,
      to: 20
    },
    3: {
      from: 21,
      to: 30
    },
    4: {
      from: 31,
      to: 40
    }
  }

  localStorage.playFromToPickedState = value

  if (value in mapping) {
    playFromState.value = mapping[value].from
    playToState.value = mapping[value].to
    playFromToCustomFlagState.value = true
  } else {
    playFromToCustomFlagState.value = false
  }
})
</script>

<template>
  <section
    class="player-section"
    :class="{ 'hide-setting-block': activeLyricsState || activePlaylistState }"
  >
    <h2 class="song-title">
      {{ currentState.title }}
    </h2>
    <div class="time-slider">
      <div class="timer">
        <p class="start">{{ currentlyTimerState }}</p>
        <p class="end">
          {{ currentState.totalTimer }}
        </p>
      </div>
      <vue-slider
        v-model="seekSliderState"
        :tooltip="'active'"
        :tooltip-formatter="seekSliderFormatState"
        @drag-end="seekTo"
      ></vue-slider>
    </div>

    <div class="volume_container">
      <span class="volume-down">
        <font-awesome-icon icon="volume-down" />
      </span>

      <vue-slider
        v-model="volumeSliderState"
        :tooltip="'active'"
        @change="setVolume"
        :style="{ width: '100%' }"
      ></vue-slider>
      <span class="volume-up">
        <font-awesome-icon icon="volume-up" />
      </span>
    </div>
    <div class="controls">
      <div class="controls-action">
        <button class="prev" @click="prev" v-if="songsState.length > 1">
          <font-awesome-icon icon="step-backward" />
        </button>
        <button class="next" @click="next" v-if="songsState.length > 1">
          <font-awesome-icon icon="step-forward" />
        </button>
      </div>

      <div class="action-play-pause">
        <button class="play" v-if="!isPlayingState" @click="play(indexState)">
          <font-awesome-icon icon="play" />
        </button>
        <button class="pause" v-else @click="pause">
          <font-awesome-icon icon="pause" />
        </button>
      </div>
    </div>
    <fieldset class="setting-block">
      <legend class="play-form-to-label">Loops</legend>
      <div class="loops">
        <p>
          Played
          <span class="text-primary">{{ countLoopsState }}</span>
          times
        </p>
        <p>
          <label for="loops_input">Loop for</label>
          <input
            id="loops_input"
            class="loops-input"
            v-model="loopsState"
            type="text"
            name="loops-input"
          />
          <span>times</span>
        </p>
      </div>
      <div>
        <button class="btn btn-reset" @click="setLoopsCount(0)">Reset</button>
      </div>
    </fieldset>
    <transition-fade>
      <div class="setting-section" v-show="!activeLyricsState && !activePlaylistState">
        <fieldset class="setting-block">
          <legend class="play-form-to-label">Play from to</legend>
          <div class="play-form-to">
            <div class="play-form-to-radio">
              <label class="radio-container"
                >1-10
                <input
                  type="radio"
                  name="playFromTo"
                  value="1"
                  :disabled="playFromToFlagState"
                  v-model="playFromToPickedState"
                />
                <span class="checkmark"></span>
              </label>
              <label class="radio-container"
                >11-20
                <input
                  type="radio"
                  name="playFromTo"
                  value="2"
                  :disabled="playFromToFlagState"
                  v-model="playFromToPickedState"
                />
                <span class="checkmark"></span>
              </label>
              <label class="radio-container"
                >21-30
                <input
                  type="radio"
                  name="playFromTo"
                  value="3"
                  :disabled="playFromToFlagState"
                  v-model="playFromToPickedState"
                />
                <span class="checkmark"></span>
              </label>
              <label class="radio-container"
                >31-40
                <input
                  type="radio"
                  name="playFromTo"
                  value="4"
                  :disabled="playFromToFlagState"
                  v-model="playFromToPickedState"
                />
                <span class="checkmark"></span>
              </label>
              <label class="radio-container"
                >Custom
                <input
                  type="radio"
                  name="playFromTo"
                  value="5"
                  :disabled="playFromToFlagState"
                  v-model="playFromToPickedState"
                />
                <span class="checkmark"></span>
              </label>
            </div>
            <div class="play-form-to-custom">
              <div class="play-form-to-custom-select">
                <multi-select
                  class="select"
                  v-model="playFromState"
                  :options="songIndexOptions"
                  :searchable="false"
                  :show-labels="false"
                  :disabled="playFromToFlagState || playFromToCustomFlagState"
                  placeholder=""
                ></multi-select>
                <label class="select-label">to </label>
                <multi-select
                  class="select"
                  v-model="playToState"
                  :options="songIndexOptions"
                  :searchable="false"
                  :show-labels="false"
                  :disabled="playFromToFlagState || playFromToCustomFlagState"
                  placeholder=""
                ></multi-select>
              </div>
              <button
                class="btn btn-set-from-to"
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

  <section class="lyrics-section" :class="{ active: activeLyricsState }">
    <multi-select
      class="select-lyric-type"
      v-model="selectedLyricTypeState"
      :options="lyricTypesOptionsState"
      :allow-empty="false"
      :searchable="false"
      label="name"
      track-by="id"
      :show-labels="false"
    ></multi-select>
    <h3>Lyrics</h3>
    <div class="text scrollbar" ref="lyricRefState" v-scroll-element="handleScrollLyric">
      <p
        v-html="lyric.text"
        v-for="(lyric, index) in convertLyric"
        :key="index"
        :class="{
          active: lyric.id === currentLyricState?.id,
          lyric2: selectedLyricTypeState.id === 'lyric2',
          over: lyric.over
        }"
        @click="setCurrentlyTimer(lyric.start || 0)"
      ></p>
    </div>
  </section>

  <section class="playlist-section" :class="{ active: activePlaylistState }">
    <ul class="song-playlist scrollbar" ref="songPlaylistState">
      <li
        v-for="(song, key) in songsState"
        :key="song.id"
        class="song"
        @click="play(key, true)"
        :class="{ active: song.id === currentState.id }"
      >
        <div class="details">
          <p class="song-title">
            {{ song.title }}
          </p>
        </div>
      </li>
    </ul>
  </section>
  <div class="nav-mobile sp-only">
    <div
      class="playlist"
      :class="{ active: activePlaylistState }"
      @click="activeNavMobile('playlist')"
    >
      <font-awesome-icon :icon="['fas', 'list']" />
    </div>
    <div class="lyrics" :class="{ active: activeLyricsState }" @click="activeNavMobile('lyrics')">
      <font-awesome-icon :icon="['fas', 'music']" />
    </div>
  </div>
</template>

<style scoped></style>
