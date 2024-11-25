<script setup lang="ts" name="tools-field">
import type { FlowField } from '#/types/flow/index';

import type { PropType } from 'vue';
import { useModel } from 'vue';

import { SvgFlowTextIcon } from '@vben/icons';

const props = defineProps({
  modelValue: {
    type: Array as PropType<FlowField[]>,
    default: () => [],
  },
  disabled: Boolean,
});

const emit = defineEmits(['update:modelValue', 'edit']);

// 列表
const list = useModel(props, 'modelValue');

// 编辑
function edit(item: FlowField) {
  emit('edit', item);
}

// 移除
function remove(index: number) {
  list.value.splice(index, 1);
}
</script>

<template>
  <div class="tools-fields">
    <div
      v-for="(item, index) in list"
      :key="index"
      :class="{
        disabled,
      }"
      class="item"
      @click="edit(item)"
    >
      <SvgFlowTextIcon class="type size-5" />
      <div class="name">
        {{ item.field }}
        <span v-if="!disabled"> · {{ item.label }}</span>
      </div>

      <span v-if="item.required" class="required">必填</span>

      <div class="op">
        <cl-svg name="delete" @click.stop="remove(index)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tools-fields {
  .item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    background-color: var(--el-fill-color-lighter);
    border-radius: 6px;
    padding: 0 5px;
    height: 30px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    .type {
      //height: 15px;
      //width: 15px;
      margin-right: 5px;
      padding: 3px;
    }

    .name {
      font-size: 12px;
      flex: 1;
    }

    .required {
      font-size: 12px;
      margin-right: 5px;
    }

    .op {
      display: none;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
      position: absolute;
      right: 0;
      top: 0;
      width: 80px;
      padding: 0 5px;
      background-color: var(--el-fill-color-light);

      .cl-svg {
        height: 15px;
        width: 15px;
        padding: 3px;
        border-radius: 4px;

        &:hover {
          background-color: var(--el-fill-color-darker);
        }
      }
    }

    &:last-child {
      margin-bottom: 0;
    }

    &:not(.disabled):hover {
      background-color: var(--el-fill-color-light);

      .op {
        display: flex;
      }
    }
  }
}
</style>
