<template>
  <main class="w-full h-svh flex justify-center p-2">
    <ClientOnly>
      <Loader v-if="roomStatus === 'pending'" class="self-center" />
    </ClientOnly>

    <p v-if="roomError" class="self-center">Error</p>

    <div v-if="roomStatus === 'success'" class="w-[550px]">
      <Drawer>
        <DrawerTrigger as-child>
          <Button class="w-full">
            <PlusCircledIcon class="size-4 mr-1" />
            Create Room
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div class="w-full flex justify-center">
            <div class="w-[550px]">
              <DrawerHeader>
                <DrawerTitle>Crete Room</DrawerTitle>
                <DrawerDescription></DrawerDescription>
              </DrawerHeader>
              <form id="create-room-form" class="grid gap-4 p-4" @submit="handleCreateRoom">
                <div class="grid gap-2">
                  <div class="w-full flex justify-between items-center">
                    <Label for="roomName">Room Name</Label>
                    <div class="flex items-center gap-2">
                      <label for="private" class="text-sm font-medium"> Private </label>
                      <Checkbox id="private" @click="isCreatePrivateRoom = !isCreatePrivateRoom" :checked="isCreatePrivateRoom" />
                    </div>
                  </div>
                  <Input id="roomName" type="text" placeholder="Your room name" required />
                  <ul v-if="createRoomNameFieldError.length" class="bg-destructive text-destructive-foreground text-xs md:text-sm p-2">
                    <li v-for="error in createRoomNameFieldError" :key="error" class="list-disc list-inside">
                      {{ error }}
                    </li>
                  </ul>
                </div>
                <div v-if="isCreatePrivateRoom" class="grid gap-2">
                  <Label for="pin-input">PIN</Label>
                  <PinInput id="pin-input" name="pin" v-model="createRoomPIN" placeholder="○" otp type="number">
                    <PinInputGroup>
                      <PinInputInput v-for="(id, index) in 6" :key="id" :index="index" class="bg-background" />
                    </PinInputGroup>
                  </PinInput>
                  <ul v-if="createRoomPinFieldError.length" class="w-full bg-destructive text-destructive-foreground text-xs md:text-sm p-2">
                    <li v-for="error in createRoomPinFieldError" :key="error" class="list-disc list-inside">
                      {{ error }}
                    </li>
                  </ul>
                </div>
              </form>
              <DrawerFooter class="flex flex-row justify-center gap-2">
                <DrawerClose class="w-full">
                  <Button type="button" variant="outline" class="w-full"> Cancel </Button>
                </DrawerClose>
                <Button type="submit" form="create-room-form" class="w-full">
                  <ReloadIcon v-if="isSubmiting" class="size-4 mr-2 animate-spin" />
                  {{ isSubmiting ? 'Please wait' : 'Submit' }}
                </Button>
              </DrawerFooter>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <div class="mt-8 grid gap-1">
        <Card
          v-for="(room, index) in rooms as IGetRoomsWaitingResponse[]"
          :key="index"
          class="px-5 py-2 cursor-pointer"
          @click="
            () => {
              joinRoomData = room;
              room.isPrivate ? (isPINDialogOpen = true) : (isAlertDialogOpen = true);
            }
          "
        >
          <h3 class="text-lg font-semibold mb-1">{{ room.name }}</h3>
          <p class="text-sm">
            Status: {{ room.status }} <span class="font-semibold">({{ room.isPrivate ? 'Private' : 'Public' }})</span>
          </p>
        </Card>
      </div>
    </div>

    <AlertDialog :open="isAlertDialogOpen" :onOpenChange="() => (isAlertDialogOpen = !isAlertDialogOpen)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Join this Room?</AlertDialogTitle>
          <AlertDialogDescription>
            You will join in
            <span class="font-bold">
              {{ joinRoomData?.name }}
            </span>
            #id: {{ joinRoomData?.id }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="isAlertDialogOpen = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handleJoinRoom">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog :open="isPINDialogOpen" :onOpenChange="() => (isPINDialogOpen = !isPINDialogOpen)">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>This room is private</DialogTitle>
          <DialogDescription>
            Please enter your PIN before join in
            <span class="font-bold">
              {{ joinRoomData?.name }}
            </span>
            #id: {{ joinRoomData?.id }}</DialogDescription
          >
        </DialogHeader>
        <form id="pin-form" class="flex flex-col items-center gap-2 px-2 py-5" @submit="handleJoinRoom">
          <PinInput id="pin-input" name="pin" v-model="joinRoomPIN" placeholder="○" otp type="number">
            <PinInputGroup>
              <PinInputInput v-for="(id, index) in 6" :key="id" :index="index" class="bg-background" />
            </PinInputGroup>
          </PinInput>
          <ul v-if="joinRoomPinFieldError.length" class="w-full bg-destructive text-destructive-foreground text-xs md:text-sm p-2">
            <li v-for="error in joinRoomPinFieldError" :key="error" class="list-disc list-inside">
              {{ error }}
            </li>
          </ul>
        </form>
        <DialogFooter class="flex justify-center gap-2">
          <Button
            type="button"
            class="w-full"
            variant="outline"
            @click="
              () => {
                isPINDialogOpen = false;
                joinRoomPIN = [];
                joinRoomPinFieldError = [];
              }
            "
          >
            Close
          </Button>
          <Button type="submit" class="w-full" form="pin-form"> Submit </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import type { IGetRoomsWaitingResponse, IResponseCreateAndJoinRoom } from '~/types/room.type';
