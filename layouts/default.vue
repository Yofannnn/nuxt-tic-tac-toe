<template>
  <div>
    <NavbarComponent v-if="!excludedRoutes.some((excluded) => route.path.startsWith(excluded))" />
    <slot />
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import NavbarComponent from '@/components/fragments/NavbarComponent.vue';

const route = useRoute();
const excludedRoutes = ['/login', '/register', '/play', '/result'];
</script>
