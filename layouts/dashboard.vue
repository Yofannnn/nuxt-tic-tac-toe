<template>
  <div class="flex min-h-screen w-full flex-col bg-muted/40">
    <aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav class="flex flex-col justify-start items-center gap-4 px-2 sm:py-5 h-full">
        <TooltipProvider v-for="(navigation, index) in navigationLinks" :key="index">
          <Tooltip>
            <TooltipTrigger as-child>
              <NuxtLink
                :to="navigation.href"
                :class="
                  cn(
                    'flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground size-9 md:size-8',
                    route.path === navigation.href && 'text-foreground'
                  )
                "
              >
                <component :is="navigation.icon" class="h-5 w-5" />
                <span class="sr-only">{{ navigation.name }}</span>
              </NuxtLink>
            </TooltipTrigger>
            <TooltipContent>
              <p>{{ navigation.name }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
      <nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <NuxtLink
                to="/dashboard/settings"
                :class="
                  cn(
                    'flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground size-9 md:size-8',
                    route.path === '/dashboard/settings' && 'text-foreground'
                  )
                "
              >
                <GearIcon class="size-5" />
                <span class="sr-only">Settings </span>
              </NuxtLink>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <a
                href="#"
                @click="
                  (e) => {
                    isLogoutDialogOpen = true;
                    e.preventDefault();
                  }
                "
              >
                <ExitIcon class="size-5 text-muted-foreground hover:text-foreground cursor-pointer" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Log Out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
    <div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
      <header
        class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
      >
        <h1 class="text-xl font-semibold">{{ title && title?.charAt(0).toUpperCase() + title?.slice(1) }}</h1>
        <div class="relative ml-auto flex-1 md:grow-0">
          <MagnifyingGlassIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]" />
        </div>
        <div class="p-1.5 rounded-full border border-foreground">
          <BellIcon class="size-4" />
        </div>
        <Sheet>
          <SheetTrigger as-child>
            <Button size="icon" variant="outline" class="sm:hidden">
              <HamburgerMenuIcon class="h-5 w-5" />
              <span class="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="sm:max-w-xs">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription />
            </SheetHeader>
            <nav class="grid gap-6 text-lg font-medium">
              <SheetClose as-child v-for="(navigation, index) in navigationLinks" :key="index">
                <NuxtLink
                  :to="navigation.href"
                  :class="
                    cn(
                      'flex items-center gap-4 px-2.5 hover:text-foreground',
                      route.path === navigation.href ? 'text-foreground' : 'text-muted-foreground'
                    )
                  "
                >
                  <component :is="navigation.icon" class="h-5 w-5" />
                  {{ navigation.name }}
                </NuxtLink>
              </SheetClose>
              <SheetClose as-child>
                <NuxtLink
                  to="/dashboard/settings"
                  :class="
                    cn(
                      'flex items-center gap-4 px-2.5 hover:text-foreground text-muted-foreground',
                      route.path === '/dashboard/settings' && 'text-foreground'
                    )
                  "
                >
                  <GearIcon class="size-5" />
                  Settings
                </NuxtLink>
              </SheetClose>
              <SheetClose as-child>
                <span
                  class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  @click="isLogoutDialogOpen = true"
                >
                  <ExitIcon class="size-5" />
                  <span>Log Out</span>
                </span>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </header>
      <slot />
      <AlertDialog :open="isLogoutDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel @click="isLogoutDialogOpen = false">Cancel</AlertDialogCancel>
            <AlertDialogAction @click="handleLogout">Log Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BellIcon, ChatBubbleIcon, ExitIcon, GearIcon, HamburgerMenuIcon, HomeIcon, MagnifyingGlassIcon, PersonIcon } from '@radix-icons/vue';
import { cn } from '~/lib/utils';

const route = useRoute();
const title = route.name?.toString().split('-')[1];
const isLogoutDialogOpen = ref(false);

function handleLogout() {
  isLogoutDialogOpen.value = false;
}

const navigationLinks = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: PersonIcon },
  { name: 'Chat', href: '/dashboard/chat', icon: ChatBubbleIcon },
];
</script>
