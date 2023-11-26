<script setup>
import { onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { formatTimer, timeStringToSecond } from '@/helpers/timer'

let repeatType = ref('time')
let isRepeatActiveState = ref(false)
let seekSliderState = ref([0, 100])
let startTimePickerState = ref(dayjs('00:00', 'mm:ss'))
let endTimePickerState = ref()
let startTimeState = ref()
let endTimeState = ref()
let delayState = ref(5)
let seekSliderFormatState = ref((v) => `${formatTimer(props.currentSongState.seconds * (v / 100))}`)
let showTimeStringLyricState = ref(false)

const props = defineProps({
  currentSongState: Object
})

defineExpose({
  setTimeWhenClickLyric,
  isRepeatActiveState,
  startTimeState,
  endTimeState,
  showTimeStringLyricState
})

const disabledTime = () => {
  return {
    disabledMinutes: () => range(2, 60)
  }
}
onMounted(() => {
  setTimeout(() => {
    endTimePickerState.value = dayjs(formatTimer(props.currentSongState.seconds), 'mm:ss')
  })
})

const range = (start, end) => {
  const result = []

  for (let i = start; i < end; i++) {
    result.push(i)
  }

  return result
}
watch(seekSliderState, (value) => {
  startTimePickerState.value = dayjs(
    formatTimer(props.currentSongState.seconds * (value[0] / 100)),
    'mm:ss'
  )
  endTimePickerState.value = dayjs(
    formatTimer(props.currentSongState.seconds * (value[1] / 100)),
    'mm:ss'
  )

  startTimeState.value = props.currentSongState.seconds * (value[0] / 100)
  endTimeState.value = props.currentSongState.seconds * (value[1] / 100)
})

function onChangeStartTimePicker(time) {
  let startSeek = timeStringToSecond(time.format('HH:mm:ss'))
  let endSeek = seekSliderState.value[1]
  seekSliderState.value = [startSeek, endSeek]
}
function onChangeEndTimePicker(time) {
  let startSeek = seekSliderState.value[0]
  let endSeek = timeStringToSecond(time.format('HH:mm:ss'))
  seekSliderState.value = [startSeek, endSeek]
}

function setTimeWhenClickLyric(startTime, endTime) {
  if (isRepeatActiveState.value && repeatType.value === 'lyric') {
    let startSeek = Math.round((startTime * 100) / props.currentSongState.seconds)
    let endSeek = Math.round((endTime * 100) / props.currentSongState.seconds)
    seekSliderState.value = [startSeek, endSeek]
    startTimeState.value = startTime
    endTimeState.value = endTime
  }
}
</script>

<template>
  <fieldset class="my-1 fieldset-border">
    <legend>Repeat</legend>
    <div class="flex justify-between items-center">
      <div class="">
        <div class="flex items-center mb-2">
          <input
            id="repeat-time"
            type="radio"
            name="playFromTo"
            class="hidden"
            value="time"
            v-model="repeatType"
          />
          <label for="repeat-time" class="flex items-center cursor-pointer">
            <span class="w-4 h-4 inline-block mr-1 rounded-full border border-grey"></span>
            Time
          </label>
        </div>
        <div class="flex items-center mb-3">
          <input
            id="repeat-lyric"
            type="radio"
            name="playFromTo"
            class="hidden"
            value="lyric"
            v-model="repeatType"
          />
          <label for="repeat-lyric" class="flex items-center cursor-pointer">
            <span class="w-4 h-4 inline-block mr-1 rounded-full border border-grey"></span>
            Lyric
          </label>
        </div>
      </div>
      <div class="flex flex-col">
        <button
          class="btn"
          :class="{ active: isRepeatActiveState }"
          @click="isRepeatActiveState = !isRepeatActiveState"
        >
          {{ isRepeatActiveState ? 'Cancel' : 'Set' }}
        </button>
      </div>
    </div>

    <div class="mb-4">
      <vue-slider
        v-model="seekSliderState"
        :tooltip="'active'"
        :tooltip-formatter="seekSliderFormatState"
        :lazy="true"
        :disabled="repeatType === 'lyric'"
      ></vue-slider>
    </div>

    <div class="flex justify-between mb-3">
      <div>
        <span class="mr-2">Start</span>
        <a-time-picker
          class="w-[90px]"
          v-model:value="startTimePickerState"
          format="mm:ss"
          :show-now="false"
          :disabledTime="disabledTime"
          :allowClear="false"
          :disabled="repeatType === 'lyric'"
          @change="onChangeStartTimePicker"
        />
      </div>
      <div>
        <span class="mr-2">End</span>
        <a-time-picker
          class="w-[90px]"
          v-model:value="endTimePickerState"
          format="mm:ss"
          :show-now="false"
          :disabledTime="disabledTime"
          :allowClear="false"
          :disabled="repeatType === 'lyric'"
          @change="onChangeEndTimePicker"
        />
      </div>
    </div>
    <div>
      <div class="mb-3">
        <p class="text-base">
          <label for="delay_input">Delay</label>
          <input
            id="delay_input"
            class="p-0.5 mx-0.5 w-[30px] text-center text-base border-b border-solid border-gray-600 outline-0"
            v-model="delayState"
            type="text"
            name="loops-input"
          />
          <span for="delay_input">seconds</span>
        </p>
      </div>
      <div>
        <p class="text-base">
          <label class="switch mr-2">
            <input type="checkbox" v-model="showTimeStringLyricState" />
            <span class="slider round"></span>
          </label>
          Show Time in Lyric
        </p>
      </div>
    </div>
  </fieldset>
</template>
