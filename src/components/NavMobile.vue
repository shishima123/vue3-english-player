<script setup>
defineProps({
  showPlaylistState: {
    type: Boolean,
    required: true
  },
  showLyricsState: {
    type: Boolean,
    required: true
  }
})
defineEmits(['activeNavMobile'])
</script>

<template>
  <section
    class="flex items-center fixed bottom-0 left-0 text-2xl text-gray-600 w-full shadow-[0px_3px_8px_rgba(0,0,0,0.24)] bg-white md:hidden z-10"
  >
    <div
      class="px-5 py-2 w-1/2 text-center border-b-4 border-b-white border-solid transition-all duration-300"
      :class="{ 'text-blue-500 !border-b-blue-500': showPlaylistState }"
      @click="$emit('activeNavMobile', 'playlist')"
    >
      <font-awesome-icon :icon="['fas', 'list']" />
    </div>
    <div
      class="px-5 py-2 w-1/2 text-center border-b-4 border-b-white border-solid transition-all duration-300"
      :class="{ 'text-blue-500 !border-b-blue-500': showLyricsState }"
      @click="$emit('activeNavMobile', 'lyrics')"
    >
      <font-awesome-icon :icon="['fas', 'music']" />
    </div>
  </section>
</template>
