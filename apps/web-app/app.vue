<script setup lang="ts">
  const route = useRoute();
</script>

<template>
  <div class="h-screen max-h-screen">
    <NuxtLayout class="h-screen max-h-screen">
      <NuxtPage />
    </NuxtLayout>
    <NuxtUiNotifications>
      <template #title="{ title }">
        <span v-html="title" />
      </template>
      <template #description="{ description }">
        <span v-html="description" />
      </template>
    </NuxtUiNotifications>
  </div>
</template>
<style>
  .page-enter-active,
  .page-leave-active {
    transition: all 0.1s;
  }
  .page-enter-from,
  .page-leave-to {
    opacity: 0;
    filter: blur(0.15rem);
    filter: grayscale(100%);
  }
  .layout-enter-active,
  .layout-leave-active {
    transition: all 0.1s;
  }
  .layout-enter-from,
  .layout-leave-to {
    opacity: 0;
    filter: blur(0.15rem);
    filter: grayscale(100%);
  }
</style>
