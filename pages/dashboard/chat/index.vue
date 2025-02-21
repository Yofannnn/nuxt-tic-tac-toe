<template>
  <main class="w-full grid grid-cols-5 gap-2 p-2 chat-height">
    <Card class="col-span-2 overflow-hidden">
      <CardHeader>Direct Message</CardHeader>
      <CardContent class="overflow-y-auto overflow-x-hidden h-full">
        <div v-for="(item, index) in 10" :key="index" class="flex items-center gap-2 hover:bg-muted cursor-pointer p-2">
          <div class="p-1.5 h-full aspect-square rounded-full border border-foreground"><PersonIcon class="size-7" /></div>
          <div class="overflow-hidden">
            <div class="flex justify-between items-center gap-1">
              <h4 class="text-base truncate w-full">Nama Orang</h4>
              <span class="text-xs text-muted-foreground text-nowrap w-fit">{{ formatTime(new Date()) }}</span>
            </div>
            <p class="text-sm truncate w-full mt-1">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex rem vitae est magni culpa perspiciatis laudantium
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card class="col-span-3 flex flex-col items-center max-h-full overflow-hidden">
      <CardHeader class="w-full">
        <div class="flex items-center gap-2">
          <div class="p-1.5 rounded-full border border-foreground"><PersonIcon class="size-5" /></div>
          <h2>Nama Orang</h2>
        </div>
      </CardHeader>
      <CardContent v-if="dummyChat.length === 0" class="flex-1 flex justify-center items-center">
        <h1 class="text-muted-foreground text-center text-sm py-4">Say hi to your friend</h1>
      </CardContent>
      <CardContent v-if="dummyChat.length > 0" class="flex-1 grid grid-cols-4 gap-y-2 w-full max-h-full overflow-x-hidden overflow-y-auto">
        <div
          v-for="(item, index) in dummyChat"
          :key="index"
          :class="item.id === userId ? 'col-start-2 col-span-3 flex flex-col items-end' : 'col-start-1 col-span-3 place-self-start'"
        >
          <p class="text-sm md:text-base rounded-lg overflow-hidden bg-muted break-words p-1.5 md:p-2 w-fit">
            {{ item.message }}
          </p>
          <div class="mt-1 text-xs text-muted-foreground flex items-center gap-0.5">
            {{ formatTime(item.createdAt) }}
            <CheckIcon v-if="userId === item.id" :class="cn('size-4 text-muted-foreground', item.isRead && 'text-green-500')" />
          </div>
        </div>
      </CardContent>
      <CardFooter class="w-full">
        <form @submit="" class="w-full flex items-end gap-2">
          <Textarea name="chat" placeholder="Type a message..." class="resize-none w-full overflow-y-auto" />
          <Button type="submit" class="rounded-full p-2">
            <PaperPlaneIcon class="size-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  </main>
</template>

<script setup lang="ts">
import { formatTime } from '~/lib/format-date';
import { CheckIcon, PaperPlaneIcon, PersonIcon } from '@radix-icons/vue';
import { cn } from '@/lib/utils';

definePageMeta({
  layout: 'dashboard',
  key: 'chat',
});

const userId: number | null = null;
const {
  data: dmList,
  error,
  status,
} = useFetch(useRuntimeConfig().public.getUserDMListURL, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  server: false,
  lazy: true,
});

const dummyChat = [];
</script>

<style scoped>
.chat-height {
  height: calc(100svh - 85px);
}
</style>
