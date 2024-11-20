<script setup lang="ts" name="node-start">
import type { FlowNode } from '#/types/flow/index';

import { type PropType } from 'vue';

import { isEmpty } from 'lodash-es';

import ToolsFields from '#/components/tools/fields.vue';

defineProps({
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
  <div v-if="!isEmpty(node?.data?.inputParams) && !focus" class="node-start">
    <ToolsFields v-model="node.data!.inputParams" disabled />
  </div>
</template>

<style lang="scss" scoped>
.node-start {
  padding-bottom: 15px;
}
</style>
