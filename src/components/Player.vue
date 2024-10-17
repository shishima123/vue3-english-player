<script setup>
import { PauseIcon, PlayIcon } from '@heroicons/vue/24/solid'
import { formatTimer } from '@/helpers/timer'
import { ref } from 'vue'
import { usePlayerStore } from '@/stores/player'

import {
  BackwardIcon,
  ForwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/vue/24/outline'

// store
const playerStore = usePlayerStore()

// ref
let seekSliderFormatState = ref((v) => `${formatTimer(v)}`)

function seekTo() {
  playerStore.playerState.currentTime = playerStore.seekSliderState
}

function setVolume() {
  playerStore.playerState.volume = playerStore.volumeSliderState / 100
}
</script>

<template>
  <!-- begin:: Player -->
  <div>
    <h2 class="w-full text-ellipsis whitespace-nowrap px-1 py-4 text-center text-xl font-bold">
      {{ playerStore.currentSongState.title }}
    </h2>
    <div class="mb-5">
      <div class="flex w-full justify-between px-1 text-xs">
        <p>{{ playerStore.currentlyTimerState }}</p>
        <p>{{ playerStore.currentSongState.totalTimer }}</p>
      </div>
      <vue-slider
        v-model="playerStore.seekSliderState"
        :min="0"
        :max="playerStore.currentSongState.seconds"
        :interval="1"
        lazy
        contained
        :tooltip="'active'"
        :tooltip-formatter="seekSliderFormatState"
        @drag-end="seekTo"
      ></vue-slider>
    </div>

    <div class="mx-auto flex w-3/5 items-center justify-center">
      <span class="mr-2 inline-block">
        <SpeakerXMarkIcon class="h-5 w-5" />
      </span>

      <vue-slider
        v-model="playerStore.volumeSliderState"
        :tooltip="'active'"
        @change="setVolume"
        :style="{ width: '100%' }"
      ></vue-slider>
      <span class="ml-4 inline-block">
        <SpeakerWaveIcon class="h-5 w-5" />
      </span>
    </div>
    <div class="flex items-center justify-center px-4 py-5">
      <div class="flex w-3/5 justify-between rounded-[30px] border border-solid border-gray-300">
        <button
          class="relative flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent px-7 py-5 text-xl text-gray-400 transition hover:scale-125"
          @click="playerStore.prev"
        >
          <span><BackwardIcon class="h-6 w-6" /></span>
        </button>
        <button
          class="relative flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent px-7 py-5 text-xl text-gray-400 transition hover:scale-125"
          @click="playerStore.next"
        >
          <span><ForwardIcon class="h-6 w-6" /></span>
        </button>
      </div>

      <div class="absolute">
        <button
          class="h-[60px] w-[60px] cursor-pointer rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-2xl text-white shadow-2xl transition hover:scale-110 hover:from-cyan-400 hover:to-blue-400"
          v-if="!playerStore.isPlayingState"
          @click="playerStore.play()"
        >
          <span class="flex justify-center"><PlayIcon class="h-7 w-7" /></span>
        </button>
        <button
          class="h-[60px] w-[60px] cursor-pointer rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-2xl text-white shadow-2xl transition hover:scale-110"
          v-else
          @click="playerStore.pause"
        >
          <span class="flex justify-center"><PauseIcon class="h-7 w-7" /></span>
        </button>
      </div>
    </div>
  </div>
  <!-- end:: Player -->
</template>
