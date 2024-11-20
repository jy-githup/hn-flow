import type { FlowNode } from '#/types/flow/index';

import { MaterialCode } from '@vben/icons';

import FormInputNumber from '../_base/form/input-number.vue';
import FormInputParams from '../_base/form/input-params.vue';
import FormText from '../_base/form/text.vue';
import FormMessage from './form/message.vue';
import FormModel from './form/model.vue';
import component from './index.vue';

export default (): FlowNode => {
  return {
    group: 'AI',
    label: 'LLM',
    description: '调用大语言模型回答问题',
    color: '#409eff',
    icon: MaterialCode,
    component,
    isDisableDrag: true, // 是否允许拖拽（部分组件跟拖拽事件冲突，需禁用。例：伪富文本dom）
    form: {
      items: [
        {
          label: '输入变量',
          prop: 'inputParams',
          component: {
            vm: FormInputParams,
            props: {
              field: 'input',
            },
          },
        },
        {
          label: '模型',
          prop: 'options.model',
          component: {
            vm: FormModel,
          },
        },
        {
          label: '消息',
          prop: 'options.messages',
          component: {
            vm: FormMessage,
          },
        },
        {
          prop: 'options.history',
          span: 12,
          component: {
            vm: FormInputNumber,
            props: {
              prefix: '保存',
              suffix: '条历史数据',
            },
          },
        },
        {
          label: '输出变量',
          component: {
            vm: FormText,
            props: {
              text: ['text<string> 回复内容'],
            },
          },
        },
      ],
    },
    data: {
      inputParams: [
        {
          field: 'input',
        },
      ],
      outputParams: [
        {
          type: 'string',
          field: 'text',
        },
        {
          type: 'stream',
          field: 'stream',
        },
      ],
      options: {
        model: {
          options: [],
          params: {
            model: '',
          },
        },
        messages: [
          {
            role: 'system',
            content: '',
          },
          {
            role: 'user',
            content: '',
          },
        ] as LLMMessage[],
        history: 0,
      },
    },
    validator(data) {
      const { model, messages } = data.options;

      // 验证变量是否绑定值
      const param = data.inputParams?.find((e) => !e.nodeId);
      if (param) {
        return `请绑定变量：${param.field}`;
      }

      // 验证模型是否选择
      if (!model.params.model) {
        return '请选择模型';
      }

      // 验证消息是否填写
      const msg = messages.find((e: LLMMessage) => !e.content);
      if (msg) {
        return `请填写${msg.role}消息`;
      }
    },
  };
};
