<script setup>
import { computed, ref } from 'vue'
import { useNavMobileStore } from '@/stores/navMobile'
import { useRepeatStore } from '@/stores/repeat'
import { useLyricStore } from '@/stores/lyric'
import { usePlayerStore } from '@/stores/player'
import { storeToRefs } from 'pinia'

// icons
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'

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
let settingDropdownState = ref(false)

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
      <div class="flex items-center absolute top-[5px] right-[10px]">
        <a-select
          v-model:value="lyricStore.selectedLyricTypeState"
          class="!w-[110px] mr-3"
          :options="lyricTypesOptionsState"
        />
        <a-dropdown v-model:open="settingDropdownState" trigger="hover" placement="bottom" arrow>
          <a class="ant-dropdown-link" @click.prevent>
            <Cog6ToothIcon class="h-6 w-6 hover:text-blue-500 transition cursor-pointer" />
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1">
                <a-switch v-model:checked="lyricStore.isShowIPAState" />
                <span class="ml-3">Show IPA</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <h3 class="text-lg md:text-center py-3 font-bold pl-7 md:pl-0">Lyrics</h3>
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
        <span class="text-2xs text-gray-400" v-if="showTimeStringLyricComputed">
          ({{ lyric.startString }})
        </span>
        <span class="first-letter:capitalize block mx-1">{{ lyric.lyric }}</span>
        <span class="block mx-1 text-sm text-gray-400" v-if="lyricStore.isShowIPAState">
          {{ lyric.ipa }}
        </span>
        <span class="text-2xs text-gray-400" v-if="showTimeStringLyricComputed">
          ({{ lyric.endString }})
        </span>
      </p>
    </div>
  </section>
  <!-- end:: Lyric Section -->
</template>
