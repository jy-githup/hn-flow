<script setup lang="ts" name="node-base-form-output-params">
import type { FlowField } from '#/types/flow/index';

import { type PropType, reactive, useModel } from 'vue';

import { MingcuteFullscreenLine, SvgFlowDeleteIcon } from '@vben/icons';

import { ElMessage } from 'element-plus';

import { SvgFlowAddIcon } from "@vben/icons";

const props = defineProps({
  modelValue: {
    type: Array as PropType<FlowField[]>,
    default: () => [],
  },

  // 类型是否能输入
  typeInput: Boolean,

  // 哪些字段不能编辑
  // eslint-disable-next-line vue/require-default-prop
  disabledFields: [Array],

  // 允许编辑命名
  editField: {
    type: Boolean,
    default: true,
  },

  // 能否操作新增、删除
  op: {
    type: Boolean,
    default: true,
  },
});

const list = useModel(props, 'modelValue');

// 选项
const options = reactive({
  type: ['string', 'number', 'array', 'object', 'boolean', 'date'],
});

let id = 0;

// 添加
function add() {
  if (!id) {
    id = list.value.length;
  }

  list.value.push({
    field: `res${++id}`,
    type: props.typeInput ? '' : 'string',
  });
}

// 移除
function remove(index: number) {
  list.value.splice(index, 1);
}

// 禁用
function onDisabled(item: FlowField, key: 'field' | 'type') {
  let f = props.disabledFields?.includes(item.field);

  if (!f && key === 'field') {
    f = !props.editField;
  }

  return f;
}

// 自定义值输入
const input = reactive({
  visible: false,
  value: '',
  data: null as FlowField | null,

  open(item: FlowField) {
    input.data = item!;
    input.value = item.type!;
    input.visible = true;
  },

  close() {
    input.visible = false;
  },

  save() {
    if (!input.value) {
      return ElMessage.warning('请输入内容');
    }

    if (input.data) {
      input.data.type = input.value;
    }

    input.close();
  },
});
</script>

<template>
  <div class="form-input-params">
    <SvgFlowAddIcon v-if="op" class="btn-icon is-rt size-6" @click="add()" />

    <div v-for="(item, index) in list" :key="index" class="item">
      <div class="d">
        <el-input
          v-model="item.field"
          :disabled="onDisabled(item, 'field')"
          class="name"
          placeholder="变量名"
        />
      </div>

      <div class="d">
        <template v-if="typeInput">
          <el-input v-model="item.type" placeholder="请输入描述">
            <template #prefix>
              <MingcuteFullscreenLine
                class="btn-icon size-6"
                @click="input.open(item)"
              />
            </template>
          </el-input>
        </template>
        <el-select
          v-else
          v-model="item.type"
          :disabled="onDisabled(item, 'type')"
          placeholder="类型"
        >
          <el-option v-for="t in options.type" :key="t" :label="t" :value="t" />
        </el-select>
      </div>
      <SvgFlowDeleteIcon
        v-if="op"
        class="btn-icon size-6"
        @click="remove(index)"
      />
    </div>

    <!-- 自定义输入 -->
    <el-dialog v-model="input.visible" title="自定义输入">
      <el-input
        v-model="input.value"
        :rows="20"
        placeholder="请输入"
        type="textarea"
      />

      <template #footer>
        <el-button @click="input.close">取消</el-button>
        <el-button type="success" @click="input.save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.form-input-params {
  .item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;

    .d {
      flex: 1;
      margin-right: 5px;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
