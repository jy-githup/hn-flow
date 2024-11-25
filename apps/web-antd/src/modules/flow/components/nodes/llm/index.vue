<script lang="ts" setup name="node-llm">
import type { FlowNode } from '#/types/flow/index';

import { type PropType } from 'vue';

import ModelText from './form/model-text.vue';

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
  <div v-if="!focus" class="node-llm">
    <div class="model">
      <ModelText :data="node.data?.options?.model" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.node-llm {
  padding-bottom: 7px;

  .model {
    display: flex;
    align-items: center;
    background-color: var(--el-fill-color-light);
    padding: 0 10px;
    border-radius: 6px;
    height: 33px;
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-bottom: 8px;
  }
}
</style>
