<template>
  <p>{{ $route.params.roomId }}</p>
</template>

<script>
const route = useRoute();
const roomId = route.params.roomId;
</script>
