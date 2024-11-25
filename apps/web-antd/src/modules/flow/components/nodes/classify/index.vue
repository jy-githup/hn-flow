<script lang="ts" setup name="node-classify">
import type { FlowNode } from '#/types/flow/index';

import { computed, type PropType } from 'vue';

import ToolsHandle from '#/components/tools/handle.vue';

import ModelText from '../llm/form/model-text.vue';

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

const list = computed(() => {
  return ((props.node.data?.options?.types as any[]) || []).map((e, i) => {
    return {
      content: e,
      value: `source-${i}`,
    };
  });
});
</script>

<template>
  <div class="node-classify">
    <div v-if="!focus" class="model">
      <ModelText :data="node.data?.options?.model" />
    </div>

    <div v-for="(item, index) in list" :key="index" class="item">
      <span class="content">{{ item.content || '未填写内容' }}</span>

      <ToolsHandle
        :id="item.value"
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
.node-classify {
  padding-bottom: 15px;

  .model,
  .item {
    display: flex;
    align-items: center;
    background-color: var(--el-fill-color-light);
    padding: 0 10px;
    border-radius: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .model {
    height: 33px;
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-bottom: 8px;
  }

  .item {
    height: 30px;
    margin-bottom: 4px;
    font-size: 12px;
    position: relative;

    .content {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
