<script setup lang="ts" name="node-judge">
import type { FlowNode } from '#/types/flow/index';

import { type PropType } from 'vue';

import { useFlow } from '#/hooks/hooks/userFlow';

import ToolsHandle from '#/components/tools/handle.vue';

const props = defineProps({
  node: {
    type: Object as PropType<FlowNode>,
    default: () => ({}),
  },
});

const flow = useFlow();
</script>

<template>
  <div class="node-judge">
    <div class="item">
      <span> 满足 </span>
      <ToolsHandle
        id="source-if"
        :node-id="node.id"
        :position="{
          right: '-24px',
        }"
        type="source"
      />
    </div>
    <div class="item">
      <span> 不满足 </span>
      <ToolsHandle
        id="source-else"
        :node-id="node.id"
        :position="{
          right: '-24px',
        }"
        type="source"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.node-judge {
  padding-bottom: 15px;

  .item {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 5px;
    font-size: 12px;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
