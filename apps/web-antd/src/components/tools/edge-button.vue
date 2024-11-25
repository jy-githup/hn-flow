<script setup lang="ts" name="tools-edge-button">
import { computed } from 'vue';

import { CircleCloseFilled } from '@element-plus/icons-vue';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core';

import { useFlow } from '#/hooks/hooks/userFlow';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  sourceX: {
    type: Number,
    required: true,
  },
  sourceY: {
    type: Number,
    required: true,
  },
  targetX: {
    type: Number,
    required: true,
  },
  targetY: {
    type: Number,
    required: true,
  },
  sourcePosition: {
    type: String,
    required: true,
  },
  targetPosition: {
    type: String,
    required: true,
  },
  markerEnd: {
    type: String,
    required: false,
  },
  style: {
    type: Object,
    required: false,
  },
  data: Object,
});

const flow = useFlow();

const path = computed(() => getBezierPath(props as any));

const edge = computed(() => {
  return flow.findEdge(props.id);
});

const node = computed(() => {
  return flow.nodes.find((e) => e.id === edge.value?.source);
});

function del() {
  const edge = flow.findEdge(props.id);

  if (edge) {
    flow.removeEdges(edge);
  }
}
</script>

<template>
  <BaseEdge :id="id" :marker-end="markerEnd" :path="path[0]" :style="style" />

  <EdgeLabelRenderer>
    <div
      :style="{
        height: '16px',
        width: '16px',
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
      class="nodrag nopan"
    >
      <el-icon
        :class="{
          show: data?.show,
        }"
        class="icon"
        @click="del"
      >
        <CircleCloseFilled />
      </el-icon>
    </div>
  </EdgeLabelRenderer>
</template>

<style lang="scss" scoped>
.icon {
  display: none;
  color: var(--el-color-danger);
  font-size: 16px;
  cursor: pointer;
  background-color: var(--el-bg-color);
  border-radius: 100%;
  transition: transform 0.15s;

  &.show {
    display: inline-block;
  }

  &.active,
  &:hover {
    transform: scale(1.3);
    display: inline-block;
  }
}
</style>
