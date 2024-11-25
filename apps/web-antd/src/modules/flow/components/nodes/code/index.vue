<script lang="ts" setup name="node-code">
import type { FlowNode } from '#/types/flow/index';

import type { PropType } from 'vue';

const props = defineProps({
  node: {
    type: Object as PropType<FlowNode>,
    default: () => ({}),
  },
  // 节点是否聚焦
  focus: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="node-code"></div>
</template>
