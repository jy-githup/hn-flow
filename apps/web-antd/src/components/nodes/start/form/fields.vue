<script setup lang="ts" name="node-start-form-fields">
import type { FlowField } from '#/types/flow/index';

import type { PropType } from 'vue';
import { useModel } from 'vue';

import { setFocus, useForm } from '@cool-vue/crud';
import { message } from 'ant-design-vue';
import { assign, isEmpty } from 'lodash-es';

import ToolsFields from '#/components/tools/fields.vue';

const props = defineProps({
  modelValue: Array as PropType<FlowField[]>,
  scope: null,
  disabled: Boolean,
  prop: String,
  isDisabled: Boolean,
});

const Form = useForm();

const list = useModel(props, 'modelValue');

function open(item?: FlowField) {
  Form.value?.open(
    {
      title: '添加变量',
      width: '500px',
      dialog: {
        controls: ['close'],
      },
      props: {
        labelPosition: 'top',
      },
      form: {
        ...item,
      },
      items: [
        {
          label: '字段类型',
          prop: 'type',
          value: 'text',
          component: {
            name: 'el-radio-group',
            options: [
              {
                label: '文本',
                value: 'text',
              },
              {
                label: '数字',
                value: 'number',
              },
              {
                label: '图片',
                value: 'image',
              },
            ],
          },
          required: true,
        },
        {
          label: '变量名称',
          prop: 'field',
          component: {
            name: 'el-input',
            props: {
              clearable: true,
              maxlength: 20,
            },
          },
          rules: [
            {
              required: true,
              validator(rule, value, callback) {
                if (isEmpty(value)) {
                  callback(new Error('请输入变量名称'));
                } else if (/^[a-z]\w*$/i.test(value)) {
                  callback();
                } else {
                  callback(
                    new Error('只能由字母、数字、下划线组成，且以字母开头'),
                  );
                }
              },
            },
          ],
        },
        {
          label: '显示名称',
          prop: 'label',
          component: {
            name: 'el-input',
            props: {
              clearable: true,
              maxlength: 20,
            },
          },
          required: true,
        },
        {
          label: '必填',
          prop: 'required',
          value: 1,
          component: {
            name: 'cl-switch',
          },
          required: true,
        },
      ],
      on: {
        submit(data, { close, done }) {
          if (
            list.value?.find((e) => e.field === data.field) &&
            item?.field !== data.field
          ) {
            done();
            return message.warning('变量名称已存在');
          }

          if (item) {
            assign(item, data);
          } else {
            list.value?.push(data);
          }

          close();
        },
      },
    },
    [setFocus('value')],
  );
}
</script>

<template>
  <div class="form-fields">
    <cl-svg class="btn-icon is-rt" name="add" @click="open()" />

    <div v-if="isEmpty(list)" class="empty">
      <el-text size="small">设置的输入可在工作流程中使用，</el-text>
      <el-text size="small" type="primary" @click="open()">立即添加</el-text>
    </div>

    <ToolsFields v-model="list" @edit="open" />
  </div>

  <cl-form ref="Form" />
</template>

<style lang="scss" scoped>
.form-fields {
  position: relative;

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    background-color: var(--el-fill-color-lighter);
    border-radius: 6px;

    .el-text:last-child {
      cursor: pointer;
    }
  }
}
</style>
