import type { FlowNode } from '../types/index';

import { ref } from 'vue';

import { useVueFlow } from '@vue-flow/core';

import { useCool } from '#/hooks';

const { mitt } = useCool();

// const offset = {
//   x: 400,
//   y_t: -10,
//   y_b: 50,
//   g: 150,
// };

export const useFlow = () => {
  const vueFlow = useVueFlow();

  // 当前选中的节点
  const node = ref<FlowNode>();

  // 清空节点
  function clearNode() {
    mitt.emit('flow.clearNode');
    setTimeout(() => {
      node.value = undefined;
    }, 0);
  }

  // 启用拖拽
  function enableDrag() {
    vueFlow.nodesDraggable.value = true;
    vueFlow.panOnDrag.value = true;
  }
  return {
    enableDrag,
    clearNode,
  };
};
