<template>
  <main>
    <div v-if="userStatus === 'pending'" class="fixed top-0 w-full h-svh flex justify-center items-center">
      <Loader />
    </div>

    <div v-if="userStatus === 'error'" class="fixed top-0 w-full h-svh flex justify-center items-center">
      <h1>{{ userError }}</h1>
    </div>

    <Card v-if="userStatus === 'success'" class="grid gap-2 max-w-xl mx-auto px-4 py-8">
      <div class="flex flex-col items-center">
        <div class="w-fit p-2 border border-foreground rounded-full">
          <PersonIcon class="size-8" />
        </div>
        <h1>{{ user.name }}</h1>
        <p>Join at {{ formatDate(user.createdAt, 'long') }}</p>
      </div>
      <div class="w-full flex gap-2 mt-4">
        <Button class="w-full" variant="outline">Match History</Button>
        <Button class="w-full" variant="outline">Friend List</Button>
      </div>
    </Card>
  </main>
</template>

<script setup lang="ts">
import { formatDate } from '~/lib/format-date';
import { PersonIcon } from '@radix-icons/vue';

definePageMeta({
  layout: 'dashboard',
  key: 'profile',
});

const {
  data: user,
  error: userError,
  status: userStatus,
} = useFetch(useRuntimeConfig().public.getUserProfileURL, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  server: false,
  key: 'user',
  lazy: true,
});
</script>
