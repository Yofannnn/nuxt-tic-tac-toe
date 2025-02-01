<template>
  <nav class="flex items-center justify-between py-2">
    <img class="size-9 ml-4" src="/tic-tac-toe-logo.svg" alt="tic-tac-toe-logo" />
    <ul class="flex items-center gap-8 justify-between mr-4">
      <li>
        <NuxtLink to="/room" class="font"> Play </NuxtLink>
      </li>
      <li @click="colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'">
        <SunIcon v-if="colorMode.value === 'light'" class="size-4" />
        <MoonIcon v-if="colorMode.value === 'dark'" class="size-4" />
      </li>
      <li>
        <NuxtLink to="/login" class="p-1.5 rounded-full border-foreground border inline-block"><PersonIcon class="size-5" /></NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { PersonIcon, MoonIcon, SunIcon } from '@radix-icons/vue';

const colorMode = useColorMode();
</script>
