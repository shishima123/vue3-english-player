<script setup>
import { useNavMobileStore } from '@/stores/navMobile'
import { QueueListIcon, MusicalNoteIcon } from '@heroicons/vue/24/outline'

// store
const navMobileStore = useNavMobileStore()
</script>

<template>
  <section
    class="flex items-center fixed bottom-0 left-0 text-2xl text-gray-600 w-full shadow-[0px_3px_8px_rgba(0,0,0,0.24)] bg-white md:hidden z-10"
  >
    <div
      class="px-5 py-2 w-1/2 text-center border-b-4 border-b-white border-solid transition-all duration-300"
      :class="{ 'text-blue-500 !border-b-blue-500': navMobileStore.showPlaylistState }"
      @click="navMobileStore.activeNavMobile('playlist')"
    >
      <span class="flex justify-center">
        <QueueListIcon class="h-7 w-7" />
      </span>
    </div>
    <div
      class="px-5 py-2 w-1/2 text-center border-b-4 border-b-white border-solid transition-all duration-300"
      :class="{ 'text-blue-500 !border-b-blue-500': navMobileStore.showLyricsState }"
      @click="navMobileStore.activeNavMobile('lyrics')"
    >
      <span class="flex justify-center">
        <MusicalNoteIcon class="h-7 w-7" />
      </span>
    </div>
  </section>
</template>
