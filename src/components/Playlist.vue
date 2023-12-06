<script setup>
import { onMounted } from 'vue'
import { usePlaylistStore } from '@/stores/playlist'
import { useNavMobileStore } from '@/stores/navMobile'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/player'

// store
const playlistStore = usePlaylistStore()
const navMobileStore = useNavMobileStore()
const playerStore = usePlayerStore()

// ref
const { playlistRef } = storeToRefs(playlistStore)

onMounted(() => {
  playlistStore.scrollToActive()
})
</script>

<template>
  <section
    class="flex flex-col flex-nowrap w-full mx-auto bg-white overflow-auto lg:overflow-hidden scrollbar md:hover:overflow-auto relative h-0 row-start-2 row-end-3 col-start-2 col-end-3 md:h-[var(--playlist-height)] md:rounded md:shadow-md transition-[height] duration-[350ms] ease-linear"
    :class="{ 'playlist-lyrics-section-active': navMobileStore.showPlaylistState }"
    ref="wrapper"
  >
    <ul class="h-full" ref="playlistRef">
      <li
        v-for="(song, key) in playerStore.songsState"
        :key="song.id"
        class="grid grid-cols-1 py-[10px] px-4 cursor-pointer border-b border-solid border-slate-200 hover:bg-sky-100 transition"
        @click="playerStore.changeSong(key)"
        :class="{
          'bg-sky-200 !border-sky-200 active': song.id === playerStore.currentSongState.id
        }"
      >
        <p class="ml-1 text-base">
          {{ song.title }}
        </p>
      </li>
    </ul>
  </section>
</template>
