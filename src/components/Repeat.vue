<script setup>
import { onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { formatTimer, timeStringToSecond } from '@/helpers/timer'
import { useRepeatStore } from '@/stores/repeat'
import { storeToRefs } from 'pinia'
import { range } from '@/helpers/utils'
import { usePlayerStore } from '@/stores/player'
import { setTimeout } from 'worker-timers'

// icons
import { XCircleIcon } from '@heroicons/vue/24/outline'

// store
const repeatStore = useRepeatStore()
const playerStore = usePlayerStore()

// ref
const { seekSliderState } = storeToRefs(repeatStore)
let startTimePickerState = ref(dayjs('00:00', 'mm:ss'))
let endTimePickerState = ref()

let seekSliderFormatState = ref((v) => `${formatTimer(v)}`)

const disabledTime = () => {
  return {
    disabledMinutes: () => range(Math.floor(playerStore.currentSongState.seconds / 60) + 1, 60)
  }
}

function onChangeStartTimePicker(time) {
  let startSeek = timeStringToSecond(time.format('HH:mm:ss'))
  if (startSeek > playerStore.currentSongState.seconds) {
    startTimePickerState.value = dayjs(formatTimer(playerStore.currentSongState.seconds), 'mm:ss')
    startSeek = Math.min(startSeek, playerStore.currentSongState.seconds)
  }
  let endSeek = repeatStore.seekSliderState[1]
  repeatStore.seekSliderState = [startSeek, endSeek]
}

function onChangeEndTimePicker(time) {
  let startSeek = repeatStore.seekSliderState[0]
  let endSeek = timeStringToSecond(time.format('HH:mm:ss'))
  if (endSeek > playerStore.currentSongState.seconds) {
    endTimePickerState.value = dayjs(formatTimer(playerStore.currentSongState.seconds), 'mm:ss')
    endSeek = Math.min(endSeek, playerStore.currentSongState.seconds)
  }
  repeatStore.seekSliderState = [startSeek, endSeek]
}

function onChangeRepeatActive() {
  repeatStore.isRepeatActiveState = !repeatStore.isRepeatActiveState
  repeatStore.clearTimeOutRepeat()
}

onMounted(() => {
  setTimeout(() => {
    endTimePickerState.value = dayjs(formatTimer(playerStore.currentSongState.seconds), 'mm:ss')
  })
})

watch(seekSliderState, (value) => {
  startTimePickerState.value = dayjs(formatTimer(value[0]), 'mm:ss')
  endTimePickerState.value = dayjs(formatTimer(value[1]), 'mm:ss')

  if (repeatStore.repeatTypeState === 'time') {
    repeatStore.startTimeState = value[0]
    repeatStore.endTimeState = value[1]
  }
})
</script>

<template>
  <fieldset class="fieldset-border my-1">
    <legend>Repeat</legend>
    <div class="flex items-center justify-between">
      <div class="mb-3">
        <a-radio-group v-model:value="repeatStore.repeatTypeState" name="repeatType">
          <a-radio value="time" class="flex py-1">Time</a-radio>
          <a-radio value="lyric" class="flex py-1">Lyric</a-radio>
        </a-radio-group>
      </div>
      <div class="flex">
        <button
          class="btn btn-danger mr-4"
          v-if="repeatStore.isRepeatActiveState"
          @click="playerStore.repeat()"
        >
          Replay
        </button>

        <button
          class="btn"
          :class="{ active: repeatStore.isRepeatActiveState }"
          @click="onChangeRepeatActive"
        >
          {{ repeatStore.isRepeatActiveState ? 'Cancel' : 'Set' }}
        </button>
      </div>
    </div>

    <div class="mb-4">
      <vue-slider
        v-model="repeatStore.seekSliderState"
        :min="0"
        :max="playerStore.currentSongState.seconds"
        :interval="1"
        contained
        lazy
        :tooltip="'active'"
        :tooltip-formatter="seekSliderFormatState"
        :disabled="repeatStore.repeatTypeState === 'lyric'"
      ></vue-slider>
    </div>

    <div class="mb-3 flex justify-between">
      <div>
        <span class="mr-2">Start</span>
        <a-time-picker
          :inputReadOnly="true"
          class="w-[90px]"
          v-model:value="startTimePickerState"
          format="mm:ss"
          :show-now="false"
          :disabledTime="disabledTime"
          :allowClear="false"
          :disabled="repeatStore.repeatTypeState === 'lyric'"
          @change="onChangeStartTimePicker"
        />
      </div>
      <div>
        <span class="mr-2">End</span>
        <a-time-picker
          inputReadOnly
          class="w-[90px]"
          v-model:value="endTimePickerState"
          format="mm:ss"
          :show-now="false"
          :disabledTime="disabledTime"
          :allowClear="false"
          :disabled="repeatStore.repeatTypeState === 'lyric'"
          @change="onChangeEndTimePicker"
        />
      </div>
    </div>
    <div>
      <div class="mb-2 flex h-[32px] items-center text-base">
        <a-switch v-model:checked="repeatStore.isSleepActiveState" />
        <label class="ml-2" for="sleep_input">Sleep</label>
        <input
          id="sleep_input"
          class="mx-0.5 w-[30px] border-b border-solid border-gray-600 p-0.5 text-center text-base outline-0"
          v-model="repeatStore.sleepTimeState"
          type="text"
          name="sleep-input"
        />
        <label for="sleep_input">seconds</label>
      </div>
      <div class="mb-2 flex h-[32px] items-center text-base">
        <a-switch v-model:checked="repeatStore.showTimeStringLyricState" />
        <span class="ml-2">Show Time in Lyric</span>
      </div>
      <div class="mb-2 flex h-[32px] items-center">
        <a-switch v-model:checked="repeatStore.syncStartActiveState" />
        <label class="mx-2 w-[80px]" for="sleep_input">Sync Start</label>
        <a-input-number
          class="input-sync w-[100px] flex-grow"
          v-model:value="repeatStore.syncStartValueState"
          :keyboard="false"
          :controls="false"
        >
          <template #addonBefore>
            <button
              class="m-[-4px_-11px] h-[32px] w-[32px] bg-transparent"
              @click="repeatStore.changeSyncValue('syncStartValueState', '-')"
            >
              -
            </button>
          </template>
          <template #addonAfter>
            <button
              class="m-[-4px_-11px] h-[32px] w-[32px] bg-transparent"
              @click="repeatStore.changeSyncValue('syncStartValueState', '+')"
            >
              +
            </button>
          </template>
        </a-input-number>
        <XCircleIcon
          class="ml-2 h-5 w-5 cursor-pointer transition hover:text-blue-500"
          @click="repeatStore.resetSyncValueState('syncStartValueState')"
        />
      </div>
      <div class="flex h-[32px] items-center">
        <a-switch v-model:checked="repeatStore.syncEndActiveState" />
        <span class="mx-2 w-[80px]">Sync End</span>
        <a-input-number
          class="input-sync w-[100px] flex-grow"
          v-model:value="repeatStore.syncEndValueState"
          :keyboard="false"
          :controls="false"
        >
          <template #addonBefore>
            <button
              class="m-[-4px_-11px] h-[32px] w-[32px] bg-transparent"
              @click="repeatStore.changeSyncValue('syncEndValueState', '-')"
            >
              -
            </button>
          </template>
          <template #addonAfter>
            <button
              class="m-[-4px_-11px] h-[32px] w-[32px] bg-transparent"
              @click="repeatStore.changeSyncValue('syncEndValueState', '+')"
            >
              +
            </button>
          </template>
        </a-input-number>
        <XCircleIcon
          class="ml-2 h-5 w-5 cursor-pointer transition hover:text-blue-500"
          @click="repeatStore.resetSyncValueState('syncEndValueState')"
        />
      </div>
    </div>
  </fieldset>
</template>
