<script setup lang="ts" name="tools-edge-button">
import { computed } from 'vue';

import { CarbonCLose } from '@vben/icons';

import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core';

import { useCool } from '#/hooks/hooks/index';
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

const { refs, setRefs } = useCool();
const flow = useFlow();

const path = computed(() => getBezierPath(props as any));

const edge = computed(() => {
  return flow.findEdge(props.id);
});

const node = computed(() => {
  return flow.nodes.find((e) => e.id == edge.value?.source);
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
      <!-- <tools-nodes
				:ref="setRefs('toolsNodes')"
				:node="node"
				:edge-id="id"
				:handle="edge?.sourceHandle!"
				is-insert
			>
				<el-icon
					class="icon"
					:class="{
						active: refs.toolsNodes?.visible,
						show: data?.show
					}"
				>
					<circle-plus-filled />
				</el-icon>
			</tools-nodes> -->

      <!--      <el-icon-->
      <!--        :class="{-->
      <!--          show: data?.show,-->
      <!--        }"-->
      <!--        class="icon"-->
      <!--        @click="del"-->
      <!--      >-->
      <!--    -->
      <!--      </el-icon>-->
      <CarbonCLose class="icon" @click="del" />
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
