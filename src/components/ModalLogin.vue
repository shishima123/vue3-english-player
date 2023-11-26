<script setup>
import { signInFirebase } from '@/configs/firebase'
import { ref } from 'vue'
const emit = defineEmits(['update:modelValue', 'handleAfterLogin'])

defineExpose({ changeOpen })

let email = ref('shishima21@gmail.com')
let password = ref('')
let error = ref(null)
let isLoading = ref(false)

let open = ref(false)

function changeOpen(value) {
  open.value = value
}

function onClosed() {
  emit('handleAfterLogin')
}

async function onSubmit() {
  isLoading.value = true
  error.value = null
  try {
    await signInFirebase(email.value, password.value)
    open.value = false
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <a-modal
    v-model:open="open"
    title=" "
    :footer="null"
    width="300px"
    :afterClose="onClosed"
    centered
  >
    <form @submit.prevent="onSubmit">
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
      <div class="w-full text-center mb-1">
        <button type="submit" :class="{ disabled: isLoading }" class="btn">Login</button>
      </div>
    </form>
  </a-modal>
</template>
