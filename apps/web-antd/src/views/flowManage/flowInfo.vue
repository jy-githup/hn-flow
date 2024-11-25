<script setup lang="ts">
import { useRoute } from 'vue-router';

import hnFlow from '#/components/flow/index.vue';

const route = useRoute();

const flowId = route.query?.id || '0';

const flowLabel = route.query?.label || '';
</script>

<template>
  <hnFlow :flow-id="flowId" :flow-label="flowLabel" />
</template>

<style scoped lang="scss"></style>
