<script lang="ts" setup name="node-code">
import type { FlowNode } from '#/types/flow/index';

import type { PropType } from 'vue';

// eslint-disable-next-line no-unused-vars,unused-imports/no-unused-vars
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
