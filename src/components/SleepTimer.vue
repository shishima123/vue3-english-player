<script setup>
import { computed, watch } from 'vue'
import { useSleepTimerStore } from '@/stores/sleepTimer'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['pause'])
const sleepTimerStore = useSleepTimerStore()

const { isSleepTimerActive } = storeToRefs(sleepTimerStore)

let sleepRemainingTimeComputed = computed(() => {
  return sleepTimerStore.sleepRemainingTimeState
    ? sleepTimerStore.sleepRemainingTimeState + ' min'
    : 'disabled'
})

let sleepInterval = null
function setSleepState() {
  sleepTimerStore.sleepRemainingTimeState--
  if (sleepTimerStore.sleepRemainingTimeState === 0) {
    emit('pause')
    isSleepTimerActive.value = false
  }
}

watch(isSleepTimerActive, async (value, oldValue) => {
  if (value !== oldValue) {
    clearInterval(sleepInterval)
    if (value) {
      sleepTimerStore.sleepRemainingTimeState = sleepTimerStore.sleepTimeState
      sleepInterval = setInterval(setSleepState, 1000 * 60)
    }
  }
})
</script>

<template>
  <fieldset class="flex justify-between items-center my-1 fieldset-border">
    <legend>Sleep timer</legend>
    <div>
      <p class="text-base">
        Sleep after:
        <span :class="{ 'text-emerald-500': isSleepTimerActive }">{{
          sleepRemainingTimeComputed
        }}</span>
      </p>
      <div class="mt-2">
        <p class="flex">
          After
          <input
            class="p-0.5 mx-0.5 w-[30px] text-center text-base border-b border-solid border-gray-600 outline-0"
            v-model="sleepTimerStore.sleepTimeState"
            type="text"
            name="loops-input"
          />
          min
        </p>
      </div>
    </div>
    <div class="flex flex-col">
      <button
        class="btn"
        :class="{ active: isSleepTimerActive }"
        @click="isSleepTimerActive = !isSleepTimerActive"
      >
        {{ isSleepTimerActive ? 'Cancel' : 'Set' }}
      </button>
    </div>
  </fieldset>
</template>
