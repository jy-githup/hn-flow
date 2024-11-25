<script setup lang="ts" name="tools-controls">
import { computed } from 'vue';

import {
  CarbonAddFilled,
  IconamoonSortingLeft,
  IconoirCursorPointer,
  IconParkSolidReduceOne,
  MaterialSymbolsMyLocationRounded,
  ProiconsHand,
} from '@vben/icons';

import { useVueFlow } from '@vue-flow/core';

import { useCool } from '#/cool';
import { useFlow } from '#/hooks/hooks/userFlow';

import ToolsHistory from './history.vue';

const vueFlow = useVueFlow();
const flow = useFlow();
const { mitt } = useCool();

const zoom = computed(() => {
  return Math.ceil(flow.viewport.zoom * 100 || 100);
});

// 缩放比例列表
const ratio = [
  {
    label: '200%',
    value: 2,
  },
  {
    label: '150%',
    value: 1.5,
  },
  {
    label: '100%',
    value: 1,
  },
  {
    label: '75%',
    value: 0.75,
  },
  {
    label: '50%',
    value: 0.5,
  },
  {
    label: '25%',
    value: 0.25,
  },
];

// 指针模式
function toPointer() {
  flow.setControlMode('pointer');
}

// 拖拽模式
function toHand() {
  flow.setControlMode('hand');
}

// 自适应
function zoomFit() {
  vueFlow.fitView();
}

// 对齐
function toArrange() {
  flow.arrange();

  // 关闭展开的弹窗
  mitt.emit('flow.closeForm');
}

// 定位
function toCenter() {
  flow.setViewportByNode(flow.node!);
}
</script>

<template>
  <div class="tools-controls">
    <el-popover
      :offset="5"
      :popper-style="{
        minWidth: '100px',
      }"
      :teleported="false"
      placement="top-start"
      popper-class="cl-flow__popper"
      trigger="click"
      width="100px"
    >
      <template #reference>
        <div class="zoom-op">
          <IconParkSolidReduceOne
            class="size-6"
            @click.stop="vueFlow.zoomOut()"
          />
          <span class="val">{{ zoom }}%</span>
          <CarbonAddFilled class="size-6" @click.stop="vueFlow.zoomIn()" />
        </div>
      </template>

      <div class="list">
        <div
          v-for="item in ratio"
          :key="item.value"
          class="item"
          @click="vueFlow.zoomTo(item.value)"
        >
          {{ item.label }}
        </div>
        <div class="item" @click="zoomFit">自适应</div>
      </div>
    </el-popover>

    <div class="hr"></div>

    <div class="btn-op">
      <el-tooltip content="指针模式">
        <IconoirCursorPointer
          :class="{
            active: flow.controlMode === 'pointer',
          }"
          class="size-6"
          @click="toPointer"
        />
      </el-tooltip>

      <el-tooltip content="手模式">
        <ProiconsHand
          :class="{
            active: flow.controlMode === 'hand',
          }"
          class="size-6"
          @click="toHand"
        />
      </el-tooltip>

      <el-tooltip content="整理节点">
        <IconamoonSortingLeft class="size-6" @click="toArrange" />
      </el-tooltip>

      <el-tooltip content="节点定位">
        <MaterialSymbolsMyLocationRounded class="size-6" @click="toCenter" />
      </el-tooltip>
    </div>

    <div class="hr"></div>

    <ToolsHistory />
  </div>
</template>

<style lang="scss" scoped>
.tools-controls {
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 9;
  border-radius: 6px;
  background-color: var(--el-bg-color);
  box-shadow: 0px 0 6px 1px rgba(16, 24, 40, 0.08);
  padding: 0 3px;

  .hr {
    height: 10px;
    width: 1px;
    background-color: var(--el-border-color-light);
    margin: 0 5px;
  }

  :deep(.iconify) {
    border-radius: 6px;
    //height: 16px;
    //width: 16px;
    padding: 4px;
    color: var(--el-color-info-dark-2);
    font-size: 24px;

    &:focus,
    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-fill-color);
    }

    &:focus {
      outline: none;
    }

    &.active {
      color: var(--el-color-primary);
    }
  }

  .zoom-op {
    width: 100px;

    .val {
      flex: 1;
      text-align: center;
      user-select: none;
      font-size: 12px;
    }
  }

  .zoom-op,
  .btn-op {
    display: flex;
    align-items: center;
    height: 30px;
    box-sizing: border-box;
    cursor: pointer;
  }

  .list {
    .item {
      cursor: pointer;
      font-size: 12px;
      padding: 5px 10px;
      border-radius: 4px;
      text-align: center;
      user-select: none;

      &:hover {
        background-color: var(--el-fill-color-lighter);
      }
    }
  }
}
</style>