import { useToast } from '@/components/ui/toast/use-toast';
import { PlusCircledIcon, ReloadIcon } from '@radix-icons/vue';

const router = useRouter();
const isCreatePrivateRoom = ref(false);
const createRoomPIN = ref<string[]>([]);
const createRoomNameFieldError = ref<string[]>([]);
const createRoomPinFieldError = ref<string[]>([]);
const joinRoomData = ref<IGetRoomsWaitingResponse | null>(null);
const joinRoomPIN = ref<string[]>([]);
const joinRoomPinFieldError = ref<string[]>([]);
const isAlertDialogOpen = ref(false);
const isPINDialogOpen = ref(false);
const isSubmiting = ref(false);
const { toast } = useToast();

const getRoomsURL = useRuntimeConfig().public.getRoomsURL;
const {
  data: rooms,
  status: roomStatus,
  error: roomError,
} = await useFetch(getRoomsURL, {
  lazy: true,
  server: false,
});

async function handleCreateRoom(e: Event) {
  e.preventDefault();

  if (isSubmiting.value) return;

  if (isCreatePrivateRoom.value && createRoomPIN.value.length !== 6) {
    createRoomPinFieldError.value = ['PIN must be 6 digits'];
    return;
  }

  isSubmiting.value = true;

  const form = e.target as HTMLFormElement;
  const roomName = form.roomName.value;
  const password = isCreatePrivateRoom.value ? Number(createRoomPIN.value.join('')) : null;

  try {
    const url = useRuntimeConfig().public.createRoomURL;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName, ...(password && { password }) }),
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok) {
      createRoomNameFieldError.value = [];

      if (Array.isArray(result.error)) {
        result.error.forEach((error: any) => {
          if (error.path[0] === 'name') createRoomNameFieldError.value.push(error.message);
        });
        throw new Error('Invalid input fields');
      }

      throw new Error(result.error);
    }

    const data = result as IResponseCreateAndJoinRoom;

    storeUserIdToSession(data.user_id);
    router.push({ path: `/play/${data.room.id}` });
  } catch (error: any) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.message,
    });
  } finally {
    isSubmiting.value = false;
  }
}

async function handleJoinRoom(e: Event) {
  e.preventDefault();

  if (joinRoomData.value?.isPrivate && joinRoomPIN.value.length !== 6) {
    joinRoomPinFieldError.value = ['PIN must be 6 digits'];
    return;
  }

  if (isSubmiting.value) return;
  isSubmiting.value = true;

  try {
    const url = useRuntimeConfig().public.joinRoomURL;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: joinRoomData.value?.id,
        ...(joinRoomData.value?.isPrivate && { password: Number(joinRoomPIN.value.join('')) }),
      }),
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error.message);

    const data = result as IResponseCreateAndJoinRoom;

    storeUserIdToSession(data.user_id);
    router.push({ path: `/play/${data.room.id}` });
  } catch (error: any) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.message,
    });
  } finally {
    isSubmiting.value = false;
  }
}

function storeUserIdToSession(id: number) {
  sessionStorage.setItem('user_id', String(id));
}
</script>
