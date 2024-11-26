<script setup lang="ts">
// import { AvatarImage, type AvatarImageProps } from 'radix-vue';
import { type AvatarImageProps } from 'radix-vue';

const props = defineProps<AvatarImageProps>();
</script>

<template>
<!--  <AvatarImage v-bind="props" class="h-full w-full object-cover" />-->
    <img class="h-full w-full object-cover" src="./logo.png" />
</template>
