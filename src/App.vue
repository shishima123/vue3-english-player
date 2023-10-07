<script setup>
import {formatTimer, timeStringToSecond} from './helpers/timer'
import {threatSongs} from './helpers/utils'
import songMocks from './mocks/songs'
import {computed, onMounted, reactive, ref, watch} from "vue";

let loops = ref(10)
let countLoops = ref(0)
let playFrom = ref(1)
let playTo = ref(10)
let current = ref({seconds: 0, src: null})
let coverObject = ref({cover: true, animated: false})
let index = ref(0)
let isPlaying = ref(false)
let currentlyTimer = ref('00:00')
let songs = ref(songMocks)
let player = ref(new Audio())
let seekSlider = ref(0)
let seekSliderFormat = ref((v) => `${formatTimer(current.value.seconds * (v / 100))}`)
let volumeSlider = ref(100)
let activePlaylist = ref(false)
let activeLyrics = ref(false)
let currentLyric = ref({})
let lyricTypesOptions = ref([
  {id: 'lyric1', name: 'Lyric 1'},
  {id: 'lyric2', name: 'Lyric 2'}
])
let selectedLyricType = ref({id: 'lyric1', name: 'Lyric 1'})
let setPlayFromToFlg = ref(false)

let songPlaylist = ref(null)
let lyricRef = ref(null)

function setCover() {
  coverObject.value.animated = true

  setTimeout(() => {
    coverObject.value.animated = false
  }, 1000)
}

function setCurrentSong() {
  current.value = songs.value[index.value]
  player.value.src = current.value.src
  setCover()
}

function setCurrentlyTimer(time) {
  if (!time) {
    return false
  }
  player.value.currentTime = time + 0.1
}

function play(indexInput, isClickFromList = false) {
  if (isClickFromList && indexInput === index.value && isPlaying.value) {
    return true
  }

  if (index.value !== indexInput) {
    setLoopsCount(0)
    index.value = calcCurrentIndex(indexInput)
    setCurrentSong()
    scrollToActiveInPlaylist()
  }
  player.value.play()
  isPlaying.value = true
}

function pause() {
  player.value.pause()
  isPlaying.value = false
}

function next() {
  let newIndex = (index.value + 1) % songs.value.length
  play(newIndex)
}

function prev() {
  let newIndex = (index.value - 1 + songs.value.length) % songs.value.length
  play(newIndex)
}

function setLoopsCount($count) {
  countLoops.value = $count
}

function registerListener() {
  player.value.addEventListener('timeupdate', () => {
    let playerTimer = player.value.currentTime
    currentLyric.value = convertLyric.value.find(
        (el) => playerTimer >= el.start - 0.4 && playerTimer <= el.end
    )
    currentlyTimer.value = formatTimer(playerTimer)
    let percent = Math.round((playerTimer * 100) / current.value.seconds)
    seekSlider.value = Math.min(percent, 100)
  })
  player.value.addEventListener('ended', () => {
    setLoopsCount(++countLoops.value)
    if (countLoops.value >= loops.value) {
      next()
    }
    isPlaying.value = false
    convertLyric.value.map((el) => {
      el.over = false
    })
    if (setPlayFromToFlg.value) {
      play(index.value)
    } else {
      next()
    }
  })
}

function seekTo() {
  console.log(current.value.seconds, seekSlider);
  console.log(current.value.seconds * (seekSlider.value / 100));
  player.value.currentTime = current.value.seconds * (seekSlider.value / 100)
}

function setVolume() {
  player.value.volume = volumeSlider.value / 100
}

function activeNavMobile(type = null) {
  switch (type) {
    case 'playlist':
      activeLyrics.value = false
      activePlaylist.value = !activePlaylist.value
      break
    case 'lyrics':
      activeLyrics.value = !activeLyrics.value
      activePlaylist.value = false
      break
    default:
      activeLyrics.value = false
      activePlaylist.value = false
  }
}

function scrollToActiveInPlaylist(behavior = 'smooth') {
  setTimeout(() => {
    let list = songPlaylist.value
    let active = list.querySelector('.active')
    if (!active) {
      return
    }
    active.scrollIntoView({behavior: behavior, block: 'center'})
  })
}

