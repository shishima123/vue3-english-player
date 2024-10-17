import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useReplayStore = defineStore('replay', () => {
  // ref
  let replayFlagState = ref(true)
  let replayFromState = useStorage('replayFromState', 1)
  let replayToState = useStorage('replayToState', 40)
  let replayCustomFlagState = ref(true)
  let replayMappingState = ref(getReplayMapping())
  let replayPickedState = useStorage('replayPickedState', '1')
  let loopsCountState = useStorage('loopsCountState', 0)
  let loopsState = useStorage('loopsState', 10)

  function setLoopsCount($count) {
    loopsCountState.value = $count
  }

  watch(replayPickedState, async (value) => {
    if (value in replayMappingState.value) {
      replayFromState.value = replayMappingState.value[value].from
      replayToState.value = replayMappingState.value[value].to
      replayCustomFlagState.value = replayMappingState.value[value].shouldDisableSelect
    }
  })

  watch(loopsState, async (value, old) => {
    value = isNaN(value) ? old : value
    loopsState.value = value
  })

  return {
    replayFlagState,
    replayFromState,
    replayToState,
    replayCustomFlagState,
    replayMappingState,
    replayPickedState,
    loopsCountState,
    loopsState,
    setLoopsCount
  }
})

function getReplayMapping() {
  return {
    1: {
      text: '1-10',
      from: 1,
      to: 10,
      shouldDisableSelect: true
    },
    2: {
      text: '11-20',
      from: 11,
      to: 20,
      shouldDisableSelect: true
    },
    3: {
      text: '21-30',
      from: 21,
      to: 30,
      shouldDisableSelect: true
    },
    4: {
      text: '31-40',
      from: 31,
      to: 40,
      shouldDisableSelect: true
    },
    5: {
      text: 'Other',
      from: 1,
      to: 40,
      shouldDisableSelect: false
    }
  }
}
