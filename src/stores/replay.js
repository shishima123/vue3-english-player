import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useSyncStore } from '@/stores/sync'

export const useReplayStore = defineStore('replay', () => {
  // store
  const playerStore = usePlayerStore()
  const syncStore = useSyncStore()

  // ref
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
    let attributes = ['loopsState', 'loopsCountState']
    attributes.forEach((el) => {
      if (localStorage[el]) {
        eval(el).value = Number(localStorage[el])
      }
    })
    if (localStorage.replayPickedState) {
      replayPickedState.value =
        localStorage.replayPickedState === 'null' ? '1' : localStorage.replayPickedState
    }

    if (localStorage.replayFromState) {
      replayFromState.value =
        localStorage.replayFromState === 'null' ? 1 : Number(localStorage.replayFromState)
    }

    if (localStorage.replayToState) {
      replayToState.value =
        localStorage.replayToState === 'null'
          ? playerStore.songsState.length
          : Number(localStorage.replayToState)
    }
  }

  watch(replayPickedState, async (value) => {
    localStorage.replayPickedState = value
    if (value in replayMappingState.value) {
      replayFromState.value = replayMappingState.value[value].from
      replayToState.value = replayMappingState.value[value].to
      replayCustomFlagState.value = replayMappingState.value[value].shouldDisableSelect
    }
    await syncStore.syncUpload()
  })

  watch(replayFromState, async (value) => {
    localStorage.replayFromState = value
    await syncStore.syncUpload()
  })

  watch(replayToState, async (value) => {
    localStorage.replayToState = value
    await syncStore.syncUpload()
  })

  watch(loopsState, async (value, old) => {
    value = isNaN(value) ? old : value
    loopsState.value = value
    localStorage.loopsState = value
    await syncStore.syncUpload()
  })

  watch(loopsCountState, async (value) => {
    localStorage.loopsCountState = value
    await syncStore.syncUpload()
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