function scrollToActiveInLyrics() {
  setTimeout(() => {
    let list = lyricRef.value
    let active = list.querySelector('.active')
    if (!active) {
      return
    }
    let listRect = list.getBoundingClientRect()
    let activeRect = active.getBoundingClientRect()
    if (activeRect.top < listRect.top || activeRect.bottom > listRect.bottom - 200) {
      active.scrollIntoView({behavior: 'smooth', block: 'center'})
    }
  })
}

function setDefaultSettingFromLocalStorage() {
  let attributes = ['volumeSlider', 'loops', 'countLoops', 'playFrom', 'playTo']
  attributes.forEach((el) => {
    if (localStorage[el]) {
      [el].value = Number(localStorage[el])
    }
  })

  if (localStorage.index) {
    index.value =
        Number(localStorage.index) > songs.value.length - 1 ? 0 : Number(localStorage.index)
  }

  if (localStorage.playFrom) {
    playFrom.value = localStorage.playFrom === 'null' ? null : Number(localStorage.playFrom)
  }

  if (localStorage.playTo) {
    playTo.value = localStorage.playTo === 'null' ? null : Number(localStorage.playTo)
  }
}

function handleScrollPlaylistLyric(evt, el) {
  if (el.scrollTop > 0) {
    el.previousSibling.classList.add("scrolled");
  } else {
    el.previousSibling.classList.remove("scrolled");
  }
}

function calcCurrentIndex(newIndex) {
  if (!setPlayFromToFlg.value || (!playFrom.value && !playTo.value)) {
    return newIndex
  }

  if (newIndex === songs.value.length - 1) {
    return playTo.value - 1
  }

  if (newIndex === 0) {
    return playFrom.value - 1
  }

  let from = Number(playFrom.value ? playFrom : 0)
  let to = Number(playTo.value ? playTo : songs.value.length - 1)
  let range = to - from + 1
  let normalizedIndex = (newIndex - from + 1) % range
  newIndex = from + normalizedIndex - 1

  if (playFrom.value <= newIndex && newIndex <= playTo.value) {
    return newIndex
  }
  return playFrom.value - 1
}

onMounted(() => {
  songs.value = threatSongs(songMocks)
  setDefaultSettingFromLocalStorage()
  setCurrentSong()
  scrollToActiveInPlaylist('auto')
  registerListener()
})

let convertLyric = computed(() => {
  if (typeof current.value[selectedLyricType.value.id] === 'undefined') {
    return []
  }

  let lyricConverted = []
  let split = current.value[selectedLyricType.value.id].split(/\n\s*\n/)
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
    lyricConverted.push({id, timeString, text, start, end, over: false})
  }
  return lyricConverted
})

let songIndexOptions = computed(() => {
  return [...Array(songs.value.length).keys()].map((el) => el + 1)
})

