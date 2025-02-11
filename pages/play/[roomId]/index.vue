<template>
  <main class="max-w-lg mx-auto p-2">
    <div v-if="boardState.length > 0" class="w-full flex justify-evenly mb-14">
      <Card :class="cn('flex flex-col items-center gap-2 p-2 relative', !waitingForPlayer && gameStatus === 'active' && 'border-foreground')">
        <PersonIcon class="size-6" />
        <h3 class="text-base">{{ userName }}</h3>
        <p class="text-sm">Score: {{ userScore }}</p>
        <span v-if="!waitingForPlayer && gameStatus === 'active'" class="absolute -bottom-6 text-xs text-muted-foreground text-center text-nowrap"
          ><TriangleRightIcon class="size-4 inline-block" />Your Turn</span
        >
      </Card>
      <Card class="flex flex-col items-center gap-2 p-2">
        <PersonIcon class="size-6" />
        <h3 class="text-base">{{ enemyName }}</h3>
        <p class="text-sm">Score: {{ enemyScore }}</p>
      </Card>
    </div>

    <div v-if="boardState.length === 0" class="w-full h-svh flex flex-col items-center justify-center p-2">
      <h1 class="text-muted-foreground text-center text-lg py-4">Waiting for Opponent</h1>
      <Button variant="destructive" @click="isAlertDialogOpen = true"> Exit <ExitIcon /></Button>
    </div>

    <div v-if="boardState.length > 0 && gameStatus === 'active'" class="grid grid-cols-3 w-full">
      <div
        v-for="(state, index) in boardState"
        :key="index"
        :class="
          cn(
            'col-span-1 aspect-square border-2 border-foreground flex justify-center items-center',
            waitingForPlayer ? 'border-muted' : 'border-foreground'
          )
        "
        @click="() => handleMakeMove(index)"
      >
        <Cross1Icon v-if="state === 'X'" class="text-primary size-3/4" />
        <CircleIcon v-if="state === 'O'" class="text-primary size-3/4" />
      </div>
    </div>
    <div v-if="gameStatus !== 'active'" class="px-2 py-10">
      <h1 class="text-center text-2xl">{{ winnerStatus === 'win' ? 'You Win' : winnerStatus === 'lose' ? 'You Lose' : 'Draw' }}</h1>
      <div class="flex justify-center items-center gap-2 mt-8">
        <Button variant="outline" @click="handleRematch"> <UpdateIcon /> Play Again</Button>
        <Button variant="destructive" @click="isAlertDialogOpen = true"> Exit <ExitIcon /></Button>
      </div>
    </div>

    <Drawer>
      <DrawerTrigger as-child>
        <Button size="sm" class="absolute top-4 right-3"> <ChatBubbleIcon class="size-4 md:size-5" /> Open Chat </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div class="w-full flex justify-center">
          <div class="w-[550px]">
            <DrawerHeader>
              <DrawerTitle>Chat</DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <div ref="chatContainer" class="max-h-[65svh] mx-4 p-2 border-2 rounded-xl grid grid-cols-4 gap-y-2 overflow-x-hidden overflow-y-auto">
              <p
                v-for="(item, index) in chats"
                :key="index"
                :class="
                  cn(
                    'w-fit flex flex-col p-2 rounded-lg overflow-hidden bg-muted break-words text-sm md:text-base',
                    item.player_id === userId ? 'col-start-2 col-span-3 place-self-end' : 'col-start-1 col-span-3 place-self-start'
                  )
                "
              >
                <span :class="cn('mb-2 inline-block', item.player_id === userId && 'self-end')">
                  {{ item.message }}
                </span>
                <span class="text-muted-foreground text-xs self-end">{{ getDateAndTime(item.createdAt).time }}</span>
              </p>
              <p v-if="chats.length === 0" class="text-muted-foreground col-span-2 col-start-2 text-center py-14">Start Chat Now</p>
            </div>
            <DrawerFooter class="pb-6">
              <form @submit="handleChat" class="w-full flex items-end gap-2">
                <Textarea name="chat" placeholder="Message" class="resize-none w-full overflow-y-auto" />
                <Button type="submit" class="rounded-full p-2">
                  <PaperPlaneIcon class="size-4" />
                </Button>
              </form>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>

    <AlertDialog :open="isAlertDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription> This will exit from room and end the game </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="isAlertDialogOpen = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handleLeaveRoom">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </main>
</template>

<script setup lang="ts">
import type { IResponseLeaveRoom } from '~/types/room.type';
import type { IGameChat, IGameState, IInitializeGame, IMatchHistory } from '~/types/game.type';
import { cn } from '~/lib/utils';
import { getDateAndTime } from '~/lib/format-date';
import { toast } from '~/components/ui/toast';
import { ChatBubbleIcon, CircleIcon, Cross1Icon, ExitIcon, PaperPlaneIcon, PersonIcon, TriangleRightIcon, UpdateIcon } from '@radix-icons/vue';

const router = useRouter();
const { $socket } = useNuxtApp();
const roomId: number = Number(useRoute().params.roomId);
const userId = ref<number>(0);
const userName = ref<string>('');
const enemyName = ref<string>('');
const userScore = ref<number>(0);
const enemyScore = ref<number>(0);
const boardState = ref<string[]>([]);
const gameStatus = ref<'active' | 'draw' | 'ended'>('active');
const winnerStatus = ref<'win' | 'lose' | 'draw' | null>(null);
const waitingForPlayer = ref(true);
const chats = ref<IGameChat[]>([]);
const chatContainer = useTemplateRef('chatContainer');
const isAlertDialogOpen = ref(false);
const forceLeave = ref(false);

