<template>
  <div>
    <NavbarComponent v-if="!excludedRoutes.includes(route.path)" />
    <slot />
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import NavbarComponent from '@/components/fragments/NavbarComponent.vue';

const route = useRoute();
const excludedRoutes = ['/login', '/register', '/play', '/result'];
</script>
