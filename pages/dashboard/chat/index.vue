<template>
  <main class="w-full grid grid-cols-5 gap-2 p-2 chat-height">
    <Card class="col-span-2 overflow-hidden flex flex-col">
      <CardHeader class="w-full flex flex-row items-center justify-between">
        Direct Message
        <Button variant="outline" size="icon" @click="isFriendListDialogOpen = true"> <Pencil2Icon class="size-4" /> </Button>
      </CardHeader>
      <CardContent class="overflow-y-auto overflow-x-hidden flex-1 w-full">
        <div
          v-if="dmList && dmList.conversations.length > 0"
          v-for="(dm, index) in dmList.conversations"
          :key="index"
          :class="
            cn(
              'flex items-center gap-2 hover:bg-muted cursor-pointer p-2',
              dm.participants.map((user) => user.user_id !== userId && user.user_id).filter(Boolean)[0] === friendConversationId && 'bg-muted'
            )
          "
          @click="() => handleOpenConversation(dm.participants.map((user) => user.user_id !== userId && user.user_id).filter(Boolean)[0] as number)"
        >
          <div class="p-1.5 h-full aspect-square rounded-full border border-foreground"><PersonIcon class="size-7" /></div>
          <div class="overflow-hidden w-full">
            <div class="w-full flex justify-between items-center gap-1">
              <h4 class="text-base truncate w-full">
                {{ dm.participants.map((user) => user.user_id !== userId && user.user_id).filter(Boolean)[0] }}
              </h4>
              <span class="text-xs text-muted-foreground text-nowrap w-fit">{{ formatTime(dm.messages[0].createdAt) }}</span>
            </div>
            <div class="w-full mt-1 flex items-center justify-between gap-2">
              <p class="text-sm truncate w-full"><span v-if="dm.messages[0].sender_id === userId">You: </span>{{ dm.messages[0].message }}</p>
              <span v-if="dm._count.messages > 0" class="text-xs rounded-full py-0.5 px-1.5 bg-muted">{{ dm._count.messages }}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card v-if="!friendConversationId" class="col-span-3 flex flex-col items-center justify-center gap-2">
      <h1 class="text-center text-xl">Start a conversation</h1>
      <Button size="sm" @click="isFriendListDialogOpen = true"> Send Message </Button>
    </Card>
    <Card v-if="friendConversationId" class="col-span-3 flex flex-col items-center max-h-full overflow-hidden">
      <CardHeader class="w-full">
        <div class="flex items-center gap-2">
          <div class="p-1.5 rounded-full border border-foreground"><PersonIcon class="size-5" /></div>
          <h2>
            {{ friendConversationName }}
          </h2>
        </div>
      </CardHeader>
      <CardContent v-if="directMessages && directMessages.length === 0" class="flex-1 flex justify-center items-center">
        <h1 class="text-muted-foreground text-center text-sm py-4">Say hi to your friend</h1>
      </CardContent>
      <CardContent
        ref="chatContainer"
        v-if="directMessages && directMessages.length > 0"
        class="flex-1 grid grid-cols-4 gap-y-2 w-full max-h-full overflow-x-hidden overflow-y-auto"
      >
        <div
          v-for="(item, index) in directMessages"
          :key="index"
          :class="item.sender_id === userId ? 'col-start-2 col-span-3 flex flex-col items-end' : 'col-start-1 col-span-3 place-self-start'"
        >
          <p class="text-sm md:text-base rounded-lg overflow-hidden bg-muted break-words p-1.5 md:p-2 w-fit">
            {{ item.message }}
          </p>
          <div class="mt-1 text-xs text-muted-foreground flex items-center gap-0.5">
            {{ formatTime(item.createdAt) }}
            <CheckIcon v-if="userId === item.sender_id" :class="cn('size-4 text-muted-foreground', item.isRead && 'text-green-500')" />
          </div>
        </div>
      </CardContent>
      <CardFooter class="w-full">
        <form @submit="handleSendMessage" class="w-full flex items-end gap-2">
          <Textarea name="chat" placeholder="Type a message..." class="resize-none w-full overflow-y-auto" />
          <Button type="submit" class="rounded-full p-2">
            <PaperPlaneIcon class="size-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>

    <Dialog v-model:open="isFriendListDialogOpen" :onOpenChange="() => (isFriendListDialogOpen = !isFriendListDialogOpen)">
      <DialogContent class="sm:max-w-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Friend List</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div class="w-full overflow-hidden">
          <ul v-if="friendList && friendList.length > 0" class="w-full max-h-[55svh] overflow-y-auto p-2">
            <li
              v-for="item in friendList"
              :key="item.id"
              class="w-full flex items-center gap-2 p-2 hover:bg-muted"
              @click="
                () => {
                  handleOpenConversation(item.id);
                  isFriendListDialogOpen = false;
                }
              "
            >
              <div class="p-1.5 w-fit rounded-full border border-foreground"><PersonIcon class="size-6" /></div>
              <p class="truncate w-full">{{ item.name }}</p>
            </li>
          </ul>
          <p v-if="friendList && friendList.length === 0" class="text-muted-foreground text-sm md:text-base p-2">You don't have any friend yet</p>
        </div>
        <DialogFooter>
          <Button type="button" @click="isFriendListDialogOpen = false"> Close </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import type { IFriend } from '~/types/friend.type';
