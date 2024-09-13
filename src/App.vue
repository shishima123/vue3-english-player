<script setup>
import { onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import NavMobile from '@/components/NavMobile.vue'
import Playlist from '@/components/Playlist.vue'
import Lyric from '@/components/Lyric.vue'
import SleepTimer from '@/components/SleepTimer.vue'
import Sync from '@/components/Sync.vue'
import Repeat from '@/components/Repeat.vue'
import Replay from '@/components/Replay.vue'
import { FirebaseEnums } from '@/configs/firebase'
import { useNavMobileStore } from '@/stores/navMobile'
import { useSyncStore } from '@/stores/sync'
import { useSleepTimerStore } from '@/stores/sleepTimer'
import { usePlayerStore } from '@/stores/player'
import { useReplayStore } from '@/stores/replay'
import { useRepeatStore } from '@/stores/repeat'
import Player from '@/components/Player.vue'

// icons
import {
  AdjustmentsVerticalIcon,
  ArrowPathIcon,
  ClockIcon,
  CloudArrowDownIcon
} from '@heroicons/vue/24/outline'

// store
const navMobileStore = useNavMobileStore()
const syncStore = useSyncStore()
const sleepTimerStore = useSleepTimerStore()
const replayStore = useReplayStore()
const playerStore = usePlayerStore()
const repeatStore = useRepeatStore()

// ref
let activeTab = useStorage('activeTab', '1')

onMounted(async () => {
  playerStore.pause()
  try {
    await syncStore.syncDownload()
  } catch (error) {
    if (error.message === FirebaseEnums.permission_denied) {
      syncStore.onShowModalLogin()
    }
  }

  await playerStore.setCurrentSong()
  await playerStore.setPlayerSource()
  await playerStore.registerListener()
  await repeatStore.updateSeekSlider()
})
</script>

<template>
  <a-config-provider
    :theme="{
      token: {
        fontFamily: 'Nunito, sans-serif',
        colorTextBase: '#1f2937',
        fontSize: 16
      }
    }"
  >
    <!-- begin:: Player Section -->
    <section
      class="flex flex-col flex-nowrap order-3 w-full h-full mx-auto overflow-hidden px-[15px] md:p-[10px] bg-white text-base rounded-none md:rounded shadow-none md:shadow-md row-start-1 row-end-3 col-start-1 col-end-2 md:order-1 transition-[height] duration-[350ms] ease-linear"
      :class="{
        '!h-[var(--player-mobile-height)]':
          navMobileStore.showLyricsState || navMobileStore.showPlaylistState
      }"
    >
      <player />
      <a-tabs v-model:activeKey="activeTab" centered class="custom-padding" animated>
        <a-tab-pane key="1" force-render>
          <template #tab>
            <AdjustmentsVerticalIcon class="h-6 w-6" />
          </template>
          <replay />
        </a-tab-pane>
        <a-tab-pane key="2" force-render>
          <template #tab>
            <ArrowPathIcon class="h-6 w-6" />
          </template>
          <repeat></repeat>
        </a-tab-pane>
        <a-tab-pane key="3" force-render>
          <template #tab>
            <span class="flex justify-center"><ClockIcon class="h-6 w-6" /></span>
            <span
              v-if="sleepTimerStore.isSleepTimerActive"
              class="absolute bg-green-600 text-green-100 px-[5px] text-xs font-bold rounded-full top-[0px] right-[-4px]"
            >
              {{ sleepTimerStore.sleepRemainingTimeState }}
            </span>
          </template>
          <sleep-timer></sleep-timer>
        </a-tab-pane>
        <a-tab-pane key="4" force-render>
          <template #tab>
            <CloudArrowDownIcon class="h-6 w-6" />
          </template>
          <sync></sync>
        </a-tab-pane>
      </a-tabs>
    </section>
    <!-- end:: Player Section -->
    <lyric />
    <!-- begin:: Playlist Section -->
    <playlist />
    <!-- end:: Playlist Section -->

    <!-- begin:: Nav mobile -->
    <nav-mobile />
    <!-- end:: Nav mobile -->
  </a-config-provider>
</template>
