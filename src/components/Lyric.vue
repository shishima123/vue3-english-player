<script setup>
import { scrollToActiveElement } from '@/helpers/utils'
import { computed, ref, watch } from 'vue'
import { timeStringToSecond } from '@/helpers/timer'

const props = defineProps({
  activeLyricsState: Boolean,
  currentState: Object
})

defineEmits(['handleScrollLyric', 'setCurrentlyTimer'])

defineExpose({
  scrollToActiveInLyrics,
  scrollToTopInLyrics,
  changeCurrentLyricState,
  resetLyricOver
})

let selectedLyricTypeState = ref({ id: 'lyric1', name: 'Lyric 1' })
let lyricTypesOptionsState = ref([
  { id: 'lyric1', name: 'Lyric 1' },
  { id: 'lyric2', name: 'Lyric 2' }
])
let currentLyricState = ref({})
let lyricRef = ref(null)

let convertLyricComputed = computed(() => {
  if (typeof props.currentState[selectedLyricTypeState.value.id] === 'undefined') {
    return []
  }

  let lyricConverted = []
  let split = props.currentState[selectedLyricTypeState.value.id].split(/\n\s*\n/)
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

function handleScrollLyric(evt, el) {
  if (el.scrollTop > 0) {
    el.previousSibling.classList.add('scrolled')
  } else {
    el.previousSibling.classList.remove('scrolled')
  }
}

function scrollToActiveInLyrics() {
  scrollToActiveElement(lyricRef.value, '.active')
}

function scrollToTopInLyrics() {
  lyricRef.value.scrollTo({ top: 0 })
}

function resetLyricOver() {
  convertLyricComputed.value.map((el) => {
    el.over = false
  })
}

function changeCurrentLyricState(playerTimer) {
  currentLyricState.value = convertLyricComputed.value.find(
    (el) => playerTimer >= el.start - 0.4 && playerTimer <= el.end
  )
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
</script>

<template>
  <!-- begin:: Lyric Section -->
  <section
    class="flex flex-col flex-nowrap w-full mx-auto bg-white overflow-hidden relative row-start-1 row-end-2 col-start-2 col-end-3 h-0 md:rounded md:shadow-md md:h-[calc(100vh-var(--playlist-height)-var(--gap-app)-var(--padding-app)*2)] transition-[height] duration-[350ms] ease-linear"
    :class="{ 'playlist-lyrics-section-active': activeLyricsState }"
  >
    <div class="sticky top-0 bg-white z-10 transition">
      <multi-select
        class="!w-[110px] !absolute top-[5px] left-[10px]"
        v-model="selectedLyricTypeState"
        :options="lyricTypesOptionsState"
        :allow-empty="false"
        :searchable="false"
        label="name"
        track-by="id"
        :show-labels="false"
      ></multi-select>
      <h3 class="text-lg text-center py-3 font-bold">Lyrics</h3>
    </div>
    <div
      class="py-5 px-7 text-center scrollbar overflow-auto"
      ref="lyricRef"
      v-scroll-element="handleScrollLyric"
    >
      <p
        v-html="lyric.text"
        v-for="(lyric, index) in convertLyricComputed"
        :key="index"
        class="text-dimgray transition-all cursor-pointer text-lg hover:text-blue-400 first-letter:capitalize lyrics [&:not(:last-child)]:mb-3"
        :class="{
          '!text-blue-500 scale-110 active': lyric.id === currentLyricState?.id,
          'text-left': selectedLyricTypeState.id === 'lyric2',
          'text-slate-300': lyric.over
        }"
        @click="$emit('setCurrentlyTimer', lyric.start || 0)"
      ></p>
    </div>
  </section>
  <!-- end:: Lyric Section -->
</template>
