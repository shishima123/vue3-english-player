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
    <h2 class="w-full text-xl font-bold text-center py-4 px-1 text-ellipsis whitespace-nowrap">
      {{ playerStore.currentSongState.title }}
    </h2>
    <div class="mb-5">
      <div class="flex justify-between px-1 w-full text-xs">
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

    <div class="flex items-center justify-center w-3/5 mx-auto">
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
    <div class="flex justify-center items-center py-5 px-4">
      <div class="flex justify-between border border-solid border-gray-300 w-3/5 rounded-[30px]">
        <button
          class="flex justify-center items-center border-0 rounded-full text-xl w-[25px] h-[25px] cursor-pointer text-gray-400 relative py-5 px-7 hover:scale-125 transition bg-transparent"
          @click="playerStore.prev"
        >
          <span><BackwardIcon class="h-6 w-6" /></span>
        </button>
        <button
          class="flex justify-center items-center border-0 rounded-full text-xl w-[25px] h-[25px] cursor-pointer text-gray-400 relative py-5 px-7 hover:scale-125 transition bg-transparent"
          @click="playerStore.next"
        >
          <span><ForwardIcon class="h-6 w-6" /></span>
        </button>
      </div>

      <div class="absolute">
        <button
          class="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-full w-[60px] h-[60px] shadow-2xl cursor-pointer text-2xl text-white hover:scale-110 transition"
          v-if="!playerStore.isPlayingState"
          @click="playerStore.play()"
        >
          <span class="flex justify-center"><PlayIcon class="h-7 w-7" /></span>
        </button>
        <button
          class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[60px] h-[60px] shadow-2xl cursor-pointer text-2xl text-white hover:scale-110 transition"
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
