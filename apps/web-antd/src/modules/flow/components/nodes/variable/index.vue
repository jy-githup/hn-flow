<script setup lang="ts" name="node-variable">
import type { FlowNode } from '#/types/flow/index';

import { type PropType } from 'vue';

defineProps({
  node: {
    type: Object as PropType<FlowNode>,
    default: () => ({}),
  },
});
</script>

<template>
  <div class="node-variable"></div>
</template>