watch(volumeSlider, async (value) => {
  localStorage.volumeSlider = value
})
watch(loops, async (value, old) => {
  value = isNaN(value) ? old : value
  loops.value = value
  localStorage.loops = value
})
watch(countLoops, async (value) => {
  localStorage.countLoops = value
})
watch(index, async (value) => {
  localStorage.index = value
})
watch(playFrom, async (value) => {
  localStorage.playFrom = value
})
watch(playTo, async (value) => {
  localStorage.playTo = value
})
watch(currentLyric, async (value) => {
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
</script>

<template>
  <!--    <div class="nav-mobile sp-only">-->
  <!--      <div @click="activeNavMobile('playlist')">-->
  <!--        <font-awesome-icon :icon="['fas', 'list']"/>-->
  <!--      </div>-->
  <!--      <div @click="activeNavMobile('lyrics')">-->
  <!--        <font-awesome-icon :icon="['fas', 'music']"/>-->
  <!--      </div>-->
  <!--    </div>-->
  <section class="player">
    <div class="cover-wrapper">
      <img v-bind:class="coverObject" :src="current.cover"/>
      <h2 class="song-title">
        {{ current.title }}
      </h2>
    </div>
    <div class="time-slider">
      <vue-slider
          v-model="seekSlider"
          :tooltip="'active'"
          @change="seekTo"
          :tooltip-formatter="seekSliderFormat"
      ></vue-slider>

      <div class="timer">
        <p class="start">{{ currentlyTimer }}</p>
        <p class="end">
          {{ current.totalTimer }}
        </p>
      </div>
    </div>

    <div class="volume_container">
        <span class="volume-down">
          <font-awesome-icon icon="volume-down"/>
        </span>

      <vue-slider
          v-model="volumeSlider"
          :tooltip="'active'"
          @change="setVolume"
          :style="{ width: '100%' }"
      ></vue-slider>
      <span class="volume-up">
          <font-awesome-icon icon="volume-up"/>
        </span>
    </div>
    <div class="controls">
      <button class="prev" @click="prev" v-if="songs.length > 1">
        <font-awesome-icon icon="step-backward"/>
      </button>
      <button class="play" v-if="!isPlaying" @click="play(index)">
        <font-awesome-icon icon="play"/>
      </button>
      <button class="pause" v-else @click="pause">
        <font-awesome-icon icon="pause"/>
      </button>
      <button class="next" @click="next" v-if="songs.length > 1">
        <font-awesome-icon icon="step-forward"/>
      </button>
    </div>
    <div class="footer">
      <div class="loops">
        <p>
          Played
          <span class="text-primary">{{ countLoops }}</span>
          times
        </p>
        <p>
          <label for="loops_input">Loop for</label>
          <input id="loops_input" class="loops-input" v-model="loops" type="text" name="loops-input"/>
          <span>times</span>
        </p>
      </div>
      <div>
        <button class="btn-reset" @click="setLoopsCount(0)">Reset</button>
      </div>
    </div>
    <div class="footer">
      <div class="play-form-to">
        <label>Play from </label>
        <multi-select
            class="select"
            v-model="playFrom"
            :options="songIndexOptions"
            :searchable="false"
            :show-labels="false"
            :disabled="setPlayFromToFlg"
            placeholder=""
        ></multi-select>
        <label>to </label>
        <multi-select
            class="select"
            v-model="playTo"
            :options="songIndexOptions"
            :searchable="false"
            :show-labels="false"
            :disabled="setPlayFromToFlg"
            placeholder=""
        ></multi-select>
      </div>
      <div>
        <button class="btn-reset" @click="setPlayFromToFlg = !setPlayFromToFlg">
          {{ setPlayFromToFlg ? 'Cancel' : 'Set' }}
        </button>
      </div>
    </div>
  </section>
  <div style="display: grid; gap: 10px">
    <section class="lyrics" :class="{ active: activeLyrics }">
      <div class="actions sp-only">
        <button class="close" @click="activeNavMobile()">
          <font-awesome-icon icon="times"/>
        </button>
      </div>
      <multi-select
          class="select-lyric-type"
          v-model="selectedLyricType"
          :options="lyricTypesOptions"
          :allow-empty="false"
          :searchable="false"
          label="name"
          track-by="id"
          :show-labels="false"
      ></multi-select>
      <h3>Lyrics</h3>
      <div class="text scrollbar" ref="lyricRef" v-scroll-element="handleScrollPlaylistLyric">
        <p
            v-html="lyric.text"
            v-for="(lyric, index) in convertLyric"
            :key="index"
            :class="{
              active: lyric.id === currentLyric?.id,
              lyric2: selectedLyricType.id === 'lyric2',
              over: lyric.over
            }"
            @click="setCurrentlyTimer(lyric.start || 0)"
        ></p>
      </div>
    </section>
    <section class="playlist" :class="{ active: activePlaylist }" style="">
      <div class="actions sp-only">
        <button class="close" @click="activeNavMobile('playlist')">
          <font-awesome-icon icon="times"/>
        </button>
      </div>
      <ul
          class="song-playlist scrollbar"
          ref="songPlaylist"
          v-scroll-element="handleScrollPlaylistLyric"
      >
        <li
            v-for="(song, key) in songs"
            :key="song.id"
            class="song"
            @click="play(key, true)"
            :class="{ active: song.id === current.id }"
        >
          <div class="details">
            <p class="song-title">
              {{ song.title }}
            </p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped></style>
