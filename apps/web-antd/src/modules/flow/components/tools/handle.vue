<script setup lang="ts" name="tools-handle">
import type { Connection } from '@vue-flow/core';

import type { PropType, StyleValue } from 'vue';
import { computed } from 'vue';

import { Handle, Position } from '@vue-flow/core';

import { useFlow } from '../../hooks';
import ToolsNodes from './nodes.vue';

const props = defineProps({
  nodeId: String,
  id: String,
  position: Object as PropType<StyleValue>,
  type: {
    type: String as PropType<'source' | 'target'>,
    default: 'source',
  },
});

const flow = useFlow();

// 节点数据
const node = computed(() => {
  return flow.findNode(props.nodeId!);
});

// 节点位置
const align = computed(() => {
  return props.type === 'target' ? Position.Left : Position.Right;
});

// 是否连接
const isLink = computed(() => {
  return !!flow.edges.find((e) => {
    if (e[props.type] === props.nodeId) {
      return e[`${props.type}Handle`] === props.id;
    }

    return false;
  });
});

// 连接校验
function onValidConnection({
  targetHandle,
  sourceHandle,
  source,
  target,
}: Connection) {
  // 不能连父节点
  const pNodes = flow.parentAllNodes(source);
  if (pNodes.find((e) => e.id === target)) {
    return false;
  }

  // 不能连自己
  if (target === source) {
    return false;
  }

  // 只能目标节点去连
  if (targetHandle === 'target' && sourceHandle !== 'target') {
    return true;
  }

  return false;
}
</script>

<template>
  <ToolsNodes :disabled="true || isLink" :handle="id" :node="node">
    <el-icon
      :class="[
        `is-${type}`,
        {
          'is-link': isLink,
        },
      ]"
      :style="[position]"
      class="tools-handle"
      @click.stop
    >
      <span class="rod"></span>

      <!-- <circle-plus-filled class="icon" /> -->
      <cl-svg class="icon" name="arrow-right" />

      <Handle
        :id="id"
        :is-valid-connection="onValidConnection"
        :position="align"
        :type="type"
      />
    </el-icon>
  </ToolsNodes>
</template>

<style lang="scss" scoped>
.tools-handle {
  position: absolute;
  color: var(--el-color-primary);
  font-size: 16px;
  transition: transform 0.2s;
  background-color: var(--el-bg-color);
  border-radius: 100%;

  &:hover {
    transform: scale(1.2);
  }

  .vue-flow__handle {
    position: absolute;
    left: -8px;
    top: 8px;
    height: 14px;
    width: 14px;
    opacity: 0;

    &-left {
      left: auto;
      right: -8px;
    }
  }

  &.is-link {
    display: flex;
    align-items: center;
    background-color: transparent;

    .icon {
      display: none;
    }

    .rod {
      width: 0;
      height: 0;
      border-radius: 1px;
      position: absolute;
      border: 5px solid transparent;
      color: var(--el-color-primary);
    }
  }

  &.is-source {
    .rod {
      right: -5px;
      border-left-color: currentColor;
    }
  }

  &.is-target {
    .rod {
      left: -5px;
      border-right-color: currentColor;
    }
  }
}
</style>