watch(chatContainer, () => nextTick(scrollToBottom), { deep: true });

onBeforeRouteLeave((to, from, next) => {
  if (isAlertDialogOpen.value || forceLeave.value) {
    isAlertDialogOpen.value = false;
    next();
    return;
  }
  next(false);
});

const preventClose = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  event.returnValue = false;
};

const preventHistoryChange = () => {
  history.pushState(null, '', location.href);
};

onUnmounted(() => {
  window.removeEventListener('beforeunload', preventClose);
  window.removeEventListener('popstate', preventHistoryChange);
});

onMounted(() => {
  window.addEventListener('beforeunload', preventClose);
  window.addEventListener('popstate', preventHistoryChange);
  history.pushState(null, '', location.href);

  userId.value = Number(sessionStorage.getItem('user_id') || '0');

  if (!userId.value) {
    router.replace({ path: '/' });
    return;
  }

  $socket.connect();

  console.log('✅ WebSocket connected, emitting initializeGame');
  $socket.emit('initializeGame', { room_id: roomId });
  $socket.emit('startChat', { room_id: roomId });
  $socket.emit('reconnect', { room_id: roomId });

  // Handle reconnecting
  $socket.on('disconnect', () => {
    console.log('🚫 WebSocket disconnected, attempting to reconnect...');
    setTimeout(() => {
      if (!$socket.connected) $socket.connect();
    }, 1000);
  });

  $socket.on('initializeGame', (initialGameState: IInitializeGame) => {
    console.log('📥 Received initializeGame event:', initialGameState);

    waitingForPlayer.value = initialGameState.initial_game.turn !== userId.value;
    boardState.value = initialGameState.initial_game.board;
    gameStatus.value = initialGameState.initial_game.status;

    if (userId.value === initialGameState.room_players.player_1.id) {
      userName.value = initialGameState.room_players.player_1.name;
      enemyName.value = initialGameState.room_players.player_2.name;
    } else {
      userName.value = initialGameState.room_players.player_2.name;
      enemyName.value = initialGameState.room_players.player_1.name;
    }
  });

  $socket.on('gameUpdate', (newGameState: IGameState) => {
    waitingForPlayer.value = newGameState.turn !== userId.value;
    boardState.value = newGameState.board;
    gameStatus.value = newGameState.status;

    if (newGameState.status === 'draw') winnerStatus.value = 'draw';
    if (newGameState.status !== 'draw' && newGameState.winner === userId.value) winnerStatus.value = 'win';
    if (newGameState.status === 'ended' && newGameState.winner !== userId.value) winnerStatus.value = 'lose';
  });

  $socket.on('matchHistory', (matchHistory: IMatchHistory) => {
    console.log('📥 Received gameOver event:', matchHistory);
    if (userId.value === matchHistory.player1_id) {
      userScore.value = matchHistory.player1_score;
      enemyScore.value = matchHistory.player2_score;
    } else {
      userScore.value = matchHistory.player2_score;
      enemyScore.value = matchHistory.player1_score;
    }
  });

  $socket.on('leaveRoom', (leaveRoom: IResponseLeaveRoom) => {
    forceLeave.value = true;
    toast({
      title: `${enemyName.value} left the room`,
      description: `${leaveRoom.match_history?.player1_id === userId.value ? 'Your score is ' + leaveRoom.match_history?.player1_score : 'Your score is ' + leaveRoom.match_history?.player2_score}`,
    });
    setTimeout(() => {
      router.push({ path: '/' });
    }, 1000);
  });

  $socket.on('newMessage', (newMessage) => {
    console.log('📥 Received newMessage event:', newMessage);
    nextTick(scrollToBottom);
  });

  $socket.on('updateChat', (gameChat) => {
    chats.value = gameChat;
    nextTick(scrollToBottom);
  });

  $socket.on('error', (error) => {
    console.log('📥 Received error event:', error);
  });

  $socket.on('playerDisconnected', (player_id) => {
    toast({
      variant: 'destructive',
      title: userId.value === player_id ? userName.value : enemyName.value + ' is disconnect',
      description: 'Please wait for another player to join',
    });
  });
});

function handleRematch() {
  $socket.emit('initializeGame', { room_id: roomId });
}

function handleMakeMove(move: number) {
  if (waitingForPlayer.value || boardState.value[move] || gameStatus.value !== 'active') return;
  $socket.emit('makeMove', { room_id: roomId, position: move });
}

function handleLeaveRoom() {
  $socket.emit('leaveRoom', { room_id: roomId });
  toast({
    title: 'You left the room',
    description: 'Your score is ' + userScore.value,
  });
  router.push({ path: '/' });
}

function handleChat(e: Event) {
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const text = form.chat.value;
  const isOnlySpace = /^\s+$/.test(text);

  if (!text || isOnlySpace) return;

  $socket.emit('sendMessage', { room_id: roomId, message: text.trim() });
  form.reset();
}

const scrollToBottom = () => {
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
};
</script>
