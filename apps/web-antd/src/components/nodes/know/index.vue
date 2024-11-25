<script lang="ts" setup name="node-know">
import type { FlowNode } from '#/types/flow/index';

import { type PropType } from 'vue';

import { isEmpty } from 'lodash-es';

import List from './form/list.vue';

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
  <div
    v-if="node?.data && !isEmpty(node.data.options.knowIds) && !focus"
    class="node-know"
  >
    <List v-model="node.data.options.knowIds" />
  </div>
</template>

<style lang="scss" scoped>
.node-know {
  padding-bottom: 15px;
}
</style>
