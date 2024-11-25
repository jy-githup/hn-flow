<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import { Background } from '@vue-flow/background';
import { VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { Modal } from 'ant-design-vue';

import FlowHeader from '#/components/flowHeader/index.vue';
import FlowNodeAdd from '#/components/flowNodeAdd/index.vue';
import ToolsCard from '#/components/tools/card.vue';
import ToolsContextMenu from '#/components/tools/context-menu.vue';
import ToolsControls from '#/components/tools/controls.vue';
import ToolsEdgeButton from '#/components/tools/edge-button.vue';
import ToolsPanel from '#/components/tools/panel/index.vue';
import ToolsSelection from '#/components/tools/selection.vue';
import { useCool } from '#/hooks/hooks/index';
import { useFlow } from '#/hooks/hooks/userFlow';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';
import '@vue-flow/node-resizer/dist/style.css';

const props = defineProps({
  flowId: {
    type: String,
    required: true,
  },
  flowLabel: {
    type: String,
    required: true,
  },
});

const { mitt, refs, setRefs } = useCool();
const flow = useFlow();

// 加载完
function onPaneReady() {
  flow.init();
  flow.get(props.flowId!, props.flowLabel!);
}

// 滚轮滚动
function onPaneScroll() {
  refs.contextMenu?.close();
}

// 线连接
function onConnect(connection: Connection) {
  flow.addEdge(connection);
}

// 节点点击
async function onNodeClick(e: NodeMouseEvent) {
  // 如果节点相同则不执行事件
  if (flow.node?.id === e.node.id) return false;
  const node = flow.findNode(String(e.node.id));
  flow.setNode(node);

  // 视图定位
  // flow.setViewportByNode(flow.node!);

  refs.contextMenu?.close();
}

// 节点鼠标移入
function onNodeMouseEnter(e: NodeMouseEvent) {
  flow.activeEdge(e.node.id, true);
}

// 节点鼠标移入
function onNodeMouseLeave(e: NodeMouseEvent) {
  flow.activeEdge(e.node.id, false);
}

// 节点拖拽结束
function onNodeDragStop(e: NodeDragEvent) {
  flow.updateNode(e.node.id, {
    position: e.node.position,
  });
}

// 鼠标移入线
function onEdgeMouseEnter(e: EdgeMouseEvent) {
  e.edge.data.show = true;
}

// 鼠标移出线
function onEdgeMouseLeave(e: EdgeMouseEvent) {
  e.edge.data.show = false;
}

// 空白处点击
function onPaneClick() {
  refs.contextMenu?.close();
  flow.enableDrag();
  flow.clearNode();
}

// 打开表单
function openForm(node: FlowNode) {
  closeForm();

  if (node) {
    flow.updateChildrenPosition('open', node); // 关闭所有

    setTimeout(() => {
      mitt.emit('flow.openForm', node);
    }, 100);
  }
}

// 关闭表单
function closeForm() {
  flow.updateChildrenPosition('close', flow.node!);
  mitt.emit('flow.closeForm', flow.node);
}

// 保存
async function save() {
  await flow.save();
  ElMessage.success('数据保存成功');
}

onMounted(() => {
  mitt.on('flow.setNode', openForm);
  mitt.on('flow.clearNode', closeForm);
  window.addEventListener('beforeunload', save);
});

onUnmounted(() => {
  mitt.off('flow.setNode', openForm);
  mitt.off('flow.clearNode', closeForm);
  window.removeEventListener('beforeunload', save);
});

let lock = false;

onBeforeRouteLeave((to, from, next) => {
  if (lock) {
    return next();
  }

  lock = true;
  Modal.confirm({
    type: 'warning',
    okText: '保存',
    cancelText: '不保存',
    distinguishCancelAndClose: true,
    title: '提示',
    content: '退出前是否保存当前数据？',
    onOk() {
      save();
      next();
    },
    onCancel() {
      next();
    },
    onClose() {
      lock = false;
      next(false);
    },
  });
});
</script>

<template>
  <div id="cl-flow" class="cl-flow">
    <VueFlow
      :default-viewport="{ zoom: 1.0 }"
      :max-zoom="2"
      :min-zoom="0.25"
      @connect="onConnect"
      @edge-mouse-enter="onEdgeMouseEnter"
      @edge-mouse-leave="onEdgeMouseLeave"
      @node-click="onNodeClick"
      @node-context-menu="refs.contextMenu?.onNode"
      @node-drag-stop="onNodeDragStop"
      @node-mouse-enter="onNodeMouseEnter"
      @node-mouse-leave="onNodeMouseLeave"
      @pane-click="onPaneClick"
      @pane-context-menu="refs.contextMenu?.onPane"
      @pane-ready="onPaneReady"
      @pane-scroll="onPaneScroll"
    >
      <!-- 自定义顶部栏 -->
      <FlowHeader />

      <!-- 自定义选择框 -->
      <ToolsSelection />

      <!-- 自定义面板 -->
      <ToolsPanel />

      <!-- 自定义节点添加面板 -->
      <FlowNodeAdd />

      <!-- 自定义右键菜单 -->
      <ToolsContextMenu :ref="setRefs('contextMenu')" />

      <!-- 自定义控制器 -->
      <ToolsControls />

      <!-- 自定义连接线按钮 -->
      <template
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
      </template>

      <!-- 自定义节点 -->
      <template
        v-for="item in flow.CustomNodes"
        :key="item.name"
        #[item.name!]="{ id }"
      >
        <ToolsCard :node-id="id" />
      </template>

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
