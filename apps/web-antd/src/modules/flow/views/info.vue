<script setup lang="ts" name="flow-info">
import { useCool } from '#/cool';
import ClFlow from '#/modules/flow/components/index.vue';

const { route } = useCool();

const flowId = Number(route.query.id || '0');
</script>

<template>
  <ClFlow :flow-id="flowId" />
</template>
