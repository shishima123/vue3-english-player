<script setup>
import { onMounted, ref } from 'vue'
import { scrollToActiveElement } from '@/helpers/utils'

const playlistRef = ref(null)

defineProps({
  showPlaylistState: Boolean,
  songsState: Array,
  currentSongState: Object
})
onMounted(() => {
  scrollToActive()
})
function scrollToActive() {
  scrollToActiveElement(playlistRef.value, '.active', 'instant', 'start')
}
defineExpose({ scrollToActive })
defineEmits(['play'])
</script>

<template>
  <section
    class="flex flex-col flex-nowrap w-full mx-auto bg-white overflow-auto relative h-0 row-start-2 row-end-3 col-start-2 col-end-3 md:h-[var(--playlist-height)] md:rounded md:shadow-md transition-[height] duration-[350ms] ease-linear"
    :class="{ 'playlist-lyrics-section-active': showPlaylistState }"
    ref="wrapper"
  >
    <ul class="h-full" ref="playlistRef">
      <perfect-scrollbar class="h-full">
        <li
          v-for="(song, key) in songsState"
          :key="song.id"
          class="grid grid-cols-1 py-[10px] px-4 cursor-pointer border-b border-solid border-slate-200 hover:bg-sky-100 transition"
          @click="$emit('play', key, true)"
          :class="{ 'bg-sky-200 !border-sky-200 active': song.id === currentSongState.id }"
        >
          <p class="ml-1 text-base">
            {{ song.title }}
          </p>
        </li>
      </perfect-scrollbar>
    </ul>
  </section>
</template>
