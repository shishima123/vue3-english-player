<script setup>
import { computed } from 'vue'
import { useReplayStore } from '@/stores/replay'
import { usePlayerStore } from '@/stores/player'
import { createSelectObjectFromNumber } from '@/helpers/utils'

const replayStore = useReplayStore()
const playerStore = usePlayerStore()

let songIndexOptionsComputed = computed(() => {
  return createSelectObjectFromNumber(playerStore.songsState.length)
})
</script>

<template>
  <!-- begin:: Loop -->
  <fieldset class="flex justify-between items-center my-1 fieldset-border">
    <legend>Loops</legend>
    <div>
      <p class="text-base">
        Played
        <span class="text-red-600">{{ replayStore.loopsCountState }}</span>
        times
      </p>
      <p class="text-base">
        <label for="loops_input">Loop for</label>
        <input
          id="loops_input"
          class="p-0.5 mx-0.5 w-[30px] text-center text-base border-b border-solid border-gray-600 outline-0"
          v-model="replayStore.loopsState"
          type="text"
          name="loops-input"
        />
        <label for="loops_input">times</label>
      </p>
    </div>
    <div>
      <button class="btn" @click="replayStore.setLoopsCount(0)">Reset</button>
    </div>
  </fieldset>
  <!-- end:: Loop -->
  <!-- begin:: Replay -->
  <fieldset class="flex justify-between items-center my-1 fieldset-border">
    <legend>Replay</legend>
    <div class="w-full">
      <a-radio-group
        v-model:value="replayStore.replayPickedState"
        name="replay"
        class="grid grid-cols-3"
      >
        <a-radio
          v-for="(radio, index) in replayStore.replayMappingState"
          :key="index"
          :value="index"
          :disabled="replayStore.replayFlagState"
          class="mb-2"
          >{{ radio.text }}</a-radio
        >
      </a-radio-group>
      <div class="flex justify-between">
        <div class="flex items-center">
          <a-select
            v-model:value="replayStore.replayFromState"
            class="w-[65px]"
            :options="songIndexOptionsComputed"
            :disabled="replayStore.replayFlagState || replayStore.replayCustomFlagState"
          ></a-select>
          <label class="mx-3">to</label>
          <a-select
            v-model:value="replayStore.replayToState"
            class="w-[65px]"
            :options="songIndexOptionsComputed"
            :disabled="replayStore.replayFlagState || replayStore.replayCustomFlagState"
          ></a-select>
        </div>
        <div>
          <button
            class="btn"
            :class="{ active: replayStore.replayFlagState }"
            @click="replayStore.replayFlagState = !replayStore.replayFlagState"
          >
            {{ replayStore.replayFlagState ? 'Cancel' : 'Set' }}
          </button>
        </div>
      </div>
    </div>
  </fieldset>
  <!-- end:: Play from to -->
</template>
