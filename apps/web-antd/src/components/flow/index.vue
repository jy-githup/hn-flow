<script setup lang="ts">
import { Background } from '@vue-flow/background';
import { VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';

import FlowHeader from '#/components/flowHeader/index.vue';
import FlowNodeAdd from '#/components/flowNodeAdd/index.vue';

// import ToolsCard from './tools/card.vue';
// import ToolsContextMenu from './tools/context-menu.vue';
// import ToolsControls from './tools/controls.vue';
// import ToolsEdgeButton from './tools/edge-button.vue';
// import ToolsHead from './tools/head.vue';
// import ToolsNodeAdd from './tools/node-add.vue';
// import ToolsPanel from './tools/panel/index.vue';
// import ToolsSelection from './tools/selection.vue';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';
import '@vue-flow/node-resizer/dist/style.css';

// const props = defineProps({
//   flowId: {
//     type: Number,
//     default: undefined,
//   },
// });

// const flow = useFlow();

// 空白处点击
const onPaneClick = () => {
  // flow.enableDrag();
  // flow.clearNode();
};
</script>

<template>
  <div id="cl-flow" class="cl-flow">
    <VueFlow
      :default-viewport="{ zoom: 1.0 }"
      :max-zoom="2"
      :min-zoom="0.25"
      @pane-click="onPaneClick"
    >
      <!-- 自定义顶部栏 -->
      <FlowHeader />

      <!-- 自定义选择框 -->
      <!-- <ToolsSelection /> -->

      <!-- 自定义面板 -->
      <!-- <ToolsPanel /> -->

      <!-- 自定义节点添加面板 -->
      <FlowNodeAdd />

      <!-- 自定义右键菜单 -->
      <!-- <ToolsContextMenu :ref="setRefs('contextMenu')" /> -->

      <!-- 自定义控制器 -->
      <!-- <ToolsControls /> -->

      <!-- 自定义连接线按钮 -->
      <!-- <template
        #edge-button="{
          id,
          sourceX,
          sourceY,
          targetX,
          targetY,
          sourcePosition,
          targetPosition,
          markerEnd,
          style,
          data,
        }"
      >
        <ToolsEdgeButton
          :id="id"
          :data="data"
          :marker-end="markerEnd"
          :source-position="sourcePosition"
          :source-x="sourceX"
          :source-y="sourceY"
          :style="style"
          :target-position="targetPosition"
          :target-x="targetX"
          :target-y="targetY"
        />
      </template> -->

      <!-- 自定义节点 -->
      <!-- <template
        v-for="item in flow.CustomNodes"
        :key="item.name"
        #[item.name!]="{ id }"
      >
        <ToolsCard :node-id="id" />
      </template> -->

      <!-- 背景 -->
      <Background :gap="16" pattern-color="#aaa" />

      <!-- 小图 -->
      <MiniMap :height="100" :width="150" position="bottom-right" />
    </VueFlow>
  </div>
</template>

<style lang="scss" scoped>
.cl-flow {
  height: 100%;

  .vue-flow {
    height: 100%;
  }

  .vue-flow__minimap {
    right: 10px;
    bottom: 50px;
    height: 100px;
    margin: 0;
    overflow: hidden;
    border-radius: 6px;
    box-shadow: 0 0 6px 1px rgb(16 24 40 / 8%);
  }

  .vue-flow__node:has(.is-moving) {
    transition: transform 0.1s;
  }
}
</style>
