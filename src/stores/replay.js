import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useReplayStore = defineStore('replay', () => {
  let replayFlagState = ref(true)
  let replayFromState = ref(1)
  let replayToState = ref(10)
  let replayCustomFlagState = ref(true)
  let replayMappingState = ref(getReplayMapping())
  let replayPickedState = ref()
  let loopsCountState = ref(0)
  let loopsState = ref(10)

  function setLoopsCount($count) {
    loopsCountState.value = $count
  }

  function setDefaultSettingFromLocalStorage() {
    let attributes = ['loopsState', 'loopsCountState', 'replayFromState', 'replayToState']
    attributes.forEach((el) => {
      if (localStorage[el]) {
        eval(el).value = Number(localStorage[el])
      }
    })
    if (localStorage.replayPickedState) {
      replayPickedState.value =
        localStorage.replayPickedState === 'null' ? '1' : localStorage.replayPickedState
    }
  }

  watch(replayPickedState, async (value) => {
    localStorage.replayPickedState = value
    // onSyncUpload()
    if (value in replayMappingState.value) {
      replayFromState.value = replayMappingState.value[value].from
      replayToState.value = replayMappingState.value[value].to
      replayCustomFlagState.value = replayMappingState.value[value].shouldDisableSelect
    }
  })

  watch(replayFromState, async (value) => {
    localStorage.replayFromState = value
    // onSyncUpload()
  })

  watch(replayToState, async (value) => {
    localStorage.replayToState = value
    // onSyncUpload()
  })

  watch(loopsState, async (value, old) => {
    value = isNaN(value) ? old : value
    loopsState.value = value
    localStorage.loopsState = value
    // onSyncUpload()
  })

  watch(loopsCountState, async (value) => {
    localStorage.loopsCountState = value
    // onSyncUpload()
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
    setLoopsCount,
    setDefaultSettingFromLocalStorage
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
