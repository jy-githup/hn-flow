<script setup lang="tsx" name="tools-context-menu">
import { defineComponent, ref } from 'vue';

import { ContextMenu } from '@cool-vue/crud';
import {
  CaretRight,
  CopyDocument,
  Delete,
  DocumentCopy,
  Grid,
  Plus,
} from '@element-plus/icons-vue';
import { NodeMouseEvent } from '@vue-flow/core';
import { ElMessageBox } from 'element-plus';

import { useCool } from '#/cool';

import { useFlow } from '../../hooks';
import ToolsNodes from './nodes.vue';

const { mitt } = useCool();
const flow = useFlow();

// 右键菜单
const PaneContextMenu = ref<ClContextMenu.Ref>();

// 节点添加图标
const PlusIcon = defineComponent({
  components: {
    Plus,
    ToolsNodes,
  },

  setup() {
    return () => {
      return (
        <div>
          <plus />

          <tools-nodes is-auto-insert onHide={close}>
            <span class="cl-flow__context-menu-btn"></span>
          </tools-nodes>
        </div>
      );
    };
  },
});

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
        suffixIcon: CopyDocument,
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
        suffixIcon: CaretRight,
        callback(done) {
          mitt.emit('flow.runOpen');
          done();
        },
      },
      {
        label: '添加节点',
        suffixIcon: PlusIcon,
        callback() {
          // @ts-ignore
          document.querySelector('.cl-flow__context-menu-btn')?.click();
        },
      },
      {
        label: '整理节点',
        suffixIcon: Grid,
        callback(done) {
          flow.arrange();
          done();
        },
      },
      {
        label: '清空节点',
        suffixIcon: Delete,
        callback(done) {
          ElMessageBox.confirm('请确认是否清空所有节点？', '提示', {
            type: 'warning',
          })
            .then(() => {
              flow.clear();
            })
            .catch(() => null);

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
        suffixIcon: DocumentCopy,
        hidden: node.type == 'start',
        callback(done) {
          flow.setCopyNode(node);
          done();
        },
      },
      {
        label: '删除',
        suffixIcon: Delete,
        hidden: node.type == 'start',
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
