<script setup lang="ts" name="node-base-form-input-params">
import type { FlowField } from '#/types/flow/index';

import { computed, type PropType, useModel } from 'vue';

import { IonAdd, SiInfoFill, SvgFlowDeleteIcon } from '@vben/icons';

import { isEmpty } from 'lodash-es';

import ToolsVar from '#/components/tools/var.vue';

const props = defineProps({
  modelValue: {
    type: Array as PropType<FlowField[]>,
    default: () => [],
  },
  field: {
    type: String,
    default: 'arg',
  },
  // 允许编辑命名
  editField: {
    type: Boolean,
    default: true,
  },
  // 禁用
  disabled: Boolean,
  // 占位内容
  // eslint-disable-next-line vue/require-default-prop
  placeholder: String,
  // 自定义输入值
  varInputable: Boolean,
});

const list = useModel(props, 'modelValue');

// 是否有相同命名
const errFields = computed(() => {
  const arr: string[] = [];
  // if (!Array.isArray(list.value)) return arr;
  list.value.forEach((a, i) => {
    const n = list.value.findIndex((b) => b.field === a.field);

    if (n !== -1 && i !== n) {
      arr.push(a.field);
    }
  });

  return arr;
});

let id = 1;

// 添加
function add() {
  list.value.push({
    field: `${props.field}${++id}`,
  });
}

// 移除
function remove(index: number) {
  list.value.splice(index, 1);
}
</script>

<template>
  <div class="form-input-params">
    <IonAdd v-if="!disabled" class="btn-icon is-rt size-6" @click="add()" />

    <div
      v-for="(item, index) in list"
      :key="index"
      :class="{
        'is-error': errFields.includes(item.field),
      }"
      class="item"
    >
      <div class="d">
        <el-input
          v-model="item.field"
          :disabled="!editField"
          class="name"
          clearable
          placeholder="变量名"
        />
      </div>

      <div class="d">
        <ToolsVar
          v-model="item.name"
          v-model:node-id="item.nodeId"
          v-model:type="item.type"
          v-model:value="item.value"
          :inputable="varInputable"
        />
      </div>
      <SvgFlowDeleteIcon
        v-if="!disabled"
        class="btn-icon size-6"
        @click="remove(index)"
      />
    </div>
    <el-button v-if="isEmpty(list) && placeholder" size="small" type="text">
      <SiInfoFill class="size-6" />
      {{ placeholder }}
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.form-input-params {
  .item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;

    .d {
      margin-right: 5px;
      flex: 1;
      overflow: hidden;
    }

    &:last-child {
      margin-bottom: 0;
    }

    &.is-error {
      .d {
        &:first-child {
          :deep(.el-input__wrapper) {
            box-shadow: 0 0 0 1px var(--el-color-danger) inset;
          }
        }
      }
    }
  }
}
</style>
