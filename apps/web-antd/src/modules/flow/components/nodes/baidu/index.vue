<script lang="ts" setup name="node-baidu">
import type { FlowNode } from '#/types/flow/index';

import type { PropType } from 'vue';

import { useFlow } from '#/hooks/hooks/userFlow';

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

const flow = useFlow();
</script>

<template>
  <div class="node-baidu"></div>
</template>

<style lang="scss" scoped>
.node-baidu {
}
</style>
