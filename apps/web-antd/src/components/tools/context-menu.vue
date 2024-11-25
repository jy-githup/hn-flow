<script setup lang="tsx" name="tools-context-menu">
import { ref } from 'vue';

import {
  BiCopy,
  SvgFlowRunIcon,
  IonAdd,
  SvgFlowDeleteIcon,
  MaterialGridOnSharp,
  MingcuteCopyLine,
} from '@vben/icons';

import { ContextMenu } from '@cool-vue/crud';
import { NodeMouseEvent } from '@vue-flow/core';
import { Modal } from 'ant-design-vue';

import { useCool } from '#/hooks/hooks/index';
import { useFlow } from '#/hooks/hooks/userFlow';

const { mitt } = useCool();
const flow = useFlow();

// 右键菜单
const PaneContextMenu = ref<ClContextMenu.Ref>();
// 关闭右键菜单
let closeContextMenu: () => void;

function close() {
  PaneContextMenu.value?.close();
  closeContextMenu?.();
}

// 右键菜单
function onPane(e: MouseEvent) {
  PaneContextMenu.value?.open(e, {
    class: 'cl-flow__context-menu',
    list: [
      {
        label: '粘贴到这里',
        suffixIcon: BiCopy,
        hidden: !flow.copyData,
        callback(done) {
          if (flow.copyData) {
            const { zoom, x, y } = flow.viewport;

            const node = flow.addNode(flow.copyData.type!, {
              ...flow.copyData,
              position: {
                x: (e.layerX - x) / zoom,
                y: (e.layerY - y) / zoom,
              },
            });

            flow.setCopyNode(null);
            flow.setNode(node);
            flow.setViewportByNode(node);
          }

          done();
        },
      },
      {
        label: '运行',
        suffixIcon: SvgFlowRunIcon,
        callback(done) {
          mitt.emit('flow.runOpen');
          done();
        },
      },
      {
        label: '添加节点',
        suffixIcon: IonAdd,
        callback() {
          // @ts-ignore
          document.querySelector('.cl-flow__context-menu-btn')?.click();
        },
      },
      {
        label: '整理节点',
        suffixIcon: MaterialGridOnSharp,
        callback(done) {
          flow.arrange();
          done();
        },
      },
      {
        label: '清空节点',
        suffixIcon: SvgFlowDeleteIcon,
        callback(done) {
          Modal.confirm({
            type: 'warning',
            title: '提示',
            content: '请确认是否清空所有节点？',
            onOk() {
              flow.clear();
            },
          });
          done();
        },
      },
    ],
  });

  e.stopPropagation();
  e.preventDefault();
}

// 节点右键菜单
function onNode({ event, node }: NodeMouseEvent) {
  const e = event as MouseEvent;

  const { close } = ContextMenu.open(e, {
    class: 'cl-flow__context-menu',
    list: [
      {
        label: '复制',
        suffixIcon: MingcuteCopyLine,
        hidden: node.type === 'start',
        callback(done) {
          flow.setCopyNode(node);
          done();
        },
      },
      {
        label: '删除',
        suffixIcon: SvgFlowDeleteIcon,
        hidden: node.type === 'start',
        callback(done) {
          flow.removeNodes(node);
          done();
        },
      },
    ],
  });

  closeContextMenu = close;

  e.stopPropagation();
  e.preventDefault();
}

defineExpose({
  onPane,
  onNode,
  close,
});
</script>

<template>
  <cl-context-menu ref="PaneContextMenu" />
</template>

<style lang="scss">
.cl-flow__context-menu {
  border-radius: 8px;
  padding: 0 5px;

  & > div {
    border-radius: 6px;
    height: 30px;
    font-size: 12px;
    padding: 0 10px;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}
</style>
