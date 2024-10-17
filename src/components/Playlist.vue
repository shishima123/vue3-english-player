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
    class="scrollbar relative col-start-2 col-end-3 row-start-2 row-end-3 mx-auto flex h-0 w-full flex-col flex-nowrap overflow-auto bg-white transition-[height] duration-[350ms] ease-linear md:h-[var(--playlist-height)] md:rounded md:shadow-md md:hover:overflow-auto lg:overflow-hidden"
    :class="{ 'playlist-lyrics-section-active': navMobileStore.showPlaylistState }"
    ref="wrapper"
  >
    <ul class="h-full" ref="playlistRef">
      <li
        v-for="(song, key) in playerStore.songsState"
        :key="song.id"
        class="grid cursor-pointer grid-cols-1 border-b border-solid border-slate-200 px-4 py-[10px] transition hover:bg-sky-100"
        @click="playerStore.changeSong(key)"
        :class="{
          'active !border-sky-200 bg-sky-200': song.id === playerStore.currentSongState.id
        }"
      >
        <p class="ml-1 text-base">
          {{ song.title }}
        </p>
      </li>
    </ul>
  </section>
</template>
