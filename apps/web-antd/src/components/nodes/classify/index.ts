import type { FlowNode } from '#/types/flow/index';

import { SvgFlowClassifyIcon } from '@vben/icons';

import FormInputParams from '../_base/form/input-params.vue';
import FormText from '../_base/form/text.vue';

import FormModel from '../llm/form/model.vue';
import FormClassify from './form/classify.vue';
import component from './index.vue';

export default (): FlowNode => {
  return {
    group: 'AI',
    label: '分类器',
    description: '根据内容调用 LLM 进行智能分类',
    bgColor: '#409eff',
    color: '#409eff',
    icon: SvgFlowClassifyIcon,
    component,
    form: {
      items: [
        {
          label: '输入变量',
          prop: 'inputParams',
          component: {
            vm: FormInputParams,
            props: {
              editField: false,
              disabled: true,
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
          label: '分类',
          prop: 'options.types',
          component: {
            vm: FormClassify,
          },
        },
        // {
        // 	component: {
        // 		name: "cl-form-card",
        // 		props: {
        // 			label: "高级设置",
        // 			expand: false
        // 		}
        // 	},
        // 	children: [
        // 		{
        // 			prop: "options.adv",
        // 			component: {
        // 				vm: FormAdv
        // 			}
        // 		}
        // 	]
        // },
        {
          label: '输出变量',
          component: {
            vm: FormText,
            props: {
              text: ['content<string> 内容', 'index<number> 分类索引'],
            },
          },
        },
      ],
    },
    data: {
      inputParams: [
        {
          field: 'content',
          type: 'string',
        },
      ],
      outputParams: [
        {
          field: 'index',
          type: 'number',
        },
      ],
      options: {
        model: {
          options: [],
          params: {
            model: '',
          },
        },
        types: [''],
      },
    },
    handle: {
      source: false,
      next: [],
    },
    validator(data) {
      const { model, types } = data.options;

      // 验证变量是否绑定值
      const param = data.inputParams?.find((e) => !e.nodeId);
      if (param) {
        return `请绑定变量：${param.field}`;
      }

      // 验证分类内容是否填写
      const type = types?.findIndex((e: string) => !e);
      if (type >= 0) {
        return `请填写分类${type + 1}的内容`;
      }

      // 验证模型是否选择
      if (!model.params.model) {
        return '请选择模型';
      }
    },
  };
};
