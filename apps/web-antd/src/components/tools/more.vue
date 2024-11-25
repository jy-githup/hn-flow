<script setup lang="ts" name="tools-more">
import type { FlowNode } from '#/types/flow/index';

import { type PropType } from 'vue';

import { cloneDeep } from 'lodash-es';

import { useCool } from '#/hooks/hooks/index';
import { useFlow } from '#/hooks/hooks/userFlow';

const props = defineProps({
  node: {
    type: Object as PropType<FlowNode>,
    default: () => ({}),
  },
});

const { refs, setRefs } = useCool();
const flow = useFlow();

const list = [
  {
    label: '克隆',
    value: 'clone',
  },
  {
    label: '复制',
    value: 'copy',
  },
  {
    label: '删除',
    value: 'remove',
    desc: 'Del',
    hidden: ['end', 'start'].includes(props.node.type!),
  },
];

function toCommand(value: string) {
  const node = cloneDeep(props.node);

  switch (value) {
    case 'clone': {
      const { x = 0, y = 0 } = node.position || {};

      flow.addNode(node.type!, {
        ...node,
        position: {
          x: x + 340,
          y,
        },
      });
      break;
    }

    case 'copy': {
      flow.setCopyNode(node);
      break;
    }

    case 'remove': {
      flow.removeNodes(node);
      break;
    }
  }

  refs.popover.hide();
}
</script>

<template>
  <el-popover
    :ref="setRefs('popover')"
    trigger="click"
    width="200px"
    placement="bottom-start"
    popper-class="cl-flow__popper"
    :offset="5"
  >
    <template #reference>
      <slot></slot>
    </template>

    <div class="tools-more">
      <div class="list">
        <template v-for="(item, index) in list" :key="index">
          <div class="item" @click="toCommand(item.value)" v-if="!item.hidden">
            <span class="label">{{ item.label }}</span>
            <span class="desc" v-if="item.desc">{{ item.desc }}</span>
          </div>
        </template>
      </div>
    </div>
  </el-popover>
</template>

<style lang="scss" scoped>
.tools-more {
  .list {
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 30px;
      cursor: pointer;
      border-radius: 6px;
      padding: 0 10px;

      .label {
        font-size: 12px;
      }

      .desc {
        color: var(--el-color-info);
        font-size: 10px;
      }

      &.active {
        color: var(--el-color-primary);
      }

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
  }
}
</style>