import type { IDirectMessage, IResponseGetUserConversations } from '~/types/direct-message.type';
import { formatTime } from '~/lib/format-date';
import { CheckIcon, PaperPlaneIcon, Pencil2Icon, PersonIcon } from '@radix-icons/vue';
import { cn } from '@/lib/utils';

definePageMeta({
  layout: 'dashboard',
  key: 'chat',
});

const config = useRuntimeConfig();
const { $socket } = useNuxtApp();
const chatContainer = useTemplateRef('chatContainer');

const userId = ref<number | null>(null);
const friendConversationId = ref<number | null>(null);
const friendConversationName = computed(() => {
  if (!friendConversationId.value || !dmList.value?.conversations) return null;

  const friend = dmList.value.conversations
    .find(({ participants }) => participants.some(({ user_id }) => user_id === friendConversationId.value))
    ?.participants.find(({ user_id }) => user_id === friendConversationId.value);

  return friend?.user.name ?? null;
});

const {
  data: dmList,
  error: dmListError,
  status: dmListStatus,
} = await useFetch<IResponseGetUserConversations>(config.public.getUserDMListURL, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  server: false,
  lazy: true,
});

// set user id
watch(dmList, () => dmList.value && (userId.value = dmList.value.user_id));

const directMessages = ref<IDirectMessage[] | null>(null);
watch(friendConversationId, async () => {
  const response = await $fetch(`${config.public.getUserDMListURL}/${friendConversationId.value}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    server: false,
    lazy: true,
  });

  directMessages.value = response as IDirectMessage[];
});

const isFriendListDialogOpen = ref(false);
const friendList = ref<IFriend[] | null>(null);
watch(isFriendListDialogOpen, async () => {
  if (!friendList.value) {
    const response = await $fetch(config.public.getUserFriendListURL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      server: false,
      lazy: true,
    });

    friendList.value = response as IFriend[];
  }
});

onMounted(() => {
  $socket.connect();

  $socket.on('newDirectMessage', (newMessage: IDirectMessage) => {
    console.log('📥 Received newDirectMessage event:', newMessage);

    directMessages.value?.push(newMessage);
    nextTick(scrollToBottom);

    const index = dmList.value?.conversations.findIndex((item) => item.id === newMessage.conversation_id);
    if (index !== undefined && index !== -1 && dmList.value) {
      dmList.value.conversations[index].messages.unshift(newMessage);
      if (!friendConversationId.value) dmList.value.conversations[index]._count.messages += 1;
    }
  });

  $socket.on('readedMessage', (newReadedMessages: IDirectMessage[]) => {
    console.log('📥 Received readedMessage event:', newReadedMessages);

    newReadedMessages.forEach((readedMessage) => {
      if (directMessages.value) {
        const index = directMessages.value.findIndex((message) => message.id === readedMessage.id);

        if (index !== undefined && index !== -1) {
          directMessages.value[index].isRead = true;
        }
      }
    });
  });
});

function handleOpenConversation(friendId: number) {
  friendConversationId.value = friendId; // set friend conversation id

  if (dmList.value) {
    const index = dmList.value.conversations.findIndex((conversation) =>
      conversation.participants.some((participant) => participant.user_id === friendId)
    );
    if (index !== undefined && index !== -1) dmList.value.conversations[index]._count.messages = 0;
  }
}

function handleSendMessage(event: Event) {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const text = form.chat.value;
  const isOnlySpace = /^\s+$/.test(text);

  if (!text || isOnlySpace || !friendConversationId.value) return;

  $socket.emit('sendDirectMessage', { friend_id: friendConversationId.value, message: text.trim() });
  form.reset();
}

const unreadMessages = computed(() => directMessages.value?.filter((msg) => !msg.isRead && msg.sender_id !== userId.value) || []);

watch(unreadMessages, (newUnread, oldUnread) => {
  if (newUnread.length > 0) {
    $socket.emit('readMessage', { sender_id: friendConversationId.value });
  }
});

watch(chatContainer, () => friendConversationId.value && nextTick(scrollToBottom), { deep: true });

const scrollToBottom = () => {
  if (chatContainer.value) chatContainer.value.$el.scrollTop = chatContainer.value.$el.scrollHeight;
};
</script>

<style scoped>
.chat-height {
  height: calc(100svh - 85px);
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #888;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
