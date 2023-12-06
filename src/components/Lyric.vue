<script setup>
import { computed, ref } from 'vue'
import { useNavMobileStore } from '@/stores/navMobile'
import { useRepeatStore } from '@/stores/repeat'
import { useLyricStore } from '@/stores/lyric'
import { usePlayerStore } from '@/stores/player'
import { storeToRefs } from 'pinia'

// store
const navMobileStore = useNavMobileStore()
const repeatStore = useRepeatStore()
const lyricStore = useLyricStore()
const playerStore = usePlayerStore()

// ref
let { lyricRef } = storeToRefs(lyricStore)
let lyricTypesOptionsState = ref([
  { value: 'lyric1', label: 'Lyric 1' },
  { value: 'lyric2', label: 'Lyric 2' }
])

// computed
let showTimeStringLyricComputed = computed(() => {
  if (!repeatStore.showTimeStringLyricState || lyricStore.selectedLyricTypeState !== 'lyric1') {
    return false
  }

  return repeatStore.showTimeStringLyricState
})
</script>

<template>
  <!-- begin:: Lyric Section -->
  <section
    class="flex flex-col flex-nowrap w-full mx-auto bg-white overflow-hidden relative row-start-1 row-end-2 col-start-2 col-end-3 h-0 md:rounded md:shadow-md md:h-[calc(100vh-var(--playlist-height)-var(--gap-app)-var(--padding-app)*2)] transition-[height] duration-[350ms] ease-linear"
    :class="{ 'playlist-lyrics-section-active': navMobileStore.showLyricsState }"
  >
    <div class="sticky top-0 bg-white z-10 transition">
      <a-select
        v-model:value="lyricStore.selectedLyricTypeState"
        class="!w-[110px] !absolute top-[5px] left-[10px]"
        :options="lyricTypesOptionsState"
      />
      <h3 class="text-lg text-center py-3 font-bold">Lyrics</h3>
    </div>
    <div class="py-5 px-7 text-center scrollbar overflow-y-auto overflow-x-hidden" ref="lyricRef">
      <p
        v-for="(lyric, index) in lyricStore.convertLyricComputed"
        :key="index"
        class="text-dimgray transition-all cursor-pointer text-lg hover:text-blue-400 lyrics [&:not(:last-child)]:mb-3"
        :class="{
          '!text-blue-500 active': lyric.id === lyricStore.currentLyricState?.id,
          'text-left': lyricStore.selectedLyricTypeState === 'lyric2',
          'text-slate-300': lyric.over
        }"
        @click="playerStore.setCurrentlyTimer(lyric.start || 0, lyric.end)"
      >
        <span class="text-2xs text-gray-400" v-if="showTimeStringLyricComputed"
          >({{ lyric.startString }})</span
        >
        <span class="first-letter:capitalize inline-block mx-1">{{ lyric.text }}</span>
        <span class="text-2xs text-gray-400" v-if="showTimeStringLyricComputed"
          >({{ lyric.endString }})</span
        >
      </p>
    </div>
  </section>
  <!-- end:: Lyric Section -->
</template>
