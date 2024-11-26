<script setup lang="ts">
import type { FlowNode } from '#/types/flow';

import { computed, reactive, ref } from 'vue';

import { ZondiconsAddSolid } from '@vben/icons';

import { isEmpty } from 'lodash';

// import { useCool } from '#/hooks/hooks/index';
import { useFlow } from '#/hooks/hooks/userFlow';

// const props = defineProps({
//   node: {
//     type: Object as PropType<FlowNode>,
//     default: () => ({}),
//   },
// });

// const emit = defineEmits(['select', 'hide']);

// const { mitt } = useCool();

// 关键字
// const keyWord = ref('');
const flow = useFlow();

// 关键字
const keyWord = ref('');

// 是否可见
const visible = ref(false);

// 列表
const list = computed(() => flow.getGroup(keyWord.value));

// 拖放
const drag = reactive({
  startX: 0,
  startY: 0,
  el: null as HTMLElement | null,
});

function mousedown(e: MouseEvent, node: FlowNode) {
  const el = document.querySelector(`#cl-flow__tools-node-add--${node.type}`);
  if (el) {
    const elRect = el.getBoundingClientRect();
    const wRect = document
      .querySelector('.cl-flow .node-add')
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
  <div class="flowNodeAddBox">
    <div
      :class="{
        expand: visible,
      }"
      class="node-add__btn"
      @click="visible = !visible"
    >
      <ZondiconsAddSolid class="size-15" color="#1677ff" />
    </div>
    <div
      :class="{
        show: visible,
      }"
      class="node-add"
    >
      <div></div>
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
              <div
                :style="`background: ${b.color || 'rgb(64, 158, 255)'};`"
                class="iconCompontentBox"
              >
                <component
                  :is="b.icon"
                  class="size-4"
                  color="#ffffff"
                  style="fill: currentColor"
                />
              </div>
              <div class="det">
                <p>{{ b.label }}</p>
                <p>{{ b.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isEmpty(list)" class="empty">未找到匹配项</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" name="node-add">
.flowNodeAddBox {
  //.node-add__btn {
  //  position: absolute;
  //  top: 50px;
  //}
  .node-add {
    position: absolute;
    top: 50px;
    left: 10px;
    z-index: 10;
    width: 260px;
    height: calc(100% - 50px);
    background-color: hsl(var(--background));
    border-radius: 6px;
    box-shadow: 0 0 10px 1px rgb(16 24 40 / 5%);
    transition: all 0.3s;
    transform: translateX(-400px);

    .wrap {
      padding: 5px 0;

      .group {
        padding: 0 5px;
        line-height: 1;

        .label {
          padding: 10px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }

      .empty {
        padding: 10px 15px;
        font-size: 12px;
        line-height: 1;
        color: var(--el-text-color-secondary);
        text-align: center;
      }
    }

    &.show {
      transform: translateX(0);
    }

    &__btn {
      position: absolute;
      top: 55px;
      left: 10px;
      z-index: 11;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      color: var(--el-color-primary);
      cursor: pointer;
      border-radius: 100%;
      transition: transform 0.3s;

      &:hover {
        color: var(--el-color-primary-light-1);
      }

      &.expand {
        transform: translate(225px, 0) rotate(225deg);
      }
    }
  }
}
</style>

<style lang="scss">
.cl-flow__tools-node-add-item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 250px;
  padding: 10px;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;

  .tools-icon {
    font-size: 18px;
  }

  .det {
    margin-left: 10px;
    flex: 1;

    p {
      font-size: 13px;
      line-height: 1.5;
      color: var(--el-text-color-regular);

      &:last-child {
        font-size: 10px;
        color: var(--el-color-info);
      }
    }
  }

  &.is-drag {
    position: absolute;
    z-index: 99;
    background-color: #2c3142;
    box-shadow: 0 0 10px 1px rgb(16 24 40 / 5%);
  }

  &:not(.is-drag):hover {
    background-color: var(--el-fill-color-light);
  }
}
.iconCompontentBox {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #ffffff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}
</style>
