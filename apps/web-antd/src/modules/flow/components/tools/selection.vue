<script setup lang="ts" name="node-selection">
import type { FlowNode } from '../../types';

import { computed, onMounted, onUnmounted, reactive } from 'vue';

import { isEmpty } from 'lodash-es';

import { useFlow } from '../../hooks';

const flow = useFlow();

const mouse = reactive({
  show: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  x: 0,
  y: 0,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
});

const box = reactive({
  show: false,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
});

const boxStyle = computed(() => {
  const { x, y } = flow.viewport;

  return {
    height: `${scale(box.height)}px`,
    width: `${scale(box.width)}px`,
    left: `${scale(box.left) + x}px`,
    top: `${scale(box.top) + y}px`,
  };
});

function scale(v: number) {
  const { zoom } = flow.viewport;
  return v * zoom;
}

function clear() {
  mouse.show = false;
  mouse.height = 0;
  mouse.width = 0;
  mouse.endX = 0;
  mouse.endY = 0;

  box.show = false;
  box.height = 0;
  box.width = 0;

  selection.clear();
}

function onmousedown(e: MouseEvent) {
  clear();

  const el = e.target as HTMLElement;

  if (el.nodeName != 'DIV') {
    return false;
  }

  if (!el.className?.includes('vue-flow__container')) {
    return false;
  }

  if (flow.controlMode == 'pointer') {
    mouse.show = true;
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
    mouse.left = mouse.x;
    mouse.top = mouse.y;
    mouse.startX = e.pageX;
    mouse.startY = e.pageY;

    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', onmouseup);
  }
}

function mousemove(e: MouseEvent) {
  if (mouse.show) {
    mouse.width = Math.abs(e.pageX - mouse.startX);
    mouse.height = Math.abs(e.pageY - mouse.startY);

    mouse.top = e.pageY < mouse.startY ? mouse.y - mouse.height : mouse.y;

    mouse.left = e.pageX < mouse.startX ? mouse.x - mouse.width : mouse.x;

    mouse.endY = mouse.top;
    mouse.endX = mouse.left;
  }
}

function onmouseup() {
  const { x: vx, y: vy } = flow.viewport;

  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;

  let isSelected = false;

  flow.nodes.forEach((e) => {
    const { x = 0, y = 0 } = e.position || {};

    // 节点大小
    const nodeEl = document.querySelector(`div[data-id="${e.id}"]`);
    const h = nodeEl?.clientHeight || 0;
    const w = nodeEl?.clientWidth || 0;

    // 检验是否包含
    if (
      nodeEl &&
      mouse.endX < scale(x + w) + vx &&
      mouse.endX + mouse.width > scale(x) + vx &&
      mouse.endY < scale(y + h) + vy &&
      mouse.endY + mouse.height > scale(y) + vy
    ) {
      isSelected = true;

      // 选中
      selection.list.push(e);

      if (!x1 || x1 > x) {
        x1 = x;
      }

      if (!y1 || y1 > y) {
        y1 = y;
      }

      if (!x2 || x2 < x + w) {
        x2 = x + w;
      }

      if (!y2 || y2 < y + h) {
        y2 = y + h;
      }
    }
  });

  // y1 -= 36;

  // 有选中
  if (isSelected) {
    box.show = true;

    box.left = x1;
    box.top = y1;
    box.width = x2 - x1;
    box.height = y2 - y1;
  }

  mouse.show = false;

  document.removeEventListener('mousemove', mousemove);
  document.removeEventListener('mouseup', onmouseup);
}

const selection = reactive({
  list: [] as FlowNode[],
  startX: 0,
  startY: 0,
  x: 0,
  y: 0,
  lock: false,

  clear() {
    selection.list = [];
  },

  onmousedown(e: MouseEvent) {
    e.stopPropagation();

    selection.lock = true;
    selection.startX = e.pageX;
    selection.startY = e.pageY;

    document.addEventListener('mouseup', selection.onmouseup);
    document.addEventListener('mousemove', selection.onmousemove);
  },

  onmousemove(e: MouseEvent) {
    if (selection.lock) {
      const { zoom } = flow.viewport;

      const x = (e.pageX - selection.startX) / zoom;
      const y = (e.pageY - selection.startY) / zoom;

      box.left += x;
      box.top += y;

      selection.list.forEach((e) => {
        flow.updateNode(e.id!, {
          position: {
            x: (e.position?.x || 0) + x,
            y: (e.position?.y || 0) + y,
          },
        });
      });

      selection.startX = e.pageX;
      selection.startY = e.pageY;
    }
  },

  onmouseup() {
    selection.lock = false;

    document.removeEventListener('mouseup', selection.onmouseup);
    document.removeEventListener('mousemove', selection.onmousemove);
  },

  onkeydown(e: KeyboardEvent) {
    if (e.key == 'Delete') {
      if (isEmpty(selection.list)) {
        if (flow.node) {
          flow.removeNodes(flow.node);
        }
      } else {
        flow.removeNodes(selection.list);
      }

      clear();
    }
  },
});

onMounted(() => {
  document
    .querySelector('#cl-flow')
    ?.addEventListener('mousedown', onmousedown);
  document.addEventListener('keydown', selection.onkeydown);
});

onUnmounted(() => {
  document
    .querySelector('#cl-flow')
    ?.removeEventListener('mousedown', onmousedown);
  document.removeEventListener('keydown', selection.onkeydown);
});
</script>

<template>
  <div
    v-show="mouse.show"
    :style="{
      height: `${mouse.height}px`,
      width: `${mouse.width}px`,
      left: `${mouse.left}px`,
      top: `${mouse.top}px`,
    }"
    class="mouse-selection"
  ></div>
  <div
    v-show="box.show"
    :style="[boxStyle]"
    class="node-selection"
    @mousedown="selection.onmousedown"
  ></div>
</template>

<style lang="scss" scoped>
.mouse-selection,
.node-selection {
  position: absolute;
  border: 1px solid var(--el-color-primary);
  background-color: rgba(var(--el-color-primary-rgb), 0.05);
  z-index: 9;
  box-sizing: border-box;
}

.node-selection {
  cursor: move;
}
</style>
