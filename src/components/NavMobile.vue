<script setup>
import { useNavMobileStore } from '@/stores/navMobile'
import { QueueListIcon, MusicalNoteIcon } from '@heroicons/vue/24/outline'

// store
const navMobileStore = useNavMobileStore()
</script>

<template>
  <section
    class="fixed bottom-0 left-0 z-10 flex w-full items-center bg-white text-2xl text-gray-600 shadow-[0px_3px_8px_rgba(0,0,0,0.24)] md:hidden"
  >
    <div
      class="w-1/2 border-b-4 border-solid border-b-white px-5 py-2 text-center transition-all duration-300"
      :class="{ '!border-b-blue-500 text-blue-500': navMobileStore.showPlaylistState }"
      @click="navMobileStore.activeNavMobile('playlist')"
    >
      <span class="flex justify-center">
        <QueueListIcon class="h-7 w-7" />
      </span>
    </div>
    <div
      class="w-1/2 border-b-4 border-solid border-b-white px-5 py-2 text-center transition-all duration-300"
      :class="{ '!border-b-blue-500 text-blue-500': navMobileStore.showLyricsState }"
      @click="navMobileStore.activeNavMobile('lyrics')"
    >
      <span class="flex justify-center">
        <MusicalNoteIcon class="h-7 w-7" />
      </span>
    </div>
  </section>
</template>
