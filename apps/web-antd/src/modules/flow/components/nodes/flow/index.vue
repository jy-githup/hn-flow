<script lang="ts" setup name="node-flow">
import type { FlowNode } from '#/types/flow/index';

import type { PropType } from 'vue';

import Info from './form/info.vue';

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
  <div v-if="node.data?.options.flowId && !focus" class="node-flow">
    <Info :flow-id="node.data?.options.flowId" />
  </div>
</template>

<style lang="scss" scoped>
.node-flow {
  padding-bottom: 15px;
}
</style>
