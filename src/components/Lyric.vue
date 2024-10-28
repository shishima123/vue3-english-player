<script setup>
import { computed, ref } from 'vue'
import { useNavMobileStore } from '@/stores/navMobile'
import { useRepeatStore } from '@/stores/repeat'
import { useLyricStore } from '@/stores/lyric'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { storeToRefs } from 'pinia'

// icons
import { Cog6ToothIcon, ArrowsPointingOutIcon } from '@heroicons/vue/24/outline'

// store
const navMobileStore = useNavMobileStore()
const repeatStore = useRepeatStore()
const lyricStore = useLyricStore()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()

// ref
let { lyricRef } = storeToRefs(lyricStore)
let lyricTypesOptionsState = ref([
  { value: 'lyric1', label: 'Lyric 1' },
  { value: 'lyric2', label: 'Lyric 2' }
])
let settingDropdownState = ref(false)
let fullScreenState = ref(false)

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
    class="relative col-start-2 col-end-3 row-start-1 row-end-2 mx-auto flex h-0 w-full flex-col flex-nowrap overflow-hidden bg-white transition-[height] duration-[350ms] ease-linear md:h-[calc(100vh-var(--playlist-height)-var(--gap-app)-var(--padding-app)*2)] md:rounded md:shadow-md"
    :class="{
      'playlist-lyrics-section-active': navMobileStore.showLyricsState,
      fullscreen: fullScreenState
    }"
  >
    <div class="sticky top-0 z-10 bg-white transition">
      <div class="absolute left-[10px] top-[5px] flex items-center">
        <ArrowsPointingOutIcon
          class="mr-2 h-6 w-6 cursor-pointer transition hover:text-blue-500"
          @click="fullScreenState = !fullScreenState"
        />
      </div>
      <div class="absolute right-[10px] top-[5px] flex items-center">
        <a-dropdown v-model:open="settingDropdownState" trigger="click" placement="bottomRight">
          <a class="ant-dropdown-link" @click.prevent>
            <Cog6ToothIcon class="h-6 w-6 cursor-pointer transition hover:text-blue-500" />
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1">
                <a-select
                  v-model:value="lyricStore.selectedLyricTypeState"
                  class="!w-full"
                  :options="lyricTypesOptionsState"
                />
              </a-menu-item>

              <a-menu-item key="2">
                <a-select
                  v-model:value="playlistStore.selectPlaylistState"
                  class="!w-full"
                  :options="playlistStore.playlistOptions"
                />
              </a-menu-item>

              <a-menu-item key="3">
                <a-switch v-model:checked="lyricStore.isShowIPAState" />
                <span class="ml-3">Show IPA</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <h3 class="py-3 pl-7 text-lg font-bold md:pl-0 md:text-center">Lyrics</h3>
    </div>
    <div class="scrollbar overflow-y-auto overflow-x-hidden px-7 py-5 text-center" ref="lyricRef">
      <p
        v-for="(lyric, index) in lyricStore.convertLyricComputed"
        :key="index"
        class="lyrics cursor-pointer text-lg text-dimgray transition-all hover:text-blue-400 [&:not(:last-child)]:mb-3"
        :class="{
          'active !text-blue-500': lyric.id === lyricStore.currentLyricState?.id,
          'text-left': lyricStore.selectedLyricTypeState === 'lyric2',
          'text-slate-300': lyric.over
        }"
        @click="playerStore.setCurrentlyTimer(lyric.start || 0, lyric.end)"
      >
        <span class="text-2xs text-gray-400" v-if="showTimeStringLyricComputed">
          ({{ lyric.startString }})
        </span>
        <span class="mx-1 block first-letter:capitalize">{{ lyric.lyric }}</span>
        <span class="mx-1 block text-sm text-gray-400" v-if="lyricStore.isShowIPAState">
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
