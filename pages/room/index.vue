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
          <div class="w-[550px] mx-auto">
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
                    <Checkbox id="private" @click="isPrivateRoom = !isPrivateRoom" :checked="isPrivateRoom" />
                  </div>
                </div>
                <Input id="roomName" type="text" placeholder="Your room name" required />
                <ul v-if="isNameFieldError.length" class="bg-destructive text-destructive-foreground text-xs md:text-sm p-2">
                  <li v-for="error in isNameFieldError" :key="error" class="list-disc list-inside">
                    {{ error }}
                  </li>
                </ul>
              </div>
              <div v-if="isPrivateRoom">
                <Label for="pin-input">PIN</Label>
                <PinInput id="pin-input" name="pin" v-model="pinRoom" placeholder="○" otp type="number">
                  <PinInputGroup>
                    <PinInputInput v-for="(id, index) in 6" :key="id" :index="index" class="bg-background" />
                  </PinInputGroup>
                </PinInput>
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
        </DrawerContent>
      </Drawer>
      <div class="mt-8 grid gap-1">
        <Card v-for="(room, index) in rooms as IRoom[]" :key="index" class="px-5 py-2 cursor-pointer" @click="dataJoinRoom = room">
          <h3 class="text-lg font-semibold mb-1">{{ room.name }}</h3>
          <p class="text-sm">Status: {{ room.status }}</p>
        </Card>
      </div>
    </div>

    <AlertDialog :open="!!dataJoinRoom">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Join this Room?</AlertDialogTitle>
          <AlertDialogDescription>
            You will join in
            <span class="font-bold">
              {{ dataJoinRoom?.name }}
            </span>
            #id: {{ dataJoinRoom?.id }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="dataJoinRoom = null">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handleJoinRoom">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </main>
</template>

<script setup lang="ts">
import { useToast } from '@/components/ui/toast/use-toast';
import { PlusCircledIcon, ReloadIcon } from '@radix-icons/vue';

interface IRoom {
  id: number;
  name: string;
  player1_id: number;
  player2_id?: number;
  status: 'waiting' | 'playing' | 'finished';
}

const router = useRouter();
const isPrivateRoom = ref(false);
const pinRoom = ref<string[]>([]);
const isNameFieldError = ref<string[]>([]);
const isPinFieldError = ref<string[]>([]);
const isSubmiting = ref(false);
const dataJoinRoom = ref<IRoom | null>(null);
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

  if (isPrivateRoom.value && pinRoom.value.length !== 6) {
    isPinFieldError.value = ['PIN must be 6 digits'];
    return;
  }

  isSubmiting.value = true;

  const form = e.target as HTMLFormElement;
  const roomName = form.roomName.value;
  const pin = isPrivateRoom.value ? pinRoom.value.join('') : null;

  try {
    const url = useRuntimeConfig().public.createRoomURL;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName, ...(pin && { pin }) }),
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok) {
      isNameFieldError.value = [];

      if (Array.isArray(result.error)) {
        result.error.forEach((error: any) => {
          if (error.path[0] === 'name') isNameFieldError.value.push(error.message);
        });
        throw new Error('Invalid input fields');
      }

      throw new Error(result.error);
    }

    toast({
      title: 'Room Created Successfully',
      description: `Room ID: ${result.data.id}`,
    });

    router.push({ path: `/play/${result.data.id}` });
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

async function handleJoinRoom() {
  if (isSubmiting.value) return;
  isSubmiting.value = true;

  try {
    const url = useRuntimeConfig().public.joinRoomURL;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: dataJoinRoom.value?.id }),
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error.message);

    router.push({ path: `/play/${dataJoinRoom.value?.id}` });
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
</script>
