<script setup lang="ts" name="node-base-form-output-params">
import type { FlowField } from '#/types/flow/index';

import { type PropType, reactive, useModel } from 'vue';

import { MaterialDeleteOutline, MingcuteFullscreenLine } from '@vben/icons';

import { message } from 'ant-design-vue';

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
      return message.warning('请输入内容');
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
    <cl-svg v-if="op" class="btn-icon is-rt" name="add" @click="add()" />

    <div v-for="(item, index) in list" :key="index" class="item">
      <div class="d">
        <a-input
          v-model="item.field"
          :disabled="onDisabled(item, 'field')"
          class="name"
          placeholder="变量名"
        />
      </div>

      <div class="d">
        <template v-if="typeInput">
          <a-input v-model="item.type" placeholder="请输入描述">
            <template #prefix>
              <MingcuteFullscreenLine
                class="btn-icon"
                @click="input.open(item)"
              />
            </template>
          </a-input>
        </template>
        <a-select
          v-else
          v-model="item.type"
          :disabled="onDisabled(item, 'type')"
          placeholder="类型"
        >
          <a-select-option
            v-for="t in options.type"
            :key="t"
            :label="t"
            :value="t"
          />
        </a-select>
      </div>
      <MaterialDeleteOutline
        v-if="op"
        class="btn-icon"
        @click="remove(index)"
      />
    </div>

    <!-- 自定义输入 -->
    <a-modal v-model="input.visible" title="自定义输入">
      <a-input
        v-model="input.value"
        :rows="20"
        placeholder="请输入"
        type="textarea"
      />

      <template #footer>
        <a-button @click="input.close">取消</a-button>
        <a-button type="success" @click="input.save">保存</a-button>
      </template>
    </a-modal>
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
