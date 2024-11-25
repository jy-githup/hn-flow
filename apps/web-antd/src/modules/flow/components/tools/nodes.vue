<script setup lang="ts" name="tools-nodes">
import type { FlowNode } from '../../types';

import type { PropType } from 'vue';
import { computed, ref } from 'vue';

import { Search } from '@element-plus/icons-vue';
import { isEmpty } from 'lodash-es';

import { useCool } from '#/cool';

import { useFlow } from '../../hooks';
import ToolsIcon from './icon.vue';

const props = defineProps({
  node: {
    type: Object as PropType<FlowNode>,
    default: () => ({}),
  },
  handle: String,
  edgeId: String,
  isChange: Boolean,
  isInsert: Boolean,
  isAutoInsert: Boolean,
  disabled: Boolean,
});

const emit = defineEmits(['select', 'hide']);

const { refs, setRefs, mitt } = useCool();
const flow = useFlow();

// 是否可见
const visible = ref(false);

// 关键字
const keyWord = ref('');

// 列表
const list = computed(() => flow.getGroup(keyWord.value));

// 节点选择
async function select(node: FlowNode) {
  // 源
  const source = props.node;

  // 目标
  let target: FlowNode | undefined;

  // 更新节点
  if (props.isChange) {
    if (node) {
      flow.updateNode(source.id!, {
        ...node,
        position: source.position,
      });
    }

    target = flow.findNode(source.id!);
  }
  // 空白处插入
  else if (props.isAutoInsert) {
    const arr = flow.nodes.map((e) => {
      return (
        (e.position?.y || 0) +
        (document.querySelector(`div[data-id="${e.id}"]`)?.clientHeight || 0)
      );
    });

    const y = Math.max(...arr, 0) + flow.offset.g;

    target = flow.addNode(node.type!, {
      position: {
        x: 100,
        y,
      },
    });
  }
  // 中间插入节点
  else if (props.isInsert) {
    // 原来的子节点
    const children = flow.childrenNodes(source.id!);

    // 原来的子所有节点
    const allChildren = flow.childrenAllNodes(source.id!, props.handle);

    // 原连接线
    const edge = flow.findEdge(props.edgeId!);

    // 先删除
    if (edge) {
      flow.removeEdges(edge);
    }

    // 插入的节点
    target = flow.insertNode(node.type!, source, {});

    if (target) {
      const h = target.handle || {};

      // 为空，或者只有一个输出点
      if (!h.next || h.next?.length == 1) {
        // 原来的与插入的连接
        flow.addEdge({
          source: source!.id!,
          target: target.id!,
          sourceHandle: edge?.sourceHandle || 'source',
          targetHandle: 'target',
        });

        if (h.source !== false) {
          // 插入的与原来的子节点连接
          children.forEach((e) => {
            if (edge?.target == e.id) {
              flow.addEdge({
                source: target!.id!,
                target: e!.id!,
                sourceHandle: h.next?.[0]?.value || 'source',
                targetHandle: 'target',
              });
            }
          });
        }
      }
    }

    // 原所有子节点位置后移
    allChildren.forEach((e) => {
      flow.updateNode(e!.id!, {
        position: {
          x: (e?.position?.x || 0) + flow.offset.x,
          y: e?.position?.y,
        },
      });
    });
  } else {
    // 头部添加
    if (props.handle == 'target') {
      target = flow.addNode(node.type!, {
        position: source.position,
      });

      // 所有子节点，包含当前
      const allChildren = [source, ...flow.childrenAllNodes(source.id!)];

      // 为空，或者只有一个输出点
      if (!target?.handle?.next || target?.handle?.next?.length == 1) {
        // 输出点
        const sourceHandle = target?.handle?.next?.[0]?.value || 'source';

        // 插入的与原来的连接
        flow.addEdge({
          source: target!.id!,
          target: source!.id!,
          sourceHandle,
          targetHandle: 'target',
        });
      }

      // 子节点后移
      allChildren.forEach((e) => {
        flow.updateNode(e!.id!, {
          position: {
            x: (e?.position?.x || 0) + flow.offset.x,
            y: e?.position?.y,
          },
        });
      });
    }

    // 尾部添加
    else {
      target = flow.insertNode(node.type!, source);

      flow.addEdge({
        source: source!.id!,
        target: target!.id!,
        sourceHandle: props.handle || 'source',
        targetHandle: 'target',
      });
    }
  }

  // 设置选中
  flow.setNode(target);

  // 视图定位
  flow.setViewportByNode(target!);

  // 关闭弹窗
  refs.popover.hide();

  // 打开表单
  // await sleep(100);
  // mitt.emit("flow.openForm", target);

  emit('select', { source, target });
}

function onShow() {
  visible.value = true;
}

function onHide() {
  visible.value = false;
  emit('hide');
}

defineExpose({
  visible,
});
</script>

<template>
  <el-popover
    :ref="setRefs('popover')"
    :disabled="disabled"
    :offset="5"
    :persistent="false"
    placement="right-start"
    popper-class="cl-flow__popper not-padding"
    trigger="click"
    width="280px"
    @hide="onHide"
    @show="onShow"
  >
    <template #reference>
      <slot></slot>
    </template>

    <div class="tools-nodes">
      <div class="search">
        <el-input
          v-model="keyWord"
          :prefix-icon="Search"
          clearable
          placeholder="搜索节点"
        />
      </div>

      <el-scrollbar :max-height="400">
        <div class="wrap">
          <div v-for="a in list" :key="a.label" class="group">
            <p v-if="a.label" class="label">{{ a.label }}</p>

            <div class="list">
              <el-popover
                v-for="b in a.children"
                :key="b.label"
                :hide-after="0"
                :offset="10"
                :persistent="false"
                :popper-style="{
                  padding: '0px',
                }"
                placement="right"
                popper-class="cl-flow__popper"
                width="200px"
              >
                <template #reference>
                  <div class="item" @click="select(b)">
                    <ToolsIcon :color="b.color" :name="b.icon" :size="22" />
                    <span>{{ b.label }}</span>
                  </div>
                </template>

                <div class="tools-nodes__description">
                  <div class="inner">
                    <ToolsIcon :color="b.color" :name="b.icon" :size="22" />
                    <span>{{ b.label }}</span>
                  </div>

                  <p class="desc">{{ b.description || '暂无描述' }}</p>
                </div>
              </el-popover>
            </div>
          </div>

          <div v-if="isEmpty(list)" class="empty">未找到匹配项</div>
        </div>
      </el-scrollbar>
    </div>
  </el-popover>
</template>

<style lang="scss" scoped>
.tools-nodes {
  .search {
    padding: 5px;

    :deep(.el-input__wrapper) {
      box-shadow: none;
      background-color: var(--el-fill-color-light);
    }
  }

  .wrap {
    padding: 5px 0;

    .group {
      line-height: 1;
      padding: 0 5px;

      .label {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        padding: 10px;
      }

      .list {
        .item {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 10px;
          border-radius: 6px;

          span {
            font-size: 13px;
            margin-left: 8px;
            color: var(--el-text-color-regular);
          }

          &:hover {
            background-color: var(--el-fill-color-light);
          }
        }
      }
    }

    .empty {
      padding: 10px 15px;
      line-height: 1;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;
    }
  }
}

.tools-nodes__description {
  .inner {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 10px;
    border-radius: 6px;

    span {
      font-size: 13px;
      margin-left: 8px;
      color: var(--el-text-color-regular);
    }
  }

  .desc {
    font-size: 12px;
    padding: 0 10px 10px 10px;
  }
}
</style>
