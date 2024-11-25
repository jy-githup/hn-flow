<script setup lang="ts" name="tools-node-add">
import type { FlowNode } from '../../types';

import type { PropType } from 'vue';
import { computed, reactive, ref } from 'vue';

import { isEmpty } from 'lodash-es';

import { useCool } from '#/cool';

import { useFlow } from '../../hooks';
import ToolsIcon from './icon.vue';

const props = defineProps({
  node: {
    type: Object as PropType<FlowNode>,
    default: () => ({}),
  },
});

const emit = defineEmits(['select', 'hide']);

const { mitt } = useCool();
const flow = useFlow();

// 关键字
const keyWord = ref('');

// 是否可见
const visible = ref(false);

// 列表
const list = computed(() => flow.getGroup(keyWord.value));

// 节点选择
async function select(node: FlowNode) {
  // 源
  const source = props.node;

  // 目标
  let target: FlowNode | undefined;

  // 空白处插入
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

  // 设置选中
  flow.setNode(target);

  // 视图定位
  flow.setViewportByNode(target!);

  // 打开表单
  // await sleep(100);
  // mitt.emit("flow.openForm", target);

  emit('select', { source, target });
}

// 拖放
const drag = reactive({
  startX: 0,
  startY: 0,
  el: null as HTMLElement | null,
});

function mousedown(e: MouseEvent, node: FlowNode) {
  const el = document.getElementById(`cl-flow__tools-node-add--${node.type}`);

  if (el) {
    const elRect = el.getBoundingClientRect();
    const wRect = document
      .querySelector('.cl-flow .tools-node-add')
      ?.getBoundingClientRect();

    if (wRect && elRect) {
      drag.startX = e.pageX - elRect.left + wRect.left - 10;
      drag.startY = e.pageY - elRect.top + wRect.top - 55;
    }

    drag.el = el.cloneNode(true) as HTMLElement;
  }

  document.addEventListener('mousemove', mousemove);
  document.addEventListener('mouseup', mouseup);
}

function mousemove(e: MouseEvent) {
  if (drag.el) {
    if (!drag.el.className.includes('is-drag')) {
      drag.el.className += ' is-drag';
      document.querySelector('.cl-flow .vue-flow')?.append(drag.el);
    }

    drag.el.style.left = `${e.pageX - drag.startX}px`;
    drag.el.style.top = `${e.pageY - drag.startY}px`;
  }
}

function mouseup(e: MouseEvent) {
  if (drag.el && drag.el.className.includes('is-drag')) {
    const [x, y] = flow.viewPx(e.pageX - drag.startX, e.pageY - drag.startY);

    flow.addNode(drag.el.dataset.type!, {
      position: {
        x,
        y,
      },
    });

    drag.el.remove();
  }

  document.removeEventListener('mousemove', mousemove);
  document.removeEventListener('mouseup', mouseup);
}
</script>

<template>
  <div
    :class="{
      expand: visible,
    }"
    class="tools-node-add__btn"
    @click="visible = !visible"
  >
    <cl-svg name="add2" />
  </div>

  <div
    :class="{
      show: visible,
    }"
    class="tools-node-add"
  >
    <el-scrollbar height="100%">
      <div class="wrap">
        <div v-for="a in list" :key="a.label" class="group">
          <p v-if="a.label" class="label">{{ a.label }}</p>

          <div class="list">
            <div
              v-for="b in a.children"
              :id="`cl-flow__tools-node-add--${b.type}`"
              :key="b.label"
              :data-type="b.type"
              class="cl-flow__tools-node-add-item item"
              @mousedown="(e) => mousedown(e, b)"
            >
              <ToolsIcon :color="b.color" :name="b.icon" :size="30" />

              <div class="det">
                <p>{{ b.label }}</p>
                <p>{{ b.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isEmpty(list)" class="empty">未找到匹配项</div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style lang="scss">
.cl-flow__tools-node-add-item {
  user-select: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 6px;
  width: 250px;
  box-sizing: border-box;

  .tools-icon {
    font-size: 18px;
  }

  .det {
    margin-left: 10px;

    p {
      font-size: 13px;
      color: var(--el-text-color-regular);
      line-height: 1.5;

      &:last-child {
        font-size: 10px;
        color: var(--el-color-info);
      }
    }
  }

  &.is-drag {
    position: absolute;
    background-color: var(--el-bg-color);
    z-index: 99;
    box-shadow: 0px 0 10px 1px rgba(16, 24, 40, 0.05);
  }

  &:not(.is-drag):hover {
    background-color: var(--el-fill-color-light);
  }
}
</style>

<style lang="scss" scoped>
.tools-node-add {
  position: absolute;
  left: 10px;
  top: 50px;
  z-index: 10;
  background-color: var(--el-bg-color);
  border-radius: 6px;
  height: calc(100% - 50px);
  width: 260px;
  transform: translateX(-400px);
  transition: all 0.3s;
  box-shadow: 0px 0 10px 1px rgba(16, 24, 40, 0.05);

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
    }

    .empty {
      padding: 10px 15px;
      line-height: 1;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;
    }
  }

  &.show {
    transform: translateX(0);
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 10px;
    top: 55px;
    font-size: 30px;
    color: var(--el-color-primary);
    border-radius: 100%;
    z-index: 11;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      color: var(--el-color-primary-light-1);
    }

    &.expand {
      transform: translate(225px, 0) rotate(225deg);
    }
  }
}
</style>
