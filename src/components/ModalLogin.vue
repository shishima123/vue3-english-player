<script setup>
import { VueFinalModal } from 'vue-final-modal'
import { signInFirebase } from '@/configs/firebase'
import { ref } from 'vue'
const emit = defineEmits(['update:modelValue', 'handleAfterLogin'])

let email = ref('shishima21@gmail.com')
let password = ref('')
let error = ref(null)
let isLoading = ref(false)

function onClosed() {
  emit('handleAfterLogin')
}

async function onSubmit() {
  isLoading.value = true
  error.value = null
  try {
    await signInFirebase(email.value, password.value)
    emit('update:modelValue', false)
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <VueFinalModal
    class="flex justify-center items-center"
    content-class="flex flex-col p-4 bg-white rounded border border-gray-100"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    teleport-to="body"
    @closed="onClosed"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <form class="w-[80vw] md:w-[300px]" @submit.prevent="onSubmit">
      <button
        class="ml-auto text-left block text-xl px-2 hover:opacity-70 transition"
        @click="emit('update:modelValue', false)"
      >
        <font-awesome-icon :icon="['fas', 'xmark']" />
      </button>
      <span class="block text-xl uppercase font-bold mb-4 text-center">Login</span>
      <div class="mb-4">
        <label for="email" class="block text-xs mb-1">Email</label>
        <input
          class="w-full border rounded p-2 outline-none focus:outline-none focus:border-green-600"
          type="email"
          name="email"
          id="email"
          placeholder="Username or Email"
          v-model="email"
        />
      </div>
      <div class="mb-6 md:w-full">
        <label for="password" class="block text-xs mb-1">Password</label>
        <input
          class="w-full border rounded p-2 outline-none focus:outline-none focus:border-green-600"
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          v-model="password"
        />
      </div>
      <span v-if="error" class="block text-red-500 text-sm mb-4">{{ error }}</span>
      <div class="w-full text-center mb-4">
        <button type="submit" :class="{ disabled: isLoading }" class="btn">Login</button>
      </div>
    </form>
  </VueFinalModal>
</template>
