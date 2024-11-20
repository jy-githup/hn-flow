<script setup lang="ts">
import { useRoute } from 'vue-router';

import hnFlow from '#/components/flow/index.vue';

const route = useRoute();

const flowId = Number(route.query?.id || '0');
</script>

<template>
  <hnFlow :flow-id="flowId" />
</template>

<style scoped lang="scss"></style>
