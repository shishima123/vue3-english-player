<script setup>
import { computed, ref, watch } from 'vue'
const emit = defineEmits(['pause'])

let isSleepTimerActive = ref(false)
let sleepTimeState = ref(30)
let sleepRemainingTimeState = ref(0)

defineExpose({ setDefaultSettingFromLocalStorage })

let sleepRemainingTimeComputed = computed(() => {
  return sleepRemainingTimeState.value ? sleepRemainingTimeState.value + ' min' : 'disabled'
})

let sleepInterval = null
function setSleepState() {
  sleepRemainingTimeState.value--
  if (sleepRemainingTimeState.value === 0) {
    emit('pause')
    isSleepTimerActive.value = false
  }
}

function setDefaultSettingFromLocalStorage() {
  if (localStorage['sleepTimeState']) {
    sleepTimeState.value = Number(localStorage['sleepTimeState'])
  }
}

watch(isSleepTimerActive, async (value, oldValue) => {
  if (value !== oldValue) {
    clearInterval(sleepInterval)
    if (value) {
      sleepRemainingTimeState.value = sleepTimeState.value
      sleepInterval = setInterval(setSleepState, 1000 * 60)
    }
  }
})

watch(sleepTimeState, async (value) => {
  localStorage.sleepTimeState = value
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
            v-model="sleepTimeState"
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
        :class="{ 'bg-zinc-100': isSleepTimerActive }"
        @click="isSleepTimerActive = !isSleepTimerActive"
      >
        {{ isSleepTimerActive ? 'Cancel' : 'Set' }}
      </button>
    </div>
  </fieldset>
</template>
